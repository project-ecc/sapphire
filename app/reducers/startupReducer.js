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
  UPDATE_AVAILABLE
} from '../actions/types';


const INITIAL_STATE = {lang: lang, loader: true, initialSetup: false, partialInitialSetup: false, setupDone: false, importWallet: false, totalSteps: 0, loading: false, updatingApp: false, guiUpdate: false, daemonUpdate:false}

export default(state = INITIAL_STATE, action) => {
	if(action.type == SET_LANGUAGE){
		lang = traduction();
		return {...state, lang: lang};
	}
	else if(action.type == UPDATE_AVAILABLE){
		return {...state, daemonUpdate: action.payload.daemonUpdate, guiUpdate: action.payload.guiUpdate}
	}
	else if(action.type == UPDATING_APP){
		return {...state, updatingApp: action.payload}
	}
	else if(action.type == INITIAL_SETUP){
		console.log("got initial setup")
		return {...state, initialSetup: true, totalSteps: 4, loader: false, loading: false};
	}
	else if(action.type == PARTIAL_INITIAL_SETUP){
		console.log("got partial initial setup")
		return {...state, partialInitialSetup: true, totalSteps: 2 , loader: false, loading: false};
	}
	else if(action.type == SETUP_DONE){
		console.log("got setup done")
		return {...state, setupDone: true};
	}
	else if(action.type == IMPORT_WALLET){
		console.log("got import wallet")
		return {...state, importWallet: true , loader: false, loading: false};
	}
	else if(action.type == LOADING){
		return {...state, loading: action.payload, loader: action.payload}
	}
	return state;
}