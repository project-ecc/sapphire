import Wallet from '../utils/wallet';
import { ipcRenderer } from 'electron';
import {
  PAYMENT_CHAIN_SYNC,
  PARTIAL_INITIAL_SETUP,
  SETUP_DONE,
  INITIAL_SETUP,
  BLOCK_INDEX_PAYMENT,
  WALLET_INFO,
  CHAIN_INFO,
  TRANSACTIONS_DATA,
  USER_ADDRESSES,
  INDEXING_TRANSACTIONS,
  STAKING_REWARD,
  PENDING_TRANSACTION,
  DAEMON_CREDENTIALS,
  LOADING,
  ECC_POST,
  COIN_MARKET_CAP,
  UPDATE_AVAILABLE,
  UPDATING_APP,
  POSTS_PER_CONTAINER,
  NEWS_NOTIFICATION,
  STAKING_NOTIFICATION,
  UNENCRYPTED_WALLET,
  SELECTED_PANEL,
  SELECTED_SIDEBAR,
  SETTINGS,
  SETTINGS_OPTION_SELECTED,
  TELL_USER_OF_UPDATE,
  SELECTED_THEME,
  SET_DAEMON_VERSION,
  STAKING_REWARD_UPDATE,
  WALLET_INFO_SEC,
  IMPORT_WALLET_TEMPORARY,
  FILE_DOWNLOAD_STATUS,
  TOLD_USER_UPDATE_FAILED,
  RESET_STAKING_EARNINGS,
  IS_FILTERING_TRANSACTIIONS,
  TRANSACTIONS_TYPE,
  ACTION_POPUP_RESULT,
  ADD_TO_DEBUG_LOG,
  LOADER_MESSAGE_FROM_LOG,
  SELECTED_CURRENCY
} from '../actions/types';

const event = require('../utils/eventhandler');
const tools = require('../utils/tools');
let remote = require('electron').remote;
let funnies = new Funnies()
import Funnies from 'funnies';
import {
  addTransaction, addAddress, deleteAddressByName, truncateTransactions,
  getAllTransactions, getAllRewardTransactions, getAllPendingTransactions,
  getLatestTransaction, getAllAddresses, updatePendingTransaction, updateTransactionsConfirmations,
  getAllMyAddresses
} from '../Managers/SQLManager';

import $ from 'jquery';
const FeedMe = require('feedme');
const https = require('https');
const Tools = require('../utils/tools');
const request = require('request');
const db = require('../../app/utils/database/db')


//this class acts as a bridge between wallet.js (daemon) and the redux store
class DaemonConnector {

	constructor(store){
		this.store = store;
    this.wallet = store.getState().application.wallet;
    this.setupDone = false;
    this.partialSetup = false;
    this.ListenToSetupEvents = this.listenToSetupEvents.bind(this);
    this.handlePartialSetup = this.handlePartialSetup.bind(this);
    this.handleInitialSetup = this.handleInitialSetup.bind(this);
    this.handleSetupDone = this.handleSetupDone.bind(this);
    this.updateConfirmations = this.updateConfirmations.bind(this);
    this.forceUpdateDaemon = this.forceUpdateDaemon.bind(this);
    this.ListenToSetupEvents();
    this.step = 1;
    this.loadingBlockIndexPayment = false;
    this.handleStoreChange = this.handleStoreChange.bind(this);
    this.unsubscribe = this.store.subscribe(this.handleStoreChange);
    this.unsubscribeFromSetupEvents = this.unsubscribeFromSetupEvents.bind(this);
    this.getAddresses = this.getAddresses.bind(this);
    this.mainCycle = this.mainCycle.bind(this);
    this.subscribeToEvents = this.subscribeToEvents.bind(this);
    this.loadTransactionsForProcessing = this.loadTransactionsForProcessing.bind(this);
    this.needToReloadTransactions = this.needToReloadTransactions.bind(this);
    this.updateProcessedAddresses = this.updateProcessedAddresses.bind(this);
    this.processTransactions = this.processTransactions.bind(this);
    this.getRawTransaction = this.getRawTransaction.bind(this);
    this.insertIntoDb = this.insertIntoDb.bind(this);
    this.loadTransactionFromDb = this.loadTransactionFromDb.bind(this);
    this.checkIfTransactionsNeedToBeDeleted = this.checkIfTransactionsNeedToBeDeleted.bind(this);
    this.processPendingTransactions = this.processPendingTransactions.bind(this);
    this.removeTransactionFromMemory = this.removeTransactionFromMemory.bind(this);
    this.goToEarningsPanel = this.goToEarningsPanel.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.subscribeToEvents();
    this.currentAddresses = [];
    this.processedAddresses = [];
    this.from = null
    this.currentFrom = this.from;
    this.transactionsPage = 0;
    this.transactionsToRequest = 1000;
    this.transactionsIndexed = false;

    this.transactionsMap = {};
    this.runningMainCycle = false;
    this.firstRun = true;
    this.hasLoadedTransactionsFromDb = false;
    this.checkStartupStatusInterval = setInterval(()=>{
      this.stateCheckerInitialStartup();
    }, 2000);
    this.getECCPosts = this.getECCPosts.bind(this);
    this.getECCPosts();
    setInterval(() => {
      this.getECCPosts();
    }, 60000);
    this.getCoinMarketCapStats = this.getCoinMarketCapStats.bind(this);
    this.getCoinMarketCapStats();
    setInterval(() => {
      this.getCoinMarketCapStats();
    }, 120000);
    this.stakingRewardsCountNotif = 0;
    this.stakingRewardsTotalEarnedNotif = 0;
    this.queuedNotifications = [];
    this.checkQueuedNotificationsInterval;
    this.checkQueuedNotifications = this.checkQueuedNotifications.bind(this);
    this.queueOrSendNotification = this.queueOrSendNotification.bind(this);
    this.unencryptedWallet = false;
    this.heighestBlockFromServer = 0;
    this.heighestBlockFromServerInterval;
    this.translator = this.store.getState().startup.lang;
    this.latestBlockTime = 0
	}

