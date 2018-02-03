import Wallet from '../utils/wallet';
const wallet = new Wallet();
import { ipcRenderer } from 'electron';
import { PAYMENT_CHAIN_SYNC, PARTIAL_INITIAL_SETUP, SETUP_DONE, INITIAL_SETUP, BLOCK_INDEX_PAYMENT, BLOCK_INDEX_PAYMENT_PERCENTAGE, WALLET_INFO, TRANSACTIONS_DATA, USER_ADDRESSES } from '../actions/types';
const event = require('../utils/eventhandler');
const tools = require('../utils/tools')
const sqlite3 = require('sqlite3');
import transactionsInfo from '../utils/transactionsInfo';

//this class acts as a bridge between wallet.js (daemon) and the redux store
class DaemonConnector {

	constructor(store){
		this.store = store;
		this.daemonAvailable = false;
    this.wallet = new Wallet();
		setInterval(this.getWalletInfo.bind(this), 5000);
    this.setupDone = false;
    this.partialSetup = false;
    this.ListenToSetupEvents = this.listenToSetupEvents.bind(this);
    this.handlePartialSetup = this.handlePartialSetup.bind(this);
    this.handleInitialSetup = this.handleInitialSetup.bind(this);
    this.handleSetupDone = this.handleSetupDone.bind(this);
    this.ListenToSetupEvents();
    this.counter = 0;
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
    this.mainCicle = this.mainCicle.bind(this);
    this.subscribeToEvents = this.subscribeToEvents.bind(this);
    this.getTrasactionsToDB = this.getTrasactionsToDB.bind(this);
    this.needToReloadTransactions = this.needToReloadTransactions.bind(this);
    this.updateProcessedAddresses = this.updateProcessedAddresses.bind(this);
    this.setupTransactionsDB = this.setupTransactionsDB.bind(this);
    this.getTransactions();
    this.getAddresses();
    this.subscribeToEvents();
    this.currentAddresses = [];
    this.processedAddresses = transactionsInfo.get('addresses').value();
    this.verifiedAddresses = false;
    this.db = undefined;
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

  needToReloadTransactions(){
    this.currentAddresses = this.store.getState().application.userAddresses;
    for(var i = 0; i < this.currentAddresses.length; i++){
      if(this.processedAddresses == undefined || !this.processedAddresses.includes(this.currentAddresses[i].address)){
        return true;
      }
    }
    return false;
  }

  updateProcessedAddresses(){
    var flag = false;
    for(var i = 0; i < this.currentAddresses.length; i++){
      var currentAddress = this.currentAddresses[i].address;
      var aux = transactionsInfo.get('addresses').find(currentAddress).value();
      if(!aux){
        transactionsInfo.get('addresses').push(currentAddress).write();
        flag = true;
      }
    }
    if(flag){
      transactionsInfo.get('done').push(false ).write();
      transactionsInfo.get('processedUpTo').push("").write();
      transactionsInfo.get('processedFrom').push("").write();
    }
    this.verifiedAddresses = true;
  }

  setupTransactionsDB(){
    this.db = new sqlite3.Database('transactions');
    var self = this;
    this.db.serialize(function() {
      self.db.run("CREATE TABLE IF NOT EXISTS transactions (transaction_id VAARCHAR(64) PRIMARY KEY, date INTEGER, amount DECIMAL(11,8), category, address, fee DECIMAL(2,8));CREATE UNIQUE INDEX idx_transfer ON transactions (transaction_id);");
    });
  }

  async getTrasactionsToDB(){
    if(!this.verifiedAddresses || this.needToReloadTransactions())
      this.updateProcessedAddresses();

    if(this.db == undefined)
      this.setupTransactionsDB();
    else if(!this.db.open)
      this.db = new sqlite3.Database('transactions');
    
    var self = this;

    var from = transactionsInfo.get('processedFrom').value();
    var upTo = transactionsInfo.get('processedUpTo').value();

    var txId = "";
    var time = 0;
    var amount = 0;
    var category = "";
    var address = "";
    var fee = 0;

    var transactions = await this.wallet.getTransactions("*", 1000, 0);
    var statement = "BEGIN TRANSACTION;";
    for (var i = 0; i < transactions.length; i++) {
      txId = transactions[i].txid;
      time = transactions[i].time;
      amount = transactions[i].amount;
      category = transactions[i].category;
      address = transactions[i].address;
      fee = transactions[i].fee == undefined ? 0 : transactions[i].fee;

      if(category == "generate" && amount > 0){
        statement += `INSERT OR REPLACE INTO transactions VALUES('${txId}', ${time}, ${amount}, '${category}', '${address}', ${fee});`;
      }
      if(category == "receive"){
        var data = await self.processRawTransaction(txId);
      }
    }
    statement += "COMMIT;";
    this.db.exec(statement, (err)=>{
      if(err)
        console.log(err);
      console.log("here")
      self.db.close();
    });
  }

  processRawTransaction(transactionId){
    return new Promise((resolve, reject) => {
      this.wallet.getRawTransaction(transactionId).then((data) => {
        console.log(data);
        resolve(data);
      }).catch((err) => {
        reject(null);
      });
    });
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
  }

  handleInitialSetup(){
    this.store.dispatch({type: INITIAL_SETUP })
  }

  handlePartialSetup(){
    this.partialSetup = true;
  }

  handleSetupDone(){
    this.store.dispatch({type: SETUP_DONE, payload: true})
    this.unsubscribeFromSetupEvents();
  }

  mainCicle(){
    if(this.step == 1){
      this.getWalletInfo();
    }
    else if(this.step == 2)
      this.getTransactions();
    else if(this.step == 3)
      this.getAddresses();

    this.step++;
    if(this.step == 4)
      this.step == 1;

    setTimeout(() => {
      this.mainCycle();
    }, 5000);
  }

  getWalletInfo(){
    	var self = this;
		  this.wallet.getInfo().then((data) => {
        if(this.loadingBlockIndexPayment){
          this.loadingBlockIndexPayment = false;
          self.store.dispatch({type: BLOCK_INDEX_PAYMENT, payload: false})
        }
			self.store.dispatch({type: WALLET_INFO, payload: {balance: data.balance, staking: data.unlocked_until > 0, connections: data.connections, block: data.blocks, headers: data.headers, connections: data.connections}});
      self.store.dispatch ({type: PAYMENT_CHAIN_SYNC, payload: data.blocks == 0 || data.headers == 0 ? 0 : ((data.blocks * 100) / data.headers).toFixed(2)})
      if(this.partialSetup){
        this.store.dispatch({type: PARTIAL_INITIAL_SETUP })
        this.partialSetup = false;
      }
		})
		.catch((err) => {
	        if (err.message == 'Loading block index...' || err.message == 'Activating best chain...') {BLOCK_INDEX_PAYMENT
            if(!self.loadingBlockIndexPayment){
              self.loadingBlockIndexPayment = true;
              self.store.dispatch({type: BLOCK_INDEX_PAYMENT, payload: true})
            }
            self.counter++;
	          self.store.dispatch({type: BLOCK_INDEX_PAYMENT_PERCENTAGE, payload: self.counter})
	        }
	        console.log(err.code + " : " + err.message)
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

  async getAddresses(){
    var self = this
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
    this.getTrasactionsToDB();
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
}

module.exports = DaemonConnector;