import { traduction } from './../lang/lang';
var lang = traduction();

import {
  INITIAL_SETUP,
  PARTIAL_INITIAL_SETUP,
  SETUP_DONE,
  IMPORT_WALLET,
  SET_LANGUAGE,
  LOADING,
  CALCULATING_STAKING_REWARDS,
  UPDATING_APP,
  UPDATE_AVAILABLE,
  UNENCRYPTED_WALLET,
  SETUP_DONE_INTERNAL,
  TELL_USER_OF_UPDATE,
  IMPORTED_WALLET,
  IMPORTING_WALLET_SETUP_DONE,
  IMPORT_WALLET_TEMPORARY
} from '../actions/types';


const INITIAL_STATE = {lang: lang, loader: true, initialSetup: false, partialInitialSetup: false, setupDone: false, importWallet: false, loading: false, updatingApp: false, guiUpdate: false, daemonUpdate:false, unencryptedWallet: false, setupDoneInternal: false, toldUserAboutUpdate: false, importingWalletWithSetupDone: false, importWalletTemp: false};

export default(state = INITIAL_STATE, action) => {
	if(action.type == SET_LANGUAGE){
		lang = traduction();
		return {...state, lang: lang};
	}
	else if(action.type == IMPORT_WALLET_TEMPORARY){
		return {...state, importWalletTemp: action.payload.importWalletTemp, importWallet: action.payload.importWallet}
	}
	else if(action.type == IMPORTING_WALLET_SETUP_DONE){
		return {...state, importingWalletWithSetupDone: action.payload}
	}
	else if(action.type == UNENCRYPTED_WALLET){
		return {...state, loader: false, loading: false, unencryptedWallet: action.payload}
	}
	else if(action.type == TELL_USER_OF_UPDATE){
		return {...state, toldUserAboutUpdate: true}
	}
	else if(action.type == UPDATE_AVAILABLE){
		return {...state, daemonUpdate: action.payload.daemonUpdate, guiUpdate: action.payload.guiUpdate}
	}
	else if(action.type == UPDATING_APP){
		return {...state, updatingApp: action.payload, daemonUpdate: false, guiUpdate: false, toldUserAboutUpdate: false}
	}
	else if(action.type == INITIAL_SETUP){
		console.log("got initial setup");
		return {...state, initialSetup: true, loader: false, loading: false, unencryptedWallet: false};
	}
	else if(action.type == PARTIAL_INITIAL_SETUP){
		console.log("got partial initial setup");
		return {...state, partialInitialSetup: true, loader: false, loading: false, unencryptedWallet: action.payload};
	}
	else if(action.type == IMPORTED_WALLET){
		return {...state, importWallet: false}
	}
	else if(action.type == SETUP_DONE){
		console.log("got setup done");
		return {...state, setupDone: true, setupDoneInternal: true, initialSetup: false, partialInitialSetup: false, unencryptedWallet: false};
	}
	else if(action.type == IMPORT_WALLET){
		console.log("got import wallet");
		return {...state, importWallet: true , loader: false, loading: false};
	}
	else if(action.type == LOADING){
		return {...state, loading: action.payload, loader: action.payload}
	}
	else if(action.type == SETUP_DONE_INTERNAL){
		return {...state, setupDoneInternal: action.payload}
	}
	return state;
}
