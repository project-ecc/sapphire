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
import ClosingApplication from '../components/Others/ClosingApplication';
import { Link } from 'react-router-dom';
const settings = require('electron-settings');
import NotificationPopup from '../components/NotificationPopup';
import UnlockWallet from '../components/UnlockWallet';
import GenericPanel from './GenericPanel';
import TransitionComponent from '../components/Others/TransitionComponent';
const Tools = require('../utils/tools')
const notifier = require('node-notifier');

class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.getMainApp = this.getMainApp.bind(this);
    this.settings = this.settings.bind(this);
    this.loadSettingsToRedux = this.loadSettingsToRedux.bind(this);
    this.news = this.news.bind(this);
    this.notification = this.notification.bind(this);
    this.setGenericAnimationToFalse = this.setGenericAnimationToFalse.bind(this);
    this.setGenericAnimationToTrue = this.setGenericAnimationToTrue.bind(this);
    this.processCloseRequest = this.processCloseRequest.bind(this);
    this.close = this.close.bind(this);
  }
  componentDidMount() {
    this.props.getSetup();

    this.loadSettingsToRedux();

    ipcRenderer.on('closing_daemon', () => {
      this.processCloseRequest();
    });

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

    if(ds && ds.minimise_to_tray !== undefined && ds.minimise_to_tray)
      minimizeToTray = true;
    if(ds && ds.hide_tray_icon !== undefined && ds.hide_tray_icon)
      tray = true;
    if(ds && ds.minimise_on_close !== undefined && ds.minimise_on_close)
      minimizeOnClose = true;
    if(ds && ds.start_at_login !== undefined && ds.start_at_login)
      startAtLogin = true;

    this.props.setMinimizeOnClose(minimizeOnClose);
    this.props.setMinimizeToTray(minimizeToTray);
    this.props.setStartAtLogin(startAtLogin);
    this.props.setTray(tray);

    let operativeSystemNotifications = true;
    let newsNotifications = true;
    let stakingNotifications = true;

    const ns = settings.get('settings.notifications');

    if(ns && ns.operative_system !== undefined && ns.operative_system)
      operativeSystemNotifications = true;
    if(ns && ns.news !== undefined && ns.news)
      newsNotifications = true;
    if(ns && ns.staking !== undefined && ns.staking)
      stakingNotifications = true;

    this.props.setOperativeSystemNotifications(operativeSystemNotifications);
    this.props.setNewsNotifications(newsNotifications);
    this.props.setStakingNotifications(stakingNotifications);
  }

  getPopup(){
    let component = null;
    let id = "unlockPanel";
    let animateIn = Tools.animatePopupIn;
    let animateOut = Tools.animatePopupOut;
    let classVal = "";
    if(this.props.exportingPrivateKeys){
      component = <ExportPrivateKeys />;
    }
    else if(this.props.importingPrivateKey){
      component = <ImportPrivateKey notInitialSetup = {true}/>;
    }
    else if(this.props.changingPassword){
      component = <ChangePassword />
    }
    else if(this.props.changingPassword){
      component = <ImportPrivateKey />
    }    
    else if(this.props.updateApplication){
      component = <UpdateApplication />
    }    
    else if(this.props.sending){
      component = <SendConfirmation />
    }
    else if(this.props.creatingAddress){
      component = <ConfirmNewAddress />
    }
    else if(this.props.unlocking){
      component = <UnlockWallet />
    }
    else if(this.props.closingApplication){
      component = <ClosingApplication />
      classVal = "closingApplication"
    }

    return(
      <div>
        <TransitionGroup component="article">
          { component != null ? 
            <TransitionComponent 
              children={component}
              id= {id}
              class = {classVal}
              animationType= "popup"
              animateIn= {animateIn}
              animateOut = {animateOut}/> 
            : null
          }
        </TransitionGroup>
      </div>
    )
  }

  news(){
    let settingsSelected = this.props.settings;
    this.props.setNotifications(false);
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
    if(this.props.genericPanelAnimationOn) return;
    this.props.setNotifications(false);
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
    if(!this.props.minimizeOnClose){
      this.processCloseRequest();
    }
  }

  processCloseRequest(){
    if(this.props.loader){
      TweenMax.to('#loading-wrapper', 0.3, {autoAlpha: 0.5});
    }
    Tools.hideFunctionIcons();
    this.props.setClosingApplication();
  }

  getLoader(){
    return(
      <div>
        <TransitionGroup component="aside">
          { this.props.loader || this.props.updatingApplication ?
            <TransitionComponent 
              children={<Loading />}
              id= "loading-wrapper"
              animationType= "loader"
              animateIn= {Tools.animateLoaderIn}
              animateOut = {Tools.animateLoaderOut}
              animateLogo = {this.animateLogo.bind(this)}
              updatingApplication = {this.props.updatingApplication}/>
              : null
          }
        </TransitionGroup>
      </div>
    )
  }

  animateLogo(callback){
    CSSPlugin.useSVGTransformAttr = false;
    TweenMax.to(['#logoLoader'], 0.5, {autoAlpha: 1});
    if(!this.props.loading)
      TweenMax.to(['#gettingReady'], 0.5, {autoAlpha: 1});

    let t = new TimelineMax({repeat:-1, yoyo:true});
    t.set(['#first', '#second', '#third', '#forth'], {x:20, y:20})
    t.fromTo('#first', 2, {autoAlpha: 0, scale: 0.90}, { scale: 1, autoAlpha: 1, transformOrigin: '50% 50%', ease: Power4.easeNone, delay: 0.3}, 0)
    t.fromTo('#second', 2, {autoAlpha: 0, scale: 0.90}, { scale: 1, autoAlpha: 1, transformOrigin: '50% 50%', ease: Power4.easeNone, delay: 0.3}, 0)
    t.fromTo('#third', 2, {autoAlpha: 0, scale: 0.90}, { scale: 1, autoAlpha: 1, transformOrigin: '50% 50%',ease: Power4.easeNone, delay: 0.3}, 0)
    t.fromTo('#forth', 2, {autoAlpha: 0, scale: 0.90}, { scale: 1, autoAlpha: 1, transformOrigin: '50% 50%', ease: Power4.easeNone, delay: 0.3}, 0)
    t.fromTo('#logo1', 2, {autoAlpha: 1}, {autoAlpha: 0, delay: 0.3}, 0)
    t.timeScale(2);
    callback();
  }

  resetWillChange(callback){
    const el = this.refs.animate;
    TweenMax.set(el, {willChange: 'auto'});
    this.props.setGenericAnimationToFalse();
    callback();
  }

  setGenericAnimationToFalse(){
    this.props.setGenericAnimationOn(false);
  }

  setGenericAnimationToTrue(){
    this.props.setGenericAnimationOn(true);
  }

  getMainApp(){  
    if(!this.props.unencryptedWallet && this.props.setupDone && !this.props.loader && !this.props.updatingApplication && !this.props.settings){
      return(
          <TransitionGroup component="section">
            <TransitionComponent 
              children={<GenericPanel />}
              id= ""
              class= "genericPanel"
              animationType= "genericPanel"
              animateIn= {Tools.animateGeneralPanelIn}
              animateOut = {Tools.animateGeneralPanelOut}
              resetWillChange = {this.resetWillChange}
              setGenericAnimationToFalse = {this.setGenericAnimationToFalse}
              setGenericAnimationToTrue = {this.setGenericAnimationToTrue}/>
          </TransitionGroup>
      )
    }
    else
      return null;
  }

  getSettings(){
    if(this.props.settings){
      return(
        <TransitionGroup component="section">
          <TransitionComponent 
            children={<Settings />}
            id= "settings"
            animationType= "settings"
            animateIn= {Tools.animateGeneralPanelIn}
            animateOut = {Tools.animateGeneralPanelOut}
            resetWillChange = {this.resetWillChange}
            setGenericAnimationToFalse = {this.setGenericAnimationToFalse}
            setGenericAnimationToTrue = {this.setGenericAnimationToTrue}/>
        </TransitionGroup>
      )
    }
    else
      return null;
  }

  getInitialSetup(){
    if(!this.props.setupDone && !this.props.loader && !this.props.updatingApplication || this.props.unencryptedWallet){
      return(
        <TransitionGroup>
          <TransitionComponent 
            children={<InitialSetup/>}
            id= "initialSetup"
            animationType= "initialSetup"
            animateIn= {Tools.animateInitialSetupIn}
            animateOut = {Tools.animateInitialSetupOut}/>
        </TransitionGroup>
      )
    }
    return null;
  }

  getNotificationsPopup(){
    if(this.props.notificationPopup){
      return(
        <NotificationPopup/>
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
             <div onClick={this.notification} className="appButton functionIcon" id="eccNewsIcon">
                <img src={notification}></img>
              </div>
             <div onClick={this.news} className="appButton functionIcon" id="eccNewsIcon">
                <img src={news}></img>
              </div>
              <div onClick={this.settings} className="appButton functionIcon">
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
        {this.getMainApp()}
        {this.getInitialSetup()}
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
    creatingAddress: state.application.creatingAddress,
    unencryptedWallet: state.startup.unencryptedWallet,
    loading: state.startup.loading,
    genericPanelAnimationOn: state.application.genericPanelAnimationOn,
    minimizeOnClose: state.application.minimizeOnClose,
    closingApplication: state.application.closingApplication
  };
};

export default connect(mapStateToProps, actions)(App);