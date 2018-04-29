import {
	UNLOCKING,
	PASSWORD_UNLOCK,
	ADDRESS_SEND,
	AMOUNT_SEND,
	NAME_SEND,
	SENDING_ECC,
	TRANSACTIONS_PAGE,
	TRANSACTIONS_REQUESTING,
	NEW_ADDRESS_NAME,
	USER_ADDRESSES,
	ADDRESS_CREATE_ANS,
	SELECTED_ADDRESS,
	CREATING_ADDRESS,
	UPGRADING_ADDRESS,
	NEW_ADDRESS_ACCOUNT,
	NEW_CONTACT_NAME,
	NEW_CONTACT_ADDRESS,
	HOVERED_ADDRESS,
	CONTACTS,
	SETTINGS,
	TRAY,
	START_AT_LOGIN,
	MINIMIZE_TO_TRAY,
	MINIMIZE_ON_CLOSE,
	EXPORT_PRIVATE_KEYS,
	PANEL_EXPORT_PRIVATE_KEYS,
	LOCATION_TO_EXPORT,
	FILTER_OWN_ADDRESSES,
	BACKUP_OPERATION_IN_PROGRESS,
	INDEXING_TRANSACTIONS,
	STAKING_REWARD,
	STAKING_REWARD_UPDATE,
	PENDING_TRANSACTION,
	IMPORTING_PRIVATE_KEY,
	CHANGING_PASSWORD,
	NEW_PASSWORD,
	WAS_STAKING,
	DAEMON_CREDENTIALS,
	CHECKING_DAEMON_STATUS_PRIVKEY,
	ECC_POST,
	POSTS_PER_CONTAINER,
	ECC_POSTS_PAGE,
	COIN_MARKET_CAP,
	SHOWING_NEWS,
	NEWS_SWITCHING_PAGE,
	UPDATE_APPLICATION,
	SELECTED_PANEL,
	SETTINGS_OPTION_SELECTED,
	SHOWING_FUNCTION_ICONS,
	GENERIC_PANEL_ANIMATION_ON,
	CLOSING_APPLICATION,
	MAC_BUTTONS_HOVER,
	MAC_BUTTONS_FOCUS,
	APP_MAXIMIZED,
	SELECTED_THEME,
	SELECTED_THEME_BACKUP,
	CHANGED_THEME,
	HOVERED_SETTINGS_SOCIAL_ICON,
	ACTION_POPUP_RESULT,
  FILE_DOWNLOAD_STATUS,
  TOLD_USER_UPDATE_FAILED
} from '../actions/types';

import Wallet from '../utils/wallet';
import notificationsInfo from '../utils/notificationsInfo';

const INITIAL_STATE = {wallet: new Wallet(), unlocking: false, password: "", userNameToSend: "", amountSend: "", addressSend: "", sendingEcc: false, transactionsPage: 0, transactionsLastPage: false, transactionsRequesting: false, newAddressName: "", newAddressAccount: "", friends: [], userAddresses: [], creatingAnsAddress: true, selectedAddress: undefined, creatingAddress: false, newContactName: "", newContactAddress:"", hoveredAddress: undefined, settings: false, hideTrayIcon: false, minimizeOnClose: false, minimizeToTray: false, startAtLogin: false, exportingPrivateKeys: false, panelExportPrivateKey: 1, locationToExport: "", filterAllOwnAddresses: true, filterNormalOwnAddresses: false, filterAnsOwnAddresses: false, backingUpWallet: false, indexingTransactions: false, stakingRewards: [], totalStakingRewards: 0, lastWeekStakingRewards: 0, lastMonthStakingRewards: 0, totalFileStorageRewards: 0, lastWeekFileStorageRewards: 0,lastMonthFileStorageRewards: 0, pendingTransactions: [], importingPrivateKey: false, changingPassword: false, wasStaking: false, newPassword: "", daemonCredentials: undefined, checkingDaemonStatusPrivateKey: false, eccPosts: [], postsPerContainerEccNews: 0, eccPostsArrays: [], eccPostsPage: 1, coinMarketCapStats: {}, showingNews: false, eccNewsSwitchingPage: false, updateApplication:false, selectedPanel: "overview", settingsOptionSelected: "General", showingFunctionIcons: false, genericPanelAnimationOn: false, closingApplication: false, macButtonsHover: false, macButtonsFocus: false, maximized:false, theme: "theme-defaultEcc", backupTheme: "theme-defaultEcc", changedTheme: false, settingsHoveredSocialIcon: undefined, actionPopupResult: false, actionPopupMessage: "", actionPopupStatus: false, downloadMessage: undefined, downloadPercentage: undefined, downloadRemainingTime: undefined, updateFailed:false};

