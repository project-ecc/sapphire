import {
SET_ACTIVE_MESSAGING_ACCOUNT
} from "../actions/types"

const INITIAL_STATE = {
  activeAccount: null,
  unsentMessages: []
};

export default(state = INITIAL_STATE, action) => {
  if (action.type == SET_ACTIVE_MESSAGING_ACCOUNT) {
    return { ...state, activeAccount: action.payload };
  }
  return state;
};
