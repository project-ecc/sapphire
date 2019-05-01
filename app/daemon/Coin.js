import React, {Component} from 'react';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';

import * as actions from '../actions/index';
import {
  addAddress,
  addTransaction,
  clearDB,
  getAllMyAddresses,
  getAllRewardTransactions,
  getAllTransactions,
  getLatestTransaction,
  updateTransactionsConfirmations
} from '../Managers/SQLManager';
import * as tools from '../utils/tools';

const event = require('../utils/eventhandler');
const db = require('../utils/database/db');

class Coin extends Component {
  constructor(props) {
    super(props);

    // Cycle bindings
    this.walletCycle = this.walletCycle.bind(this);
    this.blockCycle = this.blockCycle.bind(this);
    this.transactionLoader = this.transactionLoader.bind(this);
    this.addressLoader = this.addressLoader.bind(this);
    this.orderTransactions = this.orderTransactions.bind(this);
    this.stateCheckerInitialStartupCycle = this.stateCheckerInitialStartupCycle.bind(this);


    // Misc functions
    this.queueOrSendNotification = this.queueOrSendNotification.bind(this);
    this.checkQueuedNotifications = this.checkQueuedNotifications.bind(this);

    this.state = {
      miscInterval: 15000,
      blockInterval: 5000,
      latestBlockTime: 0,
      currentHighestBlock: 0,
      currentHighestHeader: 0,
      transactionMap: {},
      queuedNotifications: [],
      walletRunningInterval: null,
      checkStartupStatusInterval: null,
      blockProcessorInterval: null,
      coinMarketCapInterval: null,
      transactionProcessorInterval: null,
      addressProcessorInterval: null,
      transactionsIndexed: false,
      lastTransactionTime: 0,
      transactionsToRequest: 4000,
      shouldRequestMoreTransactions: false,
      running: false,
      firstRun: false,
      transactionsPage: 0,
      isIndexingTransactions: false
    };


    this.listenToEvents();

    // TODO Fix handling promise returned from this function IMPORTANT!
    db.sequelize.sync();
  }

  componentWillUnmount() {
    clearInterval(this.state.walletRunningInterval);
    clearInterval(this.state.blockProcessorInterval);
    clearInterval(this.state.coinMarketCapInterval);
    clearInterval(this.state.checkStartupStatusInterval);
    clearInterval(this.state.addressProcessorInterval);

    event.removeListener('startConnectorChildren');
    event.removeListener('runMainCycle');
    ipcRenderer.removeListener('loading-error');
    ipcRenderer.removeListener('message-from-log');
    ipcRenderer.removeListener('downloading-file');
    ipcRenderer.removeListener('downloaded-file');
    ipcRenderer.removeListener('verifying-file');
    ipcRenderer.removeListener('unzipping-file');
    ipcRenderer.removeListener('file-download-complete');
    ipcRenderer.removeListener('download-error');
  }

