import { traduction } from './../lang/lang';
var lang = traduction();

import {
  INITIAL_SETUP,
  PARTIAL_INITIAL_SETUP,
  SETUP_DONE,
  IMPORT_WALLET,
  SET_LANGUAGE
} from '../actions/types';


const INITIAL_STATE = {lang: lang, loader: true, initialSetup: false, partialInitialSetup: false, setupDone: false, importWallet: false, totalSteps: 0}

export default(state = INITIAL_STATE, action) => {
	if(action.type == SET_LANGUAGE){
		lang = traduction();
		return {...state, lang: lang};
	}
	else if(action.type == INITIAL_SETUP){
		console.log("got initial setup")
		return {...state, initialSetup: true, totalSteps: 4, loader: false};
	}
	else if(action.type == PARTIAL_INITIAL_SETUP){
		console.log("got partial initial setup")
		return {...state, partialInitialSetup: true, totalSteps: 2, loader: false};
	}
	else if(action.type == SETUP_DONE){
		console.log("got setup done")
		return {...state, setupDone: true, loader: false, partialInitialSetup: false, initialSetup: false};
	}
	else if(action.type == IMPORT_WALLET){
		console.log("got import wallet")
		return {...state, importWallet: true, loader: false};
	}
	return state;
}