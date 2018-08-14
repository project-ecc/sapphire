import React, { Component } from 'react';
import fs from 'fs';
import $ from 'jquery';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import os from 'os';


import * as actions from '../../actions';
import SettingsToggle from './SettingsToggle';
import SettingsSidebarItem from './SettingsSidebarItem';
import LanguageSelector from '../Others/LanguageSelector';
import ThemeSelector from '../Others/ThemeSelector';
import {version} from './../../../package.json';
import Console from './Console';

const settings = require('electron').remote.require('electron-settings');
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;
const app = remote.app;
const homedir = require('os').homedir();
const Tools = require('../../utils/tools');
import Wallet from '../../utils/wallet';
const guiVersion = version;
import {getSapphireDirectory} from "../../utils/platform.service";
import Donations from "./Donations";

var jsonFormat = require('json-format');
var open = require("open");

class Settings extends Component {
  constructor(props) {
    super(props);
    this.setTrayIcon = this.setTrayIcon.bind(this);
    this.handleMinimizeToTray = this.handleMinimizeToTray.bind(this);
    this.handleMinimizeOnClose = this.handleMinimizeOnClose.bind(this);
    this.handleStartAtLogin = this.handleStartAtLogin.bind(this);
    this.handleOperativeSystemNotifications = this.handleOperativeSystemNotifications.bind(this);
    this.handleNewsNotifications = this.handleNewsNotifications.bind(this);
    this.handleStakingNotifications = this.handleStakingNotifications.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.handleExportPrivateKeys = this.handleExportPrivateKeys.bind(this);
    this.onClickBackupLocation = this.onClickBackupLocation.bind(this);
    this.backupWallet = this.backupWallet.bind(this);
    this.handleImportPrivateKey = this.handleImportPrivateKey.bind(this);
    this.handleChangePasswordClicked = this.handleChangePasswordClicked.bind(this);
    this.handleSidebarClicked = this.handleSidebarClicked.bind(this);
    this.handleHelpFile = this.handleHelpFile.bind(this);
  }

  handleUpdateApplication(){
    if(!this.props.updateAvailable){
      return;
    }
    this.props.setUpdateApplication(true);
  }

  handleDropDownClicked(){
    $('.dropdownLanguageSelector').attr('tabindex', 1).focus();
    $('.dropdownLanguageSelector').toggleClass('active');
    $('.dropdownLanguageSelector').find('.dropdown-menuLanguageSelector').slideToggle(300);
  }

  handleDrowDownUnfocus(){
    $('.dropdownLanguageSelector').removeClass('active');
    $('.dropdownLanguageSelector').find('.dropdown-menuLanguageSelector').slideUp(300);
  }

  onItemClick(event) {
    let lang = event.currentTarget.dataset.id;
    settings.set('settings.lang', lang);
    this.props.setLang();
  }

  setTrayIcon(){
    if(this.props.minimizeToTray){
      this.reloadSettings('display.minimise_to_tray', false);
      this.props.setMinimizeToTray(false);
    }
    ipcRenderer.send('hideTray', !this.props.hideTrayIcon);
    this.reloadSettings('display.hide_tray_icon', !this.props.hideTrayIcon);
    this.props.setTray(!this.props.hideTrayIcon);
  }

  handleMinimizeToTray(){
    if(this.props.hideTrayIcon){
      ipcRenderer.send('hideTray', false);
      this.reloadSettings('display.hide_tray_icon', false);
      this.props.setTray(false);
    }
    this.reloadSettings('display.minimise_to_tray', !this.props.minimizeToTray);
    this.props.setMinimizeToTray(!this.props.minimizeToTray);
  }

  handleMinimizeOnClose(){
    this.reloadSettings('display.minimise_on_close', !this.props.minimizeOnClose);
    this.props.setMinimizeOnClose(!this.props.minimizeOnClose);
  }

  handleStartAtLogin(){
    ipcRenderer.send('autoStart', !this.props.startAtLogin);
    this.reloadSettings('display.start_at_login', !this.props.startAtLogin);
    this.props.setStartAtLogin(!this.props.startAtLogin);
  }

  handleOperativeSystemNotifications(){
    this.reloadSettings('notifications.operative_system', !this.props.operativeSystemNotifications);
    this.props.setOperativeSystemNotifications(!this.props.operativeSystemNotifications);
  }

  handleNewsNotifications(){
    if(this.props.newsNotifications === true){
      this.props.setNewsChecked();
    }
    this.reloadSettings('notifications.news', !this.props.newsNotifications);
    this.props.setNewsNotifications(!this.props.newsNotifications);
  }

