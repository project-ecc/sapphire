import { ipcRenderer } from 'electron';
import {
  LOADING,
  DAEMON_CREDENTIALS,
  APP_READY,
  INITIAL_SETUP,
  PARTIAL_INITIAL_SETUP,
  SETUP_DONE,
  IMPORT_WALLET,
  STEP_INITIAL_SETUP,
  SET_LANGUAGE,
  STEP_FORWARD,
  IMPORTING_WALLET,
  IMPORTED_WALLET,
  IMPORT_CANCELLED,
  IMPORT_STARTED,
  PRIVATE_KEY,
  PASSWORD,
  PASSWORD_CONFIRMATION,
  STEP_OVER,
  PAYMENT_CHAIN_SYNC,
  ENCRYPTING,
  BLOCK_INDEX_PAYMENT,
  BLOCK_INDEX_PAYMENT_PERCENTAGE,
  STAKING,
  UNLOCKING,
  PASSWORD_UNLOCK,
  AMOUNT_SEND,
  ADDRESS_SEND,
  NAME_SEND,
  SENDING_ECC,
  TRANSACTIONS_DATA,
  TRANSACTIONS_PAGE,
  NEW_ADDRESS_NAME,
  ADDRESS_CREATE_ANS,
  SELECTED_ADDRESS,
  CREATING_ADDRESS,
  NEW_ADDRESS_ACCOUNT,
  HOVERED_ADDRESS,
  USER_ADDRESSES,
  CONTACTS,
  TRAY,
  START_AT_LOGIN,
  MINIMIZE_TO_TRAY,
  MINIMIZE_ON_CLOSE,
  LOCATION_TO_EXPORT,
  FILTER_OWN_ADDRESSES,
  BACKUP_OPERATION_IN_PROGRESS,
  INDEXING_TRANSACTIONS,
  STAKING_REWARD,
  FILTER_EARNINGS_TIME,
  FILTER_EARNINGS_TYPE,
  FILTER_EXPENSES_TYPE,
  FILTER_EXPENSES_TIME,
  IMPORTING_PRIVATE_KEY,
  WAS_STAKING,
  NEW_PASSWORD,
  CHECKING_DAEMON_STATUS_PRIVKEY,
  NEWS_SWITCHING_PAGE,
  UPDATE_APPLICATION,
  UPDATING_APP,
  UPDATE_AVAILABLE,
  NEWS_CHECKED,
  EARNINGS_CHECKED,
  UNENCRYPTED_WALLET,
  OPERATIVE_SYSTEM_NOTIFICATIONS,
  NEWS_NOTIFICATIONS,
  STAKING_NOTIFICATIONS,
  SETUP_DONE_INTERNAL,
  CLOSING_APPLICATION,
  SELECTED_THEME,
  SELECTED_THEME_BACKUP,
  CHANGED_THEME,
  MESSAGING_SHOW_TITLE_TOPBAR,
  MESSAGING_INPUT_VAL,
  IMPORTING_WALLET_SETUP_DONE,
  NEW_MESSAGE,
  SHOWING_CHAT_LIST_ONLY,
  MESSAGE_ID,
  IN_MESSAGING,
  MESSAGING_ENABLED,
  USER_CHECKED_GRIFFITH_CHAT,
  USER_HAS_HOVERED_OPTIONS_ICON,
  USER_HAS_CLICKED_BUTTON,
  HOVERED_SETTINGS_SOCIAL_ICON,
  SET_DAEMON_VERSION,
  UPGRADING_ADDRESS,
  SET_TEMPORARY_BALANCE,
  ACTION_POPUP_RESULT,
  IMPORT_WALLET_TEMPORARY,
  FILE_DOWNLOAD_STATUS,
  TELL_USER_UPDATE_FAILED,
  TOLD_USER_UPDATE_FAILED,
  POPUP_LOADING,
  NEW_ADDRESS_NAME_POPUP,
  ADDRESS_OR_USERNAME_SEND,
  MULTIPLE_ANS_ADDRESSES,
  ADDING_CONTACT,
  SHOW_ZERO_BALANCE,
  IS_FILTERING_TRANSACTIIONS,
  TRANSACTIONS_TYPE,
  ADD_TO_DEBUG_LOG,
  SELECTED_CURRENCY,
  DONATION_GOALS,
  DAEMON_ERROR_POPUP,
  DAEMON_ERROR
} from "./types";

