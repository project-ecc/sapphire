import {FILTER_EARNINGS_TIME, FILTER_EARNINGS_TYPE,} from '../actions/types';


const INITIAL_STATE = { allEarningsSelected: true, fileStorageEarningsSelected: false, stakingEarningsSelected: false, weekEarningsSelected: false, monthEarningsSelected: false, allTimeEarningsSelected: true };

export default(state = INITIAL_STATE, action) => {
  if (action.type == FILTER_EARNINGS_TYPE) {
    var fileStorage = false;
    let staking = false;
    var all = false;
    switch (action.payload) {
      case 'fileStorage':
        fileStorage = true;
        break;
      case 'staking':
        staking = true;
        break;
      case 'all':
        all = true;
        break;
    }
    return { ...state, fileStorageEarningsSelected: fileStorage, stakingEarningsSelected: staking, allEarningsSelected: all };
  }	else if (action.type == FILTER_EARNINGS_TIME) {
    console.log(action.payload);
    var week = false;
    var month = false;
    var allTime = false;
    switch (action.payload) {
      case 'week':
        week = true;
        break;
      case 'month':
        month = true;
        break;
      case 'allTime':
        allTime = true;
        break;
    }
    return { ...state, weekEarningsSelected: week, monthEarningsSelected: month, allTimeEarningsSelected: allTime };
  }
  return state;
};
