import {
  STEP_INITIAL_SETUP,
  IMPORTING_WALLET,
  IMPORTED_WALLET,
  IMPORT_CANCELLED,
} from '../actions/types';
import settings from 'electron-settings';


const INITIAL_STATE = {step: 'complete',  importing: false, imported: false};

export default(state = INITIAL_STATE, action) => {
	if(action.type == STEP_INITIAL_SETUP){
	  settings.set('settings.initialSetup', action.payload)
		return {...state, step: action.payload}
	}
	else if(action.type == IMPORTING_WALLET){
		return {...state, importing: !state.importing}
	}
	else if(action.type == IMPORTED_WALLET){
		return {...state, importing: false, imported: true}
	}
	else if(action.type == IMPORT_CANCELLED){
		return {...state, importing: false}
	}
	return state;
}
