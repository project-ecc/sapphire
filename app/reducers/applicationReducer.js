import {
  TRANSACTIONS_PAGE,
  USER_ADDRESSES,
  CREATING_ADDRESS,
  CONTACTS,
  TRAY,
  START_AT_LOGIN,
  MINIMIZE_TO_TRAY,
  MINIMIZE_ON_CLOSE,
  LOCATION_TO_EXPORT,
  BACKUP_OPERATION_IN_PROGRESS,
  INDEXING_TRANSACTIONS,
  STAKING_REWARD,
  STAKING_REWARD_UPDATE,
  PENDING_TRANSACTION,
  WAS_STAKING,
  DAEMON_CREDENTIALS,
  CHECKING_DAEMON_STATUS_PRIVKEY,
  ECC_POST,
  COIN_MARKET_CAP,
  UPDATE_APPLICATION,
  CLOSING_APPLICATION,
  SELECTED_THEME,
  SELECTED_THEME_BACKUP,
  CHANGED_THEME,
  HOVERED_SETTINGS_SOCIAL_ICON,
  FILE_DOWNLOAD_STATUS,
  TOLD_USER_UPDATE_FAILED,
  POPUP_LOADING,
  ADDING_CONTACT,
  SHOW_ZERO_BALANCE,
  IS_FILTERING_TRANSACTIONS,
  ADD_TO_DEBUG_LOG,
  LOADER_MESSAGE_FROM_LOG,
  SELECTED_CURRENCY,
  DONATION_GOALS,
  DAEMON_ERROR_POPUP, DAEMON_ERROR
} from '../actions/types';

import Wallet from '../utils/wallet';
import notificationsInfo from '../utils/notificationsInfo';
const Queue = require('../utils/queue');

let moment = require('moment');

const INITIAL_STATE = {wallet: null, transactionsPage: 0, transactionsLastPage: false, transactionsRequesting: false, friends: [], userAddresses: [], creatingAddress: false, newContactAddress:"", settings: false, hideTrayIcon: false, minimizeOnClose: false, minimizeToTray: false, startAtLogin: false, locationToExport: "", backingUpWallet: false, indexingTransactions: false, stakingRewards: [], totalStakingRewards: 0, lastWeekStakingRewards: 0, lastMonthStakingRewards: 0, pendingTransactions: [], wasStaking: false, daemonCredentials: undefined, checkingDaemonStatusPrivateKey: false, eccPosts: [], coinMarketCapStats: {}, coinMarketLastUpdated: 0, updateApplication:false, closingApplication: false, theme: "theme-defaultEcc", backupTheme: "theme-defaultEcc", changedTheme: false, downloadMessage: undefined, downloadPercentage: undefined, downloadRemainingTime: undefined, updateFailed:false, popupLoading: false, contactToAdd: undefined, showZeroBalance: true, filteringTransactions: false, debugLog: new Queue(), selectedCurrency: "usd", donationGoals: {}, donationGoalsLastUpdated: 0, daemonErrorPopup:false, daemonError: ''};


