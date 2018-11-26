import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import * as actions from '../../actions';

class Connector extends Component {
  constructor(props) {
    super(props);
    this.blockCycle = this.blockCycle.bind(this);
    this.transactionCycle = this.transactionCycle.bind(this);
    this.addressCycle = this.addressCycle.bind(this);

    this.listenToEvents();

    this.state = {
      interval: 5000,
      latestBlockTime: 0,
      currentHighestBlock: 0,
      currentHighestHeader: 0
    };
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
      this.props.setDaemonError(arg.message);
      this.props.setDaemonErrorPopup(true);
      this.props.setLoading({
        isLoading: true,
        loadingMessage: arg.message
      })
    });

    ipcRenderer.on('message-from-log', (e, arg) => {
      this.props.setAppendToDebugLog(arg);
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


  listenForDownloadEvents() {
    // downloader events.
    ipcRenderer.on('downloading-file', (event, arg) => {
      // console.log("downloading-file", e, arg);
      const walletPercent = arg.percent * 100;
      this.props.setFileDownloadStatus({
        downloadMessage: 'Downloading the required files',
        downloadPercentage: walletPercent.toFixed(2),
        downloadRemainingTime: arg.time.remaining
      });
      // console.log(payload)
    });

    ipcRenderer.on('downloaded-file', () => {
      this.props.setFileDownloadStatus({
        downloadMessage: 'Downloading the required files',
        downloadPercentage: 100,
        downloadRemainingTime: 0.0
      });
    });

    ipcRenderer.on('verifying-file', () => {
      this.props.setFileDownloadStatus({
        downloadMessage: 'Validating',
        downloadPercentage: undefined,
        downloadRemainingTime: 0.0
      });
    });

    ipcRenderer.on('unzipping-file', () => {
      this.props.setFileDownloadStatus({
        downloadMessage: 'Unzipping',
        downloadPercentage: undefined,
        downloadRemainingTime: 0.0
      });
    });
    ipcRenderer.on('file-download-complete', () => {
      this.props.setFileDownloadStatus({
        downloadMessage: '',
        downloadPercentage: undefined,
        downloadRemainingTime: 0.0
      });
    });
    ipcRenderer.on('download-error', (e, arg) => {
      console.log(`Download failure: ${arg.message}`);
      this.props.settellUserUpdateFailed({
        updateFailed: true,
        downloadMessage: arg.message
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
    this.props.setWalletCredentials(arg);
  }

  processAddresses() {}

  processTransactions() {}

  processBlockHeight(data) {
    let syncedPercentage = (data.blocks * 100) / data.headers;
    syncedPercentage = Math.floor(syncedPercentage * 100) / 100;

    if (data.blocks >= this.state.currentHighestBlock && this.transactionsIndexed && !this.firstRun) {
      // do something to process new transactions here.
    }
    this.setState({
      currentHighestBlock: data.blocks,
      currentHighestHeader: data.headers,
    });
    this.props.updatePaymentChainSync(data[0].blocks === 0 || data[0].headers === 0 ? 0 : syncedPercentage);
  }

  recalculateStakingsEarnings() {}

  updateConfirmations() {}

  /**
   * Main Daemon cycle
   */
  blockCycle() {

    this.props.wallet.getInfo().then(async (data) => {
      // process block height in here.
      this.processBlockHeight(data);
    })
  }



  addressCycle(){

  }


  transactionCycle(){

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
