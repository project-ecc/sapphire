





import {getAllAddresses, getAllTransactions, getLatestTransaction} from "../Managers/SQLManager";
import {
  IMPORT_WALLET_TEMPORARY, LOADING, PARTIAL_INITIAL_SETUP, TRANSACTIONS_DATA,
  UNENCRYPTED_WALLET
} from "../actions/types";

export async function mainCycle(){
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