export const setWalletCredentials = (args) => {
  return {
    type: DAEMON_CREDENTIALS,
    payload: args
  };
}

export const getSetup = () => dispatch => {
	ipcRenderer.send('app:ready');
    //
	// ipcRenderer.on('import_wallet', (e) => {
	// 	dispatch({ type: IMPORT_WALLET });
	// });
};

export const setStepInitialSetup = (step) => {
	return{
		type: STEP_INITIAL_SETUP,
		payload: step
	};
};

export const setSetupDone = (val) => {
	return{
		type: SETUP_DONE,
		payload: val
	};
};

export const setLang = () => {
	return{
		type: SET_LANGUAGE
	};
};

export const stepForward = () => {
	return {
		type: STEP_FORWARD
	}
};

export const importingWallet = () => {
	return {
		type: IMPORTING_WALLET
	}
};

export const importedWallet = () => {
	return {
		type: IMPORTED_WALLET
	}
};

export const importCancelled = () => {
	return {
		type: IMPORT_CANCELLED
	}
};

export const importStarted = () => {
	return {
		type: IMPORT_STARTED
	}
};

export const stepOver = () => {
	return {
		type: STEP_OVER
	}
};

export const privateKey = (key) => {
	return {
		type: PRIVATE_KEY,
		payload: {key: key}
	}
};

export const password = (password) => {
	return {
		type: PASSWORD,
		payload: {password: password}
	}
};

export const passwordConfirmation = (passwordConfirmation) => {
	return {
		type: PASSWORD_CONFIRMATION,
		payload: {passwordConfirmation: passwordConfirmation}
	}
};

export const updatePaymentChainSync = (percentage) => {
	return	{
		type: PAYMENT_CHAIN_SYNC,
		payload: percentage
	}
};

export const updateBlockIndexPaymentPercentage = (percentage) => {
	return	{
		type: BLOCK_INDEX_PAYMENT_PERCENTAGE,
		payload: percentage
	}
};

export const updateBlockIndexPayment = (value) => {
	return	{
		type: BLOCK_INDEX_PAYMENT,
		payload: value
	}
};

export const isEncrypting = (val) => {
	return {
		type: ENCRYPTING,
		payload: val
	}
};

export const setStaking = (val) => {
	return{
		type: STAKING,
		payload: val
	}
};

export const setUnlocking = (val) => {
	return{
		type: UNLOCKING,
		payload: val
	}
};

export const setPassword = (val) => {
	return{
		type: PASSWORD_UNLOCK,
		payload: val
	}
};

export const setAddressSend = (val) => {
	return{
		type: ADDRESS_SEND,
		payload: val
	}
};

export const setUsernameSend = (username, code = "") => {
	return{
		type: NAME_SEND,
		payload: {username, code}
	}
};

export const setAmountSend = (val) => {
	return{
		type: AMOUNT_SEND,
		payload: val
	}
};

export const setSendingECC = (val) => {
	return{
		type: SENDING_ECC,
		payload: val
	}
};

export const setTransactionsPage = (val) => {
	return{
		type: TRANSACTIONS_PAGE,
		payload: val
	}
};

export const setTransactionsData = (data, type) => {
	return{
		type: TRANSACTIONS_DATA,
		payload: {data: data, type: type}
	}
};

export const setNewAddressName = (val) => {
	return{
		type: NEW_ADDRESS_NAME,
		payload: val
	}
};

export const setNewAddressAccount = (val) => {
	return{
		type: NEW_ADDRESS_ACCOUNT,
		payload: val
	}
};

export const setUserAddresses = (val) => {
	return{
		type: USER_ADDRESSES,
		payload: val
	}
};

export const setCreateAddressAns = (val) => {
	return{
		type: ADDRESS_CREATE_ANS,
		payload: val
	}
};

export const setSelectedAddress = (val) => {
	return{
		type: SELECTED_ADDRESS,
		payload: val
	}
};

export const setCreatingAddress = (val) =>{
	return{
		type: CREATING_ADDRESS,
		payload: val
	}
};

export const setUpgradingAddress = (val) =>{
	return{
		type: UPGRADING_ADDRESS,
		payload: val
	}
};

export const setHoveredAddress = (val) => {
	return{
		type: HOVERED_ADDRESS,
		payload: val
	}
};

