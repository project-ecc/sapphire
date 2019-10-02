import {
  BLOCK_INDEX_PAYMENT, BLOCKS_AND_HEADERS,
  CHAIN_INFO, INITIAL_BLOCK_DOWNLOAD,
  PAYMENT_CHAIN_SYNC,
  SET_DAEMON_VERSION,
  SET_TEMPORARY_BALANCE, SIZE_ON_DISK,
  STAKING,
  TRANSACTIONS_DATA,
  TRANSACTIONS_TYPE,
  WALLET_INFO,
  WALLET_INFO_SEC,
  MINING_INFO
} from '../actions/types';


const INITIAL_STATE = {paymentChainSync: 0, loadingBlockIndexPayment: false, blockPayment: 0, headersPayment:0, connectionsPayment: 0, isStaking: false, stakingConfig: false, staking: 0, balance: 0, transactionsData: [], connections: 0, transactionsType: "all", unconfirmedBalance: 0, daemonVersion: '', newMint: 0, immatureBalance: 0, initialDownload: false, sizeOnDisk: 0, unlockedUntil:0 };

export default(state = INITIAL_STATE, action) => {
   if(action.type == BLOCK_INDEX_PAYMENT){
		return {...state, loadingBlockIndexPayment: action.payload}
	}
	else if(action.type == PAYMENT_CHAIN_SYNC){
		let x = action.payload;
		if(action.payload > 100)
			x = 100;
		return {...state, paymentChainSync: x}
	}
	else if(action.type == STAKING){
		return {...state, isStaking: action.payload}
	}
	else if(action.type == CHAIN_INFO){
		return {...state, staking: action.payload.staking, connections: action.payload.connections, blockPayment: action.payload.blocks, headersPayment: action.payload.headers, connectionsPayment: action.payload.connections, unlockedUntil: action.payload.unlocked_until}
	}
	else if(action.type == MINING_INFO){
	  return {...state, isStaking: action.payload.generatepos}
   }
	else if(action.type == SIZE_ON_DISK) {
	  return {...state, sizeOnDisk: action.payload}
	}
	else if(action.type == INITIAL_BLOCK_DOWNLOAD) {
    return {...state, initialDownload: action.payload}
  }
  else if(action.type == BLOCKS_AND_HEADERS){
    return {...state, blockPayment: action.payload.blocks, headersPayment: action.payload.headers}
  }
	else if(action.type == WALLET_INFO){
		return {...state, balance: action.payload.balance, newMint: action.payload.newmint, staking: action.payload.staking}
	}
	else if(action.type == WALLET_INFO_SEC){
		return {...state, unconfirmedBalance: action.payload.unconfirmedBalance, immatureBalance: action.payload.immatureBalance}
	}
	else if(action.type == TRANSACTIONS_DATA){
		var data = action.payload.data;
		return {...state, transactionsData: action.payload.data, transactionsType: action.payload.type}
	}
	else if(action.type == TRANSACTIONS_TYPE){
     return {...state, transactionsType: action.payload}
   }
	else if(action.type == SET_DAEMON_VERSION){
	  return {...state, daemonVersion: action.payload}
   	}
   	else if(action.type == SET_TEMPORARY_BALANCE){
   		return {...state, balance: action.payload}
   	}
	return state;
}
