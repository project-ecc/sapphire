// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { ipcRenderer } from 'electron';
import $ from 'jquery';
import TopBar from './Layouts/partials/TopBar';
import routes from './router/routes';
import { traduction } from './lang/lang';
import * as actions from './actions/index';
import hash from './router/hash';
import Loading from './Layouts/Loading';
import DaemonConnector from './daemon/Connector';
import Toast from 'globals/Toast/Toast';

const event = require('utils/eventhandler');

const lang = traduction();
const Tools = require('./utils/tools');
const settings = require('electron').remote.require('electron-settings');

class App extends Component {
  constructor(props) {
    super(props);
    this.startUp = this.startUp.bind(this);
  }

  componentDidMount() {
    // this.props.getSetup();
    this.startUp();

    ipcRenderer.on('closing_daemon', () => {
      if (this.props.loader) {
        TweenMax.to('#loading-wrapper', 0.3, { autoAlpha: 0.5 });
      }
      this.props.setClosingApplication();
    });
  }

  componentWillUnmount() {
    event.emit('stop');
  }

  /**
   * Load the app settings
   */
  startUp() {
    let tray = false;
    let startAtLogin = false;
    let minimizeToTray = false;
    let minimizeOnClose = false;
    let theme = 'theme-darkEcc';
    const ds = settings.get('settings.display');

    if (ds && ds.minimise_to_tray !== undefined && ds.minimise_to_tray) { minimizeToTray = true; }
    if (ds && ds.hide_tray_icon !== undefined && ds.hide_tray_icon) { tray = true; }
    if (ds && ds.minimise_on_close !== undefined && ds.minimise_on_close) { minimizeOnClose = true; }
    if (ds && ds.start_at_login !== undefined && ds.start_at_login) { startAtLogin = true; }
    if (ds && ds.theme !== undefined) { theme = ds.theme; }

    this.props.setMinimizeOnClose(minimizeOnClose);
    this.props.setMinimizeToTray(minimizeToTray);
    this.props.setStartAtLogin(startAtLogin);
    this.props.setTray(tray);
    this.props.setTheme(theme);

    let operativeSystemNotifications = true;
    let newsNotifications = true;
    let stakingNotifications = true;

    const ns = settings.get('settings.notifications');

    if (ns && ns.operative_system !== undefined && ns.operative_system) { operativeSystemNotifications = true; }
    // TODO : news notifications?
    if (ns && ns.news !== undefined && ns.news) { newsNotifications = true; }
    if (ns && ns.staking !== undefined && ns.staking) { stakingNotifications = true; }

    this.props.setOperativeSystemNotifications(operativeSystemNotifications);
    this.props.setNewsNotifications(newsNotifications);
    this.props.setStakingNotifications(stakingNotifications);
  }

  /*
    Append the selected theme class to the body
   */
  checkThemeClass() {
    const theme = this.props.theme;
    const availablethemes = ['theme-darkEcc', 'theme-defaultEcc', 'theme-lightEcc'];
    for (const ele in availablethemes) {
      if (document.body.classList.contains(availablethemes[ele])) {
        document.body.classList.remove(availablethemes[ele]);
      }
    }
    document.body.classList.add(theme);
  }

  render() {
    /* Add the theme class to body */
    this.checkThemeClass();

    return (
      <div>
        <DaemonConnector />
        {/*{this.props.loading && (<Loading />)}*/}
        {this.props.setupStep !== 'complete' && (<Redirect to="/setup" />)}
        <TopBar />
        <div>{renderRoutes(routes)}</div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    setupStep: state.setup.step,
    loader: state.startup.loader || (state.chains.loadingBlockIndexPayment),
    loading: state.startup.loading,
    minimizeOnClose: state.application.minimizeOnClose,
    closingApplication: state.application.closingApplication,
    theme: state.application.theme,
  };
};

export default withRouter(connect(mapStateToProps, actions)(App));