  subscribeToEvents(){
    let self = this;
    event.on('newAddress', self.getAddresses);
    //recalculate earnings every 30 minutes
    setInterval(() => {
      this.store.dispatch({type: STAKING_REWARD_UPDATE})
    }, 30 * 60 * 1000)
    this.checkQueuedNotificationsInterval = setInterval(() => this.checkQueuedNotifications(), 5000);
    //get headers from server every 2 minutes
    this.heighestBlockFromServerInterval = setInterval( async() => {
      this.heighestBlockFromServer = await this.getLastBlockFromServer();
    }, 120000)
    //get headers as soon as the app loads
    setTimeout( async() => {
      this.heighestBlockFromServer = await this.getLastBlockFromServer();
    }, 0);

  }

  checkQueuedNotifications(){
    if(!this.store.getState().startup.loading && !this.store.getState().startup.loader && this.store.getState().startup.setupDone && this.queuedNotifications.length >= 0){

      if(this.queuedNotifications.length === 0){
        clearInterval(this.checkQueuedNotificationsInterval);
        return;
      }else{
        let notification = this.queuedNotifications[0];
        this.queuedNotifications.splice(0, 1);
        Tools.sendOSNotification(notification.body, notification.callback);
      }
    }
  }

  //this method is used to detect the initial setup has been completed and is never called again after, I should probably use the event class here.
  handleStoreChange() {
    const setupDone = this.store.getState().startup.setupDone;
    if(setupDone){
      this.unsubscribe();
      this.unsubscribeFromSetupEvents();
    }
  }

