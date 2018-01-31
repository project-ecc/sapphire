import React, { Component } from 'react';
import $ from 'jquery';
import Sidebar from './Sidebar';
import InitialSetup from './Pages/InitialSetup';
import Settings from '../components/SettingsPage/Settings';
import { ipcRenderer } from 'electron';
import Loading from '../Components/LoaderPage/LoaderPage';
import { connect } from 'react-redux';
import * as actions from '../actions';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import ExportPrivateKeys from '../components/SettingsPage/ExportPrivateKeys';

const settings = require('electron-settings');

class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.getMainApp = this.getMainApp.bind(this);
    this.settings = this.settings.bind(this);
    this.loadSettingsToRedux = this.loadSettingsToRedux.bind(this);
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

  getMainApp(){
    //had to add the ExportPrivateKeys component here because for some reason it just wasn't working properly as a child of the settings component (position wise in the window)
    return(
      <div>
        <div className="mancha">
        </div>
        <Sidebar route={this.props.route} />
        <div className="my_wrapper">
          {this.props.children}
          <TransitionGroup component={"section"}>
            {this.props.settings ? <Settings/> : null}
          </TransitionGroup>
          <TransitionGroup>
           { this.props.exportingPrivateKeys ? <ExportPrivateKeys/> : null}
          </TransitionGroup>
        </div>
      </div>
    )
  }
  
  settings(){
    if(!this.props.settings)
      this.props.selectedSideBar(undefined);
    this.props.setSettings(!this.props.settings);
    this.props.setExportingPrivateKeys(false);
    this.props.setPanelExportingPrivateKeys(1);
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
  render() {
    console.log("loader ", this.props.loader)
    console.log(this.props.setupDone, this.props.initialSetup, this.props.partialInitialSetup)
    const minimize = require('../../resources/images/minimize.png');
    const maximize = require('../../resources/images/maximize.png');
    const close = require('../../resources/images/close.png');
    const miniButton = require('../../resources/images/logo_setup.png');
    let settings = require('../../resources/images/settings-white.png');
    if(this.props.settings)
      settings = require('../../resources/images/settings-orange.png');
    return (
      <div id="main">
        <div id="wrapperToBeAbleToResize">
          <div id="topBar">
          <img className="miniButton" src={miniButton}></img>
            <div id="appButtons">
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
        <div>
        {this.props.setupDone && !this.props.loader ? this.getMainApp()  : null}
        <TransitionGroup>
          {this.props.loader ? <Loading/> : null}
        </TransitionGroup> 
        <TransitionGroup>
          {!this.props.setupDone && !this.props.loader ? <InitialSetup/> : null}
        </TransitionGroup>
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
    loader: state.startup.loader || state.chains.loadingBlockIndexPayment,
    //had to add this for production, otherwise clicking on sidebar would not cause the tab to change (no idea why)
    pathname: state.router.location.pathname,
    settings: state.application.settings,
    exportingPrivateKeys: state.application.exportingPrivateKeys
  };
};

export default connect(mapStateToProps, actions)(App);