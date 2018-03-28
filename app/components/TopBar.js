import React, { Component } from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { ipcRenderer } from 'electron';

class TopBar extends React.Component {
 constructor() {
    super();
    this.getDarwinBar = this.getDarwinBar.bind(this);
    this.close = this.close.bind(this);
    this.settings = this.settings.bind(this);
    this.news = this.news.bind(this);
    this.notification = this.notification.bind(this);
    this.maximize = this.maximize.bind(this);
  }

  componentDidMount(){
    $('#appButtonsMac').on("mouseenter", () => {
      this.props.setMacButtonsHover(true);
    });
    $('#appButtonsMac').on("mouseleave", () => {
      this.props.setMacButtonsHover(false);
    });

    if (process.platform === 'darwin'){
      ipcRenderer.on('full-screen', () => {this.fullScreenMac(true)});
    }
  }

  componentWillUnmount(){
    $('#appButtonsMac').off('mouseenter');
    $('#appButtonsMac').off('mouseleave');
  }

  minimize(){
    ipcRenderer.send('minimize');
    $(".appButton").removeClass('appButtonHover');
  }

  fullScreenMac(externalAction){
    if(!externalAction){
      ipcRenderer.send('full-screen');
    }
    this.props.setAppMaximized(!this.props.appMaximized);
  }

  maximize(){
    ipcRenderer.send('maximize');
    this.props.setAppMaximized(!this.props.appMaximized);
  }

  close(){
    ipcRenderer.send('close');
    if(!this.props.minimizeOnClose){
      this.props.closeSapphire();
    }
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

  getDarwinBar(){
    let minimize = require('../../resources/images/mac-minimize-inactive.png');
    let maximize = require('../../resources/images/mac-fullscreen-inactive.png');
    let close = require('../../resources/images/mac-close-inactive.png');

    if(this.props.macButtonsHover){
      minimize = require('../../resources/images/mac-minimize-active.png');
      maximize = require('../../resources/images/mac-fullscreen-active.png');
      close = require('../../resources/images/mac-close-active.png');
    }
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

    return(
      <div>
        <img className="miniButton" src={miniButton}></img>
        <div id="appButtonsMac">
          <div onClick={this.close} className="appButtonMac">
            <img src={close}></img>
          </div>
          <div onClick={this.minimize} className="appButtonMac">
            <img src={minimize}></img>
          </div>
          <div onClick={this.fullScreenMac.bind(this, false)} className="appButtonMac">
            <img src={maximize}></img>
          </div>
        </div>
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
        </div>
      </div>
    )
  }

  getWinLinBar(){
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

    return(
      <div>
        <img className="miniButton" src={miniButton}></img>
        <p id="topBarCustomTitle">Messaging</p>
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
          <div onClick={this.maximize.bind(this, false)} className="appButton">
            <img src={maximize}></img>
          </div>
          <div onClick={this.close} className="appButton appButtonClose">
            <img src={close}></img>
          </div>
        </div>
      </div>
    )
  }

  render() { 
    let menuBar = null;
    if (process.platform === 'darwin'){
      menuBar = this.getDarwinBar();
    }
    else{
      menuBar = this.getWinLinBar();
    }
     return (
        <div id="wrapperToBeAbleToResize">
          <div id="topBar">
            {menuBar}
          </div>
        </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    settings: state.application.settings,
    news: state.application.selectedPanel == "news" ? true : false,
    macButtonsHover: state.application.macButtonsHover,
    genericPanelAnimationOn: state.application.genericPanelAnimationOn,
    notificationPopup: state.notifications.popupEnabled,
    appMaximized: state.application.maximized
  };
};

export default connect(mapStateToProps, actions)(TopBar);