  async mainCycle(){
    if(!this.isIndexingTransactions){
      const addresses = await getAllAddresses();
      if(addresses.length > 0){
        for (let i = 0; i < addresses.length - 1; i++){
          this.processedAddresses.push(addresses[i].address);
        }
      }
      const latestTransaction = await getLatestTransaction();
      this.from = latestTransaction != null ? latestTransaction.time : 0;
      this.currentFrom = this.from
      this.transactionsIndexed = true;
    }

    if(this.store.getState().startup.updatingApp){
      this.runningMainCycle = false;
      return;
    }
    if(!this.hasLoadedTransactionsFromDb && this.transactionsIndexed){
      await this.loadTransactionFromDb();
      // grab transaction that is main
      const where = {
        is_main: 1
      };
      const transactionData = await getAllTransactions(100, 0, where);
      this.store.dispatch({type: TRANSACTIONS_DATA, payload: {data: transactionData , type: "all"}});
      this.hasLoadedTransactionsFromDb = true
    }
    try{
      await this.wallet.getAllInfo().then( async (data) => {
        if(data){
          console.log(data)
          await this.getAddresses(data[2], data[3]);
          const highestBlock = data[0].headers === 0 || data[0].headers < this.heighestBlockFromServer ? this.heighestBlockFromServer : data[0].headers;
          // remove .00 if 100%
          let syncedPercentage = (data[0].blocks * 100) / data[0].headers;
          syncedPercentage = Math.floor(syncedPercentage * 100) / 100;

          if(data[0].blocks >= highestBlock && this.transactionsIndexed && !this.firstRun){
            await this.processPendingTransactions();
          }
          data[0].headers = highestBlock;

          // check the latest transactions against the current from
          const result = (data[1].filter(transaction =>{
           return transaction.time * 1000 > this.currentFrom
          }));
          console.log(result)
          if (result.length > 0 && !this.firstRun){
            await this.loadTransactionsForProcessing()
          }

          // update all transactions confirmations.
          const blockChainInfo = await this.wallet.getBlockChainInfo();
          const latestBlockTime = blockChainInfo.mediantime

          if(this.latestBlockTime < latestBlockTime && !this.firstRun){
            this.latestBlockTime = latestBlockTime;
            await this.updateConfirmations()
            this.hasLoadedTransactionsFromDb = false;
          }

          this.store.dispatch({type: SET_DAEMON_VERSION, payload: tools.formatVersion(data[0].version)});
          this.store.dispatch({type: WALLET_INFO, payload: data[0]});
          this.store.dispatch({type: CHAIN_INFO, payload: data[0]});
          this.store.dispatch({type: WALLET_INFO_SEC, payload: data[4]});
          this.store.dispatch ({type: PAYMENT_CHAIN_SYNC, payload: data[0].blocks === 0 || data[0].headers === 0 ? 0 : syncedPercentage});
        }
      });
    } catch(err) {
      console.log(err);
      setTimeout(async () => {
        await this.mainCycle();
      }, this.firstRun && this.transactionsIndexed ? 1000 : 4000);
      return;
    }
    if(!this.firstRun && !this.isIndexingTransactions && !this.transactionsIndexed){
      await this.loadTransactionsForProcessing();
    }
    if(this.transactionsIndexed){
      if(this.partialSetup && !this.unencryptedWallet){
        this.store.dispatch({type: PARTIAL_INITIAL_SETUP, payload: false });
        this.partialSetup = false;
      }
      else if(this.partialSetup && this.unencryptedWallet){
        this.store.dispatch({type: PARTIAL_INITIAL_SETUP, payload: true });
        this.partialSetup = false;
        this.unencryptedWallet = false;
      }
      else if(!this.partialSetup && this.unencryptedWallet){
        this.store.dispatch({type: UNENCRYPTED_WALLET, payload: true });
        this.unencryptedWallet = false;
      }
      if(this.firstRun){
        this.firstRun=false;
        this.store.dispatch({type: LOADING, payload:{isLoading: false, loadingMessage: ''}})
        if(this.store.getState().startup.importWalletTemp){
          this.store.dispatch({type: IMPORT_WALLET_TEMPORARY, payload: {importWalletTemp: false, importWallet: true}})
        }
      }
    }
    if((this.store.getState().startup.daemonUpdate || this.store.getState().startup.guiUpdate) && !this.store.getState().startup.toldUserAboutUpdate && !this.store.getState().startup.loader){
      this.notifyUserOfApplicationUpdate();
    }

    setTimeout(async () => {
      await this.mainCycle();
    }, this.firstRun && this.transactionsIndexed ? 1000 : 4000);
  }

  unsubscribeFromSetupEvents(){
    ipcRenderer.removeListener('initial_setup', this.handleInitialSetup);
    ipcRenderer.removeListener('setup_done', this.handleSetupDone);
    ipcRenderer.removeListener('partial_initial_setup', this.handlePartialSetup);
  }

  listenToSetupEvents(){
    ipcRenderer.on('initial_setup', this.handleInitialSetup);
    ipcRenderer.on('setup_done', this.handleSetupDone);
    ipcRenderer.on('partial_initial_setup', this.handlePartialSetup);
    ipcRenderer.on('guiUpdate', this.handleGuiUpdate.bind(this));
    ipcRenderer.on('daemonUpdate', this.handleDaemonUpdate.bind(this));
    ipcRenderer.on('daemonUpdated', this.handleDaemonUpdated.bind(this));
    ipcRenderer.on('daemonCredentials', this.createWallet.bind(this));

    //downloader events.
    ipcRenderer.on('downloading-file', (event, arg) =>{
      // console.log("downloading-file", e, arg);
      const walletPercent = arg.percent * 100;

      this.store.dispatch({type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: 'Downloading the required files',
          downloadPercentage: walletPercent.toFixed(2),
          downloadRemainingTime: arg.time.remaining
        }
      })
      // console.log(payload)
    });

