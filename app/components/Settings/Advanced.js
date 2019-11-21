import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  getConfUri,
  getDebugUri,
  getSapphireDirectory,
  grabEccoinDir,
  grabWalletDir
} from '../../utils/platform.service';
import * as actions from '../../actions/index';
import Console from './partials/Console';
import fs from 'fs-extra';
import {SettingsIcon} from 'mdi-react';
import {Button} from 'reactstrap';
import Header from '../Others/Header';
import Body from '../Others/Body';
import ActionModal from '../Others/ActionModal';
import {clearTransactions, clearAddresses} from '../../Managers/SQLManager'
import UnlockModal from "../Others/UnlockModal";
import Toast from "../../globals/Toast/Toast";
import SettingsToggle from "./partials/SettingsToggle";
import {toggleBetaMode} from "../../utils/tools";
import {ipcRenderer} from "electron";
const shell = require('electron').remote.shell;


const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;
const app = remote.app;
const event = require('../../utils/eventhandler');
const settings = require('electron').remote.require('electron-settings');

class Advanced extends Component {
  constructor(props) {
    super(props);
    this.toggleBetaMode = this.toggleBetaMode.bind(this);
    this.deleteAndReIndex = this.deleteAndReIndex.bind(this);
    this.clearBanlist = this.clearBanlist.bind(this);
    this.openDebugFile = this.openDebugFile.bind(this);
    this.exportDebugLog = this.exportDebugLog.bind(this);
    this.openConfigFile = this.openConfigFile.bind(this);
    this.openConsole = this.openConsole.bind(this);
    this.unlocktoggle = this.unlocktoggle.bind(this);
    this.deleteAndRedownloadDaemon = this.deleteAndRedownloadDaemon.bind(this);
    this.deleteBlockChain = this.deleteBlockChain.bind(this);
    this.onClickBackupLocation = this.onClickBackupLocation.bind(this);

    event.on('daemonStopped', async (args) => {

      if(args.clearBlockchain) {
        await this.deleteBlockChain()
      }

      if(args.clearDaemon) {
        await this.deleteAndRedownloadDaemon()
      }
      console.log(args)
    });
  }

  async deleteAndReIndex() {
      try {
        await clearTransactions();
        await clearAddresses();
        event.emit('loadAddresses');
      } catch (err) {
        console.error('no access!', err);
      }
  }

  async revalidateLastBlock(){
    const bestBlockHash = await this.props.wallet.getBestBlockHash();
    if (bestBlockHash !== null) {
      const invalidateBlock = await this.props.wallet.invalidateBlock(bestBlockHash);
      if(invalidateBlock === null){
        const reconsiderBlock = await this.props.wallet.reconsiderBlock(bestBlockHash);
        if(reconsiderBlock === null){
          Toast({
            title: "Last Block revalidated",
            color: 'green'
          });
        } else {
          Toast({
            title: "unable to revalidate last block",
            color: 'red'
          });
        }
      }
    }

  }
  openDebugFile() {
    console.log(getDebugUri());
    shell.openItem(getDebugUri());
  }

  openConfigFile() {
    console.log(getConfUri());
    shell.openItem(getConfUri());
  }

  reloadSettings(settingPath, value) {
    settings.set(`settings.${settingPath}`, value);
    ipcRenderer.send('reloadSettings');
  }

  unlocktoggle(){
    this.unlockModal.getWrappedInstance().toggle();
  }

  async deleteAndRedownloadDaemon(){
    setTimeout(async () => {
      try {
        await fs.remove(grabWalletDir());
        Toast({
          title: "Daemon Deleted",
          color: 'green'
        });
        event.emit('initial_setup', true);
      } catch (err) {
        Toast({
          title: "Deletion Failed",
          message: "error deleting daemon, restarting daemon now" + err,
          color: 'red'
        });
        console.error(err)
        event.emit('start')
      }
    }, 5000);

  }

  async deleteBlockChain() {
    try {
      await fs.remove(`${grabEccoinDir()}blocks`);
      await fs.remove(`${grabEccoinDir()}chainstate`);
      Toast({
        title: "Blockchain Deleted",
        color: 'green'
      });
    } catch (err) {
      Toast({
        title: this.props.lang.exportFailed,
        message: "error deleting blockchain files, restarting daemon" + err,
        color: 'red'
      });
      console.error(err)
    }
    event.emit('start')
  }

  async backupWallet(location, args) {
    try {
      await fs.copyFile(`${grabEccoinDir()}wallet.dat`, location)
      Toast({
        title: this.props.lang.exportedWallet,
        message: location,
        color: 'green'
      });
      this.props.setBackupOperationInProgress(false);

      if(args.clearDaemon) {
        event.emit('stop', { restart: false, closeApplication: false, clearDaemon: true })
      }
      if(args.clearBlockchain){
        event.emit('stop', { restart: false, closeApplication: false, clearBlockchain: true })
      }
    } catch (err) {
      Toast({
        title: this.props.lang.exportFailed,
        message: "error backing up wallet: " + err,
        color: 'red'
      });
      this.props.setBackupOperationInProgress(false);
      console.error(err)
    }
  }

