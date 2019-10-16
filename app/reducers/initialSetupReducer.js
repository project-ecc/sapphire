const settings = require('electron').remote.require('electron-settings');

import {STEP_INITIAL_SETUP,} from '../actions/types';


const INITIAL_STATE = { step: 'complete' };

export default(state = INITIAL_STATE, action) => {
  if (action.type == STEP_INITIAL_SETUP) {
	  settings.set('settings.initialSetup', action.payload);
    return { ...state, step: action.payload };
  }
  return state;
};
