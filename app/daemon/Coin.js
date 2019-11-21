import React, {Component} from 'react';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import hash from './../router/hash';
import TransactionWorker from '../Workers/Transaction.worker.js';
import * as actions from '../actions/index';
import {RpcProvider} from 'worker-rpc';
import {
  addAddress,
  addTransaction,
  getAllMyAddresses,
  getAllRewardTransactions,
  getLatestTransaction, getUnconfirmedTransactions,
  updateTransactionsConfirmations
} from '../Managers/SQLManager';
import * as tools from '../utils/tools';
import Toast from "../globals/Toast/Toast";

const event = require('../utils/eventhandler');


class Coin extends Component {
  constructor(props) {
    super(props);

    // Cycle bindings
    this.walletCycle = this.walletCycle.bind(this);
    this.blockCycle = this.blockCycle.bind(this);
    this.coinCycle = this.coinCycle.bind(this);
    this.transactionLoader = this.transactionLoader.bind(this);
    this.addressLoader = this.addressLoader.bind(this);
    this.orderTransactions = this.orderTransactions.bind(this);
    this.stateCheckerInitialStartupCycle = this.stateCheckerInitialStartupCycle.bind(this);
    this.newTransactionChecker = this.newTransactionChecker.bind(this);


    // Misc functions
    this.queueOrSendNotification = this.queueOrSendNotification.bind(this);
    this.checkQueuedNotifications = this.checkQueuedNotifications.bind(this);
    const worker = new TransactionWorker();
    this.rpcProvider = new RpcProvider(
      (message, transfer) => worker.postMessage(message, transfer)
    );

    worker.onmessage = e => this.rpcProvider.dispatch(e.data);

    this.state = {
      miscInterval: 15000,
      blockInterval: 5000,
      coinInterval: 30000,
      latestBlockTime: 0,
      currentHighestBlock: 0,
      currentHighestHeader: 0,
      transactionMap: {},
      queuedNotifications: [],
      walletRunningInterval: null,
      checkStartupStatusInterval: null,
      blockProcessorInterval: null,
      coinCycleInterval: null,
      coinMarketCapInterval: null,
      transactionProcessorInterval: null,
      addressProcessorInterval: null,
      transactionsIndexed: false,
      lastTransactionTime: 0,
      transactionsToRequest: 4000,
      shouldRequestMoreTransactions: false,
      firstRun: false,
      transactionsPage: 0,
      isIndexingTransactions: false
    };


    this.listenToEvents();
  }

  componentWillUnmount() {
    clearInterval(this.state.walletRunningInterval);
    clearInterval(this.state.blockProcessorInterval);
    clearInterval(this.state.coinMarketCapInterval);
    clearInterval(this.state.checkStartupStatusInterval);
    clearInterval(this.state.addressProcessorInterval);

    event.removeListener('startConnectorChildren');
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
      this.props.setBlockChainConnected(true);
      this.props.setDaemonRunning(true);

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

      if (!data.encrypted) {
        this.props.setUnencryptedWallet(true);
      } else {
        this.props.setUnencryptedWallet(false);
      }

      if (this.props.updatingApp) {
        this.props.setUpdatingApplication(true);
      }

      if (this.props.daemonRunning) {
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
    });