export const setContacts = (val) => {
	return{
		type: CONTACTS,
		payload: val
	}
};

export const setTray = (val) => {
	return{
		type: TRAY,
		payload: val
	}
};

export const setStartAtLogin = (val) => {
	return{
		type: START_AT_LOGIN,
		payload: val
	}
};

export const setMinimizeToTray = (val) => {
	return{
		type: MINIMIZE_TO_TRAY,
		payload: val
	}
};

export const setMinimizeOnClose = (val) => {
	return{
		type: MINIMIZE_ON_CLOSE,
		payload: val
	}
};

export const setLocationToExport = (val) => {
	return{
		type: LOCATION_TO_EXPORT,
		payload: val
	}
};

export const setFilterOwnAddresses = (val) => {
	return{
		type: FILTER_OWN_ADDRESSES,
		payload: val
	}
};

export const setBackupOperationInProgress = (val) => {
	return{
		type: BACKUP_OPERATION_IN_PROGRESS,
		payload: val
	}
};

export const setIndexingTransactions = (val) => {
	return{
		type: INDEXING_TRANSACTIONS,
		payload: val
	}
};

export const setStakingReward = (val) => {
	return{
		type: STAKING_REWARD,
		payload: val
	}
};

export const setFilterEarningsTime = (val) => {
	return{
		type: FILTER_EARNINGS_TIME,
		payload: val
	}
};

export const setFilterEarningsStaking = () => {
	return{
		type: FILTER_EARNINGS_STAKING
	}
};

export const setFilterEarningsFileStorage = () => {
	return{
		type: FILTER_EARNINGS_FILE_STORAGE
	}
};

export const setFilterEarningsAll = () => {
	return{
		type: FILTER_EARNINGS_ALL
	}
};

export const setFilterEarningsType = (val) => {
	return{
		type: FILTER_EARNINGS_TYPE,
		payload: val
	}
};

export const setFilterExpensesTime = (val) => {
	return{
		type: FILTER_EXPENSES_TIME,
		payload: val
	}
};

export const setFilterExpensesType = (val) => {
	return{
		type: FILTER_EXPENSES_TYPE,
		payload: val
	}
};

export const setImportingPrivateKey = (val) => {
	return{
		type: IMPORTING_PRIVATE_KEY,
		payload: val
	}
};

export const setWasStaking = () => {
	return{
		type: WAS_STAKING
	}
};

export const setNewPassword = (val) => {
	return{
		type: NEW_PASSWORD,
		payload: val
	}
};

export const setCheckingDaemonStatusPrivKey = (val) => {
	return{
		type: CHECKING_DAEMON_STATUS_PRIVKEY,
		payload: val
	}
};

export const setNewsSwitchingPage = (val) => {
	return{
		type: NEWS_SWITCHING_PAGE,
		payload: val
	}
};

export const setUpdateApplication = (val) => {
	return{
		type: UPDATE_APPLICATION,
		payload: val
	}
};

export const setUpdatingApplication = (val) => {
	return{
		type: UPDATING_APP,
		payload: val
	}
};

export const setUpdateAvailable = () => {
	return{
		type: UPDATE_AVAILABLE,
		payload: {guiUpdate: false, daemonUpdate: false}
	}
};

export const setNewsChecked = (val) => {
	return{
		type: NEWS_CHECKED,
		payload: val
	}
};

export const setEarningsChecked = (val) => {
	return{
		type: EARNINGS_CHECKED,
		payload: val
	}
};

export const setUnencryptedWallet = (val) => {
	return{
		type: UNENCRYPTED_WALLET,
		payload: val
	}
};

export const setOperativeSystemNotifications = (val) => {
	return{
		type: OPERATIVE_SYSTEM_NOTIFICATIONS,
		payload: val
	}
};

export const setNewsNotifications = (val) => {
	return{
		type: NEWS_NOTIFICATIONS,
		payload: val
	}
};

export const setStakingNotifications = (val) => {
	return{
		type: STAKING_NOTIFICATIONS,
		payload: val
	}
};

export const setSetupDoneInternal = (val) => {
	return{
		type: SETUP_DONE_INTERNAL,
		payload: val
	}
};

export const setClosingApplication = () => {
	return{
		type: CLOSING_APPLICATION
	}
};

export const setTheme = (val) => {
	return{
		type: SELECTED_THEME,
		payload: val
	}
};

