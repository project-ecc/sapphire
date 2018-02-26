import Wallet from '../utils/wallet';
import { ipcRenderer } from 'electron';
import { PAYMENT_CHAIN_SYNC, PARTIAL_INITIAL_SETUP, SETUP_DONE, INITIAL_SETUP, BLOCK_INDEX_PAYMENT, WALLET_INFO, CHAIN_INFO, TRANSACTIONS_DATA, USER_ADDRESSES, INDEXING_TRANSACTIONS, STAKING_REWARD, PENDING_TRANSACTION, DAEMON_CREDENTIALS, LOADING, ECC_POST, COIN_MARKET_CAP, UPDATE_AVAILABLE, UPDATING_APP, POSTS_PER_CONTAINER, NEWS_NOTIFICATION, STAKING_NOTIFICATION } from '../actions/types';
const event = require('../utils/eventhandler');
const tools = require('../utils/tools')
const sqlite3 = require('sqlite3');
let remote = require('electron').remote
const app = remote.app
import transactionsInfo from '../utils/transactionsInfo';
import notificationsInfo from '../utils/notificationsInfo';
import $ from 'jquery';
const FeedMe = require('feedme');
const https = require('https');
const Tools = require('../utils/tools')
const request = require('request')

//this class acts as a bridge between wallet.js (daemon) and the redux store
class DaemonConnector {

	constructor(store){
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
    this.getTransactions = this.getTransactions.bind(this);
    this.getAddresses = this.getAddresses.bind(this);
    this.getAccounts = this.getAccounts.bind(this);
    this.getAddressesOfAccounts = this.getAddressesOfAccounts.bind(this);
    this.getAddress = this.getAddress.bind(this);
    this.getReceivedByAddress = this.getReceivedByAddress.bind(this);
    this.getAddressesAmounts = this.getAddressesAmounts.bind(this);
    this.mainCycle = this.mainCycle.bind(this);
    this.subscribeToEvents = this.subscribeToEvents.bind(this);
    this.loadTransactionsForProcessing = this.loadTransactionsForProcessing.bind(this);
    this.needToReloadTransactions = this.needToReloadTransactions.bind(this);
    this.updateProcessedAddresses = this.updateProcessedAddresses.bind(this);
    this.setupTransactionsDB = this.setupTransactionsDB.bind(this);
    this.closeDb = this.closeDb.bind(this);
    this.processTransactions = this.processTransactions.bind(this);
    this.getWalletInfo = this.getWalletInfo.bind(this);
    this.getChainInfo = this.getChainInfo.bind(this);
    this.getRawTransaction = this.getRawTransaction.bind(this);
    this.insertIntoDb = this.insertIntoDb.bind(this);
    this.loadTransactionFromDb = this.loadTransactionFromDb.bind(this);
    this.checkIfTransactionsNeedToBeDeleted = this.checkIfTransactionsNeedToBeDeleted.bind(this);
    this.processPendingTransactions = this.processPendingTransactions.bind(this);
    this.removeTransactionFromDb = this.removeTransactionFromDb.bind(this);
    this.removeTransactionFromMemory = this.removeTransactionFromMemory.bind(this);
    //this.createWallet = this.createWallet.bind(this);
    this.subscribeToEvents();
    this.currentAddresses = [];
    this.processedAddresses = transactionsInfo.get('addresses').value();
    this.from = transactionsInfo.get('info').value().processedFrom;
    this.db = undefined;
    this.transactionsPage = 0;
    this.transactionsToRequest = 1000;
    this.transactionsIndexed = transactionsInfo.get('info').value().done;
    this.transactionsMap = {};
    this.runningMainCycle = false;
    this.setupTransactionsDB();
    this.firstRun = true;
    this.isIndexingTransactions = false;
    this.checkStartupStatusInterval = setInterval(()=>{
      this.stateCheckerInitialStartup();
    }, 2000)
    this.getECCPosts = this.getECCPosts.bind(this);
    this.getECCPosts();
    var self = this;
    setInterval(() => {
      self.getECCPosts();
    }, 60000)
    this.getCoinMarketCapStats = this.getCoinMarketCapStats.bind(this);
    this.getCoinMarketCapStats();
    var self = this;
    setInterval(() => {
      self.getCoinMarketCapStats();
    }, 120000)
	}

