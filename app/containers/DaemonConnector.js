import Wallet from '../utils/wallet';
import { ipcRenderer } from 'electron';
import {
  PAYMENT_CHAIN_SYNC, PARTIAL_INITIAL_SETUP, SETUP_DONE, INITIAL_SETUP, BLOCK_INDEX_PAYMENT, WALLET_INFO,
  CHAIN_INFO, TRANSACTIONS_DATA, USER_ADDRESSES, INDEXING_TRANSACTIONS, STAKING_REWARD, PENDING_TRANSACTION,
  DAEMON_CREDENTIALS, LOADING, ECC_POST, COIN_MARKET_CAP, UPDATE_AVAILABLE, UPDATING_APP, POSTS_PER_CONTAINER,
  NEWS_NOTIFICATION, STAKING_NOTIFICATION, UNENCRYPTED_WALLET, SELECTED_PANEL, SELECTED_SIDEBAR, SETTINGS,
  SETTINGS_OPTION_SELECTED, TELL_USER_OF_UPDATE, SELECTED_THEME, SET_DAEMON_VERSION, STAKING_REWARD_UPDATE,
  WALLET_INFO_SEC, IMPORT_WALLET_TEMPORARY, FILE_DOWNLOAD_STATUS, TOLD_USER_UPDATE_FAILED, RESET_STAKING_EARNINGS
} from '../actions/types';

const event = require('../utils/eventhandler');
const tools = require('../utils/tools');
const sqlite3 = require('sqlite3');
let remote = require('electron').remote;
const app = remote.app;
import transactionsInfo from '../utils/transactionsInfo';
import {addTransaction} from '../Managers/SQLManager'
import $ from 'jquery';
const FeedMe = require('feedme');
const https = require('https');
const Tools = require('../utils/tools');
const request = require('request');
import db from '../../app/utils/database/db'

//this class acts as a bridge between wallet.js (daemon) and the redux store
class DaemonConnector {

	constructor(store){
	  db.sequelize.sync()
		this.store = store;
		this.daemonAvailable = false;
    this.wallet = store.getState().application.wallet;
    this.setupDone = false;
    this.partialSetup = false;
    this.ListenToSetupEvents = this.listenToSetupEvents.bind(this);
    this.handlePartialSetup = this.handlePartialSetup.bind(this);
    this.handleInitialSetup = this.handleInitialSetup.bind(this);
    this.handleSetupDone = this.handleSetupDone.bind(this);
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
    this.setupTransactionsDB = this.setupTransactionsDB.bind(this);
    this.closeDb = this.closeDb.bind(this);
    this.processTransactions = this.processTransactions.bind(this);
    this.getRawTransaction = this.getRawTransaction.bind(this);
    this.insertIntoDb = this.insertIntoDb.bind(this);
    this.loadTransactionFromDb = this.loadTransactionFromDb.bind(this);
    this.checkIfTransactionsNeedToBeDeleted = this.checkIfTransactionsNeedToBeDeleted.bind(this);
    this.processPendingTransactions = this.processPendingTransactions.bind(this);
    this.removeTransactionFromDb = this.removeTransactionFromDb.bind(this);
    this.removeTransactionFromMemory = this.removeTransactionFromMemory.bind(this);
    this.goToEarningsPanel = this.goToEarningsPanel.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.subscribeToEvents();
    this.currentAddresses = [];
    this.processedAddresses = transactionsInfo.get('addresses').value();
    this.from = transactionsInfo.get('info').value().processedFrom;
    this.currentFrom = this.from;
    this.db = undefined;
    this.transactionsPage = 0;
    this.transactionsToRequest = 1000;
    this.transactionsIndexed = transactionsInfo.get('info').value().done;
    this.transactionsMap = {};
    this.runningMainCycle = false;
    this.setupTransactionsDB();
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

      if(this.queuedNotifications.length == 0){
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
    if(this.store.getState().startup.updatingApp){
      this.runningMainCycle = false;
      return;
    }
    if(!this.hasLoadedTransactionsFromDb)
      await this.loadTransactionFromDb();

    await this.wallet.getAllInfo().then( async (data) => {
      if(data){
        let highestBlock = data[0].headers == 0 || data[0].headers < this.heighestBlockFromServer ? this.heighestBlockFromServer : data[0].headers;

        // remove .00 if 100%
        let syncedPercentage = (data[0].blocks * 100) / data[0].headers;
        syncedPercentage = Math.floor(syncedPercentage * 100) / 100;

        data[0].headers = highestBlock;

        this.store.dispatch({type: SET_DAEMON_VERSION, payload: tools.formatVersion(data[0].version)});
        this.store.dispatch({type: WALLET_INFO, payload: data[0]});
        this.store.dispatch({type: CHAIN_INFO, payload: data[0]});
        this.store.dispatch({type: WALLET_INFO_SEC, payload: data[4]});
        this.store.dispatch ({type: PAYMENT_CHAIN_SYNC, payload: data[0].blocks == 0 || data[0].headers == 0 ? 0 : syncedPercentage});
        this.store.dispatch({type: TRANSACTIONS_DATA, payload: {data: data[1], type: this.store.getState().chains.transactionsType}});
        await this.getAddresses(data[2], data[3]);
      }
    });
    if(!this.firstRun && !this.isIndexingTransactions && this.transactionsIndexed){
      this.loadTransactionsForProcessing();
    }
    //RETHINK THIS -> needs to happen when user is 100% synced...
    //this.processPendingTransactions();

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
        this.store.dispatch({type: LOADING, payload:false})
        if(this.store.getState().startup.importWalletTemp){
          this.store.dispatch({type: IMPORT_WALLET_TEMPORARY, payload: {importWalletTemp: false, importWallet: true}})
        }
      }
    }
    if((this.store.getState().startup.daemonUpdate || this.store.getState().startup.guiUpdate) && !this.store.getState().startup.toldUserAboutUpdate && !this.store.getState().startup.loader){
      this.notifyUserOfApplicationUpdate();
    }