    ipcRenderer.on('downloaded-file', () => {
      this.store.dispatch({type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: 'Downloading the required files',
          downloadPercentage: 100,
          downloadRemainingTime: 0.0
        }
      })
    });

    ipcRenderer.on('verifying-file', () => {
      this.store.dispatch({type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: 'Validating',
          downloadPercentage: undefined,
          downloadRemainingTime: 0.0
        }
      })
    });

    ipcRenderer.on('unzipping-file', () => {
      this.store.dispatch({type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: 'Unzipping',
          downloadPercentage: undefined,
          downloadRemainingTime: 0.0
        }
      })
    });
    ipcRenderer.on('file-download-complete', () => {
      this.store.dispatch({type: FILE_DOWNLOAD_STATUS,
        payload: {
          downloadMessage: '',
          downloadPercentage: undefined,
          downloadRemainingTime: 0.0
        }
      })
    });
    ipcRenderer.on('download-error', (e, arg) => {
      console.log('Download failure: '+ arg.message);
      this.store.dispatch({type: TOLD_USER_UPDATE_FAILED,
        payload: {
          updateFailed: true,
          downloadMessage: arg.message
        }
      });
      if(this.store.getState().startup.daemonUpdate){
        this.firstRun = true;
        this.checkStartupStatusInterval = setInterval(()=>{
          this.stateCheckerInitialStartup();
        }, 2000)
      }
    });


    ipcRenderer.on('loading-error', (e, arg) => {
      console.log('loading failure: '+ arg.message);
      const discordIcon = Tools.getIconForTheme('discord', false);
      this.store.dispatch({type: ACTION_POPUP_RESULT, payload: {flag: true, successful: false,
        message: `<div>
                    <h3>Oops!</h3>
                    <img height="75px" width="75px" src=${discordIcon}>
                    <p className="backupSuccessful">It looks like Sapphire is unable to load ECC's blockchain</p>
                    <p className="backupSuccessful">Please join our discord below and report your issue in #support</p>
                    <a href="https://discord.gg/wAV3n2q" target="_blank">https://discord.gg/wAV3n2q</a>
                    <div style="height:10px;"></div>
                  </div>`}})

      this.store.dispatch({type: LOADING, payload:{isLoading: true, loadingMessage: ''}})
    });

    ipcRenderer.on('message-from-log', (event, arg) =>{
      this.store.dispatch({type: ADD_TO_DEBUG_LOG, payload: arg})
      const castedArg = String(arg)
      console.log(castedArg)
      if(castedArg != null && castedArg.indexOf('init message')!== -1 && this.firstRun){
        const logMessage = castedArg.split("init message:")[1];

        this.store.dispatch({type: LOADING, payload:{isLoading: true, loadingMessage: logMessage}})
      }
    });

    ipcRenderer.on('selected-currency', (event, arg) => {
      console.log('in here ',arg)
     this.getCoinMarketCapStats(arg)
    });

    event.on('runMainCycle', () => {
      console.log('run main cycle')
      if(!this.runningMainCycle){
        this.firstRun = true;
        this.mainCycle();
      }
    });
  }

  handleDaemonUpdated(){
    this.store.dispatch({type: UPDATE_AVAILABLE, payload: {guiUpdate: false, daemonUpdate: false}})
    this.firstRun = true;
    this.checkStartupStatusInterval = setInterval(async()=>{
      await this.stateCheckerInitialStartup();
    }, 2000)
  }

  forceUpdateDaemon(){
    this.store.dispatch({type: ACTION_POPUP_RESULT, payload: {flag: false, successful: false, message: ''}});
    event.emit('updateDaemon', false);
  }

  notifyUserOfApplicationUpdate(){
    const callback = () => {
      this.store.dispatch({type: SETTINGS, payload: true});
      this.store.dispatch({type: SETTINGS_OPTION_SELECTED, payload: "General"})
    }
    const body = this.store.getState().startup.lang.updateAvailableNotif;

    this.queueOrSendNotification(callback, body);

    this.store.dispatch({type: TELL_USER_OF_UPDATE})
  }

  handleGuiUpdate(){
    this.store.dispatch({type: UPDATE_AVAILABLE, payload: {guiUpdate: true, daemonUpdate: this.store.getState().startup.daemonUpdate} })
  }

  handleDaemonUpdate(){
    this.store.dispatch({type: UPDATE_AVAILABLE, payload: {guiUpdate: this.store.getState().startup.guiUpdate, daemonUpdate: true} })
  }

  createWallet(event, arg){
    this.store.dispatch({type: DAEMON_CREDENTIALS, payload: arg })
    this.wallet = new Wallet(arg.username, arg.password)
  }

  handleInitialSetup(){
    this.store.dispatch({type: INITIAL_SETUP })
  }

  handlePartialSetup(){
    this.partialSetup = true;
  }

  handleSetupDone(){
    this.store.dispatch({type: SETUP_DONE, payload: true});
    this.unsubscribeFromSetupEvents();
  }

  async stateCheckerInitialStartup(){
    this.wallet.getInfo().then(async (data) => {
      if(!data.encrypted){
        this.unencryptedWallet = true;
      }
      if(this.loadingBlockIndexPayment){
        this.loadingBlockIndexPayment = false;
        this.store.dispatch({type: BLOCK_INDEX_PAYMENT, payload: false})
      }
      if(this.store.getState().startup.updatingApp){
        this.store.dispatch({type: UPDATING_APP, payload: false})
      }
      if(!this.runningMainCycle){
        await db.sequelize.sync();
        this.runningMainCycle = true;
        await this.mainCycle();
      }
      // sync database before loading anything else.
      clearInterval(this.checkStartupStatusInterval);
    })
    .catch((err) => {
      console.log(err.message)
      if (err.message === 'Loading block index...' || err.message === 'Activating best chain...' || err.message === "Loading wallet..." || err.message === 'Rescanning...') {
        if(!this.loadingBlockIndexPayment){
          this.loadingBlockIndexPayment = true;
          this.store.dispatch({type: BLOCK_INDEX_PAYMENT, payload: true})
        }

        if(err.message === 'Loading block index...'){
          if(!this.store.getState().startup.initialSetup){
            this.store.dispatch({type: LOADING, payload:{isLoading: true }})
          }
        } else if(err.message === 'Rescanning...'){
          // TODO: fix this
          this.store.dispatch({type: LOADER_MESSAGE_FROM_LOG, payload:true})
          const message = this.store.getState().application.debugLog.peek()
          this.store.dispatch({type: LOADING, payload:{isLoading: true, loadingMessage: message}})
        }
      }
    });
  }

  getLastBlockFromServer(){
    return new Promise((resolve, reject) => {
      let options = {
        url: 'https://ecc.network/api/v1/block_height',
      };
      let self = this;
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          let json = JSON.parse(body);
          let height = json.block_height;
          console.log("Server height: ", height)
          let localHeight = self.store.getState().chains.headersPayment;
          console.log("Local height: ", self.store.getState().chains.headersPayment)
          if(localHeight >= height){
            clearInterval(self.heighestBlockFromServerInterval);
            resolve(localHeight);
            return;
          }
          if(height < self.heighestBlockFromServer)
          {
            resolve(self.heighestBlockFromServer);
            return;
          }
          resolve(json.block_height);
        }
        else
        {
          resolve(self.heighestBlockFromServer);
        }
      }
      request(options, callback);
    });
  }

  fixNewsText(text){
    let result = text.replace(new RegExp('</p><p>', 'g'), ' ');
    result = result.replace(new RegExp('</blockquote><p>', 'g'), '. ');
    return result;
  }

  getECCPosts(){
    let posts = this.store.getState().application.eccPosts;
    let lastCheckedNews = this.store.getState().notifications.lastCheckedNews;
    https.get('https://medium.com/feed/@project_ecc', (res) => {
      if (res.statusCode != 200) {
        console.error(new Error(`status code ${res.statusCode}`));
        return;
      }
      const today = new Date();
      let parser = new FeedMe();
      let totalNews = 0;
      let title = this.store.getState().startup.lang.eccNews;
      parser.on('end', () => {
        if(totalNews == 0 || !this.store.getState().notifications.newsNotificationsEnabled) return;
        const body = totalNews == 1 ? title : `${totalNews} ${title}`;
        const callback = () => {
          this.store.dispatch({type: SELECTED_PANEL, payload: "news"});
          this.store.dispatch({type: SELECTED_SIDEBAR, payload: {undefined}})
        };

        this.queueOrSendNotification(callback, body);
      });

      parser.on('item', (item) => {
        let url = item.guid.text;
        let hasVideo = item["content:encoded"].indexOf('iframe');
        let text = $(this.fixNewsText(item["content:encoded"])).text();
        let index = text.indexOf("Team");
        if(index == 13){
         text = text.slice(index + 4);
        }
        let date = item["pubdate"];
        let iTime = new Date(date);
        let time = Tools.calculateTimeSince(this.store.getState().startup.lang, today, iTime);

        //push post (fetch existing posts)
        let post = undefined;
        if(posts.length == 0 || posts[posts.length-1].date > iTime.getTime()){
          post = {
            title: item.title,
            timeSince: time,
            hasVideo: hasVideo != -1 ? true : false, //probably going to remove this video flag
            url: url,
            body: text,
            date: iTime.getTime()
          };
          posts.push(post);
          this.store.dispatch({type: ECC_POST, payload: posts})
        }
        //put post in the first position of the array (new post)
        else if(posts[0].date < iTime.getTime()){
          post = {
            title: item.title,
            timeSince: time,
            hasVideo: hasVideo != -1 ? true : false,
            url: url,
            body: text,
            date: iTime.getTime()
          };
          posts.unshift(post);
          this.store.dispatch({type: ECC_POST, payload: posts});
          //update render
          this.store.dispatch({type: POSTS_PER_CONTAINER, payload: this.store.getState().application.postsPerContainerEccNews})
        }
        if(post && post.date > lastCheckedNews && this.store.getState().notifications.newsNotificationsEnabled ){
          totalNews++;
          this.store.dispatch({type: NEWS_NOTIFICATION, payload: post.date})
        }
      });
      res.pipe(parser);
    });
  }

  getCoinMarketCapStats(currency = ''){
    let url = ''
	  if(currency === ''){
      currency = 'USD'
	    url = 'https://api.coinmarketcap.com/v2/ticker/212'
    } else{
      currency = currency.toUpperCase();
      url = 'https://api.coinmarketcap.com/v2/ticker/212/?convert='+ currency
    }

	  let options = {
      url: url,
    };
    let self = this;
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        let json = JSON.parse(body);
        console.log(json)
        self.store.dispatch({type: COIN_MARKET_CAP, payload: {
          price: Tools.formatNumber(Number(json['data']['quotes'][currency].price)),
          rank: json['data'].rank,
          marketCap:  Tools.formatNumber(Number(json['data']['quotes'][currency].market_cap)),
          volume: Tools.formatNumber(Number(json['data']['quotes'][currency].volume_24h))}})
        self.store.dispatch({type: SELECTED_CURRENCY, payload: currency.toLowerCase()})
      }
      else
      {
        console.log(error)
      }
    }
    request(options, callback);
  }


  //DATABASE RELATED CODE (EARNINGS FROM STAKING)

  needToReloadTransactions(){
    for(let i = 0; i < this.currentAddresses.length -1; i++){
      if(this.processedAddresses === undefined || !this.processedAddresses.includes(this.currentAddresses[i].address)){
        return true;
      }
    }
    return false;
  }

  // if addresses were added or removed, re-index transactions
  async updateProcessedAddresses(){
    for(let i = 0; i < this.currentAddresses.length; i++){
      let currentAddress = this.currentAddresses[i].address;
      this.processedAddresses.push(currentAddress)
    }
    this.store.dispatch({type: RESET_STAKING_EARNINGS});
    this.from = 0;
    this.transactionsIndexed = false;
    await truncateTransactions();
  }

  orderTransactions(data) {
    const aux = [];
    for (let i = data.length - 1; i >= 0; i -= 1) {
      aux.push(data[i]);
    }
    return aux;
  }

  async checkIfTransactionsNeedToBeDeleted(){
    if(this.needToReloadTransactions())
      await this.updateProcessedAddresses();
  }

  async loadTransactionsForProcessing(){
    this.isIndexingTransactions = true;

    await this.checkIfTransactionsNeedToBeDeleted();

    let txId = "";
    let time = 0;
    let amount = 0;
    let category = "";
    let address = "";
    let fee = 0;
    let confirmations = 0;
    let shouldRequestAnotherPage = false;
    let transactions = await this.wallet.getTransactions("*", this.transactionsToRequest, this.transactionsToRequest * this.transactionsPage);
    if(transactions === null){
      setTimeout(async ()=>{
        await this.loadTransactionsForProcessing();
      }, 1000)
    }

    transactions = this.orderTransactions(transactions);

    // load transactions into transactionsMap for processing
    for (let i = 0; i < transactions.length; i++) {
      time = transactions[i].time;
      if(time * 1000 > this.currentFrom || !this.transactionsIndexed){
        // console.log(transactions[i])
        shouldRequestAnotherPage = true;
        txId = transactions[i].txid;
        amount = transactions[i].amount;
        category = transactions[i].category;
        address = transactions[i].address;
        fee = transactions[i].fee === undefined ? 0 : transactions[i].fee;
        confirmations = transactions[i].confirmations;
        if(!this.transactionsMap[txId]){
            this.transactionsMap[txId] = [];
        }
        this.transactionsMap[txId].push({
          txId: txId,
          time: time,
          amount: amount,
          category: category,
          address: address,
          fee: fee,
          confirmations: confirmations,
          is_main: false
        });
      }else{
        shouldRequestAnotherPage = false;
      }
    }

    if(transactions.length === this.transactionsToRequest && shouldRequestAnotherPage){
      this.transactionsPage++;
      await this.loadTransactionsForProcessing();
    }
    else{
      await this.processTransactions();
    }
  }

  async processTransactions(){
    let entries = [];
    let rewards = [];
    let staked = [];
    let change = [];

    //process transactions
    for (const key of Object.keys(this.transactionsMap)) {

      let values = this.transactionsMap[key];
      let generatedFound = false;

      // check if current values array contains a staked transaction, if it does flag the rest of them as category staked
      restartLoop:
        while (true) {
          for(let i = 0; i <= values.length - 1; i++) {
            if ((values[i].category === 'generate' || values[i].category === 'immature') && generatedFound === false) {
              generatedFound = true
              continue restartLoop;
            }
            if(generatedFound) {
              if(values[i].category !== 'generate' && values[i].category !== 'immature') {
                values[i].category = "staked";
              } else {
                values[i].is_main = true;
                values[i].category = 'generate';
              }
              rewards.push({...values[i], txId: key})
            }
          }
          break;
        }

      // if the above condition doesnt fit calculate the lev
      if (!generatedFound){
        for(let i = 0; i <= values.length - 1; i++){

          entries.push({...values[i], txId: key});

          for(let j = 0; j < entries.length - 1; j++ ){
            let original = entries[j];
            let current = values[i];
            if(current.txId === original.txId) {
              console.log('txId match')

              // if original == send
              if(original.category === "receive" && current.category === "send" || original.category === "send" && current.category === "receive"){
                if(tools.similarity(original.amount.toString(), current.amount.toString()) > 0.6){
                  current.category = "change";
                  original.category = "change";
                  change.push({...current, txId: key});
                  change.push({...original, txId: key});
                  entries.splice(entries.indexOf(original), 1);
                  entries.splice(entries.indexOf(current), 1);
                } else {
                  // console.log('similarity too low')
                  // console.log(tools.similarity(original.amount.toString(), current.amount.toString()))
                }
              } else{
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
    for(let j = 0; j <= entries.length - 1; j++) {
      entries[j].is_main = true;
    }

    // console.log(entries);
    // console.log(rewards);
    // console.log(staked);
    this.transactionsMap = {};
    entries = entries.concat(rewards, staked, change);
    // console.log(entries.length)
    // console.log(JSON.stringify(entries))
    await this.insertIntoDb(entries)
  }

  goToEarningsPanel(){
    // this.store.dispatch({type: IS_FILTERING_TRANSACTIIONS, payload: true})
    this.store.dispatch({type: SELECTED_PANEL, payload: "transactions"});
    this.store.dispatch({type: TRANSACTIONS_TYPE, payload: "generate"});
    this.store.dispatch({type: SELECTED_SIDEBAR, payload: {parent: "walletSelected", child: "transactionsSelected"}});
  }

  async insertIntoDb(entries){

    let lastCheckedEarnings = this.store.getState().notifications.lastCheckedEarnings;
    let earningsCountNotif = 0;
    let earningsTotalNotif = 0;
    let shouldNotifyEarnings = this.store.getState().notifications.stakingNotificationsEnabled;

    for (let i = 0; i < entries.length; i++) {
      // console.log(lastCheckedEarnings)
      if(this.firstRun){
        this.store.dispatch({type: LOADING, payload:{isLoading: true, loadingMessage: `Indexing transaction ${i}/${entries.length}`}})
      }
      let entry = entries[i];

      entry.time = entry.time * 1000;
      if(Number(entry.confirmations) < 30){
        this.store.dispatch({type: PENDING_TRANSACTION, payload: entry.txId})

      }

      let isPending = false;

      if(entry.category === 'generate' || entry.category === 'staked'){
        isPending = Number(entry.confirmations) < 30;
      } else {
        isPending = Number(entry.confirmations) < 10;
      }
      await addTransaction(entry, isPending)

      //update with 1 new staking reward since previous ones have already been loaded on startup
      if(entry.category === "generate"){

        if(entry.time > lastCheckedEarnings && shouldNotifyEarnings){
          this.store.dispatch({type: STAKING_NOTIFICATION, payload: {earnings: entry.amount, date: entry.time}});
          earningsCountNotif++;
          earningsTotalNotif += entry.amount;
        }
      }
    }

    if(shouldNotifyEarnings && earningsCountNotif > 0){
      earningsTotalNotif = tools.formatNumber(earningsTotalNotif);
      let title = `Staking reward - ${earningsTotalNotif} ECC`;
      const body = earningsCountNotif === 1 ? title : `${earningsCountNotif} Staking rewards - ${earningsTotalNotif} ECC`;
      const callback = () => {this.goToEarningsPanel();}
      this.queueOrSendNotification(callback, body);
    }

    //no more transactions to process, mark as done to avoid spamming the daemon
    if(!this.transactionsIndexed){
      this.transactionsIndexed = true;
      this.store.dispatch({type: INDEXING_TRANSACTIONS, payload: false});
      let rewards = await getAllRewardTransactions();
      this.store.dispatch({type: STAKING_REWARD, payload: rewards})
    }

    this.transactionsPage = 0;
    this.currentFrom = this.from;
    this.isIndexingTransactions = false;
  }

  async processPendingTransactions(){
	  let pendingTransactions = await getAllPendingTransactions()
    for (const [index, pending] of pendingTransactions.entries()) {
	    console.log(pending)
      // handle the response
      let id = pending.transaction_id;
      let rawT = await this.getRawTransaction(id);
      await updatePendingTransaction(id, rawT.confirmations);
    }
  }

  removeTransactionFromMemory(transactionId, deleteFromTransactions){
    let pendingTransactions = this.store.getState().application.pendingTransactions;
    let index = pendingTransactions.indexOf(transactionId);

    if (index !== -1) {
        pendingTransactions.splice(index, 1);
    }
    if(deleteFromTransactions){
      let transactions = this.store.getState().application.stakingRewards;
      for(let i = 0; i < transactions.length; i++){
        if(transactions[i].transaction_id === transactionId){
          let index = transactions.indexOf(transactions[i]);
          transactions.splice(index, 1);
          this.store.dispatch({type: STAKING_REWARD, payload: transactions});
          this.store.dispatch({type: PENDING_TRANSACTION, payload: pendingTransactions});
          return;
        }
      }
    }
  }

  async loadTransactionFromDb(){
    return new Promise(async (resolve, reject) => {
      let lastCheckedEarnings = this.store.getState().notifications.lastCheckedEarnings;
      let earningsCountNotif = 0;
      let earningsTotalNotif = 0;
      let shouldNotifyEarnings = this.store.getState().notifications.stakingNotificationsEnabled;


      //map all income from transactions
      this.store.dispatch({type: RESET_STAKING_EARNINGS});
      let transactions = await getAllRewardTransactions();
      this.store.dispatch({type: STAKING_REWARD, payload: transactions})
      transactions.map((transaction) => {
        let time = transaction.time;
        let amount = transaction.amount;
        if(time > lastCheckedEarnings && shouldNotifyEarnings){

          this.store.dispatch({type: STAKING_NOTIFICATION, payload: {earnings: amount, date: time}});
          earningsCountNotif++;
          earningsTotalNotif += amount;
        }
      });

      //map all rewards from staking rewards
      let rewards = await getAllRewardTransactions();

      this.store.dispatch({type: STAKING_REWARD, payload: rewards});


      // map all pending transaction
      let pendingTransactions = await getAllPendingTransactions();

      let aux = [];
      pendingTransactions.map((val) => {
        aux.push(val.transaction_id)
      });
      this.store.dispatch({type: PENDING_TRANSACTION, payload: aux});

      // TODO: make this do some better error handling.
      resolve();
    });
  }

  //MISC METHODS

  async updateConfirmations(){
    getAllTransactions()
      .then(async (transactionData) => {
        const walletTransactions = await this.wallet.getTransactions("*", transactionData.length,0);
        await Promise.all(walletTransactions.map(async(transactions) => {
          try {
            const result = await updateTransactionsConfirmations(transactions.txid, transactions.confirmations);
            return result
          }catch (err){
             console.log(err)
          }
        }));
    }).catch(errors => {
      console.log(errors)
    });

  }

  queueOrSendNotification(callback, body){
    if(this.store.getState().startup.loading || this.store.getState().startup.loader || !this.store.getState().startup.setupDone){
      this.queuedNotifications.push({callback: callback, body: body})
    } else {
      Tools.sendOSNotification(body, callback);
    }
  }
  async getAddresses(allReceived, allAddresses){
    const normalAddresses = [].concat.apply([], allAddresses).map(group => {
      return {
        account: group.length > 2 ? group[2] : null,
        address: group[0],
        normalAddress: group[0],
        amount: tools.formatNumber(parseFloat(group[1])),
        ans: false,
      }
    });

    const allAddressesWithANS = await Promise.all(normalAddresses.map(async (address) => {
      let retval;
      const ansRecord = await this.wallet.getANSRecord(address.address);

      if (ansRecord && ansRecord.Name) {
        retval = {
          account: address.account,
          address: ansRecord.Name,
          normalAddress: address.address,
          amount: address.amount,
          code: ansRecord.Code,
          expiryTime: ansRecord.ExpireTime,
          ans: true
        }
      } else {
        retval = address;
      }
      return retval;
    }));

    const toAppend = allReceived
                      .filter(address => address.amount === 0)
                      .map(address => {
                        return {
                          account: address.account || null,
                          address: address.address,
                          normalAddress: address.address,
                          amount: 0,
                          ans: false,
                        }
                      });

    let toReturn = allAddressesWithANS.concat(toAppend);
    toReturn = Object.values(toReturn).sort(function(a,b){
      if(!b.ans || !a.ans){
        return b.ans - a.ans
      }
      else{
        return b.address < a.address
      }
    });

    // if(normalAddresses.length > this.currentAddresses.length) {
      for (const [index, address] of toReturn.entries()) {
        // handle the response
        const addressObj = await addAddress(address, address.ans, true);
        if(addressObj[1] !== null && addressObj[1] === true){
          this.queueOrSendNotification(()=>{}, `${this.translator.ansReady}.\n\n${this.translator.username}: ${addressObj[0].name}#${addressObj[0].code}`);
        }
      }

      const addresses = await getAllMyAddresses();
      this.store.dispatch({type: USER_ADDRESSES, payload: addresses});
    // }
    //We need to have the addresses loaded to be able to index transactions
    this.currentAddresses = normalAddresses;
    if(!this.transactionsIndexed && this.firstRun && this.currentAddresses.length > 0 && !this.isIndexingTransactions){
      await this.loadTransactionsForProcessing();
      this.store.dispatch({type: INDEXING_TRANSACTIONS, payload: true})
    }
  }

  getRawTransaction(transactionId){
    return new Promise((resolve, reject) => {
      this.wallet.getRawTransaction(transactionId).then((data) => {
        resolve(data);
      }).catch((err) => {
        reject(err)
      });
    });
  }
}

module.exports = DaemonConnector;
