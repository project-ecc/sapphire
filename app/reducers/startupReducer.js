import { traduction } from './../lang/lang';
var lang = traduction();

import {
  SET_LANGUAGE,
  LOADING,
  UPDATING_APP,
  UPDATE_AVAILABLE,
  UNENCRYPTED_WALLET,
  TELL_USER_OF_UPDATE,
} from '../actions/types';


const INITIAL_STATE = {lang: lang, loader: true, loading: true, loadingMessage: '', updatingApp: false, guiUpdate: false, daemonUpdate:false, unencryptedWallet: false, toldUserAboutUpdate: false };

export default(state = INITIAL_STATE, action) => {
	if(action.type == SET_LANGUAGE){
		lang = traduction();
		return {...state, lang: lang};
	}
	else if(action.type == UNENCRYPTED_WALLET){
		return {...state, loader: false, loading: false, unencryptedWallet: action.payload}
	}
	else if(action.type == TELL_USER_OF_UPDATE){
		return {...state, toldUserAboutUpdate: true}
	}
	else if(action.type == UPDATE_AVAILABLE){
    let daemonUpdate = state.daemonUpdate;
    let guiUpdate = state.guiUpdate;
    if(action.payload){
      daemonUpdate = action.payload.daemonUpdate;
      guiUpdate = action.payload.guiUpdate;
    }
		return {...state, daemonUpdate: daemonUpdate, guiUpdate: guiUpdate}
	}
	else if(action.type == UPDATING_APP){
		return {...state, updatingApp: action.payload, toldUserAboutUpdate: true}
	}
	else if(action.type == LOADING){
	  if(action.payload.loadingMessage == null){
      return {...state, loading: action.payload.isLoading, loader: action.payload.isLoading}
    } else{
      return {...state, loading: action.payload.isLoading, loader: action.payload.isLoading, loadingMessage: action.payload.loadingMessage}
    }
	}
	return state;
}
