import React, { Component } from 'react';
import fs from 'fs';
import connectWithTransitionGroup from 'connect-with-transition-group';
import * as actions from '../../actions';
import { connect } from 'react-redux';
import $ from 'jquery';
import ToggleButton from 'react-toggle';
import { traduction, language } from '../../lang/lang';
import { ipcRenderer } from 'electron';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import os from 'os';
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;
const app = remote.app;
const settings = require('electron-settings');
const homedir = require('os').homedir();

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
  }

  componentDidMount(){
    $( window ).on('resize', this.handleResize.bind(this));
  }

  handleResize(){
    $('#settingsContainer').css("height", $(window).height()-135);
  }

  componentWillUnmount(){

  }

  componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {
    console.log("componentDidAppear")
  }
  
   componentWillEnter (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.2, {y: document.body.clientHeight}, {y: 0,ease: Linear.easeNone, onComplete: callback});
  }
  
  componentDidEnter(callback) {
  }

  componentWillLeave (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.2, {y: 0}, {y: document.body.clientHeight, ease: Linear.easeNone, onComplete: callback});
  }
  
  componentDidLeave(callback) {
  }

  componentWillReceiveProps(props){
    console.log(props)
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

  onClickBackupLocation() {
    const self = this;
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        return;
      }
      const platform = os.platform();
      let walletpath;

      if (platform.indexOf('win') > -1) {
        walletpath = `${app.getPath('appData')}/eccoin/wallet.dat`;
      } else {
        walletpath = `${app.getPath('home')}/.eccoin/wallet.dat`;
      }

      fs.readFile(walletpath, (err, data) => {
        if (err) {
          console.log(err)
          return;
        }

        fs.writeFile(`${folderPaths}/walletBackup.dat`, data, (err) => {
          if (err) {
            console.log(err)
            return;
          }
          else{
            self.props.setBackupOperationCompleted(true);
          }
        
        });
      });
    });
  }

  render() {
    return (
      <div ref="second" id="settings" className="sendPanel" style={{position: "absolute", backgroundColor: "#181e35", top:"40px", height: "100%", width: "100%", paddingLeft: "40px", paddingRight: this.props.sidebarHidden ? "0px" : "224px", overflow:"hidden", zIndex: "10"}}>
        <p style={{fontSize: "55px", color: "#1f2642", fontWeight: "bold", maxWidth: "775px", margin: "0 auto"}}>Settings</p>
        <div id="settingsContainer" style={{height: $(window).height()-135, overflowX:"hidden", overflowY:"auto", width:"100%"}}>
          <div style={{maxWidth: "725px", margin: "0 auto", marginTop:"20px"}}>
            <p style={{color: "#555d77", fontSize: "18px", fontWeight: "600", lineHeight:"25px", marginTop: "10px", textAlign:"right", position:"relative", top:"-26px"}}>No update available</p>
            <p style={{color: "#b4b7c8", fontSize: "21px"}}>Backup</p>
            <p style={{color: "#555d77", fontSize: "18px", fontWeight: "600", lineHeight:"25px", marginTop: "10px", textAlign:"justify"}}>You should backup your wallet whenever you generate a new address. There are two ways to backup a wallet. One is by backing up a file named wallet.dat, which contains your private keys and gives you access to your addresses. The second and the safest method is by printing the private keys and storing them in a safe. Do not store the private keys in digital form, export them using the function below, print them and delete the file. If anyone gains access to your private keys they can access your ECC.</p>
            <div className="row" style={{marginTop:"30px", marginBottom:"30px"}}>
              <div className="col-sm-6 text-center">
                <p className="buttonTransaction" onClick={this.onClickBackupLocation} style={{padding: "6px 9px", fontSize:"15px", bottom:"auto"}}>Backup wallet.dat</p>
              </div>  
              <div className="col-sm-6 text-center">
                <p className="buttonTransaction" onClick={this.handleExportPrivateKeys} style={{padding: "6px 9px", fontSize:"15px", bottom:"auto"}}>Export Private Keys</p>
              </div>  
            </div>  
            <p style={{color: "#b4b7c8", fontSize: "21px"}}>General</p>
            <div className="row" style={{marginTop:"30px", marginBottom:"30px"}}>
              <div className="col-sm-10 text-left">
                <p style={{color: "#555d77", fontWeight:"600"}}>Start ECC on System Login</p>
              </div>
              <div className="col-sm-2 text-center">
              <ToggleButton checked={this.props.startAtLogin}  onChange={() => {this.handleStartAtLogin(); }} />
              </div>
            </div>
            <div className="row" style={{marginTop:"30px", marginBottom:"30px"}}>
              <div className="col-sm-10 text-left">
                <p style={{color: "#555d77", fontWeight:"600"}}>Hide tray icon</p>
              </div>
              <div className="col-sm-2 text-center">
              <ToggleButton checked={this.props.hideTrayIcon}  onChange={() => {this.setTrayIcon(); }} />
              </div>
            </div>
            <div className="row" style={{marginTop:"30px", marginBottom:"30px"}}>
              <div className="col-sm-10 text-left">
                <p style={{color: "#555d77", fontWeight:"600"}}>Minimize to tray instad of the task bar</p>
              </div>
              <div className="col-sm-2 text-center">
              <ToggleButton checked={this.props.minimizeToTray}  onChange={() => {this.handleMinimizeToTray(); }} />
              </div>
            </div>
            <div className="row" style={{marginTop:"30px", marginBottom:"30px"}}>
              <div className="col-sm-10 text-left">
                <p style={{color: "#555d77", fontWeight:"600"}}>Minimize on close</p>
              </div>
              <div className="col-sm-2 text-center">
              <ToggleButton checked={this.props.minimizeOnClose}  onChange={() => {this.handleMinimizeOnClose(); }} />
              </div>
            </div>
            <p style={{color: "#b4b7c8", fontSize: "21px"}}>Language</p>
            <div className="row" style={{marginTop:"30px", marginBottom:"30px"}}>
              <div className="col-sm-6 text-left">
                <p style={{color: "#555d77", fontWeight:"600"}}>Select language</p>
              </div>
              <div className="col-sm-6 text-center">
                <div style={{position:"relative"}}>
                  <div className="dropdownLanguageSelector" style={{position:"absolute", right: "0px"}} onBlur={this.handleDrowDownUnfocus} onClick={this.handleDropDownClicked}>
                    <div className="selectLanguageSelector">
                      <p>{language()}</p>
                      <i className="fa fa-chevron-down"></i>
                    </div>
                    <input type="hidden" name="gender"></input>
                    <ul className="dropdown-menuLanguageSelector">
                        <li onClick={this.onItemClick} data-id="bg">български (Bulgarian)</li>
                        <li onClick={this.onItemClick} data-id="zh_cn">简体中文—中国 (Chinese - CN)</li>
                        <li onClick={this.onItemClick} data-id="zh_hk">繁體中文-中華人民共和國香港特別行政區 (Chinese - HK)</li>
                        <li onClick={this.onItemClick} data-id="nl">Nederlands (Dutch)</li>
                        <li onClick={this.onItemClick} data-id="en">English</li>
                        <li onClick={this.onItemClick} data-id="fr">Français (French)</li>
                        <li onClick={this.onItemClick} data-id="de">Deutsch (German)</li>
                        <li onClick={this.onItemClick} data-id="el">ελληνικά (Greek)</li>
                        <li onClick={this.onItemClick} data-id="ko">한국어(Korean)</li>
                        <li onClick={this.onItemClick} data-id="pl">Polski (Polish)</li>
                        <li onClick={this.onItemClick} data-id="pt">Português (Portuguese)</li>
                        <li onClick={this.onItemClick} data-id="ru">Русский язык (Russian)</li>
                        <li onClick={this.onItemClick} data-id="sl">Slovenčina (Slovenian)</li>
                        <li onClick={this.onItemClick} data-id="es">Español (Spanish)</li>
                        <li onClick={this.onItemClick} data-id="tr">Türkçe (Turkish)</li>
                        <li onClick={this.onItemClick} data-id="vn">Tiếng việt (Vietnamese)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <p style={{color: "#b4b7c8", fontSize: "21px"}}>Theme</p>
             <div id="themes" style={{position:"relative", marginTop:"30px", left:"-32px"}}>
              <div className="themeSelector" id="darkTheme">
               <div className="themes">
                 <div className="theme">
                  <div className="divSquare" style={{backgroundColor: "#d09128"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#21242a"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#333840"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#1e2544"}}></div>
                 </div> 
               </div>
                 <p className="themeName">Dark</p>
               </div>
               <div className="themeSelector">
               <div className="themes">
                 <div className="theme">
                  <div className="divSquare" style={{backgroundColor: "#d09128"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#14182f"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#c4c4d3"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#1e2544"}}></div>
                 </div> 
               </div>
                 <p className="themeName">Default</p>
               </div>
               <div className="themeSelector" id="lightTheme">
               <div className="themes">
                 <div className="theme">
                  <div className="divSquare" style={{backgroundColor: "#bbbbbb"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#17152a"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#de9b2b"}}></div>
                  <div className="divSquare" style={{backgroundColor: "#ffffff"}}></div>
                 </div> 
               </div>
                 <p className="themeName">Light</p>
               </div>
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
    backupCompleted: state.application.backupOperationCompleted
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(Settings));