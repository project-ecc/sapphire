import React, { Component } from 'react';
import $ from 'jquery';
import Sidebar from './Sidebar';
import InitialSetup from './Pages/InitialSetup';
import Settings from '../components/SettingsPage/Settings';
import { ipcRenderer } from 'electron';
import Loading from '../components/LoaderPage/LoaderPage';
import { connect } from 'react-redux';
import * as actions from '../actions';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import ExportPrivateKeys from '../components/SettingsPage/ExportPrivateKeys';
import ImportPrivateKey from '../components/InitialSetupPage/ImportPrivateKey';
import ChangePassword from '../components/SettingsPage/ChangePassword';
import UpdateApplication from '../components/SettingsPage/UpdateApplication';
import SendConfirmation from '../components/SendTransactions/SendConfirmation';
import ConfirmNewAddress from '../components/ReceiveTransaction/ConfirmNewAddress';
import { Link } from 'react-router-dom';
const settings = require('electron-settings');
import NotificationPopup from '../components/NotificationPopup';
import UnlockWallet from '../components/UnlockWallet';
import GenericPanel from './GenericPanel';

class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.getMainApp = this.getMainApp.bind(this);
    this.settings = this.settings.bind(this);
    this.loadSettingsToRedux = this.loadSettingsToRedux.bind(this);
    this.news = this.news.bind(this);
    this.notification = this.notification.bind(this);
  }
  componentDidMount() {
    this.props.getSetup();

    this.loadSettingsToRedux();

    ipcRenderer.on('focused', (e) => {
      $(".appButton").mouseover(function(){
        $(this).addClass('appButtonHover');
      })
      $(".appButton").mouseleave(function(){   
        $(this).removeClass('appButtonHover');
      })
    });
  }

  loadSettingsToRedux(){
    let tray = false;
    let startAtLogin = false;
    let minimizeToTray = false;
    let minimizeOnClose = false;
    const ds = settings.get('settings.display');
    //TODO can't really be undefined
    if(ds == undefined) return;

    if(ds.minimise_to_tray !== undefined && ds.minimise_to_tray)
      minimizeToTray = true;
    if(ds.tray_icon !== undefined && ds.tray_icon)
      tray = true;
    if(ds.minimise_on_close !== undefined && ds.minimise_on_close)
      minimizeOnClose = true;
    if(ds.start_at_login !== undefined && ds.start_at_login)
      startAtLogin = true;

    this.props.setMinimizeOnClose(minimizeOnClose);
    this.props.setMinimizeToTray(minimizeToTray);
    this.props.setStartAtLogin(startAtLogin);
    this.props.setTray(tray);
  }

  getPopup(){
    return(
      <div>
        <TransitionGroup component={"article"}> 
         { this.props.exportingPrivateKeys ? <ExportPrivateKeys/> : null}
        </TransitionGroup>
        <TransitionGroup component={"aside"}>
         { this.props.importingPrivateKey ? <ImportPrivateKey notInitialSetup = {true}/> : null}
        </TransitionGroup>
        <TransitionGroup component={"aside"}>
         { this.props.changingPassword ? <ChangePassword/> : null}
        </TransitionGroup>
        <TransitionGroup  component={"aside"}>
         { this.props.updateApplication ? <UpdateApplication/> : null}
        </TransitionGroup>
        <TransitionGroup component={"article"}>
           { this.props.unlocking ? <UnlockWallet/> : null}
        </TransitionGroup>
        <TransitionGroup component={"article"}>
           { this.props.sending ? <SendConfirmation/> : null}
        </TransitionGroup>
        <TransitionGroup component={"article"}>
            { this.props.creatingAddress ? <ConfirmNewAddress/> : null}
        </TransitionGroup>
      </div>
    )
  }
  getMainApp(){
    return(
      <div>
        <TransitionGroup component={"section"}>
          {<GenericPanel/>}
        </TransitionGroup>
      </div>
    )
  }

  news(){
    var settingsSelected = this.props.settings;
    if(this.props.news && !settingsSelected){ 
      return;
    }
    this.props.setSelectedPanel("news");
    this.props.selectedSideBar(undefined);
    this.props.setShowingNews(settingsSelected ? true : !this.props.news);
    if(this.props.settings){
      this.props.setSettings(false);
      this.props.setExportingPrivateKeys(false);
      this.props.setPanelExportingPrivateKeys(1);
      this.props.setImportingPrivateKey(false);
      this.props.setChangingPassword(false);
      this.props.setUpdateApplication(false);
      TweenMax.to($('.mancha'), 0.2, { autoAlpha:0, ease: Linear.easeNone});
    }
  }

  notification(){
    if(!this.props.notificationPopup){
      this.props.setExportingPrivateKeys(false);
      this.props.setPanelExportingPrivateKeys(1);
      this.props.setImportingPrivateKey(false);
      this.props.setChangingPassword(false);
      this.props.setUpdateApplication(false);
      TweenMax.to($('.mancha'), 0.2, { autoAlpha:0, ease: Linear.easeNone});
    }
    this.props.setNotifications(!this.props.notificationPopup);

  }
  
  settings(){
    if(this.props.checkingDaemonStatusPrivateKey) return;
    this.props.setSettings(!this.props.settings);
    this.props.setExportingPrivateKeys(false);
    this.props.setPanelExportingPrivateKeys(1);
    this.props.setImportingPrivateKey(false);
    this.props.setChangingPassword(false);
    this.props.setUpdateApplication(false);
    TweenMax.to($('.mancha'), 0.2, { autoAlpha:0, ease: Linear.easeNone});
  }

  minimize(){
    ipcRenderer.send('minimize');
    $(".appButton").removeClass('appButtonHover');
  }

  maximize(){
    ipcRenderer.send('maximize');
  }
  close(){
    ipcRenderer.send('close');
  }

  getLoader(){
    console.log("LOADER: ", this.props.loader || this.props.updatingApplication)
    if(this.props.loader || this.props.updatingApplication){
      return(
        <TransitionGroup component={"aside"}>
          <Loading />
        </TransitionGroup> 
      )
    }
    else{
      return null;
    }
  }

  getSettings(){
    if(this.props.settings){
      return(
        <TransitionGroup component={"section"}>
          <Settings />
        </TransitionGroup>
      )
    }else{
      return null;
    }
  }

  getNotificationsPopup(){
    if(this.props.notificationPopup){
      return(
        <TransitionGroup>
          <NotificationPopup/>
        </TransitionGroup>
      )
    }
    else 
      return null;
  }
  render() {
    const minimize = require('../../resources/images/minimize.png');
    const maximize = require('../../resources/images/maximize.png');
    const close = require('../../resources/images/close.png');
    const miniButton = require('../../resources/images/logo_setup.png');
    let settings = require('../../resources/images/settings-white.png');
    let notification = require('../../resources/images/notification-white.png');
    let news = require('../../resources/images/news-white.png');
    if(this.props.settings){
      settings = require('../../resources/images/settings-orange.png');
    }
    if(this.props.news && !this.props.settings){
       news = require('../../resources/images/news-orange.png');
    }
    return (
      <div id="main">
        <div id="wrapperToBeAbleToResize">
          <div id="topBar">
          <img className="miniButton" src={miniButton}></img>
            <div id="appButtons">
             <div onClick={this.notification} className="appButton" id="eccNewsIcon">
                <img src={notification}></img>
              </div>
             <div onClick={this.news} className="appButton" id="eccNewsIcon">
                <img src={news}></img>
              </div>
              <div onClick={this.settings} className="appButton">
                <img src={settings}></img>
              </div>
              <div onClick={this.minimize} className="appButton">
                <img src={minimize}></img>
              </div>
              <div onClick={this.maximize} className="appButton">
                <img src={maximize}></img>
              </div>
              <div onClick={this.close} className="appButton appButtonClose">
                <img src={close}></img>
              </div>
            </div>
          </div>
        </div>
        <div className="mancha">
        </div>
        <div>
        {this.props.setupDone && !this.props.loader && !this.props.updatingApplication && !this.props.settings ? this.getMainApp()  : null}
        <TransitionGroup>
          {!this.props.setupDone && !this.props.loader && !this.props.updatingApplication ? <InitialSetup/> : null}
        </TransitionGroup>
        {this.getSettings()}
        {this.getLoader()}
        {this.getNotificationsPopup()}
        {this.getPopup()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    initialSetup: state.startup.initialSetup,
    partialInitialSetup: state.startup.partialInitialSetup,
    setupDone: state.startup.setupDone,
    loader: state.startup.loader || (state.chains.loadingBlockIndexPayment && !state.startup.initialSetup),
    //had to add this for production, otherwise clicking on sidebar would not cause the tab to change (no idea why)
    pathname: state.router.location.pathname,
    settings: state.application.settings,
    exportingPrivateKeys: state.application.exportingPrivateKeys,
    importingPrivateKey: state.application.importingPrivateKey,
    changingPassword: state.application.changingPassword,
    checkingDaemonStatusPrivateKey: state.application.checkingDaemonStatusPrivateKey,
    news: state.application.selectedPanel == "news" ? true : false,
    updateApplication: state.application.updateApplication,
    updatingApplication: state.startup.updatingApp,
    notificationPopup: state.notifications.popupEnabled,
    unlocking: state.application.unlocking,
    sending: state.application.sendingEcc,
    creatingAddress: state.application.creatingAddress
  };
};

export default connect(mapStateToProps, actions)(App);