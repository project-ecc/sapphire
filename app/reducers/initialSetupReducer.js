import {
  STEP_INITIAL_SETUP,
  STEP_FORWARD,
  IMPORTING_WALLET,
  IMPORTED_WALLET,
  IMPORT_CANCELLED,
  IMPORT_STARTED,
  PRIVATE_KEY,
  PASSWORD,
  PASSWORD_CONFIRMATION,
  STEP_OVER,
  ENCRYPTING
} from '../actions/types';
import settings from 'electron-settings';


const INITIAL_STATE = {step: 'complete',  importing: false, imported: false, importStarted: false, privateKey: "", password: "", confirmationPassword: "", stepOver: true, encrypting: false};

export default(state = INITIAL_STATE, action) => {
	if(action.type == STEP_OVER){
		return {...state, stepOver: true}
	}
	else if(action.type == STEP_INITIAL_SETUP){
	  settings.set('settings.initialSetup', action.payload)
		return {...state, step: action.payload}
	}
	else if(action.type == STEP_FORWARD){
		return {...state, step: state.step + 1, stepOver: false}
	}
	else if(action.type == IMPORTING_WALLET){
		return {...state, importing: !state.importing}
	}
	else if(action.type == IMPORTED_WALLET){
		return {...state, importing: false, importStarted: false, imported: true}
	}
	else if(action.type == IMPORT_CANCELLED){
		return {...state, importing: false}
	}
	else if(action.type == IMPORT_STARTED){
		return {...state, importStarted: true}
	}
	else if(action.type == PRIVATE_KEY){
		return {...state, privateKey: action.payload.key}
	}
	else if(action.type == PASSWORD){
		return {...state, password: action.payload.password}
	}
	else if(action.type == PASSWORD_CONFIRMATION){
		return {...state, confirmationPassword: action.payload.passwordConfirmation}
	}
	else if(action.type == ENCRYPTING){
		return {...state, encrypting: action.payload}
	}
	return state;
}
