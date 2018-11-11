// @flow
import React, { Component } from 'react';
import {connect, Provider} from 'react-redux';
import { withRouter } from 'react-router';
import { HashRouter as Router } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { ipcRenderer } from 'electron';
import $ from 'jquery';
import TopBar from './../components/TopBar';
import routes from './../router/routes';
import { traduction } from '../lang/lang';
import * as actions from '../actions';
import hash from './../router/hash';
import Loading from './../Layouts/Loading';

const lang = traduction();
const Tools = require('../utils/tools');
const settings = require('electron').remote.require('electron-settings');

class Root extends Component {
  constructor(props) {
    super(props);
    this.startUp = this.startUp.bind(this);
  }

  componentDidMount() {
    this.props.getSetup();
    this.startUp();

    ipcRenderer.on('closing_daemon', () => {
      if (this.props.loader) {
        TweenMax.to('#loading-wrapper', 0.3, { autoAlpha: 0.5 });
      }
      this.props.setClosingApplication();
    });
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

    // added this as a temporary fix when importing a wallet when initial setup has been done
    const initialSetup = settings.get('settings.initialSetup');
    if (initialSetup) {
      this.props.setSetupDone(true);
    }
  }

  checkThemeClass (theme) {
    const availablethemes = ['theme-darkEcc', 'theme-defaultEcc'];
    for (const ele in availablethemes) {
      if (document.body.classList.contains(availablethemes[ele])) {
        document.body.classList.remove(availablethemes[ele]);
      }
    }
    document.body.classList.add(theme);
  }

  render() {
    const { store } = this.props;
    const ready = (!this.props.unencryptedWallet && !this.props.shouldImportWallet && this.props.setupDone && !this.props.loader && !this.props.updatingApplication && !this.props.importingWalletWithSetupDone);

    if (!this.props.setupDone && !this.props.loader && !this.props.updatingApplication || this.props.unencryptedWallet || this.props.shouldImportWallet || this.props.importingWalletWithSetupDone) {
      hash.push('/setup');
    }

    /* Add the theme class to body */
    this.checkThemeClass(this.props.theme);

    return (
      <Provider store={store}>
        <Router>
          <div>
            <TopBar />
            {!this.props.importingWalletWithSetupDone && (this.props.loader || this.props.updatingApplication) &&
              <aside>
                <Loading />
              </aside>
            }
            <div>{renderRoutes(routes)}</div>
          </div>
        </Router>
      </Provider>
    );
  }
}

const mapStateToProps = state => {
  return {
    initialSetup: state.startup.initialSetup,
    partialInitialSetup: state.startup.partialInitialSetup,
    setupDone: state.startup.setupDone,
    loader: state.startup.loader || (state.chains.loadingBlockIndexPayment && !state.startup.initialSetup),
    importingPrivateKey: state.application.importingPrivateKey,
    checkingDaemonStatusPrivateKey: state.application.checkingDaemonStatusPrivateKey,
    updateApplication: state.application.updateApplication,
    updatingApplication: state.startup.updatingApp,
    unlocking: state.application.unlocking,
    sending: state.application.sendingEcc,
    creatingAddress: state.application.creatingAddress,
    unencryptedWallet: state.startup.unencryptedWallet,
    loading: state.startup.loading,
    minimizeOnClose: state.application.minimizeOnClose,
    closingApplication: state.application.closingApplication,
    theme: state.application.theme,
    shouldImportWallet: state.startup.importWallet,
    importingWalletWithSetupDone: state.startup.importingWalletWithSetupDone,
    actionPopupResult: state.application.actionPopupResult,
    actionPopupMessage: state.application.actionPopupMessage,
    actionPopupStatus: state.application.actionPopupStatus,
    daemonErrorPopup: state.application.daemonErrorPopup
  };
};

export default connect(mapStateToProps, actions)(Root);