  onClickBackupLocation(args) {
    console.log('in here')
    if(this.props.backingUpWallet) return;
    this.props.setBackupOperationInProgress(true);
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, async (folderPaths) => {
      if (folderPaths === undefined) {
        this.props.setBackupOperationInProgress(false);
        return;
      }

      await this.backupWallet(`${folderPaths}/walletBackup.dat`, args);
    });
  }

  exportDebugLog() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        return;
      }
      try {
        let filePath = getDebugUri();
        let destPath = folderPaths + '/debug.log';
        fs.copySync(filePath, destPath);
        Toast({
          title: this.props.lang.success,
          message: 'File Saved to: ' + destPath
        });
      } catch (e){
        Toast({
          title: this.props.lang.error,
          message: e,
          color: 'red'
        });
      }
    });
  }

  async toggleBetaMode() {
    let toggled = await toggleBetaMode(!this.props.betaMode)
    if(toggled){
      this.reloadSettings('application.beta_mode', !this.props.betaMode);
      this.props.setBetaMode(!this.props.betaMode);
      ipcRenderer.send('stop', { restart: true, closeApplication: false })
    } else {
      Toast({
        title: this.props.lang.fail,
        message: this.props.lang.unableToToggleBetaMode
      });
    }
  }

  async clearBanlist() {
    const data = await this.props.wallet.clearBanned();
    if (data === null) {
      console.log('banlist cleared');
      this.clearedBanlist.getWrappedInstance().toggle();
    }
  }

  openConsole () {
    this.consoleModal.getWrappedInstance().toggle();
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.advanced }
        </Header>
        <Body>
          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>{ this.props.lang.console }</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>For Manually interacting with the BlockChain Daemon</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.openConsole()}>{ this.props.lang.accessConsole }</Button>
            </div>
          </div>
          <div className="row settingsToggle" >
            <div className="col-sm-9 text-left removePadding">
              <p>Delete And Reindex Database</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Delete Indexed Transactions and Addresses database, useful when swapping a wallet.dat file</p>
            </div>
            <div className="col-sm-3 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.clearIndexedData.getWrappedInstance().toggle()}>Run Now</Button>
            </div>
          </div>
          <div className="row settingsToggle" >
            <div className="col-sm-9 text-left removePadding">
              <p>Clear blockchain</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Delete Blockchain and resync, useful when forked and syncing has stopped</p>
            </div>
            <div className="col-sm-3 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.clearBlockchain.getWrappedInstance().toggle()}>Run Now</Button>
            </div>
          </div>
          <div className="row settingsToggle" >
            <div className="col-sm-9 text-left removePadding">
              <p>Delete and re-download daemon</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Delete Blockchain daemon and download latest version, useful when having daemon issues</p>
            </div>
            <div className="col-sm-3 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.reinstallDaemon.getWrappedInstance().toggle()}>Run Now</Button>
            </div>
          </div>
          <div className="row settingsToggle" >
            <div className="col-sm-9 text-left removePadding">
              <p>Revalidate Last Block</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Revalidate last block, useful when forked</p>
            </div>
            <div className="col-sm-3 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.invalidateLastBlock.getWrappedInstance().toggle()}>Run Now</Button>
            </div>
          </div>
          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>Banlist</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Click clear banlist to remove all the banned nodes.</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.clearBanlist()}>Clear Ban list</Button>
            </div>
          </div>
          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>Daemon config file</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Modify daemon config file, (changes will not be applied till next reboot)</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.openConfigFile()}>Open Config</Button>
            </div>
          </div>
          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>Debug File</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Open or export debug.log file</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.exportDebugLog()}>Export Debug Log</Button>
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.openDebugFile()}>Open Debug Log</Button>
            </div>
          </div>
          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>Manual Daemon Start/Stop</p>
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Manually Start and stop the blockChain daemon</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              { this.props.daemonRunning && (
                <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => [event.emit('stop', { restart: false, closeApplication: false })]}>Stop</Button>)}
              { !this.props.daemonRunning && (
                <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => {event.emit('start')}}>Start</Button>)}
            </div>
          </div>

          {/*<SettingsToggle*/}
          {/*  keyVal={1}*/}
          {/*  text={this.props.lang.toggleBetaMode}*/}
          {/*  handleChange={this.toggleBetaMode}*/}
          {/*  checked={this.props.betaMode}*/}
          {/*/>*/}

        </Body>
        <UnlockModal ref={(e) => { this.unlockModal = e; }} onUnlock={async(e) => { await this.deleteAndReIndex()}} forStaking={false}>
          <p> Please unlock your wallet to reindex your ECC Addresses and Transactions.</p>
        </UnlockModal>
        <ActionModal ref={(e) => { this.clearedBanlist = e; }} body={this.props.lang.banlistCleared} />

        {/*Confirmation action modals*/}
        <ActionModal header={this.props.lang.areyousure} cancelText={this.props.lang.no} okText={this.props.lang.yes} ok={() => {this.onClickBackupLocation({clearBlockchain:true})}} ref={(e) => { this.clearBlockchain = e; }} body="Clearing the blockchain data will require a full resync from the internet, resync time is completely dependant on your hardware and network connection (you will be prompted to backup your wallet first)" />
        <ActionModal header={this.props.lang.areyousure} cancelText={this.props.lang.no} okText={this.props.lang.yes} ok={() => {this.onClickBackupLocation({clearDaemon:true})}} ref={(e) => { this.reinstallDaemon = e; }} body="Reinstalling the latest daemon requires an active internet connection (you will be prompted to backup your wallet first)" />
        <ActionModal header={this.props.lang.areyousure} cancelText={this.props.lang.no} okText={this.props.lang.yes} ok={() => {this.revalidateLastBlock()}} ref={(e) => { this.invalidateLastBlock = e; }} body="Are you sure you want to revalidate the last block?" />
        <ActionModal header={this.props.lang.areyousure} cancelText={this.props.lang.no} okText={this.props.lang.yes} ok={() => {this.unlocktoggle()}} ref={(e) => { this.clearIndexedData = e; }} body="Are you sure you want to clear indexed transaction and address data?"/>
        <Console ref={(e) => { this.consoleModal = e; }} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    backingUpWallet: state.application.backingUpWallet,
    daemonRunning: state.application.daemonRunning,
    betaMode: state.application.betaMode
  };
};

export default connect(mapStateToProps, actions)(Advanced);
