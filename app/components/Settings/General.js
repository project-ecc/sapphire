import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ipcRenderer} from 'electron';
import fs from 'fs';
import {SettingsIcon} from 'mdi-react';

import * as actions from '../../actions/index';
import {Button} from 'reactstrap';
import {version} from '../../../package.json';
import SettingsToggle from './partials/SettingsToggle';
import Header from '../Others/Header';
import Body from '../Others/Body';
import ActionModal from '../Others/ActionModal';

const settings = require('electron').remote.require('electron-settings');
const remote = require('electron').remote;

const event = require('../../utils/eventhandler');

const app = remote.app;

const guiVersion = version;
const jsonFormat = require('json-format');

class General extends Component {
  constructor(props) {
    super(props);

    this.handleStartAtLogin = this.handleStartAtLogin.bind(this);
    this.setTrayIcon = this.setTrayIcon.bind(this);
    this.handleMinimizeToTray = this.handleMinimizeToTray.bind(this);
    this.handleMinimizeOnClose = this.handleMinimizeOnClose.bind(this);
    this.handleHelpFile = this.handleHelpFile.bind(this);
    this.checkForUpdates = this.checkForUpdates.bind(this);


    //when daemon is updated
    event.on('updatedDaemon', () =>{
      event.emit('start');
    });

    event.on('noUpdateAvailable', () =>{
      this.noUpdateAvailable.getWrappedInstance().toggle();
    })
  }

  handleUpdateApplication() {
    if (!this.props.updateAvailable) {
      return;
    }
    event.emit('updateDaemon', true);
  }

  checkForUpdates(){
    console.log('in here')
    event.emit('checkForDaemonUpdates');
  }

  handleStartAtLogin() {
    ipcRenderer.send('autoStart', !this.props.startAtLogin);
    this.reloadSettings('display.start_at_login', !this.props.startAtLogin);
    this.props.setStartAtLogin(!this.props.startAtLogin);
  }

  setTrayIcon() {
    if (this.props.minimizeToTray) {
      this.reloadSettings('display.minimise_to_tray', false);
      this.props.setMinimizeToTray(false);
    }
    ipcRenderer.send('hideTray', !this.props.hideTrayIcon);
    this.reloadSettings('display.hide_tray_icon', !this.props.hideTrayIcon);
    this.props.setTray(!this.props.hideTrayIcon);
  }

  handleMinimizeToTray() {
    if (this.props.hideTrayIcon) {
      ipcRenderer.send('hideTray', false);
      this.reloadSettings('display.hide_tray_icon', false);
      this.props.setTray(false);
    }
    this.reloadSettings('display.minimise_to_tray', !this.props.minimizeToTray);
    this.props.setMinimizeToTray(!this.props.minimizeToTray);
  }

  handleMinimizeOnClose() {
    this.reloadSettings('display.minimise_on_close', !this.props.minimizeOnClose);
    this.props.setMinimizeOnClose(!this.props.minimizeOnClose);
  }

  reloadSettings(settingPath, value) {
    settings.set(`settings.${settingPath}`, value);
    ipcRenderer.send('reloadSettings');
  }



  handleHelpFile() {
    const queries = [];
    queries.push({ method: 'getinfo' });
    queries.push({ method: 'getwalletinfo' });
    queries.push({ method: 'getblockchaininfo' });
    queries.push({ method: 'getnetworkinfo' });
    queries.push({ method: 'getpeerinfo' });
    queries.push({ method: 'listtransactions', parameters: ['*', 25] });
    const toPrint = {};
    this.props.wallet.command(queries).then((data) => {
      for (let i = 0; i < data.length; i++) {
        const queryType = this.getTypeOfQuery(i);
        const response = data[i];
        toPrint[queryType] = response;
      }
      toPrint['debug.log'] = this.props.debugLog.store;

      fs.writeFile(`${app.getPath('desktop')}/Sapphire-info.json`, jsonFormat(toPrint), (err) => {
        if (!err) {
          this.exportSuccessModal.getWrappedInstance().toggle();
        } else {
          this.exportErrorModal.getWrappedInstance().toggle();
        }
      });
      console.log(toPrint);
    }).catch((err) => {
      console.log('exception handleHelpFile: ', err);
      this.exportErrorModal.getWrappedInstance().toggle();
    });
  }

  getTypeOfQuery(id) {
    switch (id) {
      case 0: return 'getinfo';
      case 1: return 'getwalletinfo';
      case 2: return 'getblockchaininfo';
      case 3: return 'getnetworkinfo';
      case 4: return 'getpeerinfo';
      case 5: return 'listtransactions (25)';
    }
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.general }
        </Header>
        <Body>
          <SettingsToggle
            keyVal={4}
            text={this.props.lang.startOnLogin}
            handleChange={this.handleStartAtLogin}
            checked={this.props.startAtLogin}
          />
          <SettingsToggle
            keyVal={5}
            text={this.props.lang.hideTrayIcon}
            handleChange={this.setTrayIcon}
            checked={this.props.hideTrayIcon}
          />
          <SettingsToggle
            keyVal={6}
            text={process.platform === 'darwin' ? this.props.lang.minimizeToTrayMac : this.props.lang.minimizeToTray}
            handleChange={this.handleMinimizeToTray}
            checked={this.props.minimizeToTray}
          />
          <SettingsToggle
            keyVal={7}
            text={this.props.lang.minimizeOnClose}
            handleChange={this.handleMinimizeOnClose}
            checked={this.props.minimizeOnClose}
          />



          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>{ this.props.lang.applicationVersion }</p>
              <p id="applicationVersion">v{guiVersion}g & v{this.props.daemonVersion}d</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              {this.props.updateAvailable && (
                <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.handleUpdateApplication()}>Update Now</Button>
              )}
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.checkForUpdates()}>Check for updates</Button>
            </div>
          </div>
          <div className="row settingsToggle" >
            <div className="col-sm-10 text-left removePadding">
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>{this.props.lang.sapphireInfoDesc}.</p>
            </div>
            <div className="col-sm-2 text-right removePadding">
              <Button size="sm" outline color="warning" onClick={this.handleHelpFile.bind(this)} style={{ cursor: 'pointer' }}>Generate</Button>
            </div>
          </div>
        </Body>

        <ActionModal ref={(e) => { this.exportErrorModal = e; }} body={this.props.lang.failedSapphireInfo} />
        <ActionModal
          ref={(e) => { this.exportSuccessModal = e; }}
          body={(
            <span>{ this.props.lang.exportedSapphireInfo1 } <b>Sapphire-info.json</b> { this.props.lang.exportedSapphireInfo2 }</span>
          )}
        />
        <ActionModal ref={(e) => { this.noUpdateAvailable = e; }} body={this.props.lang.noUpdateAvailable} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    startAtLogin: state.application.startAtLogin,
    hideTrayIcon: state.application.hideTrayIcon,
    minimizeToTray: state.application.minimizeToTray,
    minimizeOnClose: state.application.minimizeOnClose,
    daemonVersion: state.chains.daemonVersion,
    updateAvailable: state.startup.daemonUpdate,
    debugLog: state.application.debugLog,

  };
};

export default connect(mapStateToProps, actions)(General);