  handleStakingNotifications(){
    if(this.props.stakingNotifications === true){
      this.props.setEarningsChecked();
    }
    this.reloadSettings('notifications.staking', !this.props.stakingNotifications);
    this.props.setStakingNotifications(!this.props.stakingNotifications);
  }

  reloadSettings(settingPath, value){
    settings.set('settings.' + settingPath, value);
    ipcRenderer.send('reloadSettings');
  }

  handleExportPrivateKeys(){
    this.props.setExportingPrivateKeys(!this.props.exportingPrivateKeys)
  }

  handleImportWalletFile(){
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['dat'] }
      ]
    }, (fileLocation) => {
      if (fileLocation === undefined) {
        return;
      }
      this.importWallet(fileLocation);
    });
  }

  importWallet(fileLocation){
    console.log(fileLocation)
  }

  backupWallet(location){
    this.props.wallet.command([{
      method: 'backupwallet', parameters: [location]
    }
    ]).then((data) => {
      //Work on error handling
      if (data[0] === null) {
        this.props.setActionPopupResult({flag: true, successful: true, message: `<p className="backupSuccessful">${this.props.lang.exportedWallet}:</p> <p className="backupLocation">${location}</p>`})
      } else if(data[0]['code'] == '-4') {
        console.log('Windows code error 4: Insufficient permissions');
        this.props.setActionPopupResult({flag: true, successful: false, message: `<p className="backupFailed">${this.props.lang.exportFailedTryAdmin}</p>`})
      } else {
        console.log("error backing up wallet: ", data);
        this.props.setActionPopupResult({flag: true, successful: false, message: `<p className="backupFailed">${this.props.lang.exportFailed}</p>`})
      }
      this.props.setBackupOperationInProgress(false);
    }).catch((err) => {
      console.log("exception backing up wallet: ", err)
      this.props.setBackupOperationInProgress(false);
      this.props.setActionPopupResult({flag: true, successful: false, message: `<p className="backupFailed">${this.props.lang.exportFailed}</p>`})
    });
  }

  onClickBackupLocation() {
    if(this.props.backingUpWallet) return;
    this.props.setBackupOperationInProgress(true);
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        this.props.setBackupOperationInProgress(false);
        return;
      }
      let walletpath;

      var backupLocation = `${folderPaths}/walletBackup.dat`;
      this.backupWallet(backupLocation);
    });
  }

  handleImportPrivateKey(){
    this.props.setImportingPrivateKey(true);
  }

  handleChangePasswordClicked(){
    this.props.setChangingPassword(true);
  }

  handleSidebarClicked(option){
    this.props.setSettingsOptionSelected(option);
  }

  getTypeOfQuery(id){
    switch(id){
      case 0: return "getinfo";
      case 1: return "getwalletinfo";
      case 2: return "getblockchaininfo";
      case 3: return "getnetworkinfo";
      case 4: return "getpeerinfo";
      case 5: return "listtransactions (25)"
    }
  }

  handleHelpFile(){
    let queries = [];
    queries.push({method: 'getinfo'});
    queries.push({method: 'getwalletinfo'});
    queries.push({method: 'getblockchaininfo'});
    queries.push({method: 'getnetworkinfo'});
    queries.push({method: 'getpeerinfo'});
    queries.push({method: 'listtransactions', parameters: ["*", 25]});
    let toPrint = {};
    this.props.wallet.command(queries).then((data) => {
      for(let i = 0; i < data.length; i++){
        let queryType = this.getTypeOfQuery(i);
        let response = data[i];
        toPrint[queryType] = response;
      }
        toPrint['debug.log'] = this.props.debugLog.store

     fs.writeFile(app.getPath('desktop')+"/Sapphire-info.json", jsonFormat(toPrint), (err) => {
        if(!err){
          this.props.setActionPopupResult({flag: true, successful: true, message: `<p className="exportedSapphireInfo">${this.props.lang.exportedSapphireInfo}.</p>`})
        }
        else{
          this.props.setActionPopupResult({flag: true, successful: true, message: `<p className="exportedSapphireInfo">${this.props.lang.failedSapphireInfo}.</p>`})
        }
      });
      console.log(toPrint)
    }).catch((err) => {
      console.log("exception handleHelpFile: ", err);
      this.props.setActionPopupResult({flag: true, successful: false, message: `<p className="exportedSapphireInfo">${this.props.lang.failedSapphireInfo}.</p>`})
    });
  }

  async deleteAndReIndex(){

    const data = await this.props.wallet.walletstop();
    if (data && data === 'ECC server stopping') {
      console.log('stopping daemon');

      const dbLocation = getSapphireDirectory() + 'database.sqlite';
      console.log(dbLocation)
      try {
        fs.unlinkSync(dbLocation);
        console.log('can read/write');
        app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])})
        app.exit(0)
      } catch (err) {
        console.error('no access!');
      }
    }

  }

  async clearBanlist(){
    const data = await this.props.wallet.clearBanned();
    if (data === null) {
     console.log('banlist cleared')
      this.props.setActionPopupResult({flag: true, successful: true, message: `<p style="margin-bottom: 20px" className="backupFailed">Banlist Cleared!</p>`})
    }
  }

  getGeneralSettings(){
    return(
      <div className="container">
        <SettingsToggle
          keyVal={4}
          text= { this.props.lang.startOnLogin }
          handleChange = {this.handleStartAtLogin}
          checked = {this.props.startAtLogin}
        />
        <SettingsToggle
          keyVal={5}
          text= { this.props.lang.hideTrayIcon }
          handleChange = {this.setTrayIcon}
          checked = {this.props.hideTrayIcon}
        />
        <SettingsToggle
          keyVal={6}
          text= { process.platform === "darwin" ? this.props.lang.minimizeToTrayMac : this.props.lang.minimizeToTray }
          handleChange = {this.handleMinimizeToTray}
          checked = {this.props.minimizeToTray}
        />
        <SettingsToggle
          keyVal={7}
          text= { this.props.lang.minimizeOnClose }
          handleChange = {this.handleMinimizeOnClose}
          checked = {this.props.minimizeOnClose}
        />
        <div className="row settingsToggle">
          <div className="col-sm-6 text-left removePadding">
            <p>{ this.props.lang.applicationVersion }</p>
            <p id="applicationVersion">v{guiVersion}g & v{this.props.daemonVersion}d</p>
          </div>
          <div className="col-sm-6 text-right removePadding">
            <p onClick={this.handleUpdateApplication.bind(this)} id={this.props.updateAvailable ? "updateAvailable" : "updateUnavailable"}>{this.props.updateAvailable ? this.props.lang.installUpdate : this.props.lang.noUpdateAvailable }</p>
          </div>
        </div>
        <div className="row settingsToggle" >
            <div className="col-sm-10 text-left removePadding">
              <p className="walletBackupOptions" style={{fontSize: "14px", fontWeight: "700"}}>{this.props.lang.sapphireInfoDesc}.</p>
            </div>
            <div className="col-sm-2 text-right removePadding">
              <p onClick={this.handleHelpFile.bind(this)} style={{cursor: "pointer"}}>Generate</p>
            </div>
        </div>
      </div>
    )
  }

  getWalletSettings(){
    return(
      <div>
      <p id="walletBackup">{ this.props.lang.backup }</p>
        <p id="walletBackupExplanation">{ this.props.lang.backupExplanation }</p>
        <div className="row" style={{marginTop:"30px", marginBottom:"30px"}}>
          <div className="col-sm-6 text-center">
            <p className="buttonTransaction settingsButtonBackup" onClick={this.onClickBackupLocation}>{ this.props.lang.backup } wallet.dat</p>
          </div>
          <div className="col-sm-6 text-center">
            <p className="buttonTransaction settingsButtonBackup" onClick={this.handleExportPrivateKeys}>{ this.props.lang.exportPrivateKeys }</p>
          </div>
        </div>
        <div className="container">
          <div className="row settingsToggle">
            <div className="col-sm-10 text-left removePadding">
              <p className="walletBackupOptions">{ this.props.lang.password }</p>
            </div>
            <div className="col-sm-2 text-right removePadding">
            <p onClick={this.handleChangePasswordClicked} style={{cursor: "pointer"}}>{ this.props.lang.change }</p>
            </div>
          </div>
          <div className="row settingsToggle" >
            <div className="col-sm-10 text-left removePadding">
              <p className="walletBackupOptions">{ this.props.lang.privateKey }</p>
            </div>
            <div className="col-sm-2 text-right removePadding">
            <p onClick={this.handleImportPrivateKey} style={{cursor: "pointer"}}>{ this.props.lang.import }</p>
            </div>
          </div>

          {/*<div className="row settingsToggle">*/}
            {/*<div className="col-sm-6 text-left removePadding">*/}
              {/*<p>{ this.props.lang.wallet }</p>*/}
              {/*<p id="applicationVersion">{this.props.lang.walletImportInfo}</p>*/}
            {/*</div>*/}
            {/*<div className="col-sm-6 text-right removePadding">*/}
              {/*<p onClick={this.handleImportWalletFile} style={{cursor: "pointer"}}>{ this.props.lang.import }</p>*/}
            {/*</div>*/}
          {/*</div>*/}
        </div>
      </div>
    );
  }

  handleMediumClick(){
    open("https://medium.com/@project_ecc")
  }

  getNotificationSettings(){
    return(
      <div className="container">
        <SettingsToggle
          keyVal={2}
          text= { this.props.lang.operativeSystemNotifications }
          subText = {this.props.operativeSystemNotifications ? <p className="settingsToggleSubText">{ this.props.lang.operativeSystemNotificationDisable }</p> : <p className="settingsToggleSubText">{ this.props.lang.operativeSystemNotificationEnable }</p>}
          handleChange = {this.handleOperativeSystemNotifications}
          checked = {this.props.operativeSystemNotifications}
        />
        <SettingsToggle
          keyVal={3}
          text= {<p>{ this.props.lang.eccNewsNotificationsFrom } <span className="mediumToggle" onClick={this.handleMediumClick}>Medium</span></p>}
          handleChange = {this.handleNewsNotifications}
          checked = {this.props.newsNotifications}
        />
        <SettingsToggle
          keyVal={1}
          text= { this.props.lang.stakingNotifications }
          subText = {this.props.stakingNotifications ? <p className="settingsToggleSubText">{ this.props.lang.stakingNotificationsDisable }</p> : <p className="settingsToggleSubText">{ this.props.lang.stakingNotificationsEnable }</p>}
          handleChange = {this.handleStakingNotifications}
          checked = {this.props.stakingNotifications}
        />
      </div>
    )
  }

  getAdvancedSettings(){
    return(
      <div className="container">
        <div className="row settingsToggle" >
          <div className="col-sm-9 text-left removePadding">
            <p>Delete And Reindex</p>
            <p className="walletBackupOptions" style={{fontSize: "14px", fontWeight: "700"}}>Delete Index Transactions database (WARNING) this will delete your contacts</p>
          </div>
          <div className="col-sm-3 text-right removePadding">
            <p onClick={this.deleteAndReIndex.bind(this)} style={{cursor: "pointer"}}>Delete & Relaunch</p>
          </div>
        </div>
        <div className="row settingsToggle">
          <div className="col-sm-6 text-left removePadding">
            <p>Banlist</p>
            <p id="applicationVersion">Click clear banlist to remove all the banned nodes.</p>
          </div>
          <div className="col-sm-6 text-right removePadding">
            <p onClick={this.clearBanlist.bind(this)} style={{cursor: "pointer"}}>Clear Banlist</p>
          </div>
        </div>
      </div>
    )
  }

  goToUrl(url){
    open(url);
  }

  getLanguageSettings(){
    return(
      <div className="container removePadding">
        <div id="languageRectangle">
          <p id="languageHelp">{ this.props.lang.helpTranslate1 }</p>
          <p id="languageHelpDesc">{ this.props.lang.helpTranslate2 } <span onClick={this.goToUrl.bind(this,"https://poeditor.com/join/project/p7WYAsLDSj")}>{ this.props.lang.helpTranslate3 }.</span></p>
        </div>
        <div className="row" id="settingsLanguageSelector">
          <div className="col-sm-4 text-left">
            <p>{ this.props.lang.language }</p>
          </div>
          <div className="col-sm-8 text-right">
            <LanguageSelector />
          </div>
        </div>
      </div>
    )
  }

  forceSettingsUpdate(){
    this.forceUpdate();
  }

  getAppearanceSettings(){
    return(
      <div>
        <p id="walletBackup">{ this.props.lang.theme }</p>
        <ThemeSelector forceUpdate={this.forceSettingsUpdate.bind(this)} />
      </div>
    )
  }

  getDonateSettings() {
    return (<div><Donations/></div>)
  }

  getSettings(){
    switch(this.props.settingsOptionSelected){
      case "General": return this.getGeneralSettings();
      case "Wallet": return this.getWalletSettings();
      case "Language": return this.getLanguageSettings();
      case "Appearance": return this.getAppearanceSettings();
      case "Notifications": return this.getNotificationSettings();
      case "Donate": return this.getDonateSettings();
      case "Advanced": return this.getAdvancedSettings();
    }
  }

  handleIconHover(name){
    this.props.setHoveredSettingsSocialIcon(name);
  }

  handleIconUnhover(){
    this.props.setHoveredSettingsSocialIcon(undefined);
  }

  shouldComponentUpdate(props){
    console.log(props.theme);
    console.log(this.props.theme);
    if(props.theme !== this.props.theme){
      console.log("Forcing update.");
      this.forceUpdate()
    }
    return true;
  }

  render() {
    let twitter = Tools.getIconForTheme("twitter", false, this.props.theme);
    let facebook = Tools.getIconForTheme("facebook", false, this.props.theme);
    let medium = Tools.getIconForTheme("medium", false, this.props.theme);
    let reddit = Tools.getIconForTheme("reddit", false, this.props.theme);
    let slack = Tools.getIconForTheme("slack", false, this.props.theme);

    const hoveredIcon = this.props.hoveredIcon;

    if(hoveredIcon && hoveredIcon === "twitter"){
      twitter = Tools.getIconForTheme("twitter", true);
    }
    else if(hoveredIcon && hoveredIcon === "facebook"){
      facebook = Tools.getIconForTheme("facebook", true);
    }
    else if(hoveredIcon && hoveredIcon === "medium"){
      medium = Tools.getIconForTheme("medium", true);
    }
    else if(hoveredIcon && hoveredIcon === "reddit"){
      reddit = Tools.getIconForTheme("reddit", true);
    }
    else if(hoveredIcon && hoveredIcon === "slack"){
      slack = Tools.getIconForTheme("slack", true);
    }

    return (
      <div>
        <div id="brigher">
        </div>
        <div id="darker">
        </div>
        <div id="mainSettingsColorFix">
          <div id="settingsContainer">
            <div id="sidebarSettings">
              <p id="sidebarTitle">{ this.props.lang.appSettings }</p>
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "General")} selected={this.props.settingsOptionSelected === "General"} text={ this.props.lang.general } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Wallet")} selected={this.props.settingsOptionSelected === "Wallet"} text={ this.props.lang.wallet } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Notifications")} selected={this.props.settingsOptionSelected === "Notifications"} text={ this.props.lang.notifications } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Appearance")} selected={this.props.settingsOptionSelected === "Appearance"} text={ this.props.lang.appearance } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Language")} selected={this.props.settingsOptionSelected === "Language"} text={ this.props.lang.language } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Donate")} selected={this.props.settingsOptionSelected === "Donate"} text={ this.props.lang.donate } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Advanced")} selected={this.props.settingsOptionSelected === "Advanced"} text={ this.props.lang.advanced } />
              <div id="socialIcons">
                <img onMouseEnter={this.handleIconHover.bind(this, "twitter")} onMouseLeave={this.handleIconUnhover.bind(this)} onClick={this.goToUrl.bind(this, "https://twitter.com/project_ecc")} src={twitter} />
                <img onMouseEnter={this.handleIconHover.bind(this, "facebook")} onMouseLeave={this.handleIconUnhover.bind(this)} onClick={this.goToUrl.bind(this, "https://www.facebook.com/projectECC/")} src={facebook} />
                <img onMouseEnter={this.handleIconHover.bind(this, "medium")} onMouseLeave={this.handleIconUnhover.bind(this)} onClick={this.goToUrl.bind(this, "https://medium.com/@project_ecc")} src={medium} />
                <img onMouseEnter={this.handleIconHover.bind(this, "reddit")} onMouseLeave={this.handleIconUnhover.bind(this)} onClick={this.goToUrl.bind(this, "https://www.reddit.com/r/ecc/")} src={reddit} />
                <img onMouseEnter={this.handleIconHover.bind(this, "slack")} onMouseLeave={this.handleIconUnhover.bind(this)} onClick={this.goToUrl.bind(this, "https://ecc.network/#join-slack")} src={slack} />
              </div>
            </div>
            <div className="subSettings">
              {this.getSettings()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    sidebarHidden: state.sideBar.sidebarHidden,
    hideTrayIcon: state.application.hideTrayIcon,
    minimizeToTray: state.application.minimizeToTray,
    minimizeOnClose: state.application.minimizeOnClose,
    startAtLogin: state.application.startAtLogin,
    wallet: state.application.wallet,
    updateAvailable: state.startup.guiUpdate || state.startup.daemonUpdate,
    backingUpWallet: state.application.backingUpWallet,
    settingsOptionSelected: state.application.settingsOptionSelected,
    operativeSystemNotifications: state.notifications.operativeSystemNotificationsEnabled,
    newsNotifications: state.notifications.newsNotificationsEnabled,
    stakingNotifications: state.notifications.stakingNotificationsEnabled,
    hoveredIcon: state.application.settingsHoveredSocialIcon,
    theme: state.application.theme,
    daemonVersion: state.chains.daemonVersion,
    debugLog: state.application.debugLog
  };
};


export default connect(mapStateToProps, actions)(Settings);
