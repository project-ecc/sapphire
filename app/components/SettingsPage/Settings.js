import React, { Component } from 'react';
import fs from 'fs';
import connectWithTransitionGroup from 'connect-with-transition-group';
import * as actions from '../../actions';
import { connect } from 'react-redux';
import $ from 'jquery';
import { ipcRenderer } from 'electron';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import os from 'os';
import SettingsToggle from './SettingsToggle';
import SettingsSidebarItem from './SettingsSidebarItem';
import LanguageSelector from '../Others/LanguageSelector';
import ThemeSelector from '../Others/ThemeSelector';
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;
const app = remote.app;
const settings = require('electron-settings');
const homedir = require('os').homedir();
var open = require("open");

class Settings extends Component {
  constructor(props) {
    super(props);
    this.setTrayIcon = this.setTrayIcon.bind(this);
    this.handleMinimizeToTray = this.handleMinimizeToTray.bind(this);
    this.handleMinimizeOnClose = this.handleMinimizeOnClose.bind(this);
    this.handleStartAtLogin = this.handleStartAtLogin.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.handleExportPrivateKeys = this.handleExportPrivateKeys.bind(this);
    this.onClickBackupLocation = this.onClickBackupLocation.bind(this);
    this.backupWallet = this.backupWallet.bind(this);
    this.handleImportPrivateKey = this.handleImportPrivateKey.bind(this);
    this.handleChangePasswordClicked = this.handleChangePasswordClicked.bind(this);
    this.handleSidebarClicked = this.handleSidebarClicked.bind(this);
  }

  componentDidMount(){
    $( window ).on('resize', this.handleResize.bind(this));
  }

  handleResize(){
  }

  componentWillUnmount(){

  }

  componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear() {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.2, {autoAlpha: 0, scale: 2.5}, {autoAlpha: 1, scale: 1, ease: Linear.easeNone});
  }
  
   componentWillEnter (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.2, {autoAlpha: 0, scale: 2.5}, {autoAlpha: 1, scale: 1, ease: Linear.easeNone, onComplete: callback});
  }
  
  componentDidEnter(callback) {
    callback();
  }

  componentWillLeave (callback) {
    console.log("componentWillLeave")
  }
  
  componentDidLeave(callback) {
    console.log("componentWillLeave")
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
    ipcRenderer.send('hideTray', !this.props.hideTrayIcon);
    this.reloadSettings(!this.props.hideTrayIcon, this.props.minimizeOnClose, this.props.minimizeToTray, this.props.startAtLogin);
    this.props.setTray(!this.props.hideTrayIcon);

  }

  handleMinimizeToTray(){
    this.reloadSettings(this.props.hideTrayIcon, this.props.minimizeOnClose, !this.props.minimizeToTray, this.props.startAtLogin);
    this.props.setMinimizeToTray(!this.props.minimizeToTray);
  }

  handleMinimizeOnClose(){
    this.reloadSettings(this.props.hideTrayIcon, !this.props.minimizeOnClose, this.props.minimizeToTray, this.props.startAtLogin);
    this.props.setMinimizeOnClose(!this.props.minimizeOnClose);
  }

  handleStartAtLogin(){
    ipcRenderer.send('autoStart', !this.props.startAtLogin);
    this.reloadSettings(this.props.hideTrayIcon, this.props.minimizeOnClose, this.props.minimizeToTray, !this.props.startAtLogin);
    this.props.setStartAtLogin(!this.props.startAtLogin);
  }

  reloadSettings(hideTrayIcon, minimizeOnClose, minimizeToTray, startAtLogin){
    settings.set('settings.display', {
      hyde_tray_icon: hideTrayIcon,
      minimise_to_tray: minimizeToTray,
      minimise_on_close: minimizeOnClose,
      start_at_login: startAtLogin
    });
    ipcRenderer.send('reloadSettings');
  }

  handleExportPrivateKeys(){
    this.props.setExportingPrivateKeys(!this.props.exportingPrivateKeys)
  }

  backupWallet(location){
    var self = this;
    this.props.wallet.command([{
      method: 'backupwallet', parameters: [location]
    }
    ]).then((data) => {
      //Work on error handling
      if (data[0] === null) {
        this.props.setBackupOperationInProgress(false);
      } else {
        console.log("error backing up wallet: ", data)
        this.props.setBackupOperationInProgress(false);
      }
    }).catch((err) => {
      console.log("exception backing up wallet: ", err)
    });
  }

  onClickBackupLocation() {
    if(this.props.backingUpWallet) return;
    this.props.setBackupOperationInProgress(true);
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
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

  getGeneralSettings(){
    return(
      <div className="container">
        <SettingsToggle 
          text= "Start ECC on system login"
          handleChange = {this.handleStartAtLogin}
          checked = {this.props.startAtLogin}
        />
        <SettingsToggle 
          text= "Hide tray icon"
          handleChange = {this.setTrayIcon}
          checked = {this.props.hideTrayIcon}
        />
        <SettingsToggle 
          text= "Minimize to tray instead of the task bar"
          handleChange = {this.handleMinimizeToTray}
          checked = {this.props.minimizeToTray}
        />
        <SettingsToggle 
          text= "Minimize on close"
          handleChange = {this.handleMinimizeOnClose}
          checked = {this.props.minimizeOnClose}
        />
        <div className="row settingsToggle">
          <div className="col-sm-6 text-left removePadding">
            <p>Application version</p>
            <p id="applicationVersion">v0.1.4g & v1.1.2d</p>
          </div>
          <div className="col-sm-6 text-right removePadding">
            <p onClick={this.handleUpdateApplication.bind(this)} id={this.props.updateAvailable ? "updateAvailable" : "updateUnavailable"}>{this.props.updateAvailable ? "Install Update" : "No update available"}</p>
          </div>
        </div>
      </div>
    )
  }

  getWalletSettings(){
    return(
      <div>
      <p id="walletBackup">Backup</p>
        <p id="walletBackupExplanation">You should backup your wallet whenever you generate a new address. There are two ways to backup a wallet. One is by backing up a file named wallet.dat, which contains your private keys and gives you access to your addresses. The second and the safest method is by printing the private keys and storing them in a safe. Do not store the private keys in digital form, export them using the function below, print them and delete the file. If anyone gains access to your private keys they can access your ECC.</p>
        <div className="row" style={{marginTop:"30px", marginBottom:"30px"}}>
          <div className="col-sm-6 text-center">
            <p className="buttonTransaction settingsButtonBackup" onClick={this.onClickBackupLocation}>Backup wallet.dat</p>
          </div>  
          <div className="col-sm-6 text-center">
            <p className="buttonTransaction settingsButtonBackup" onClick={this.handleExportPrivateKeys}>Export Private Keys</p>
          </div>  
        </div> 
        <div className="container">
          <div className="row settingsToggle">
            <div className="col-sm-10 text-left removePadding">
              <p className="walletBackupOptions">Password</p>
            </div>
            <div className="col-sm-2 text-right removePadding">
            <p onClick={this.handleChangePasswordClicked} style={{cursor: "pointer"}}>Change</p>
            </div>
          </div>
          <div className="row settingsToggle" >
            <div className="col-sm-10 text-left removePadding">
              <p className="walletBackupOptions">Private Key</p>
            </div>
            <div className="col-sm-2 text-right removePadding">
            <p onClick={this.handleImportPrivateKey} style={{cursor: "pointer"}}>Import</p>
            </div>
          </div>
        </div> 
      </div>
    )
  }

  goToTranslationPlatform(){
    open("https://poeditor.com/join/project/p7WYAsLDSj");
  }

  getLanguageSettings(){
    return(
      <div className="container removePadding">
        <div id="languageRectangle">
          <p id="languageHelp">Help translate Sapphire</p>
          <p id="languageHelpDesc">If your language is not available and you’d like to help us add it to Sapphire please visit our <span onClick={this.goToTranslationPlatform}>translation platform.</span></p>
        </div>
        <div className="row" id="settingsLanguageSelector">
          <div className="col-sm-4 text-left">
            <p >Language</p>
          </div>
          <div className="col-sm-8 text-right">
            <LanguageSelector />
          </div>
        </div>
      </div>
    )
  }

  getAppearanceSettings(){
    return(
      <div>
        <p id="walletBackup">Theme</p>
        <ThemeSelector />
      </div>
    )
  }

  getSettings(){
    switch(this.props.settingsOptionSelected){
      case "General": return this.getGeneralSettings();
      case "Wallet": return this.getWalletSettings();
      case "Language": return this.getLanguageSettings();
      case "Appearance": return this.getAppearanceSettings();
    }
  }

  render() {
    return (
      <div ref="second" id="settings" style={{position: "absolute", top:"40px", height: "100%", width: "100%"}}>
        <div id="brigher">
        </div>
        <div id="darker">
        </div>
        <div id="mainSettingsColorFix">
          <div id="settingsContainer">
            <div id="sidebarSettings">
              <p id="sidebarTitle">APP SETTINGS</p>
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "General")} selected={this.props.settingsOptionSelected == "General" ? true : false} text="General" />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Wallet")} selected={this.props.settingsOptionSelected == "Wallet" ? true : false} text="Wallet" />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Notifications")} selected={this.props.settingsOptionSelected == "Notifications" ? true : false} text="Notifications" />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Appearance")} selected={this.props.settingsOptionSelected == "Appearance" ? true : false} text="Appearance" />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Language")} selected={this.props.settingsOptionSelected == "Language" ? true : false} text="Language" />
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
    settingsOptionSelected: state.application.settingsOptionSelected
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(Settings));