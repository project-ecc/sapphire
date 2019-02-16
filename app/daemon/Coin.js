import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import * as actions from '../actions/index';
import {
  addTransaction, addAddress,
  getAllTransactions, getAllRewardTransactions,
  getLatestTransaction, updateTransactionsConfirmations,
  getAllMyAddresses, clearDB
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
    this.transactionCycle = this.transactionCycle.bind(this);
    this.addressCycle = this.addressCycle.bind(this);
    this.addressCycle = this.addressCycle.bind(this);
    this.stateCheckerInitialStartupCycle = this.stateCheckerInitialStartupCycle.bind(this);


    // Misc functions
    this.queueOrSendNotification = this.queueOrSendNotification.bind(this);
    this.checkQueuedNotifications = this.checkQueuedNotifications.bind(this);

    this.state = {
      interval: 5000,
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
      firstRun: false
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
  }

  async stateCheckerInitialStartupCycle() {
    this.props.wallet.getInfo().then(async (data) => {
      if (!data.encrypted) {
        this.props.setUnencryptedWallet(true);
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
        console.log("error", err.message);

        if (err.message === 'Loading wallet...') {
          if (!this.props.initialSetup) {
            this.props.setLoading({
              isLoading: true,
              loadingMessage: 'Loading wallet...'
            });
          }
        }
        if (err.message === 'Activating best chain...') {
          if (!this.props.initialSetup) {
            this.props.setLoading({
              isLoading: true,
              loadingMessage: 'Activating best chain...'
            });
          }
        }
        if (err.message === 'Loading block index...') {
          if (!this.props.initialSetup) {
            this.props.setLoading({
              isLoading: true,
              loadingMessage: 'Loading block index...'
            });
          }
        }
        if (err.message === 'Rescanning...') {
          let rescarnningMessage = this.props.rescanningLogInfo.peekEnd()
          this.props.setLoading({
            isLoading: true,
            loadingMessage: 'Rescanning...' + rescarnningMessage
          });
        }
        if ((err.message === 'Internal Server Error' || err.message === 'ESOCKETTIMEDOUT')) {
          this.props.setLoading({
            isLoading: true,
            loadingMessage: 'Rescanning...'
          });
        }
        if (err.message === 'connect ECONNREFUSED 127.0.0.1:19119') {
          this.props.setLoading({
            isLoading: true,
            loadingMessage: 'Please wait while we try to restart your wallet. You may also try closing and reopening Sapphire.'
          });
        }
      });
  }
  /**
   * Subscribe the daemon to manager events
   */
  listenToEvents() {
    // TODO: Review these and remove them where applicable
    // ipcRenderer.on('guiUpdate', this.handleGuiUpdate.bind(this));
    // ipcRenderer.on('daemonUpdate', this.handleDaemonUpdate.bind(this));
    // ipcRenderer.on('daemonUpdated', this.handleDaemonUpdated.bind(this));
    event.on('startConnectorChildren', () => {
      this.stateCheckerInitialStartupCycle.bind(this);
      this.setState({
        checkStartupStatusInterval: setInterval(async () => { await this.stateCheckerInitialStartupCycle(); }, 2000),
      });
    });

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
      // console.log(castedArg);
      if (castedArg != null && (castedArg.indexOf('init message') !== -1 || castedArg.indexOf('Still rescanning') !== -1 || castedArg.indexOf('Corrupted block database detected') !== -1)) {
        this.loadingMessage = castedArg;
        if (castedArg.indexOf('Corrupted block database detected') !== -1) {
          console.log('Corrupted block database detected.');
          ipcRenderer.send('loading-error', { message: 'Corrupted block database detected.' });
        }
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
      walletRunningInterval: setInterval(async () => { await this.walletCycle(); }, this.state.interval),
      running: true
    });
  }


  processAddresses() {}

  processTransactions() {}

  recalculateStakingsEarnings() {

  }
  async loadTransactionsForProcessing() {
    // TODO : WUT
    // await this.checkIfTransactionsNeedToBeDeleted();

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
    while (transactions == null && attempts <= maxAttempts) {
      transactions = await this.props.wallet.getTransactions('*', this.transactionsToRequest, this.transactionsToRequest * this.transactionsPage);
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
        if (!this.transactionsMap[txId]) {
          this.transactionsMap[txId] = [];
        }
        this.transactionsMap[txId].push({
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
  async processTransactions() {
    let entries = [];
    const rewards = [];
    const staked = [];
    const change = [];

    // process transactions
    for (const key of Object.keys(this.transactionsMap)) {
      const values = this.transactionsMap[key];
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
                } else {
                  // console.log('similarity too low')
                  // console.log(tools.similarity(original.amount.toString(), current.amount.toString()))
                }
              } else {
                // console.log('Sim value')
                // console.log(tools.similarity(original.amount.toString(), current.amount.toString()))
                // console.log('values dont line up')
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

    // console.log(entries);
    // console.log(rewards);
    // console.log(staked);
    this.transactionsMap = {};
    entries = entries.concat(rewards, staked, change);
    // console.log(entries.length)
    // console.log(JSON.stringify(entries))
    await this.insertIntoDb(entries);
  }
  async insertIntoDb(entries) {
    const lastCheckedEarnings = this.props.notifications.lastCheckedEarnings;
    let earningsCountNotif = 0;
    let earningsTotalNotif = 0;
    const shouldNotifyEarnings = this.props.notifications.stakingNotificationsEnabled;

    for (let i = 0; i < entries.length; i++) {
      // console.log(lastCheckedEarnings)
      if (this.firstRun) {
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
    if (!this.transactionsIndexed) {
      this.transactionsIndexed = true;
      this.props.setIndexingTransactions(false);
      const rewards = await getAllRewardTransactions();
      this.props.setStakingReward(rewards);
    }

    this.transactionsPage = 0;
    this.currentFrom = this.from;
    this.isIndexingTransactions = false;
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
        blockProcessorInterval: setInterval(() => { this.blockCycle(); }, this.state.interval),
        transactionProcessorInterval: setInterval(async () => { await this.transactionCycle(); }, this.state.interval),
        addressProcessorInterval: setInterval(async () => { await this.addressCycle(); }, this.state.interval)
      });

      this.props.setLoading({
        isLoading: true,
        loadingMessage: 'Connecting Sapphire to the blockchain!'
      });
      clearInterval(this.state.walletRunningInterval);
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

    this.props.setLoading({
      isLoading: true,
      loadingMessage: 'Connected!'
    });

    this.props.setLoading({
      isLoading: false,
    });
  }


  /**
   * This function should check all addresses to see if their balance has changed and update confirmations for
   * addresses, at the same time this should check if the address has a registered ans name not in the database
   * if so, store it and tell the user with a notifications.
   */
  async addressCycle() {
    this.props.wallet.listReceivedByAddress().then(async (data) => {
      let addresses = data;

      // if my current database addresses are not all in the addresses returned from the daemon,
      const myAddresses = await getAllMyAddresses();

      for (const [i, add] of myAddresses.entries()) {
        const found = addresses.filter((daemonAddress) => {
          return daemonAddress.address === add.address;
        });
        if (!found || found.length === 0) {
          await clearDB();
          console.log('in here');
          // this.transactionsIndexed = false;
          break;
        }
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
      if (!this.transactionsIndexed && this.firstRun && this.currentAddresses.length > 0 && !this.isIndexingTransactions) {
        await this.loadTransactionsForProcessing();
        this.props.setIndexingTransactions(true);
      }


      console.log(data);
    });
    this.props.wallet.listAddressGroupings().then(async (data) => {
      console.log(data);
    });
  }


  /**
   * This transaction cycle function should pull down any transactions not stored in the DB and process them using the
   * algorithm i wrote. this function should not notify the user of previous transactions if they are resyncing the DB.
   * This function should also notify if there is new transactions.
   */
  async transactionCycle() {
    // compare the latest transaction time stored in memory against the latest 10 transactions.
    const latestTransaction = await getLatestTransaction();
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

    if(this.state.transactionsIndexed === false){
      console.log('transactions indexed',this.state.transactionsIndexed);
      await this.loadTransactionsForProcessing();
    }

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
    rescanningLogInfo: state.application.debugLog
  };
};

export default connect(mapStateToProps, actions)(Coin);
