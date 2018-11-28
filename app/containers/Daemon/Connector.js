import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

// TODO : this needs to be removed its being used for parsing some news crap.
import $ from 'jquery';

import * as actions from '../../actions';
import {
  addTransaction, addAddress, truncateTransactions,
  getAllTransactions, getAllRewardTransactions, getAllPendingTransactions,
  getLatestTransaction, getAllAddresses, updatePendingTransaction, updateTransactionsConfirmations,
  getAllMyAddresses, clearDB
} from '../../Managers/SQLManager';
import * as tools from '../../utils/tools';
import hash from '../../router/hash';
import ConnectorNews from './News';

const event = require('../../utils/eventhandler');
const settings = require('electron-settings');
const FeedMe = require('feedme');
const https = require('https');
const request = require('request');
const moment = require('moment');
const db = require('../../../app/utils/database/db');

class Connector extends Component {
  constructor(props) {
    super(props);

    // Cycle bindings
    this.walletCycle = this.walletCycle.bind(this);
    this.blockCycle = this.blockCycle.bind(this);
    this.transactionCycle = this.transactionCycle.bind(this);
    this.addressCycle = this.addressCycle.bind(this);
    this.marketCapCycle = this.marketCapCycle.bind(this);


    // Misc functions
    this.queueOrSendNotification = this.queueOrSendNotification.bind(this);
    this.checkQueuedNotifications = this.checkQueuedNotifications.bind(this);

    this.listenToEvents();

    this.state = {
      interval: 5000,
      latestBlockTime: 0,
      currentHighestBlock: 0,
      currentHighestHeader: 0,
      transactionMap: {},
      queuedNotifications: [],
      walletRunningInterval: null,
      blockProcessorInterval: null,
      coinMarketCapInterval: null
    };

    // TODO Fix handling promise returned from this function IMPORTANT!
    db.sequelize.sync();
  }

  componentWillUnmount() {
    clearInterval(this.state.walletRunningInterval);
    clearInterval(this.state.blockProcessorInterval);
    clearInterval(this.state.coinMarketCapInterval);
  }

  /**
   * Subscribe the daemon to manager events
   */
  listenToEvents() {
    ipcRenderer.on('daemonCredentials', this.createWallet.bind(this));

    // TODO: Review these and remove them where applicable
    // ipcRenderer.on('guiUpdate', this.handleGuiUpdate.bind(this));
    // ipcRenderer.on('daemonUpdate', this.handleDaemonUpdate.bind(this));
    // ipcRenderer.on('daemonUpdated', this.handleDaemonUpdated.bind(this));


    ipcRenderer.on('loading-error', (e, arg) => {
      console.log(`loading failure: ${arg.message}`);
      this.props.setDaemonError(arg.message);
      this.props.setDaemonErrorPopup(true);
      this.props.setLoading({
        isLoading: true,
        loadingMessage: arg.message
      });
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
  createWallet(e, { credentials }) {
    this.props.setWalletCredentials(credentials);

    // alert('credentials');
    const key = 'settings.initialSetup';
    if (settings.has(key)) {
      const val = settings.get(key);
      this.props.setStepInitialSetup(val);
    } else {
      event.emit('initialSetup');
      this.props.setStepInitialSetup('start');
    }

    event.emit('startConnectorChildren')

    // we can starting syncing the block data with redux now
    this.setState({
      walletRunningInterval: setInterval(async () => { await this.walletCycle(); }, this.state.interval),
      coinMarketCapInterval: setInterval(async () => { await this.marketCapCycle(); }, this.state.interval)
    });
  }

  processAddresses() {}

  processTransactions() {}

  recalculateStakingsEarnings() {

  }


  /**
   * Notification based stuff, should be moved into its own file maybe?
   * @param callback
   * @param body
   */


  queueOrSendNotification(callback, body) {
    if (this.props.startup.loading || this.props.startup.loader || !this.props.startup.setupDone) {
      this.state.queuedNotifications.push({ callback, body });
    } else {
      tools.sendOSNotification(body, callback);
    }
  }

  checkQueuedNotifications() {
    if (!this.props.startup.loading && !this.props.startup.loader && this.props.startup.setupDone && this.state.queuedNotifications.length >= 0) {
      if (this.state.queuedNotifications.length === 0) {
        clearInterval(this.checkQueuedNotificationsInterval);
      } else {
        const notification = this.state.queuedNotifications[0];
        this.state.queuedNotifications.splice(0, 1);
        tools.sendOSNotification(notification.body, notification.callback);
      }
    }
  }


  /**
   * Wallet Cycle Function: this funcntion checks if the block index is loaded and the wallet is functioning normally
   */

  async walletCycle() {
    let data = null;
    try {
      data = await this.props.wallet.getInfo();
    } catch (e) {
      console.log(e);
    }

    if (data != null) {
      clearInterval(this.state.walletRunningInterval);

      // start all the other intervals
      this.setState({
        blockProcessorInterval: setInterval(() => { this.blockCycle(); }, this.state.interval)
      });
    }
  }

  /**
   * This function should update the block height and sync percentage and should trigger the confirmations cycle.
   */
  blockCycle() {
    this.props.wallet.getInfo().then(async (data) => {
      // process block height in here.
      let syncedPercentage = (data.blocks * 100) / data.headers;
      syncedPercentage = Math.floor(syncedPercentage * 100) / 100;

      // dont know if should even bother putting this here and just do it all the transaction loop.
      // if (data.blocks >= this.state.currentHighestBlock && this.transactionsIndexed && !this.firstRun) {
      //   // do something to process new transactions here.
      // }
      this.setState({
        currentHighestBlock: data.blocks,
        currentHighestHeader: data.headers,
      });

      // mutate redux data with data from the system.
      this.props.updatePaymentChainSync(data.blocks === 0 || data.headers === 0 ? 0 : syncedPercentage);
      this.props.setDaemonVersion(tools.formatVersion(data.version));
      this.props.chainInfo(data);
      this.props.walletInfo(data);
    });

    this.props.wallet.getWalletInfo().then(async (data) => {
      console.log(data);
      this.props.walletInfoSec(data);
    });
  }


  /**
   * This function should check all addresses to see if their balance has changed and update confirmations for
   * addresses, at the same time this should check if the address has a registered ans name not in the database
   * if so, store it and tell the user with a notifications.
   */
  addressCycle() {

  }


  /**
   * This transaction cycle function should pull down any transactions not stored in the DB and process them using the
   * algorithm i wrote. this function should not notify the user of previous transactions if they are resyncing the DB.
   * This function should also notify if there is new transactions.
   */
  transactionCycle() {


  }

  /**
   * This function should be fired somehow and run in the background to update all the confirmations for all
   * stored Transations this should be coded in a way it doesnt interupt the UI and should replace the in memory
   * transactions when its done. SHOULD NOT BE CALLED WHEN USER IS USING A TRANSACTION FILTER.
   */
  confirmationsCycle() {
    getAllTransactions()
      .then(async (transactionData) => {
        const walletTransactions = await this.wallet.getTransactions('*', transactionData.length, 0);
        await Promise.all(walletTransactions.map(async (transactions) => {
          try {
            return await updateTransactionsConfirmations(transactions.txid, transactions.confirmations);
          } catch (err) {
            console.log(err);
          }
        }));
      }).catch(errors => {
        console.log(errors);
      });
  }


  /**
   * This cycle should pull down the market cap information and tell the user if the price has changed since last pulled
   */
  marketCapCycle() {

  }

  render() {
    return (
      <ConnectorNews />
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Connector);