  async stateCheckerInitialStartupCycle() {
    this.props.wallet.getInfo().then(async (data) => {
      console.log(data);
      if (!data.encrypted) {
        this.props.setUnencryptedWallet(true);
      } else {
        this.props.setUnencryptedWallet(false);
      }

      if (this.props.updatingApp) {
        this.props.setUpdatingApplication(true);
      }

      if (!this.state.running) {
        await db.sequelize.sync();
        this.setState({
          running: true
        });
        clearInterval(this.state.checkStartupStatusInterval);
        await this.startCycles();
      }
    })
      .catch((err) => {
        this.processError(err)
      });
  }
  /**
   * Subscribe the daemon to manager events
   */
  listenToEvents() {
    event.on('startConnectorChildren', async () => {
      await this.stateCheckerInitialStartupCycle();
      this.setState({
        checkStartupStatusInterval: setInterval(async () => { await this.stateCheckerInitialStartupCycle(); }, 2000),
      });
    });

    // Reload Addresses
    event.on('loadAddresses', async () => {
      await this.addressLoader();
    });
    // Toggle Staking State
    event.on('loadTransactions', async () => {
      await this.transactionLoader()
    });

    // if there is a loading error we must force all loading to stop
    ipcRenderer.on('loading-error', (e, arg) => {
      console.log(`loading failure: ${arg.message}`);
      this.props.setDaemonError(arg.message);
      this.props.setDaemonErrorPopup(true);

      //remove the interval and display the error
      clearInterval(this.state.checkStartupStatusInterval);
      setTimeout(20000);
      this.props.setLoading({
        isLoading: true,
        loadingMessage: arg.message
      });
    });

    ipcRenderer.on('message-from-log', (e, arg) => {
      this.props.setAppendToDebugLog(arg);
      const castedArg = String(arg);
      const captureStrings = [
        'init message',
        'Still rescanning',
        'Corrupted block database detected',
        'Aborted block database rebuild. Exiting.',
        'initError: Cannot obtain a lock on data directory ',
        'ERROR: VerifyDB():'
      ];

      if (captureStrings.some((v) => { return castedArg.indexOf(v) > -1; })) {
        ipcRenderer.send('loading-error', { message: castedArg});
      }
    });

    this.listenForDownloadEvents();
    event.on('runMainCycle', async () => {
      console.log('run main cycle');
      if (!this.state.running) {
        this.setState({
          firstRun: true
        });
        await this.startCycles();
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
      if (this.props.daemonUpdate) {
        this.setState({
          checkStartupStatusInterval: setInterval(async () => { await this.stateCheckerInitialStartupCycle(); }, 2000),
          firstRun: true
        });
      }
    });
  }


  async startCycles() {
    // we can starting syncing the block data with redux now
    this.setState({
      walletRunningInterval: setInterval(async () => { await this.walletCycle(); }, this.state.blockInterval),
      running: true
    });
  }
  async loadTransactionsForProcessing() {
    this.setState({
      isIndexingTransactions: true
    });
    let txId = '',
      time = 0,
      amount = 0,
      category = '',
      address = '',
      fee = 0,
      confirmations = 0;


    const maxAttempts = 5;
    const attempts = 0;


    let transactions = null;
    console.log('transactions', transactions);
    while (transactions == null && attempts <= maxAttempts) {
      transactions = await this.props.wallet.getTransactions('*', this.state.transactionsToRequest, this.state.transactionsToRequest * this.state.transactionsPage);
      console.log(transactions);
    }

    transactions = this.orderTransactions(transactions);

    // load transactions into transactionsMap for processing
    for (let i = 0; i < transactions.length; i++) {
      time = transactions[i].time;
      if (time > this.state.lastTransactionTime) {
        this.setState({
          shouldRequestMoreTransactions: true
        });

        txId = transactions[i].txid;
        amount = transactions[i].amount;
        category = transactions[i].category;
        address = transactions[i].address;
        fee = transactions[i].fee === undefined ? 0 : transactions[i].fee;
        confirmations = transactions[i].confirmations;
        if (!this.state.transactionMap[txId]) {
          this.state.transactionMap[txId] = [];
        }
        this.state.transactionMap[txId].push({
          txId,
          time,
          amount,
          category,
          address,
          fee,
          confirmations,
          is_main: false
        });
      } else {
        this.setState({
          shouldRequestMoreTransactions: false
        });
      }
    }

    if (transactions.length === this.transactionsToRequest) {
      this.transactionsPage++;
      await this.loadTransactionsForProcessing();
    } else {
      await this.processTransactions();
    }
  }

  orderTransactions(data) {
    const aux = [];
    for (let i = data.length - 1; i >= 0; i -= 1) {
      aux.push(data[i]);
    }
    return aux;
  }

  async processTransactions() {
    let entries = [];
    const rewards = [];
    const staked = [];
    const change = [];

    // process transactions
    for (const key of Object.keys(this.state.transactionMap)) {
      const values = this.state.transactionMap[key];
      let generatedFound = false;

      // check if current values array contains a staked transaction, if it does flag the rest of them as category staked
      restartLoop:
        while (true) {
          for (let i = 0; i <= values.length - 1; i++) {
            if ((values[i].category === 'generate' || values[i].category === 'immature') && generatedFound === false) {
              generatedFound = true;
              continue restartLoop;
            }
            if (generatedFound) {
              if (values[i].category !== 'generate' && values[i].category !== 'immature') {
                values[i].category = 'staked';
              } else {
                values[i].is_main = true;
                values[i].category = 'generate';
              }
              rewards.push({ ...values[i], txId: key });
            }
          }
          break;
        }

      // if the above condition doesnt fit calculate the lev
      if (!generatedFound) {
        for (let i = 0; i <= values.length - 1; i++) {
          entries.push({ ...values[i], txId: key });

          for (let j = 0; j < entries.length - 1; j++) {
            const original = entries[j];
            const current = values[i];
            if (current.txId === original.txId) {
              // console.log('txId match')

              // if original == send
              if (original.category === 'receive' && current.category === 'send' || original.category === 'send' && current.category === 'receive') {
                if (tools.similarity(original.amount.toString(), current.amount.toString()) > 0.6) {
                  current.category = 'change';
                  original.category = 'change';
                  change.push({ ...current, txId: key });
                  change.push({ ...original, txId: key });
                  entries.splice(entries.indexOf(original), 1);
                  entries.splice(entries.indexOf(current), 1);
                }
              }
            }
          }
        }
      }
      generatedFound = false;
    }

    // Set every transaction still left in entries as the main transaction.
    for (let j = 0; j <= entries.length - 1; j++) {
      entries[j].is_main = true;
    }

    this.setState({
      transactionsMap: {}
    });
    entries = entries.concat(rewards, staked, change);
    await this.insertIntoDb(entries);
  }
  async insertIntoDb(entries) {
    const lastCheckedEarnings = this.props.notifications.lastCheckedEarnings;
    let earningsCountNotif = 0;
    let earningsTotalNotif = 0;
    const shouldNotifyEarnings = this.props.notifications.stakingNotificationsEnabled;

    for (let i = 0; i < entries.length; i++) {
      // console.log(lastCheckedEarnings)
      if (this.state.transactionsIndexed === false) {
        this.props.setLoading({
          isLoading: true,
          loadingMessage: `Indexing transaction ${i}/${entries.length}`
        });
      }
      const entry = entries[i];
      if (Number(entry.confirmations) < 30) {
        // this.store.dispatch({ type: PENDING_TRANSACTION, payload: entry.txId });
      }

      let isPending = false;

      if (entry.category === 'generate' || entry.category === 'staked') {
        isPending = Number(entry.confirmations) < 30;
      } else {
        isPending = Number(entry.confirmations) < 10;
      }
      await addTransaction(entry, isPending);

      // update with 1 new staking reward since previous ones have already been loaded on startup
      if (entry.category === 'generate') {
        if (entry.time > lastCheckedEarnings && shouldNotifyEarnings) {
          this.props.setStakingNotifications({
            earnings: entry.amount,
            date: entry.time
          });
          earningsCountNotif++;
          earningsTotalNotif += entry.amount;
        }
      }
    }

    if (shouldNotifyEarnings && earningsCountNotif > 0) {
      earningsTotalNotif = tools.formatNumber(earningsTotalNotif);
      const title = `Staking reward - ${earningsTotalNotif} ECC`;
      const body = earningsCountNotif === 1 ? title : `${earningsCountNotif} Staking rewards - ${earningsTotalNotif} ECC`;
      const callback = () => { this.goToEarningsPanel(); };
      this.queueOrSendNotification(callback, body);
    }

    // no more transactions to process, mark as done to avoid spamming the daemon
    if (!this.state.transactionsIndexed) {
      this.setState({
        transactionsIndexed: true
      });
      this.props.setIndexingTransactions(false);
      const rewards = await getAllRewardTransactions();
      this.props.setStakingReward(rewards);
    }

    this.setState({
      transactionsPage: 0,
      isIndexingTransactions: false
    });
  }


  /**
   * Notification based stuff, should be moved into its own file maybe?
   * @param callback
   * @param body
   */


  queueOrSendNotification(callback, body) {
    if (this.props.startup.loading || this.props.startup.loader) {
      this.state.queuedNotifications.push({ callback, body });
    } else {
      tools.sendOSNotification(body, callback);
    }
  }

  checkQueuedNotifications() {
    if (!this.props.startup.loading && !this.props.startup.loader && this.state.queuedNotifications.length >= 0) {
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
   * Wallet Cycle Function: this function checks if the block index is loaded and the wallet is functioning normally
   */
  async walletCycle() {
    if (!this.props.daemonRunning) {
      return;
    }

    // start all the other intervals
    this.setState({
      blockProcessorInterval: setInterval(() => { this.blockCycle(); }, this.state.blockInterval)
    });

    clearInterval(this.state.walletRunningInterval);
  }

  /**
   * This function should update the block height and sync percentage and should trigger the confirmations cycle.
   */
  blockCycle() {
    this.props.wallet.getInfo().then(async (data) => {
      // process block height in here.
      let syncedPercentage = (data.blocks * 100) / data.headers;
      syncedPercentage = Math.floor(syncedPercentage * 100) / 100;

      this.setState({
        currentHighestBlock: data.blocks,
        currentHighestHeader: data.headers,
      });

      // mutate redux data with data from the system.
      this.props.updatePaymentChainSync(data.blocks === 0 || data.headers === 0 ? 0 : syncedPercentage);
      this.props.setDaemonVersion(tools.formatVersion(data.version));
      this.props.chainInfo(data);
      this.props.walletInfo(data);

      if(!this.state.isIndexingTransactions){
        this.props.setLoading({
          isLoading: false
        });
      }
    }).catch((err) => {
      this.processError(err)
    });

    this.props.wallet.getWalletInfo().then(async (data) => {
      console.log(data);
      this.props.walletInfoSec(data);
    }).catch((err) => {
      this.processError(err)
    });
  }


  /**
   * This function should check all addresses to see if their balance has changed and update confirmations for
   * addresses, at the same time this should check if the address has a registered ans name not in the database
   * if so, store it and tell the user with a notifications.
   */
  async addressLoader() {
    this.props.wallet.listAddresses().then(async (data) => {
      console.log(data);
      let addresses = data;

      // if my current database addresses are not all in the addresses returned from the daemon,
      const myAddresses = await getAllMyAddresses();

      if (myAddresses.length > addresses.length) {
        await clearDB();
        console.log('in here');
      }

      // if(normalAddresses.length > this.currentAddresses.length) {
      for (const [index, address] of addresses.entries()) {
        // handle the response
        const addressObj = await addAddress(address, true);
      }

      addresses = await getAllMyAddresses();
      this.props.setUserAddresses(addresses);
      // }
      // We need to have the addresses loaded to be able to index transactions
      // this.currentAddresses = normalAddresses;
      if (!this.transactionsIndexed && this.firstRun && this.currentAddresses.length > 0 && !this.state.isIndexingTransactions) {
        await this.loadTransactionsForProcessing();
        this.props.setIndexingTransactions(true);
      }
      console.log(data);
      event.emit('reloadAddresses');
    });
  }


  /**
   * This transaction cycle function should pull down any transactions not stored in the DB and process them using the
   * algorithm i wrote. this function should not notify the user of previous transactions if they are resyncing the DB.
   * This function should also notify if there is new transactions.
   */
  async transactionLoader() {
    // compare the latest transaction time stored in memory against the latest 10 transactions.
    const latestTransaction = await getLatestTransaction();
    console.log(latestTransaction)
    this.from = latestTransaction != null ? latestTransaction.time : 0;


    const transactions = await this.props.wallet.getTransactions('*', 10000, 0);
    if ((latestTransaction === undefined || latestTransaction === null) && transactions.length === 0) {
      this.setState({
        transactionsIndexed: true
      });
    } else if ((latestTransaction === undefined || latestTransaction === null) && transactions.length > 0) {
      this.setState({
        transactionsIndexed: false
      });
    } else {
      this.setState({
        transactionsIndexed: true
      });
    }

    if (this.state.transactionsIndexed === false) {
      console.log('transactions indexed', this.state.transactionsIndexed);
      await this.loadTransactionsForProcessing();
    }
    //emit globally to update transaction list
    event.emit('reloadTransactions');

    // check if transactions have been indexed before.

    // if they havent been indexed before run the indexing process, and popup a loading module to the user


    // index transactions and calculate staking reward, once complete destroy this cycle.
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


  processError(err){
    console.log('error message', err.message);
    console.log('error code', err.code);

    if (err.message === 'Loading wallet...') {
      if (!this.props.initialSetup) {
        this.props.setLoading({
          isLoading: true,
          loadingMessage: this.props.lang.loadingWallet
        });
      }
    }
    if (err.message === 'Activating best chain...') {
      if (!this.props.initialSetup) {
        this.props.setLoading({
          isLoading: true,
          loadingMessage: this.props.lang.activatingBestChain
        });
      }
    }
    if (err.code === -28) {
      if (!this.props.initialSetup) {
        const loadingMessage = this.props.rescanningLogInfo.peekEnd() != null ?
          this.props.rescanningLogInfo.peekEnd(): err.message;

        this.props.setLoading({
          isLoading: true,
          loadingMessage: `${loadingMessage}`
        });
      }
    }
    if (err.message === 'Rescanning...') {
      const rescanningMessage = this.props.rescanningLogInfo.peekEnd();
      this.props.setLoading({
        isLoading: true,
        loadingMessage: `${this.props.lang.rescanning} ${rescanningMessage}`
      });
    }
    if ((err.message === 'Internal Server Error' || err.message === 'ESOCKETTIMEDOUT')) {
      this.props.setDaemonRunning(false);
    }
    if (err.message === 'connect ECONNREFUSED 127.0.0.1:19119') {
      this.props.setDaemonRunning(false);
      const errorMessage = this.props.rescanningLogInfo.peekEnd();
      console.log(errorMessage)
      this.props.setLoading({
        isLoading: true,
        loadingMessage: errorMessage
      });
    }
  }


  render() {
    return null;
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    updatingApp: state.startup.updatingApp,
    initialSetup: state.startup.initialSetup,
    daemonUpdate: state.startup.daemonUpdate,
    notifications: state.notifications,
    rescanningLogInfo: state.application.debugLog,
    daemonRunning: state.application.daemonRunning
  };
};

export default connect(mapStateToProps, actions)(Coin);