  subscribeToEvents(){
    var self = this;
    event.on('newAddress', self.getAddresses);
  }

  //this method is used to detect the initial setup has been completed and is never called again after, I should probably use the event class here.
  handleStoreChange() {
    const setupDone = this.store.getState().startup.setupDone;
    if(setupDone){
      console.log("SETUP IS DONE!!");
      this.unsubscribe();
      this.unsubscribeFromSetupEvents();
    }
  }

  mainCycle(){
    if(process.env.NODE_ENV === 'development' && (this.store.getState().startup.loading || this.store.getState().startup.loader)){
      this.store.dispatch({type: LOADING, payload:false})
    }
    if(this.store.getState().startup.updatingApp){
      var self = this;
      setTimeout(() => {
        self.mainCycle();
      }, self.firstRun && self.transactionsIndexed ? 1000 : 3000);
      return;
    }
    if(this.step == 1){
      this.getChainInfo();
    }
    else if(this.step == 2){
      this.getWalletInfo();
    }
    else if(this.step == 3){
      this.getTransactions();
    }
    else if(this.step == 4){
      this.getAddresses();
    }
    else if(this.step == 5 && !this.isIndexingTransactions && this.transactionsIndexed){
      this.loadTransactionsForProcessing();
    }
    else if(this.step == 6 && this.store.getState().application.pendingTransactions.length > 0){
      this.processPendingTransactions();
    }

    this.step++;
    if(this.step >= 7 && this.transactionsIndexed){
      this.step = 1;
      if(this.partialSetup){
        this.store.dispatch({type: PARTIAL_INITIAL_SETUP })
        this.partialSetup = false;
      }
      if(this.firstRun){
        this.firstRun=false;
        this.store.dispatch({type: LOADING, payload:false})
      }
    }
    var self = this;
    setTimeout(() => {
      self.mainCycle();
    }, self.firstRun && self.transactionsIndexed ? 1000 : 3000);
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
    ipcRenderer.on('guiUpdate', this.handleGuiUpdate.bind(this));
  }

  handleDaemonUpdated(){
    this.checkStartupStatusInterval = setInterval(()=>{
      this.stateCheckerInitialStartup();
    }, 2000)
  }

  handleGuiUpdate(){
    console.log("daemon connector got gui update message, updating state")
    this.store.dispatch({type: UPDATE_AVAILABLE, payload: {guiUpdate: true, daemonUpdate: this.store.getState().startup.daemonUpdate} })
  }

  handleDaemonUpdate(){
    console.log("daemon connector got daemon update message, updating state")
    this.store.dispatch({type: UPDATE_AVAILABLE, payload: {guiUpdate: this.store.getState().startup.guiUpdate, daemonUpdate: true} })
  }

  handleInitialSetup(event, args){
    this.store.dispatch({type: INITIAL_SETUP })
    //this.createWallet(args);
  }

  handlePartialSetup(event, args){
    //this.createWallet(args);
    this.partialSetup = true;
    this.getChainInfo();
  }

  handleSetupDone(event, args){
    //this.createWallet(args);
    this.store.dispatch({type: SETUP_DONE, payload: true})
    this.unsubscribeFromSetupEvents();
  }

  getWalletInfo(){
    this.wallet.command([{method: "getwalletinfo"}]).then((data) => {
      if(data.length > 0)
        this.store.dispatch({type: WALLET_INFO, payload: {balance: data[0].balance, unconfirmedBalance: data[0].unconfirmed_balance}});
    })
    .catch((err) => {
        console.log(err.code + " : " + err.message)
    });
  }

  stateCheckerInitialStartup(){
    var self = this;
    this.wallet.getInfo().then((data) => {
      if(self.loadingBlockIndexPayment){
        self.loadingBlockIndexPayment = false;
        self.store.dispatch({type: BLOCK_INDEX_PAYMENT, payload: false})
      }
      console.log("UPDATING APP: ", self.store.getState().startup.updatingApp)
      if(self.store.getState().startup.updatingApp){
        self.store.dispatch({type: UPDATING_APP, payload: false})
      }
      if(!self.runningMainCycle){
        self.runningMainCycle = true;
        self.mainCycle();
      }
      clearInterval(self.checkStartupStatusInterval);
    })
    .catch((err) => {
      if (err.message == 'Loading block index...' || err.message == 'Activating best chain...' || err.message == "Loading wallet...") {
        if(!self.loadingBlockIndexPayment){
          self.loadingBlockIndexPayment = true;
          self.store.dispatch({type: BLOCK_INDEX_PAYMENT, payload: true})
        }
        if(!self.store.getState().startup.initialSetup){
          self.store.dispatch({type: LOADING, payload: true})
        }
      }
    }); 
  }

