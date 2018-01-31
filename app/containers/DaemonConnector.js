import Wallet from '../utils/wallet';
const wallet = new Wallet();
import { ipcRenderer } from 'electron';
import { PAYMENT_CHAIN_SYNC, PARTIAL_INITIAL_SETUP, SETUP_DONE, INITIAL_SETUP, BLOCK_INDEX_PAYMENT, BLOCK_INDEX_PAYMENT_PERCENTAGE, WALLET_INFO, TRANSACTIONS_DATA, USER_ADDRESSES } from '../actions/types';
const event = require('../utils/eventhandler');

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
    this.formatNumber = this.formatNumber.bind(this);
    this.mainCicle = this.mainCicle.bind(this);
    this.subscribeToEvents = this.subscribeToEvents.bind(this);
    this.getTransactions();
    this.getAddresses();
    this.subscribeToEvents();
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

 formatNumber(number) {
    return number.toFixed(2).replace(/./g, function(c, i, a) {
        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    });
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
			self.store.dispatch({type: WALLET_INFO, payload: {balance: this.formatNumber(data.balance), staking: data.unlocked_until > 0, connections: data.connections, block: data.blocks, headers: data.headers, connections: data.connections}});
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
          amount: this.formatNumber(amounts[counter]),
          ans: false
        })
        counter++;
      }
    }
    this.store.dispatch({type: USER_ADDRESSES, payload: toReturn})
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