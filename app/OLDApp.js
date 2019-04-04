import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import InitialSetup from '../components/Setup/OldIndex';
import Settings from '../components/Settings/Settings';
import Loading from './components/Settings/modals/BlockIndexModal';
import * as actions from './actions/index';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import UpdateApplication from './components/Settings/partials/UpdateApplicationModal';
import SendConfirmation from './components/Send/partials/SendConfirmation';
import ConfirmNewAddress from './components/Receive/partials/NewRequestModal';
import ClosingApplication from './components/Others/ClosingApplication';
import TopBar from './Layouts/partials/TopBar';
import NotificationPopup from './components/NotificationPopup';
import GenericPanel from './GenericPanel';
import TransitionComponent from './components/Others/TransitionComponent';
import DaemonErrorModal from './components/Others/DaemonErrorComponent';

const settings = require('electron').remote.require('electron-settings');
const Tools = require('./utils/tools');

class OLDApp extends Component<Props> {
  constructor(props) {
    super(props);
    this.getMainApp = this.getMainApp.bind(this);
    this.loadSettingsToRedux = this.loadSettingsToRedux.bind(this);
    this.setGenericAnimationToFalse = this.setGenericAnimationToFalse.bind(this);
    this.setGenericAnimationToTrue = this.setGenericAnimationToTrue.bind(this);
  }

  componentDidMount() {
    this.props.getSetup();

    this.loadSettingsToRedux();

    ipcRenderer.on('closing_daemon', () => {
      if (this.props.loader) {
        TweenMax.to('#loading-wrapper', 0.3, { autoAlpha: 0.5 });
      }
      this.props.setClosingApplication();
    });
  }