export default(state = INITIAL_STATE, action) => {
	if(action.type == SHOW_ZERO_BALANCE){
    return {...state, showZeroBalance: action.payload}
  }
  else if(action.type == POPUP_LOADING){
    return {...state, popupLoading: action.payload}
  }
	else if(action.type == CHANGED_THEME){
		return {...state, changedTheme: action.payload}
	}
	else if(action.type == SELECTED_THEME_BACKUP){
		return {...state, backupTheme: action.payload}
	}
	else if(action.type == SELECTED_THEME){
		return {...state, theme: action.payload}
	}
	else if(action.type == CLOSING_APPLICATION){
		return {...state, closingApplication: true}
	}
	else if(action.type == UPDATE_APPLICATION){
		return {...state, updateApplication: action.payload}
	}
	else if(action.type == COIN_MARKET_CAP){
		return {...state, coinMarketCapStats: action.payload.stats, coinMarketLastUpdated: action.payload.lastUpdated}
	}
	else if(action.type == ECC_POST){
		return {...state, eccPosts: action.payload}
	}
	else if(action.type == CHECKING_DAEMON_STATUS_PRIVKEY){
		return {...state, checkingDaemonStatusPrivateKey: action.payload}
	}
	else if(action.type == DAEMON_CREDENTIALS){
		const wallet = new Wallet(action.payload.username, action.payload.password);
		return {...state, wallet: wallet}
	}
	else if(action.type == WAS_STAKING){
		return {...state, wasStaking: true}
	}
	//update staking transactions (last week and last month)
	else if(action.type == STAKING_REWARD_UPDATE){

    const oneMonthAgo = moment().subtract(1, 'M').unix();
    const oneWeekago = moment().subtract(7, 'd').unix();
    const currentDay = moment().unix();
    let stakingRewards = state.stakingRewards;
    let rewardsLastMonth = 0;
    let rewardsLastWeek = 0;
		stakingRewards.map((transaction) => {
      const transactionTime = transaction.time;
      if (transactionTime >= oneWeekago && transactionTime <= currentDay ){
        rewardsLastWeek += transaction.amount;
      }
      if(transactionTime >= oneMonthAgo && transactionTime <= currentDay){
        rewardsLastMonth += transaction.amount
      }
		});
		return {...state, lastWeekStakingRewards: rewardsLastWeek, lastMonthStakingRewards: rewardsLastMonth};
	}
	else if(action.type == STAKING_REWARD){

    let oneMonthAgo = moment().subtract(1, 'M').unix();
    let oneWeekago = moment().subtract(7, 'd').unix();
    let currentDay = moment().unix();
    let rewardsLastMonth = 0;
    let rewardsLastWeek = 0;
    let totalRewards = 0;

		//we get this the first time we load the transactions or when we load them from memory
		if(action.payload instanceof Object){
			action.payload.map((transaction) => {
			  const transactionTime = transaction.time;
			  if (transactionTime >= oneWeekago && transactionTime <= currentDay ){
			    rewardsLastWeek += transaction.amount;
        }
        if(transactionTime >= oneMonthAgo && transactionTime <= currentDay){
			    rewardsLastMonth += transaction.amount
        }
				totalRewards += transaction.amount;
			});

			return {...state, stakingRewards: action.payload, totalStakingRewards: totalRewards, lastWeekStakingRewards: rewardsLastWeek, lastMonthStakingRewards: rewardsLastMonth};
		}
		//else its just one entry
		else{
			let transaction = action.payload;
			let stakingRewards = state.stakingRewards;
			stakingRewards.unshift(action.payload);
			rewardsLastMonth = state.lastMonthStakingRewards;
			rewardsLastWeek = state.lastWeekStakingRewards;
			totalRewards = state.totalStakingRewards;

      const transactionTime = transaction.time;

      if (transactionTime >= oneWeekago && transactionTime <= currentDay ){
        rewardsLastWeek += transaction.amount;
      }

      if(transactionTime >= oneMonthAgo && transactionTime <= currentDay){
        rewardsLastMonth += transaction.amount
      }
			totalRewards += transaction.amount;

			return {...state, stakingRewards: stakingRewards, totalStakingRewards: totalRewards, lastWeekStakingRewards: rewardsLastWeek, lastMonthStakingRewards: rewardsLastMonth};
		}
	}
	else if(action.type == PENDING_TRANSACTION){
		var pendingTransactions = state.pendingTransactions;
		if(action.payload instanceof Object){
			pendingTransactions = action.payload;
		}
		else{
			pendingTransactions.push(action.payload);
		}
		return {...state, pendingTransactions: pendingTransactions}
	}
	else if(action.type == INDEXING_TRANSACTIONS){
		return {...state, indexingTransactions: action.payload}
	}
	else if(action.type == BACKUP_OPERATION_IN_PROGRESS){
		return {...state, backingUpWallet: action.payload}
	}
	else if(action.type == LOCATION_TO_EXPORT){
		return {...state, locationToExport: action.payload}
	}
	else if(action.type == TRAY){
		return{...state, hideTrayIcon: action.payload}
	}
	else if(action.type == START_AT_LOGIN){
		return{...state, startAtLogin: action.payload}
	}
	else if(action.type == MINIMIZE_TO_TRAY){
		return{...state, minimizeToTray: action.payload}
	}
	else if(action.type == MINIMIZE_ON_CLOSE){
		return{...state, minimizeOnClose: action.payload}
	}
	else if(action.type == USER_ADDRESSES){
		return{...state, userAddresses: action.payload}
	}
	else if(action.type == TRANSACTIONS_PAGE){
		return {...state, transactionsPage: action.payload}
	}
	else if(action.type == CREATING_ADDRESS){
		return {...state, creatingAddress: action.payload}
	}
	else if(action.type == CONTACTS){
		return {...state, friends: action.payload}
	}
	else if(action.type == FILE_DOWNLOAD_STATUS){
    return {...state, downloadMessage: action.payload.downloadMessage, downloadPercentage: action.payload.downloadPercentage, downloadRemainingTime: action.payload.downloadRemainingTime}
  }
  else if(action.type == TOLD_USER_UPDATE_FAILED){
	  return {...state, updateFailed: action.payload.updateFailed, downloadMessage: action.payload.message}
	}
	else if(action.type == IS_FILTERING_TRANSACTIONS){
    return {...state, filteringTransactions: action.payload}
  }
  else if(action.type == ADD_TO_DEBUG_LOG){

	  let currentLog = state.debugLog;
	  let currentLine = action.payload;

	  if(currentLog.size() > 100){
	    currentLog.dequeue();
	    currentLog.enqueue(currentLine);
    } else{
      currentLog.enqueue(currentLine);
    }
	  return {...state}
  }
  else if(action.type == LOADER_MESSAGE_FROM_LOG){
    if(action.payload === true){
      state.loadingMessage = state.debugLog.peek()
    }
  }
  else if(action.type == SELECTED_CURRENCY){
    return {...state, selectedCurrency: action.payload}
  }
  else if (action.type == DONATION_GOALS){
    return {...state, donationGoals: action.payload.goals, donationGoalsLastUpdated: action.payload.lastUpdated}
  }
  else if(action.type == DAEMON_ERROR_POPUP){
  	return {...state, daemonErrorPopup: action.payload}
  }
  else if(action.type == DAEMON_ERROR){
  	return {...state, daemonError: action.payload}
  }
	return state;
}

function UpdateNotificationInfo(lastCheckedNews, lastCheckedEarnings){
	notificationsInfo.set('info', {lastCheckedNews: lastCheckedNews, lastCheckedEarnings: lastCheckedEarnings, lastCheckedChat: {}}).write();
}
