import React, { Component } from 'react';
import fs from 'fs';
import * as actions from '../../actions';
import { connect } from 'react-redux';
import $ from 'jquery';
import { ipcRenderer } from 'electron';
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
const Tools = require('../../utils/tools');

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
    this.reloadSettings('display.hide_tray_icon', !this.props.hideTrayIcon);
    this.props.setTray(!this.props.hideTrayIcon);
  }

  handleMinimizeToTray(){
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
    if(this.props.newsNotifications == true){
      this.props.setNewsChecked();
    }
    this.reloadSettings('notifications.news', !this.props.newsNotifications);
    this.props.setNewsNotifications(!this.props.newsNotifications);
  }

  handleStakingNotifications(){
    if(this.props.stakingNotifications == true){
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

  backupWallet(location){
    this.props.wallet.command([{
      method: 'backupwallet', parameters: [location]
    }
    ]).then((data) => {
      //Work on error handling
      if (data[0] === null) {
        this.props.setBackupOperationInProgress(false);
      } else {
        console.log("error backing up wallet: ", data);
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
          text= { this.props.lang.minimizeToTray }
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
            <p id="applicationVersion">v0.1.4g & v1.1.2d</p>
          </div>
          <div className="col-sm-6 text-right removePadding">
            <p onClick={this.handleUpdateApplication.bind(this)} id={this.props.updateAvailable ? "updateAvailable" : "updateUnavailable"}>{this.props.updateAvailable ? this.props.lang.installUpdate : this.props.lang.noUpdateAvailable }</p>
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
        </div>
      </div>
    )
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

  getSettings(){
    switch(this.props.settingsOptionSelected){
      case "General": return this.getGeneralSettings();
      case "Wallet": return this.getWalletSettings();
      case "Language": return this.getLanguageSettings();
      case "Appearance": return this.getAppearanceSettings();
      case "Notifications": return this.getNotificationSettings();
    }
  }

  handleIconHover(name){
    this.props.setHoveredSettingsSocialIcon(name);
  }

  handleIconUnhover(){
    this.props.setHoveredSettingsSocialIcon(undefined);
  }

  shouldComponentUpdate(props){
    console.log(props.theme)
    console.log(this.props.theme)
    if(props.theme != this.props.theme){
      console.log("Forcing update.")
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

    if(hoveredIcon && hoveredIcon == "twitter"){
      twitter = Tools.getIconForTheme("twitter", true);
    }
    else if(hoveredIcon && hoveredIcon == "facebook"){
      facebook = Tools.getIconForTheme("facebook", true);
    }
    else if(hoveredIcon && hoveredIcon == "medium"){
      medium = Tools.getIconForTheme("medium", true);
    }
    else if(hoveredIcon && hoveredIcon == "reddit"){
      reddit = Tools.getIconForTheme("reddit", true);
    }
    else if(hoveredIcon && hoveredIcon == "slack"){
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
              <p id="sidebarTitle">{ this.props.lang.appSettingsCAPS }</p>
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "General")} selected={this.props.settingsOptionSelected == "General" ? true : false} text={ this.props.lang.general } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Wallet")} selected={this.props.settingsOptionSelected == "Wallet" ? true : false} text={ this.props.lang.wallet } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Notifications")} selected={this.props.settingsOptionSelected == "Notifications" ? true : false} text={ this.props.lang.notifications } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Appearance")} selected={this.props.settingsOptionSelected == "Appearance" ? true : false} text={ this.props.lang.appearance } />
              <SettingsSidebarItem handleClicked={this.handleSidebarClicked.bind(this, "Language")} selected={this.props.settingsOptionSelected == "Language" ? true : false} text={ this.props.lang.language } />
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
  };
};


export default connect(mapStateToProps, actions)(Settings);