export const setThemeBackup = (val) => {
	return{
		type: SELECTED_THEME_BACKUP,
		payload: val
	}
};

export const setChangedTheme = (val) => {
	return{
		type: CHANGED_THEME,
		payload: val
	}
};

export const setShowingMessageTopBar = (val) => {
	return{
		type: MESSAGING_SHOW_TITLE_TOPBAR,
		payload: val
	}
};

export const setMessagingInputVal = (val) => {
	return{
		type: MESSAGING_INPUT_VAL,
		payload: val
	}
};

export const setImportingWalletWithSetupDone = (val) => {
	return{
		type: IMPORTING_WALLET_SETUP_DONE,
		payload: val
	}
};

export const addNewMessage = (val) => {
	return{
		type: NEW_MESSAGE,
		payload: val
	}
};

export const setShowingChatListOnly = (val) => {
	return{
		type: SHOWING_CHAT_LIST_ONLY,
		payload: val
	}
};

export const setMessageId = (id, address) => {
	return{
		type: MESSAGE_ID,
		payload: {id: id, address:address}
	}
};

export const setInMessaging = (val) => {
	return{
		type: IN_MESSAGING,
		payload: val
	}
}

export const setMessagingEnabled = (val) => {
	return{
		type: MESSAGING_ENABLED,
		payload: val
	}
}

export const setUserCheckedGriffithChat = (val) => {
	return{
		type: USER_CHECKED_GRIFFITH_CHAT,
		payload: val
	}
}

export const setUserHoveredOptionsButton = (val) => {
	return{
		type: USER_HAS_HOVERED_OPTIONS_ICON,
		payload: val
	}
}

export const setUserClickedButton = (val) => {
	return{
		type: USER_HAS_CLICKED_BUTTON,
		payload: {clickType: val}
	}
}

export const setDaemonVersion = (val) => {
  return {
    type: SET_DAEMON_VERSION,
    payload: val
  };
}

export const setTemporaryBalance = (val) => {
  return {
    type: SET_TEMPORARY_BALANCE,
    payload: val
  };
}

export const setActionPopupResult = (val) => {
  return {
    type: ACTION_POPUP_RESULT,
    payload: {flag: val.flag, message: val.message, successful: val.successful}
  };
}

export const setImportWalletTemporary = (val) => {
  return {
    type: IMPORT_WALLET_TEMPORARY,
    payload: val
  };
}

export const setFileDownloadStatus = (val) => {
  return {
    type: FILE_DOWNLOAD_STATUS,
    payload: val
  }
}

export const settellUserUpdateFailed = (val) => {
  return {
    type: TOLD_USER_UPDATE_FAILED,
    payload: val
  }
};

export const setLoading = val => {
  return {
    type: LOADING,
    payload: val
  }
};

export const setPopupLoading = (val) => {
  return {
    type: POPUP_LOADING,
    payload: val
  }
}

export const setNewAddressNamePopup = (val) => {
  return {
    type: NEW_ADDRESS_NAME_POPUP,
    payload: val
  }
}

export const setAddressOrUsernameSend = (val) => {
  return {
    type: ADDRESS_OR_USERNAME_SEND,
    payload: val
  }
}

export const setMultipleAnsAddresses = (val) => {
  return {
    type: MULTIPLE_ANS_ADDRESSES,
    payload: val
  }
}

export const setShowZeroBalance = (val) => {
  return {
    type: SHOW_ZERO_BALANCE,
    payload: val
  }
}

export const setIsFilteringTransactions = (val) => {
  return {
    type: IS_FILTERING_TRANSACTIIONS,
    payload: val
  }
}
export const setTransactionType = (val) => {
  return {
    type: TRANSACTIONS_TYPE,
    payload: val
  }
}

export const setAppendToDebugLog = (val) => {
  return {
    type: ADD_TO_DEBUG_LOG,
    payload: val
  }
}
export const setSelectedCurrency = (val) => {
  return {
    type: SELECTED_CURRENCY,
    payload: val
  }
}

export const setDonationGoals = (val) => {
  return {
    type: DONATION_GOALS,
    payload: val
  }
}

export const setDaemonErrorPopup = (val) => {
  return {
    type: DAEMON_ERROR_POPUP,
    payload: val
  }
}

export const setDaemonError = (val) => {
  return {
    type: DAEMON_ERROR,
    payload: val
  }
}

