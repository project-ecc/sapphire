import {traduction} from './../lang/lang';
import {
  LOADING,
  SET_LANGUAGE,
  TELL_USER_OF_UPDATE,
  UNENCRYPTED_WALLET,
  UPDATE_AVAILABLE,
  UPDATING_APP,
  INITIAL_SETUP
} from '../actions/types';

var lang = traduction();


const INITIAL_STATE = {lang: lang, loader: true, loading: true, loadingMessage: '', updatingApp: false, daemonUpdate:false, unencryptedWallet: false, toldUserAboutUpdate: false , initialSetup: false};

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
		return {...state, daemonUpdate: action.payload.daemonUpdate}
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
	} else if(action.type == INITIAL_SETUP){
    return {...state, initialSetup: action.payload}
  }
	return state;
}