    setTimeout(() => {
      this.mainCycle();
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

    event.on('runMainCycle', () => {
      if(!this.runningMainCycle){
        this.firstRun = true;
        this.mainCycle();
      }
    });
  }



  handleDaemonUpdated(){
    this.store.dispatch({type: UPDATE_AVAILABLE, payload: {guiUpdate: false, daemonUpdate: false}})
    this.firstRun = true;
    this.checkStartupStatusInterval = setInterval(()=>{
      this.stateCheckerInitialStartup();
    }, 2000)
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

  stateCheckerInitialStartup(){
    this.wallet.getInfo().then((data) => {
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
        this.runningMainCycle = true;
        this.mainCycle();
      }
      clearInterval(this.checkStartupStatusInterval);
    })
    .catch((err) => {
      if (err.message == 'Loading block index...' || err.message == 'Activating best chain...' || err.message == "Loading wallet...") {
        if(!this.loadingBlockIndexPayment){
          this.loadingBlockIndexPayment = true;
          this.store.dispatch({type: BLOCK_INDEX_PAYMENT, payload: true})
        }
        if(!this.store.getState().startup.initialSetup){
          this.store.dispatch({type: LOADING, payload: true})
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
          let localHeight = self.store.getState().chains.headersPayment;
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

  getCoinMarketCapStats(){
    let options = {
      url: 'https://api.coinmarketcap.com/v1/ticker/eccoin/',
    };
    let self = this;
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        let json = JSON.parse(body);
        json = json[0];
        self.store.dispatch({type: COIN_MARKET_CAP, payload: {price: "$" + Tools.formatNumber(Number(json.price_usd)) + " USD", rank: "#" + json.rank, marketCap: "$" + Tools.formatNumber(Number(json.market_cap_usd))+ " USD", volume: "$" + Tools.formatNumber(Number(json["24h_volume_usd"])) + " USD"}})
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
    for(let i = 0; i < this.currentAddresses.length; i++){
      if(this.processedAddresses == undefined || !this.processedAddresses.includes(this.currentAddresses[i].address)){
        return true;
      }
    }
    return false;
  }

  //if addresses were added or removed, re-index transactions
  updateProcessedAddresses(){
    transactionsInfo.set('info', {done: false, processedFrom: 0, processedUpTo: 0}).write();
    transactionsInfo.set('addresses', []).write();

    for(let i = 0; i < this.currentAddresses.length; i++){
      let currentAddress = this.currentAddresses[i].address;
      transactionsInfo.get('addresses').push(currentAddress).write();
      this.processedAddresses.push(currentAddress)
    }
    this.store.dispatch({type: RESET_STAKING_EARNINGS});
    this.from = 0;
    this.transactionsIndexed = false;
    this.db = new sqlite3.Database(app.getPath('userData') + '/transactions');
    this.db.run("DELETE FROM TRANSACTIONS;");
    this.db.run("DELETE FROM PENDINGTRANSACTIONS;");
    this.closeDb()
  }

  setupTransactionsDB(){
    this.db = new sqlite3.Database(app.getPath('userData') + '/transactions');
    this.db.serialize(() => {
      this.db.run("CREATE TABLE IF NOT EXISTS transactions (transaction_id VAARCHAR(64), time INTEGER, amount DECIMAL(11,8), category, address, fee DECIMAL(2,8), confirmations INTEGER);");
      this.db.run("CREATE TABLE IF NOT EXISTS pendingTransactions (transaction_id VAARCHAR(64));");
    });

  }

  closeDb(){
    if(this.db && this.db.open)
      this.db.close();
  }

  openDb(){
    if(!this.db || !this.db.open)
      this.db = new sqlite3.Database(app.getPath('userData') + '/transactions');
  }

  orderTransactions(data) {
    const aux = [];
    for (let i = data.length - 1; i >= 0; i -= 1) {
      aux.push(data[i]);
    }
    return aux;
  }

  checkIfTransactionsNeedToBeDeleted(){
    if(this.needToReloadTransactions())
      this.updateProcessedAddresses();
  }

  async loadTransactionsForProcessing(){
    this.isIndexingTransactions = true;

    this.checkIfTransactionsNeedToBeDeleted();

    let txId = "";
    let time = 0;
    let amount = 0;
    let category = "";
    let address = "";
    let fee = 0;
    let shouldAdd = false;
    let confirmations = 0;
    let shouldRequestAnotherPage = false;
    let transactions = await this.wallet.getTransactions("*", this.transactionsToRequest, this.transactionsToRequest * this.transactionsPage);
    if(transactions == null){
      setTimeout(()=>{
        this.loadTransactionsForProcessing();
      }, 1000)
    }

    transactions = this.orderTransactions(transactions);

    if(transactions.length > 0 && this.transactionsPage == 0){
      this.from = transactions[0].time;
    }

    //console.log(transactions)
    // console.log(JSON.stringify(transactions))

    //load transactions into transactionsMap for processing
    for (let i = 0; i < transactions.length; i++) {
      time = transactions[i].time;
      if(time > this.currentFrom || !this.transactionsIndexed){
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
          confirmations: confirmations
        });
      }else{
        shouldRequestAnotherPage = false;
      }
    }

    if(transactions.length == this.transactionsToRequest && shouldRequestAnotherPage){
      this.transactionsPage++;
      this.loadTransactionsForProcessing();

    }
    else{
      this.processTransactions();
    }
  }

  similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  }

  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    let costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0)
          costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  processTransactions(){
    let entries = [];
    let rewards = [];
    let staked = [];
    let change = [];
    const self = this

    //process transactions
    for (const key of Object.keys(this.transactionsMap)) {

      let values = this.transactionsMap[key];
      let generatedFound = false;


      // check if current values array contains a staked transaction, if it does flag the rest of them as category staked
      restartLoop:
        while (true) {
          for(let i = 0; i <= values.length - 1; i++) {
            if (values[i].category === "generate" && generatedFound === false) {
              generatedFound = true
              continue restartLoop;
            }
            if(generatedFound) {
              if(values[i].category !== "generate") {
                values[i].category = "staked";
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
                if(this.similarity(original.amount.toString(), current.amount.toString()) > 0.6){
                  console.log('original ele')
                  console.log(original)
                  console.log('current Element')
                  console.log(current)
                  console.log('change transaction' + current.amount)

                  console.log('Sim value')
                  console.log(this.similarity(original.amount.toString(), current.amount.toString()))

                  current.category = "change";
                  original.category = "change";
                  change.push({...current, txId: key});
                  change.push({...original, txId: key});
                  entries.splice(entries.indexOf(original), 1);
                  entries.splice(entries.indexOf(current), 1);
                } else {
                  console.log('similarity too low')
                  console.log(this.similarity(original.amount.toString(), current.amount.toString()))
                }
              } else{
                console.log('Sim value')
                console.log(this.similarity(original.amount.toString(), current.amount.toString()))
                console.log('original ele')
                console.log(original)
                console.log('current Element')
                console.log(current)
                console.log('values dont line up')
              }
            }
          }

        }
      }
      generatedFound = false;
    }

    console.log(entries);
    console.log(rewards);
    console.log(staked);
    this.transactionsMap = {};
    entries = entries.concat(rewards, staked);
    console.log(entries.length)
    // console.log(JSON.stringify(entries))
    this.insertIntoDb(entries)
  }

  goToEarningsPanel(){
      this.store.dispatch({type: SELECTED_PANEL, payload: "transactions"});
      //TODO replace all by generate when transactions are sorted properly
      this.store.dispatch({type: TRANSACTIONS_DATA, payload: {data: this.store.getState().chains.transactionsData, type: "all"}});
      this.store.dispatch({type: SELECTED_SIDEBAR, payload: {parent: "walletSelected", child: "transactionsSelected"}})
  }

  async insertIntoDb(entries){
    this.openDb();
    let statement = "BEGIN TRANSACTION;";
    let lastCheckedEarnings = this.store.getState().notifications.lastCheckedEarnings;
    let earningsCountNotif = 0;
    let earningsTotalNotif = 0;
    let shouldNotifyEarnings = this.store.getState().notifications.stakingNotificationsEnabled;
    for (let i = 0; i < entries.length; i++) {
      let entry = entries[i];
      entry.time = entry.time * 1000;
      statement += `INSERT INTO transactions VALUES('${entry.txId}', ${entry.time}, ${entry.amount}, '${entry.category}', '${entry.address}', ${entry.fee}, '${entry.confirmations}');`;
      if(Number(entry.confirmations) < 30){
          statement += `INSERT INTO pendingtransactions VALUES('${entry.txId}');`;
          this.store.dispatch({type: PENDING_TRANSACTION, payload: entry.txId})
      }

      await addTransaction(entry, Number(entry.confirmations) < 30)
      //update with 1 new staking reward since previous ones have already been loaded on startup
      if(this.transactionsIndexed){
        this.store.dispatch({type: STAKING_REWARD, payload: entries[i]})
      }
      if(entry.time > lastCheckedEarnings && shouldNotifyEarnings){
        this.store.dispatch({type: STAKING_NOTIFICATION, payload: {earnings: entry.amount, date: entry.time}});
        earningsCountNotif++;
        earningsTotalNotif += entry.amount;
      }
    }

    if(shouldNotifyEarnings && earningsCountNotif > 0){
      earningsTotalNotif = tools.formatNumber(earningsTotalNotif);
      let title = `Staking reward - ${earningsTotalNotif} ECC`;
      const body = earningsCountNotif == 1 ? title : `${earningsCountNotif} Staking rewards - ${earningsTotalNotif} ECC`;
      const callback = () => {this.goToEarningsPanel();}
      this.queueOrSendNotification(callback, body);
    }

    statement += "COMMIT;";
    if(entries.length > 0){
      this.db.exec(statement, (err)=>{
        if(err)
          console.log(err);
        this.closeDb();
      });
    }
    else this.closeDb();

    //no more transactions to process, mark as done to avoid spamming the daemon
    if(!this.transactionsIndexed){
      this.transactionsIndexed = true;
      this.store.dispatch({type: INDEXING_TRANSACTIONS, payload: false});
      this.store.dispatch({type: STAKING_REWARD, payload: entries})
    }

    this.transactionsPage = 0;
    this.currentFrom = this.from;
    transactionsInfo.set('info', {done: this.transactionsIndexed, processedFrom: this.from}).write();
    this.isIndexingTransactions = false;
  }

  async processPendingTransactions(){
    let pendingTransactions = this.store.getState().application.pendingTransactions;
    for(let i = 0; i < pendingTransactions.length; i++){
      let id = pendingTransactions[i];
      let rawT = await this.getRawTransaction(id);
      rawT.confirmations = -1;
      if(rawT.confirmations >= 30 || rawT.confirmations == -1){
        let deleteFromTransactions = false;

        if(rawT.confirmations == -1)
          deleteFromTransactions = true;

        if(await this.removeTransactionFromDb(id, deleteFromTransactions)){
          this.removeTransactionFromMemory(id, deleteFromTransactions);
        }
      }
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
        if(transactions[i].transaction_id == transactionId){
          let index = transactions.indexOf(transactions[i]);
          transactions.splice(index, 1);
          this.store.dispatch({type: STAKING_REWARD, payload: transactions});
          this.store.dispatch({type: PENDING_TRANSACTION, payload: pendingTransactions});
          return;
        }
      }
    }
  }

