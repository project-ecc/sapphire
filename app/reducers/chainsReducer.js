import {
		PAYMENT_CHAIN_SYNC,
		BLOCK_INDEX_PAYMENT_PERCENTAGE,
		BLOCK_INDEX_PAYMENT,
		STAKING,
		WALLET_INFO,
		TRANSACTIONS_DATA
} from '../actions/types';


const INITIAL_STATE = {paymentChainSync: 0, blockIndexPaymentPercentage: 0, loadingBlockIndexPayment: false, blockPayment: 0, headersPayment:0, connectionsPayment: 0, staking: false, balance: 0, transactionsData: [], connections: 0, transactionsType: "all", messagingChain: false, fileStorageChain:false}

export default(state = INITIAL_STATE, action) => {
	if(action.type == BLOCK_INDEX_PAYMENT_PERCENTAGE){
		return {...state, blockIndexPaymentPercentage: action.payload}
	}
	else if(action.type == BLOCK_INDEX_PAYMENT){
		return {...state, loadingBlockIndexPayment: action.payload}
	}
	else if(action.type == PAYMENT_CHAIN_SYNC){
		let x = action.payload;
		if(action.payload == "100.00")
			x = 100;
		return {...state, paymentChainSync: x}
	}
	else if(action.type == STAKING){
		return {...state, staking: action.payload, password: ""}
	}
	else if(action.type == WALLET_INFO){
		return {...state, balance: action.payload.balance, staking: action.payload.staking, connections: action.payload.connections, blockPayment: action.payload.block, headersPayment: action.payload.headers, connectionsPayment: action.payload.connections}
	}
	else if(action.type == TRANSACTIONS_DATA){
		var data = action.payload.data;
		console.log(data.length)
		for(var i = 0; i < data.length; i++){
			if(data[i].txid == "e9b9755a27b0a83f4ca0fd93c23fe5aad0e983c23e9e421d6fea2599785c8ef5")
				console.log(data[i])

		}
		return {...state, transactionsData: action.payload.data, transactionsType: action.payload.type}
	}
	return state;
}