export default(state = INITIAL_STATE, action) => {
    if(action.type == UNLOCKING){
		return {...state, unlocking: action.payload}
	}
	else if(action.type == ACTION_POPUP_RESULT){
		return {...state, actionPopupResult: action.payload.flag, actionPopupMessage: action.payload.message, actionPopupStatus: action.payload.successful}
	}
	else if(action.type == HOVERED_SETTINGS_SOCIAL_ICON){
		return {...state, settingsHoveredSocialIcon: action.payload}
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
	else if(action.type == APP_MAXIMIZED){
		return {...state, maximized: action.payload}
	}
	else if(action.type == MAC_BUTTONS_HOVER){
		return {...state, macButtonsHover: action.payload}
	}
	else if(action.type == MAC_BUTTONS_FOCUS){
		return {...state, macButtonsFocus: action.payload}
	}
	else if(action.type == CLOSING_APPLICATION){
		return {...state, closingApplication: true}
	}
	else if(action.type == GENERIC_PANEL_ANIMATION_ON){
		return {...state, genericPanelAnimationOn: action.payload}
	}
	else if(action.type == SHOWING_FUNCTION_ICONS){
		return {...state, showingFunctionIcons: action.payload}
	}
	else if(action.type == NEWS_SWITCHING_PAGE){
		return {...state, eccNewsSwitchingPage: action.payload}
	}
	else if(action.type == SETTINGS_OPTION_SELECTED){
		return {...state, settingsOptionSelected: action.payload}
	}
	else if(action.type == SELECTED_PANEL){
		return {...state, selectedPanel: action.payload}
	}
	else if(action.type == UPDATE_APPLICATION){
		return {...state, updateApplication: action.payload}
	}
	else if(action.type == SHOWING_NEWS){
		var settings = state.settings;
		if(action.payload)
			settings = false;
		return {...state, showingNews: action.payload, settings: settings}
	}
	else if(action.type == COIN_MARKET_CAP){
		return {...state, coinMarketCapStats: action.payload}
	}
	else if(action.type == ECC_POSTS_PAGE){
		return {...state, eccPostsPage: action.payload}
	}
	else if(action.type == POSTS_PER_CONTAINER){
		let arrays = [],
		size = action.payload,
		counter = 0,
		arrayConter = 0,
		currentPosts = state.eccPosts;

		arrays.push([]);
		currentPosts.map((value, index) => {
			if(counter == size){
				counter = 0;
				arrayConter++;
				arrays.push([]);
			}
			arrays[arrayConter].push(value);
			counter++;
		});

		return {...state, postsPerContainerEccNews: action.payload, eccPostsArrays: arrays}
	}
	else if(action.type == ECC_POST){
		return {...state, eccPosts: action.payload}
	}
	else if(action.type == CHECKING_DAEMON_STATUS_PRIVKEY){
		return {...state, checkingDaemonStatusPrivateKey: action.payload}
	}
	else if(action.type == DAEMON_CREDENTIALS){
		var wallet = new Wallet(action.payload.username, action.payload.password);
		return {...state, wallet: wallet}
	}
	else if(action.type == NEW_PASSWORD){
		return {...state, newPassword: action.payload}
	}
	else if(action.type == WAS_STAKING){
		return {...state, wasStaking: true}
	}
	else if(action.type == IMPORTING_PRIVATE_KEY){
		return {...state, importingPrivateKey: action.payload}
	}
	else if(action.type == CHANGING_PASSWORD){
		return {...state, changingPassword: action.payload}
	}
	//update staking transactions (last week and last month)
	else if(action.type == STAKING_REWARD_UPDATE){
		var timeOneMonthAgo = GetDateOneMonthAgo();
		var timeOneWeekAgo = GetDateOneWeekAgo();
		var stakingRewards = state.stakingRewards;
		var rewardsLastMonth = 0;
		var rewardsLastWeek = 0;
		stakingRewards.map((transaction) => {
			if(transaction.time >= timeOneMonthAgo)
				rewardsLastMonth += transaction.amount;
			if(transaction.time >= timeOneWeekAgo)
				rewardsLastWeek += transaction.amount;
		});
		return {...state, lastWeekStakingRewards: rewardsLastWeek, lastMonthStakingRewards: rewardsLastMonth};
	}
	else if(action.type == STAKING_REWARD){

		var timeOneMonthAgo = GetDateOneMonthAgo();
		var timeOneWeekAgo = GetDateOneWeekAgo();
		//we get this the first time we load the transactions or when we load them from memory
		if(action.payload instanceof Array){
			var rewardsLastMonth = 0;
			var rewardsLastWeek = 0;
			var totalRewards = 0;
			action.payload.map((transaction) => {
				if(transaction.time >= timeOneMonthAgo)
					rewardsLastMonth += transaction.amount;
				if(transaction.time >= timeOneWeekAgo)
					rewardsLastWeek += transaction.amount;
				totalRewards += transaction.amount;
			});

			return {...state, stakingRewards: action.payload, totalStakingRewards: totalRewards, lastWeekStakingRewards: rewardsLastWeek, lastMonthStakingRewards: rewardsLastMonth};
		}
		//else its just one entry
		else{
			var transaction = action.payload;
			var stakingRewards = state.stakingRewards;
			stakingRewards.unshift(action.payload);
			var rewardsLastMonth = state.lastMonthStakingRewards;
			var rewardsLastWeek = state.lastWeekStakingRewards;
			var totalRewards = state.totalStakingRewards;

			if(transaction.time >= timeOneMonthAgo)
				rewardsLastMonth += transaction.amount;
			if(transaction.time >= timeOneWeekAgo)
				rewardsLastWeek += transaction.amount;
			totalRewards += transaction.amount;

			return {...state, stakingRewards: stakingRewards, totalStakingRewards: totalRewards, lastWeekStakingRewards: rewardsLastWeek, lastMonthStakingRewards: rewardsLastMonth};
		}
	}
	else if(action.type == PENDING_TRANSACTION){
		var pendingTransactions = state.pendingTransactions;
		if(action.payload instanceof Array){
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
	else if(action.type == FILTER_OWN_ADDRESSES){

		let filterAllOwnAddresses = false;
		let filterNormalOwnAddresses = false;
		let filterAnsOwnAddresses = false;

		if(action.payload == "all")
			filterAllOwnAddresses = true;
		else if(action.payload == "normal")
			filterNormalOwnAddresses = true;
		else if(action.payload == "ans")
			filterAnsOwnAddresses = true;

		return {...state, filterAllOwnAddresses: filterAllOwnAddresses, filterNormalOwnAddresses: filterNormalOwnAddresses, filterAnsOwnAddresses: filterAnsOwnAddresses}
	}
	else if(action.type == BACKUP_OPERATION_IN_PROGRESS){
		return {...state, backingUpWallet: action.payload}
	}
	else if(action.type == LOCATION_TO_EXPORT){
		return {...state, locationToExport: action.payload}
	}
	else if(action.type == PANEL_EXPORT_PRIVATE_KEYS){
		return {...state, panelExportPrivateKey: action.payload}
	}
	else if(action.type == EXPORT_PRIVATE_KEYS){
		return {...state, exportingPrivateKeys: action.payload}
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
	else if(action.type == PASSWORD_UNLOCK){
		return {...state, password: action.payload}
	}
	else if(action.type == ADDRESS_SEND){
		return {...state, addressSend: action.payload}
	}
	else if(action.type == NAME_SEND){
		return {...state, userNameToSend: action.payload}
	}
	else if(action.type == AMOUNT_SEND){
		return {...state, amountSend: action.payload}
	}
	else if(action.type == SENDING_ECC){
		if(!action.payload)
			return {...state, sendingEcc: action.payload, password: ""};
		return {...state, sendingEcc: action.payload}
	}
	else if(action.type == TRANSACTIONS_PAGE){
		return {...state, transactionsPage: action.payload}
	}
	else if(action.type == NEW_ADDRESS_NAME){
		return {...state, newAddressName: action.payload}
	}
	else if(action.type == ADDRESS_CREATE_ANS){
		return {...state, creatingAnsAddress: action.payload}
	}
	else if(action.type == SELECTED_ADDRESS){
		return {...state, selectedAddress: action.payload}
	}
	else if(action.type == CREATING_ADDRESS){
		return {...state, creatingAddress: action.payload}
	}
	else if(action.type == UPGRADING_ADDRESS){
		return {...state, upgradingAddress: action.payload}
	}
	else if(action.type == NEW_ADDRESS_ACCOUNT){
		return {...state, newAddressAccount: action.payload}
	}
	else if(action.type == NEW_CONTACT_NAME){
		return {...state, newContactName: action.payload}
	}
	else if(action.type == NEW_CONTACT_ADDRESS){
		return {...state, newContactAddress: action.payload}
	}
	else if(action.type == HOVERED_ADDRESS){
		return {...state, hoveredAddress: action.payload}
	}
	else if(action.type == CONTACTS){
		return {...state, friends: action.payload}
	}
	else if(action.type == SETTINGS){
		return {...state, settings: action.payload}
	}
	else if(action.type == FILE_DOWNLOAD_STATUS){
    return {...state, downloadMessage: action.payload.downloadMessage, downloadPercentage: action.payload.downloadPercentage, downloadRemainingTime: action.payload.downloadRemainingTime}
  }
  else if(action.type == TOLD_USER_UPDATE_FAILED){
	  return {...state, updateFailed: action.payload.updateFailed}
	}
	return state;
}

function GetDateOneMonthAgo(){
	var d = new Date();
	d.setMonth(d.getMonth() - 1);
	d.setHours(0, 0, 0);
	d.setMilliseconds(0);
	return d/1000|0;
}

function GetDateOneWeekAgo(){
	var d = new Date();
	d.setDate(d.getDate() - 7);
	d.setHours(0, 0, 0);
	d.setMilliseconds(0);
	return d/1000|0;
}

function UpdateNotificationInfo(lastCheckedNews, lastCheckedEarnings){
	notificationsInfo.set('info', {lastCheckedNews: lastCheckedNews, lastCheckedEarnings: lastCheckedEarnings, lastCheckedChat: {}}).write();
}
