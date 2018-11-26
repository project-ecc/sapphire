import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import Wallet from '../../utils/wallet';
import * as actions from '../../actions';
import {
  ADD_TO_DEBUG_LOG,
  DAEMON_ERROR,
  DAEMON_ERROR_POPUP,
  FILE_DOWNLOAD_STATUS, LOADING,
  TOLD_USER_UPDATE_FAILED
} from "../../actions/types";

class Connector extends Component {
  constructor(props) {
    super(props);
    this.cycle = this.cycle.bind(this);

    this.interval = 5000;
    this.wallet = null


    // variables for state management

    this.latestBlocktime = 0;

    this.listenToEvents();
  }

  /**
   * Subscribe the daemon to manager events
   */
  listenToEvents() {
    ipcRenderer.on('daemonCredentials', this.createWallet.bind(this));

    ipcRenderer.on('initial_setup', this.handleInitialSetup);
    ipcRenderer.on('setup_done', this.handleSetupDone);
    ipcRenderer.on('partial_initial_setup', this.handlePartialSetup);
    ipcRenderer.on('guiUpdate', this.handleGuiUpdate.bind(this));
    ipcRenderer.on('daemonUpdate', this.handleDaemonUpdate.bind(this));
    ipcRenderer.on('daemonUpdated', this.handleDaemonUpdated.bind(this));
    ipcRenderer.on('daemonCredentials', this.createWallet.bind(this));




    ipcRenderer.on('loading-error', (e, arg) => {
      console.log(`loading failure: ${arg.message}`);
      this.store.dispatch({ type: DAEMON_ERROR, payload: arg.message });
      this.store.dispatch({ type: DAEMON_ERROR_POPUP, payload: true });
      this.store.dispatch({ type: LOADING, payload: { isLoading: true, loadingMessage: arg.message } });
    });

    ipcRenderer.on('message-from-log', (e, arg) => {
      this.store.dispatch({ type: ADD_TO_DEBUG_LOG, payload: arg });
      const castedArg = String(arg);
      console.log(castedArg);
      if (castedArg != null && (castedArg.indexOf('init message') !== -1 || castedArg.indexOf('Still rescanning') !== -1 || castedArg.indexOf('Corrupted block database detected') !== -1)) {
        this.loadingMessage = castedArg;
        if (castedArg.indexOf('Corrupted block database detected') !== -1) {
          console.log('Corrupted block database detected.');
          ipcRenderer.send('loading-error', { message: 'Corrupted block database detected.' });
        }
      }
    });

    ipcRenderer.on('selected-currency', async (event, arg) => {
      console.log('in here ', arg);
      await this.getCoinMarketCapStats(arg);
      ipcRenderer.send('refresh-complete');
    });
    this.listenForDownloadEvents();
    event.on('runMainCycle', () => {
      console.log('run main cycle');
      if (!this.runningMainCycle) {
        this.firstRun = true;
        this.mainCycle();
      }
    });
  }


  listenForDownloadEvents(){
    // downloader events.
    ipcRenderer.on('downloading-file', (event, arg) => {
      // console.log("downloading-file", e, arg);
      const walletPercent = arg.percent * 100;

      this.store.dispatch({ type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: 'Downloading the required files',
          downloadPercentage: walletPercent.toFixed(2),
          downloadRemainingTime: arg.time.remaining
        }
      });
      // console.log(payload)
    });

    ipcRenderer.on('downloaded-file', () => {
      this.store.dispatch({ type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: 'Downloading the required files',
          downloadPercentage: 100,
          downloadRemainingTime: 0.0
        }
      });
    });

    ipcRenderer.on('verifying-file', () => {
      this.store.dispatch({ type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: 'Validating',
          downloadPercentage: undefined,
          downloadRemainingTime: 0.0
        }
      });
    });

    ipcRenderer.on('unzipping-file', () => {
      this.store.dispatch({ type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: 'Unzipping',
          downloadPercentage: undefined,
          downloadRemainingTime: 0.0
        }
      });
    });
    ipcRenderer.on('file-download-complete', () => {
      this.store.dispatch({ type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: '',
          downloadPercentage: undefined,
          downloadRemainingTime: 0.0
        }
      });
    });
    ipcRenderer.on('download-error', (e, arg) => {
      console.log(`Download failure: ${arg.message}`);
      this.store.dispatch({ type: TOLD_USER_UPDATE_FAILED,
        payload: {
          updateFailed: true,
          downloadMessage: arg.message
        }
      });
      if (this.store.getState().startup.daemonUpdate) {
        this.firstRun = true;
        this.checkStartupStatusInterval = setInterval(() => {
          this.stateCheckerInitialStartup();
        }, 2000);
      }
    });
  }

  /**
   * Create the wallet instance
   * @param event
   * @param arg
   */
  createWallet(event, arg) {
    this.props.setWalletCredentials(arg)
  }

  processAddresses(){}

  processTransactions(){}

  processBlockheight(){}

  recalculateStakingsEarnings(){}

  updateConfirmations(){}

  /**
   * Main Daemon cycle
   */
  cycle() {

  }

  render() {
    return null;
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Connector);