  removeTransactionFromDb(transferId, deleteFromTransactions){
    return new Promise((resolve, reject) => {
      this.openDb();
      let sql = `DELETE FROM pendingtransactions where transaction_id = '${transferId}';`;
      if(deleteFromTransactions)
        sql+= `DELETE FROM transactions where transaction_id = '${transferId}';`;

      this.db.exec(sql, (err)=> {
        if(err){
          console.log("error deleting from transactions: ", err);
          reject(false);
          return;
        }
        this.closeDb();
        resolve(true);
      });
    });
  }

  loadTransactionFromDb(){
    return new Promise((resolve, reject) => {
      this.openDb();
      let sql = `SELECT * FROM transactions ORDER BY time DESC;`;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          console.log("ERROR GETTING TRANSACTIONS: ", err);
        }
        let lastCheckedEarnings = this.store.getState().notifications.lastCheckedEarnings;
        let earningsCountNotif = 0;
        let earningsTotalNotif = 0;
        let shouldNotifyEarnings = this.store.getState().notifications.stakingNotificationsEnabled;
        rows.map((transaction) => {
          let time = transaction.time;
          let amount = transaction.amount;
          if(time > lastCheckedEarnings && shouldNotifyEarnings){
            this.store.dispatch({type: STAKING_NOTIFICATION, payload: {earnings: amount, date: time}});
            earningsCountNotif++;
            earningsTotalNotif += amount;
          }

        });
        //this is an issue
        /*if(shouldNotifyEarnings && earningsCountNotif > 0){
          earningsTotalNotif = tools.formatNumber(earningsTotalNotif);
          let title = `Staking reward - ${earningsTotalNotif} ECC`;
          const body = earningsCountNotif == 1 ? title : `${earningsCountNotif} Staking rewards - ${earningsTotalNotif} ECC`;
          const callback = () => {this.goToEarningsPanel();}
          this.queueOrSendNotification(callback, body);
        }*/
        this.store.dispatch({type: STAKING_REWARD, payload: rows})
      });