  loadSettingsToRedux() {
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

  getPopup() {
    let component = null;
    const id = 'unlockPanel';
    const animateIn = Tools.animatePopupIn;
    const animateOut = Tools.animatePopupOut;
    let classVal = '';
    if (this.props.updateApplication) {
      component = <UpdateApplication />;
    } else if (this.props.daemonErrorPopup) {
      component = <DaemonErrorModal />;
    } else if (this.props.closingApplication) {
      component = <ClosingApplication />;
      classVal = 'closingApplication';
    }

    return (
      <div>
        <TransitionGroup component="article">
          { component !== null ?
            <TransitionComponent
              children={component}
              id={id}
              class={classVal}
              animationType="popup"
              animateIn={animateIn}
              animateOut={animateOut}
            />
            : null
          }
        </TransitionGroup>
      </div>
    );
  }

  getLoader() {
    if (!this.props.importingWalletWithSetupDone) {
      return (
        <div>
          <TransitionGroup component="aside">
            { this.props.loader || this.props.updatingApplication ?
              <TransitionComponent
                children={<Loading />}
                id="loading-wrapper"
                animationType="loader"
                animateIn={Tools.animateLoaderIn}
                animateOut={Tools.animateLoaderOut}
                animateLogo={this.animateLogo.bind(this)}
                updatingApplication={this.props.updatingApplication}
              />
                : null
            }
          </TransitionGroup>
        </div>
      );
    }
  }

  animateLogo(callback) {
    CSSPlugin.useSVGTransformAttr = false;
    TweenMax.to(['#logoLoader'], 0.5, { autoAlpha: 1 });
    if (!this.props.loading) { TweenMax.to(['#gettingReady'], 0.5, { autoAlpha: 1 }); }

    const t = new TimelineMax({ repeat: -1, yoyo: true });
    t.set(['#first', '#second', '#third', '#forth'], { x: 20, y: 20 });
    t.fromTo('#first', 2, { autoAlpha: 0, scale: 0.90 }, { scale: 1, autoAlpha: 1, transformOrigin: '50% 50%', ease: Power4.easeNone, delay: 0.3 }, 0);
    t.fromTo('#second', 2, { autoAlpha: 0, scale: 0.90 }, { scale: 1, autoAlpha: 1, transformOrigin: '50% 50%', ease: Power4.easeNone, delay: 0.3 }, 0);
    t.fromTo('#third', 2, { autoAlpha: 0, scale: 0.90 }, { scale: 1, autoAlpha: 1, transformOrigin: '50% 50%', ease: Power4.easeNone, delay: 0.3 }, 0);
    t.fromTo('#forth', 2, { autoAlpha: 0, scale: 0.90 }, { scale: 1, autoAlpha: 1, transformOrigin: '50% 50%', ease: Power4.easeNone, delay: 0.3 }, 0);
    t.fromTo('#logo1', 2, { autoAlpha: 1 }, { autoAlpha: 0, delay: 0.3 }, 0);
    t.timeScale(2);
    callback();
  }

  resetWillChange(callback) {
    const el = this.refs.animate;
    TweenMax.set(el, { willChange: 'auto' });
    this.props.setGenericAnimationToFalse();
    callback();
  }

  setGenericAnimationToFalse() {
    this.props.setGenericAnimationOn(false);
  }

  setGenericAnimationToTrue() {
    this.props.setGenericAnimationOn(true);
  }

  getMainApp() {
    if (!this.props.unencryptedWallet && !this.props.shouldImportWallet && this.props.setupDone && !this.props.loader && !this.props.updatingApplication && !this.props.importingWalletWithSetupDone) {
      return (
        <TransitionGroup component="section">
          <TransitionComponent
            children={<GenericPanel />}
            id=""
            class="genericPanel"
            animationType="genericPanel"
            animateIn={Tools.animateGeneralPanelIn}
            animateOut={Tools.animateGeneralPanelOut}
            resetWillChange={this.resetWillChange}
            setGenericAnimationToFalse={this.setGenericAnimationToFalse}
            setGenericAnimationToTrue={this.setGenericAnimationToTrue}
          />
        </TransitionGroup>
      );
    }
    return null;
  }

  getSettings() {
    if (this.props.settings && !this.props.updatingApplication) {
      return (
        <TransitionGroup component="section">
          <TransitionComponent
            children={<Settings />}
            id="settings"
            animationType="settings"
            animateIn={Tools.animateGeneralPanelIn}
            animateOut={Tools.animateGeneralPanelOut}
            resetWillChange={this.resetWillChange}
            setGenericAnimationToFalse={this.setGenericAnimationToFalse}
            setGenericAnimationToTrue={this.setGenericAnimationToTrue}
          />
        </TransitionGroup>
      );
    }
    return null;
  }

  getInitialSetup() {
    if (!this.props.setupDone && !this.props.loader && !this.props.updatingApplication || this.props.unencryptedWallet || this.props.shouldImportWallet || this.props.importingWalletWithSetupDone) {
      return (
        <TransitionGroup>
          <TransitionComponent
            children={<InitialSetup />}
            id="initialSetup"
            animationType="initialSetup"
            animateIn={Tools.animateInitialSetupIn}
            animateOut={Tools.animateInitialSetupOut}
          />
        </TransitionGroup>
      );
    }
    return null;
  }

  getNotificationsPopup() {
    if (this.props.notificationPopup) {
      return (
        <NotificationPopup />
      );
    }
    return null;
  }
  render() {
    return (
      <div className={this.props.theme}>
        <div id="main">
          <TopBar />
          <div className="mancha" />
          <div>
            {this.getMainApp()}
            {this.getInitialSetup()}
            {this.getSettings()}
            {this.getLoader()}
            {this.getNotificationsPopup()}
            {this.getPopup()}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    initialSetup: state.startup.initialSetup,
    partialInitialSetup: state.startup.partialInitialSetup,
    setupDone: state.startup.setupDone,
    loader: state.startup.loader || (state.chains.loadingBlockIndexPayment && !state.startup.initialSetup),
    // had to add this for production, otherwise clicking on sidebar would not cause the tab to change (no idea why)
    pathname: state.router.location.pathname,
    importingPrivateKey: state.application.importingPrivateKey,
    checkingDaemonStatusPrivateKey: state.application.checkingDaemonStatusPrivateKey,
    news: state.application.selectedPanel === 'news',
    updateApplication: state.application.updateApplication,
    updatingApplication: state.startup.updatingApp,
    sending: state.application.sendingEcc,
    creatingAddress: state.application.creatingAddress,
    unencryptedWallet: state.startup.unencryptedWallet,
    loading: state.startup.loading,
    minimizeOnClose: state.application.minimizeOnClose,
    closingApplication: state.application.closingApplication,
    theme: state.application.theme,
    shouldImportWallet: state.startup.importWallet,
    importingWalletWithSetupDone: state.startup.importingWalletWithSetupDone,
    daemonErrorPopup: state.application.daemonErrorPopup
  };
};

export default connect(mapStateToProps, actions)(OLDApp);