    ipcRenderer.on('message-from-log', (e, arg) => {
      this.props.setAppendToDebugLog(arg);
      const castedArg = String(arg);
      const captureErrorStrings = [
        'Corrupted block database detected',
        'Aborted block database rebuild. Exiting.',
        'initError: Cannot obtain a lock on data directory ',
        'ERROR: VerifyDB():',
      ];

      const captureLoadingStrings = [
        'Block Import: already had block',
        'init message',
        'Still rescanning',
      ];

      if (captureErrorStrings.some((v) => { return castedArg.indexOf(v) > -1; })) {
        ipcRenderer.send('loading-error', { message: castedArg});
      }

      if (captureLoadingStrings.some((v) => { return castedArg.indexOf(v) > -1; })) {
        this.props.setLoading({
          isLoading: true,
          loadingMessage: castedArg
        });
      }
    });
  }

  async startCycles() {
    // we can starting syncing the block data with redux now
    this.setState({
      walletRunningInterval: setInterval(async () => { await this.walletCycle(); }, this.state.blockInterval),
      newTransactionInterval: setInterval(async() => { await this.newTransactionChecker(); }, 30000)
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
      transactions = await this.props.wallet.getTransactions(this.state.transactionsToRequest, this.state.transactionsToRequest * this.state.transactionsPage);
      console.log(transactions);
    }

    transactions = this.orderTransactions(transactions);

    // load transactions into transactionsMap for processing
    for (let i = 0; i < transactions.length; i++) {
      time = transactions[i].time;
      if (time > this.state.lastTransactionTime) {
        // console.log(transactions[i])
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
      this.rpcProvider
        .rpc('processTransactions',
          {
            transactions: this.state.transactionMap,
            lastCheckedEarnings: this.props.notifications.lastCheckedEarnings,
            shouldNotifyEarnings: this.props.notifications.stakingNotificationsEnabled
          }
        )
        .then(async (result) => {
          console.log(result)
          await this.insertIntoDb(result);
        });
    }
  }

  orderTransactions(data) {
    const aux = [];
    for (let i = data.length - 1; i >= 0; i -= 1) {
      aux.push(data[i]);
    }
    return aux;
  }

  async insertIntoDb(entries) {
    console.log('TRANSACTIONS STARTED INDEXING')
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
      const callback = () => { hash.push('/coin/transactions');};
      await this.queueOrSendNotification(callback, body);
    }

    // no more transactions to process, mark as done to avoid spamming the daemon
    if (!this.state.transactionsIndexed) {
      this.setState({
        transactionsIndexed: true
      });
      this.props.setIndexingTransactions(false);
      console.log('TRANSACTIONS FINISHED INDEXING')
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
   * @param title
   */


  async queueOrSendNotification(callback, body, title = null) {
    if (this.props.loading) {
      this.state.queuedNotifications.push({ callback, body, title });
    } else {
      await tools.sendOSNotification(body, callback, title);
    }
  }

  checkQueuedNotifications() {
    if (!this.props.loading && this.state.queuedNotifications.length >= 0) {
      if (this.state.queuedNotifications.length === 0) {
        clearInterval(1000);
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

    // start all the other intervals
    this.setState({
      blockProcessorInterval: setInterval(() => { this.blockCycle(); }, this.state.blockInterval),
      coinCycleInterval: setInterval(async () => { await this.coinCycle(); }, this.state.coinInterval)
    });

    clearInterval(this.state.walletRunningInterval);
  }

  /**
   * This function should update the block height and sync percentage and should trigger the confirmations cycle.
   */
  blockCycle() {
    this.props.wallet.getBlockChainInfo().then(async (data) => {
      this.props.setBlockChainConnected(true);
      // process block height in here.
      let syncedPercentage = (data.blocks * 100) / data.headers;
      syncedPercentage = Math.floor(syncedPercentage * 100) / 100;

      this.setState({
        currentHighestBlock: data.blocks,
        currentHighestHeader: data.headers,
      });

      // mutate redux data with data from the system.
      this.props.updatePaymentChainSync(data.blocks === 0 || data.headers === 0 ? 0 : syncedPercentage);
      this.props.setBlocksAndHeaders({
        blocks: data.blocks,
        headers: data.headers
      });

      this.props.setInitialBlockDownload(data.initialblockdownload);
      this.props.setSizeOnDisk(data.size_on_disk);
      if(!this.state.isIndexingTransactions && this.props.daemonRunning && this.props.blockChainConnected){
        this.props.setLoading({
          isLoading: false
        });
      }
    })
    .catch((err) => {
      this.processError(err)
    });

    this.props.wallet.getMiningInfo().then(async (data) => {
      this.props.miningInfo(data)
    })
    .catch((err) => {
      this.processError(err)
    });
  }

  coinCycle() {
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
      console.log(data)
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
      // console.log(data);
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
      ipcRenderer.send('processAddresses', data)
      let addresses = data;

      for (const [index, address] of addresses.entries()) {
        // handle the response
        const addressObj = await addAddress(address, true);
      }

      addresses = await getAllMyAddresses();
      this.props.setUserAddresses(addresses);
      // }
      // We need to have the addresses loaded to be able to index transactions
      // this.currentAddresses = normalAddresses;
      if (!this.state.transactionsIndexed && this.firstRun && this.props.userAddresses.length > 0 && !this.state.isIndexingTransactions) {
        await this.loadTransactionsForProcessing();
        this.props.setIndexingTransactions(true);
      }
      event.emit('reloadAddresses');
    }).catch((err) => {
      this.processError(err)
    });
  }

  async newTransactionChecker(){
    const latestTransaction = await getLatestTransaction();
    const latestTransactionTime = latestTransaction != null ? latestTransaction.time : 0;
    this.setState({
      lastTransactionTime : latestTransactionTime
    })
    let transactions = [];
    try{
      transactions = await this.props.wallet.getTransactions(1, 0);
    } catch (e) {
      console.log(e)
    }

    if(transactions !== null && transactions.length > 0 ){
      console.log(this.state.lastTransactionTime)
      let newTransaction = false

      let arrayLength = transactions.length;
      for (let i = 0; i < arrayLength; i++) {
        if(transactions[0].time > this.state.lastTransactionTime){
          newTransaction = true
          let title = ''
          let message = ''
          switch(transactions[i].category){
            case "send":
              title = 'Transaction sent successfully!'
              message = `Sent Amount: ${transactions[i].amount}`
              break;
            case "receive":
              title = 'New Transaction Received!'
              message = `Received Amount: ${transactions[i].amount}`
              break;
            case "generate":
              title = 'Stake Reward Received!'
              message = `Reward Amount: ${transactions[i].amount}`
              break;
          }
          await this.queueOrSendNotification( () => {
            hash.push('/coin/transactions');
          }, message , title);
        }
      }
      if(newTransaction === true){
        await this.transactionLoader()
      }
    }
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
    const latestTransactionTime = latestTransaction != null ? latestTransaction.time : 0;
    console.log(latestTransactionTime)
    this.setState({
      lastTransactionTime : latestTransactionTime
    })


    let transactions = [];
    try{
      transactions = await this.props.wallet.getTransactions(10000, 0);
      transactions = this.orderTransactions(transactions);
    } catch (e) {
      console.log(e)
    }

    if(latestTransactionTime !== 0 && transactions !== null && transactions.length > 0 ){
      console.log(transactions[0].time)
      console.log(this.state.lastTransactionTime)
      console.log('in first statement')
      if(transactions[0].time > this.state.lastTransactionTime){
        await this.loadTransactionsForProcessing();
        this.setState({
          transactionsIndexed: false
        })
      }
    }

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

    } else{
      if(!this.props.initialDownload){
        await this.updateConfirmations();
      }

    }
    //emit globally to update transaction list
    this.props.setLoading({
      isLoading: false
    });
    event.emit('reloadTransactions');

    // index transactions and calculate staking reward, once complete destroy this cycle.
  }

  /**
   * This function should be fired somehow and run in the background to update all the confirmations for all
   * stored Transations this should be coded in a way it doesnt interupt the UI and should replace the in memory
   * transactions when its done. SHOULD NOT BE CALLED WHEN USER IS USING A TRANSACTION FILTER.
   */
  async updateConfirmations() {
    await getUnconfirmedTransactions()
      .then(async (transactionData) => {
        await Promise.all(transactionData.map(async (transaction) => {
          try {
            const walletTransaction = await this.props.wallet.getTransaction(transaction['transaction_id']);
            return await updateTransactionsConfirmations(walletTransaction.txid, walletTransaction.confirmations);
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
    if ((err.code === 401)) {
      this.props.setLoading({
        isLoading: true,
        loadingMessage: err.message
      });
    }
    if ((err.message === 'Internal Server Error' || err.message === 'ESOCKETTIMEDOUT' || err.body === 'Work queue depth exceeded')) {
      this.props.setBlockChainConnected(false);
    }
    if (err.message === 'connect ECONNREFUSED 127.0.0.1:19119') {
      this.props.setDaemonRunning(false);
      this.props.setBlockChainConnected(false);
      const errorMessage = this.props.rescanningLogInfo.peekEnd();
      if(this.props.betaMode){
        Toast({
          color: 'red',
          message: errorMessage
        });
      }
      console.log(errorMessage)
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
    loading: state.startup.loading,
    notifications: state.notifications,
    rescanningLogInfo: state.application.debugLog,
    daemonRunning: state.application.daemonRunning,
    userAddresses: state.application.userAddresses,
    initialDownload: state.chains.initialDownload,
    blockChainConnected: state.application.blockChainConnected,
    betaMode: state.application.betaMode
  };
};

export default connect(mapStateToProps, actions)(Coin);