      sql = `SELECT * FROM pendingTransactions;`;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          console.log("ERROR GETTING TRANSACTIONS: ", err);
        }
        let aux = [];
        rows.map((val) => {
          aux.push(val.transaction_id)
        });
        this.store.dispatch({type: PENDING_TRANSACTION, payload: aux});
        this.closeDb();
        this.hasLoadedTransactionsFromDb = true;
        resolve();
      });
    });
  }

  //MISC METHODS

  queueOrSendNotification(callback, body){
    if(this.store.getState().startup.loading || this.store.getState().startup.loader || !this.store.getState().startup.setupDone){
      this.queuedNotifications.push({callback: callback, body: body})
    }
    else
      Tools.sendOSNotification(body, callback);
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

    /*const allAddressesWithANS = await Promise.all(normalAddresses.map(async (address) => {
      let retval;
      const ansRecord = await this.wallet.getANSRecord(address.address);
      if (ansRecord.Name) {
        retval = {
          account: address.account,
          address: ansRecord.Name,
          normalAddress: address.address,
          amount: address.amount,
          ans: true,
        }
      } else {
        retval = address;
      }

      return retval;
    }));*/

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

    //const toReturn = allAddressesWithANS.concat(toAppend);
    const toReturn = normalAddresses.concat(toAppend);

    this.store.dispatch({type: USER_ADDRESSES, payload: toReturn});
    //We need to have the addresses loaded to be able to index transactions
    this.currentAddresses = toReturn;
    if(!this.transactionsIndexed && this.firstRun && this.currentAddresses.length > 0 && !this.isIndexingTransactions){
      this.loadTransactionsForProcessing();
      this.store.dispatch({type: INDEXING_TRANSACTIONS, payload: true})
    }
  }

 getRawTransaction(transactionId){
    return new Promise((resolve, reject) => {
      this.wallet.getRawTransaction(transactionId).then((data) => {
        resolve(data);
      }).catch((err) => {
        console.log("error getting getRawTransaction");
        resolve(null)
      });
    });
  }

   /*async processRawTransaction(transactionId, address){
    let self = this;
    return new Promise((resolve, reject) => {
      this.wallet.getRawTransaction(transactionId).then(async (data) => {
        let inputs = data.vin.length;
        if(inputs > 2){
          resolve(true);
          return;
        }
        for(let i = 0; i < data.vin.length; i++){
          let txId = data.vin[i].txid;
          let txRaw = await self.getRawTransaction(txId);
          let amount = 0;
          let addressVout = "";
          for(let j = 0; j < txRaw.vout.length; j++){
            let vout = txRaw.vout[j];
            if(vout.scriptPubKey != undefined && vout.scriptPubKey.addresses != undefined && vout.value > amount){
              amount = vout.value;
              addressVout = vout.scriptPubKey.addresses[0];
            }
          }
          if(addressVout == address){
            resolve(false);
            return;
          }
        }
        resolve(true);
      }).catch((err) => {
        reject(null);
      });
    });*/

  /*
    this.getChainInfo();
    this.getWalletInfo();
    this.getTransactions();
    this.setupTransactionsDB();
    this.getAddresses();
  }*/
  }

module.exports = DaemonConnector;