  getChainInfo(){
  	var self = this;
	  this.wallet.getInfo().then((data) => {
      if(self.loadingBlockIndexPayment){
        self.loadingBlockIndexPayment = false;
        self.store.dispatch({type: BLOCK_INDEX_PAYMENT, payload: false})
      }
			self.store.dispatch({type: CHAIN_INFO, payload: data});
      self.store.dispatch ({type: PAYMENT_CHAIN_SYNC, payload: data.blocks == 0 || data.headers == 0 ? 0 : ((data.blocks * 100) / data.headers).toFixed(2)})
		})
	}

  getECCPosts(){
    var posts = this.store.getState().application.eccPosts;
    var lastCheckedNews = this.store.getState().notifications.lastCheckedNews;
    var self = this;
    https.get('https://medium.com/feed/@project_ecc', (res) => {
      if (res.statusCode != 200) {
        console.error(new Error(`status code ${res.statusCode}`));
        return;
      }
      const today = new Date();
      var parser = new FeedMe();
      parser.on('item', (item) => {
        let url = item.guid.text;
        let hasVideo = item["content:encoded"].indexOf('iframe');
        let text = $(item["content:encoded"]).text();
        let index = text.indexOf("Team");
        if(index == 18){
         text = text.slice(index + 4);
        }
        let date = item["pubdate"];
        let iTime = new Date(date);
        let time = Tools.calculateTimeSince(self.store.getState().startup.lang, today, iTime);
        //push post (fetch existing posts)
        var post = undefined;
        if(posts.length == 0 || posts[posts.length-1].date > iTime.getTime()){
          post = {
            title: item.title,
            timeSince: time,
            hasVideo: hasVideo != -1 ? true : false,
            url: url,
            body: text,
            date: iTime.getTime()
          }
          posts.push(post);
          self.store.dispatch({type: ECC_POST, payload: posts})
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
          }
          posts.unshift(post);
          self.store.dispatch({type: ECC_POST, payload: posts})
          //update render
          self.store.dispatch({type: POSTS_PER_CONTAINER, payload: this.store.getState().application.postsPerContainerEccNews})

        }
        if(post && post.date > lastCheckedNews){
          self.store.dispatch({type: NEWS_NOTIFICATION, payload: post.date})
        }
      });
      res.pipe(parser);
    });
  }

  getCoinMarketCapStats(){
    var options = {
      url: 'https://api.coinmarketcap.com/v1/ticker/eccoin/',
    }
    var self = this;
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
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
    for(var i = 0; i < this.currentAddresses.length; i++){
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

    for(var i = 0; i < this.currentAddresses.length; i++){
      var currentAddress = this.currentAddresses[i].address;
      transactionsInfo.get('addresses').push(currentAddress).write();
      this.processedAddresses.push(currentAddress)
    }
      
    this.transactionsIndexed = false;
    this.db = new sqlite3.Database(app.getPath('userData') + '/transactions');
    this.db.run("DELETE FROM TRANSACTIONS;");
    this.db.run("DELETE FROM PENDINGTRANSACTIONS;");
    this.closeDb()
  }

  setupTransactionsDB(){
    this.db = new sqlite3.Database(app.getPath('userData') + '/transactions');
    var self = this;
    this.db.serialize(function() {
      self.db.run("CREATE TABLE IF NOT EXISTS transactions (transaction_id VAARCHAR(64) PRIMARY KEY, time INTEGER, amount DECIMAL(11,8), category, address, fee DECIMAL(2,8), confirmations INTEGER);");
      self.db.run("CREATE TABLE IF NOT EXISTS pendingTransactions (transaction_id VAARCHAR(64));");
    });
    
  }

  closeDb(){
    if(this.db.open)
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

    let self = this;
    let txId = "";
    let time = 0;
    let amount = 0;
    let category = "";
    let address = "";
    let fee = 0;
    let shouldAdd = false;
    let confirmations = 0;
    let transactions = await this.wallet.getTransactions("*", this.transactionsToRequest, this.transactionsToRequest * this.transactionsPage);
    if(transactions == null){
      let self = this;
      setTimeout(()=>{
        self.loadTransactionsForProcessing();
      }, 1000)
    }

    transactions = this.orderTransactions(transactions);

    if(transactions.length > 0 && this.transactionsPage == 0){
      this.from = transactions[0].time;
    }

    //load transactions into transactionsMap for processing
    for (var i = 0; i < transactions.length; i++) {
      time = transactions[i].time;

      if(time > this.from || !this.transactionsIndexed){
        console.log(time)
        txId = transactions[i].txid;
        amount = transactions[i].amount;
        category = transactions[i].category;
        address = transactions[i].address;
        fee = transactions[i].fee == undefined ? 0 : transactions[i].fee;
        confirmations = transactions[i].confirmations;
        if(this.transactionsMap[txId] == undefined){
            this.transactionsMap[txId] = [];
            this.transactionsMap[txId].push(address)
        }
        this.transactionsMap[txId].push({
          time: time,
          amount: amount,
          category: category,
          address: address,
          fee: fee,
          confirmations: confirmations
        }); 
      }
    }
    
    if(transactions.length == this.transactionsToRequest){
      this.transactionsPage++;
      this.loadTransactionsForProcessing(); 
      return;
    }
    else
      this.processTransactions();
  }

  processTransactions(){
    var entries = [];
    /*var auxCurrentAddresses = [];
    var currentAddresses = this.store.getState().application.userAddresses;
    for(var i = 0; i < currentAddresses.length; i++)
      auxCurrentAddresses.push(currentAddresses[i].address)*/

    //process transactions
    for (const key of Object.keys(this.transactionsMap)) {
      var values = this.transactionsMap[key];
      for(var i = 1; i < values.length; i++){
        if(values[i].category == "generate" && values[i].amount > 0){
          entries.push({...values[i], txId: key})
          break;
        }
      }
      //the opposite means its staking transactions
      //if(!(values.length == 3 && values[1].category == "send" && values[2].category == "send")){

        //earned from staking
        //if(values.length == 4 && values[3].category == "generate" && values[3].amount > 0){
          //entries.push({...values[3], txId: key})
        //}
        //received transactions
        /*else if(values.length == 2 && values[1].category == "receive"){
            entries.push({...values[1], txId: key})
        }
        //same wallet transaction
        else if(values.length == 5){
          entries.push({...values[2], txId: key})
          entries.push({...values[4], txId: key})
        }
        //sent transactions
        else if(values.length == 3 || values.length == 4){
          console.log(values.length)
          for(var i = 1; i < values.length; i++){
            console.log(values[i].amount)
            console.log(values[i].address)
            console.log(values[i].category)
          }
          let address = this.transactionsMap[key][0];
          var netAmount = 0;
          for(var i = 1; i < values.length; i++){
            netAmount += values[i].amount;
          }
          if(netAmount < 0){
            for(var i = 1; i < values.length; i++){
              if(!auxCurrentAddresses.includes(values[i].address) && values[i].category == "send"){
                entries.push({...values[i], txId: key})
              }
              }
            }
          }
        }*/
      }
      this.transactionsMap = {};
    this.insertIntoDb(entries)
  }

  insertIntoDb(entries){
    this.openDb();
    var self = this;
    var statement = "BEGIN TRANSACTION;";
    var lastCheckedEarnings = this.store.getState().notifications.lastCheckedEarnings;
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      statement += `INSERT INTO transactions VALUES('${entry.txId}', ${entry.time}, ${entry.amount}, '${entry.category}', '${entry.address}', ${entry.fee}, '${entry.confirmations}');`;
      if(Number(entry.confirmations) < 30){
          statement += `INSERT INTO pendingtransactions VALUES('${entry.txId}');`;
          self.store.dispatch({type: PENDING_TRANSACTION, payload: entry.txId})
      }
      //update with 1 new staking reward since previous ones have already been loaded on startup
      if(this.transactionsIndexed){
        this.store.dispatch({type: STAKING_REWARD, payload: entries[i]})
      }
      if(entry.time > lastCheckedEarnings){
        self.store.dispatch({type: STAKING_NOTIFICATION, payload: {earnings: entry.amount, date: entry.time}})
      }
    }

    statement += "COMMIT;";
    if(entries.length > 0){
      this.db.exec(statement, (err)=>{
        if(err)
          console.log(err);
        self.closeDb();
      });
    }
    else this.closeDb();

    //no more transactions to process, mark as done to avoid spamming the daemon
    if(!this.transactionsIndexed){    
      this.transactionsIndexed = true;
      this.store.dispatch({type: INDEXING_TRANSACTIONS, payload: false})
      this.store.dispatch({type: STAKING_REWARD, payload: entries})
    }

    this.transactionsPage = 0;
    transactionsInfo.set('info', {done: this.transactionsIndexed, processedFrom: this.from}).write();
    this.isIndexingTransactions = false;
  }

  async processPendingTransactions(){
    var pendingTransactions = this.store.getState().application.pendingTransactions;
    var self = this;
    for(var i = 0; i < pendingTransactions.length; i++){
      var id = pendingTransactions[i];
      var rawT = await this.getRawTransaction(id);
      rawT.confirmations = -1;
      if(rawT.confirmations >= 30 || rawT.confirmations == -1){
        var deleteFromTransactions = false;

        if(rawT.confirmations == -1)
          deleteFromTransactions = true;

        if(await this.removeTransactionFromDb(id, deleteFromTransactions)){
          self.removeTransactionFromMemory(id, deleteFromTransactions);
        }
      }
    }
  }

  removeTransactionFromMemory(transactionId, deleteFromTransactions){
    var pendingTransactions = this.store.getState().application.pendingTransactions;
    var index = pendingTransactions.indexOf(transactionId);
    
    if (index !== -1) {
        pendingTransactions.splice(index, 1);
    }
    if(deleteFromTransactions){
      var transactions = this.store.getState().application.stakingRewards;
      for(var i = 0; i < transactions.length; i++){
        if(transactions[i].transaction_id == transactionId){
          var index = transactions.indexOf(transactions[i]);
          transactions.splice(index, 1);
          this.store.dispatch({type: STAKING_REWARD, payload: transactions})
          this.store.dispatch({type: PENDING_TRANSACTION, payload: pendingTransactions})
          return;
        }
      }
    }
  }

  removeTransactionFromDb(transferId, deleteFromTransactions){
    return new Promise((resolve, reject) => {
      this.openDb();
      var self = this;
      var sql = `DELETE FROM pendingtransactions where transaction_id = '${transferId}';`
      if(deleteFromTransactions)
        sql+= `DELETE FROM transactions where transaction_id = '${transferId}';`

      this.db.exec(sql, (err)=>{
        if(err){
          console.log("error deleting from transactions: ", err);
          reject(false);
          return;
        }
        self.closeDb();
        resolve(true);
      });
    });
  }

  loadTransactionFromDb(){
    this.openDb();

    var sql = `SELECT * FROM transactions ORDER BY time DESC;`;
    var self = this;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        console.log("ERROR GETTING TRANSACTIONS: ", err);
      }
      var lastCheckedEarnings = self.store.getState().notifications.lastCheckedEarnings;
      console.log(lastCheckedEarnings)
      rows.map((transaction) => {
        var time = transaction.time*1000;
        var amount = transaction.amount;
        console.log(time)
        if(time > lastCheckedEarnings){ 
          self.store.dispatch({type: STAKING_NOTIFICATION, payload: {earnings: amount, date: time}}) 
        }

      })
      self.store.dispatch({type: STAKING_REWARD, payload: rows})
    });

    sql = `SELECT * FROM pendingTransactions;`;
    var self = this;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        console.log("ERROR GETTING TRANSACTIONS: ", err);
      }
      var aux = [];
      rows.map((val) => {
        aux.push(val.transaction_id)
      })
      self.store.dispatch({type: PENDING_TRANSACTION, payload: aux})
      self.closeDb();
    });

  }

  //MISC METHODS

  async getAddresses(){
    var accounts = await this.getAccounts();
    var addresses = await this.getAddressesOfAccounts(accounts);
    var amounts = await this.getAddressesAmounts(addresses);
    var toReturn = [];
    var counter = 0;
    var keys = Object.keys(accounts);
    for(var i = 0; i < keys.length; i++){
      for(var j = 0; j < addresses[i].length; j++){
        toReturn.push({
          account: keys[i],
          address: addresses[i][j],
          amount: tools.formatNumber(amounts[counter]),
          ans: false
        })
        counter++;
      }
    }
    this.store.dispatch({type: USER_ADDRESSES, payload: toReturn})
    //We need to have the addresses loaded to be able to index transactions
    this.currentAddresses = toReturn;
    if(!this.transactionsIndexed && this.firstRun && this.currentAddresses.length > 0 && !this.isIndexingTransactions){
      this.loadTransactionsForProcessing();
      this.store.dispatch({type: INDEXING_TRANSACTIONS, payload: true})
    }
    else if(this.firstRun){
      this.loadTransactionFromDb();
    }
  }

  getAccounts(){
    return new Promise((resolve, reject) => {
      this.wallet.listAccounts().then((data) => {
          resolve(data);
      }).catch((err) => {
          reject(null);
      });
    });
  }

  getAddressesOfAccounts(accounts){
    return new Promise((resolve, reject) => {
      var promises = [];
      var keys = Object.keys(accounts);
      for(var i = 0; i < keys.length; i++){
        var promise = this.getAddress(keys[i]);
        promises.push(promise);
      }

      Promise.all(promises).then((data) => {
        resolve(data);
      }).catch((err) => {
        console.log("error waiting for all promises: ", err)
        reject(null);
      })
    });
  }

  getAddressesAmounts(addresses){
    return new Promise((resolve, reject) => {
      var promises = [];
      for(var i = 0; i < addresses.length; i++){
        for(var j = 0; j < addresses[i].length; j++){
          var promise = this.getReceivedByAddress(addresses[i][j]);
          promises.push(promise);
        }
      }

      Promise.all(promises).then((data) => {
        resolve(data);
      }).catch((err) => {
        console.log("error waiting for all promises: ", err)
        reject(null);
      })
    });
  }

  getReceivedByAddress(address){
    return new Promise((resolve, reject) => {
      this.wallet.getReceivedByAddress(address).then((amount) => {
           resolve(amount);
      }).catch((err) => {
          console.log("error getting address of account ", err)
          reject(null);
      });
    });
  }

  getAddress(account){
    return new Promise((resolve, reject) => {
      this.wallet.getAddressesByAccount(account).then((address) => {
           resolve(address);
      }).catch((err) => {
          console.log("error getting address of account ", err)
          reject(null);
      });
    });
  }

  getTransactions(){
    if(this.store.getState().chains.transactionsPage > 0) return;
    var self = this;
    this.wallet.getTransactions(null, 100, 0).then((data) => {
        self.store.dispatch({type: TRANSACTIONS_DATA, payload: {data: data, type: "all"}});
    }).catch((err) => {
        console.log("error getting transactions: ", err)
    });
  }

 getRawTransaction(transactionId){
    return new Promise((resolve, reject) => {
      this.wallet.getRawTransaction(transactionId).then((data) => {
        resolve(data);
      }).catch((err) => {
        console.log("error getting getRawTransaction")
        resolve(null)
      });
    });
  }

   /*async processRawTransaction(transactionId, address){
    var self = this;
    return new Promise((resolve, reject) => {
      this.wallet.getRawTransaction(transactionId).then(async (data) => {
        var inputs = data.vin.length;
        if(inputs > 2){
          resolve(true);
          return;
        }
        for(var i = 0; i < data.vin.length; i++){
          var txId = data.vin[i].txid;
          var txRaw = await self.getRawTransaction(txId);
          var amount = 0;
          var addressVout = "";
          for(var j = 0; j < txRaw.vout.length; j++){
            var vout = txRaw.vout[j];
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

      /*createWallet(args){
    this.store.dispatch({type: DAEMON_CREDENTIALS, payload: args })
    this.wallet = this.store.getState().application.wallet;

    this.getChainInfo();
    this.getWalletInfo();
    this.getTransactions();
    this.setupTransactionsDB();
    this.getAddresses();
  }*/
  }

module.exports = DaemonConnector;