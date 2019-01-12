import { ipcRenderer } from 'electron';
import {
  LOADING,
  DAEMON_CREDENTIALS,
  APP_READY,
  STEP_INITIAL_SETUP,
  SET_LANGUAGE,
  PAYMENT_CHAIN_SYNC,
  BLOCK_INDEX_PAYMENT,
  BLOCK_INDEX_PAYMENT_PERCENTAGE,
  STAKING,
  AMOUNT_SEND,
  ADDRESS_SEND,
  NAME_SEND,
  TRANSACTIONS_DATA,
  TRANSACTIONS_PAGE,
  CREATING_ADDRESS,
  USER_ADDRESSES,
  CONTACTS,
  TRAY,
  START_AT_LOGIN,
  MINIMIZE_TO_TRAY,
  MINIMIZE_ON_CLOSE,
  LOCATION_TO_EXPORT,
  BACKUP_OPERATION_IN_PROGRESS,
  INDEXING_TRANSACTIONS,
  STAKING_REWARD,
  FILTER_EARNINGS_TIME,
  FILTER_EARNINGS_TYPE,
  WAS_STAKING,
  CHECKING_DAEMON_STATUS_PRIVKEY,
  UPDATE_APPLICATION,
  UPDATING_APP,
  UPDATE_AVAILABLE,
  NEWS_CHECKED,
  EARNINGS_CHECKED,
  UNENCRYPTED_WALLET,
  OPERATIVE_SYSTEM_NOTIFICATIONS,
  NEWS_NOTIFICATIONS,
  STAKING_NOTIFICATIONS,
  CLOSING_APPLICATION,
  SELECTED_THEME,
  SELECTED_THEME_BACKUP,
  CHANGED_THEME,
  HOVERED_SETTINGS_SOCIAL_ICON,
  SET_DAEMON_VERSION,
  SET_TEMPORARY_BALANCE,
  FILE_DOWNLOAD_STATUS,
  TELL_USER_UPDATE_FAILED,
  TOLD_USER_UPDATE_FAILED,
  POPUP_LOADING,
  ADDING_CONTACT,
  SHOW_ZERO_BALANCE,
  IS_FILTERING_TRANSACTIIONS,
  TRANSACTIONS_TYPE,
  ADD_TO_DEBUG_LOG,
  SELECTED_CURRENCY,
  DONATION_GOALS,
  DAEMON_ERROR_POPUP,
  DAEMON_ERROR, WALLET_INFO, WALLET_INFO_SEC, CHAIN_INFO, ECC_POST, NEWS_NOTIFICATION, COIN_MARKET_CAP
} from "./types";
import {validateChecksum} from "../utils/downloader";

export const setWalletCredentials = (args) => {
  return {
    type: DAEMON_CREDENTIALS,
    payload: args
  };
}

export const getSetup = () => dispatch => {
	ipcRenderer.send('app:ready');
};

export const setStepInitialSetup = (step) => {
	return{
		type: STEP_INITIAL_SETUP,
		payload: step
	};
};

export const setLang = () => {
	return{
		type: SET_LANGUAGE
	};
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

export const setStaking = (val) => {
	return{
		type: STAKING,
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

export const setUserAddresses = (val) => {
	return{
		type: USER_ADDRESSES,
		payload: val
	}
};

export const setCreatingAddress = (val) =>{
	return{
		type: CREATING_ADDRESS,
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

export const setWasStaking = () => {
	return{
		type: WAS_STAKING
	}
};

export const setCheckingDaemonStatusPrivKey = (val) => {
	return{
		type: CHECKING_DAEMON_STATUS_PRIVKEY,
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

export const walletInfo = (val) => {
  return {
    type: WALLET_INFO,
    payload: {balance: val.balance, newmint: val.newmint, staking: val.stake}
  };
}

export const walletInfoSec = (val) => {
  return {
    type: WALLET_INFO_SEC,
    payload: {
      unconfirmedBalance: val.unconfirmed_balance, immatureBalance: val.immature_balance
    }
  }
}

export const chainInfo = (val) => {
  return {
    type: CHAIN_INFO,
    payload: {
      staking: val.staking, unlocked_until: val.unlocked_until, connections: val.connections, blocks: val.blocks, headers: val.headers
    }
  };
}

export const setEccPosts = (val) => {
  return {
    type: ECC_POST,
    payload: val
  };
}

export const setNewsNotification = (val) => {
  return {
    type: NEWS_NOTIFICATION,
    payload: val
  };
}

export const setCoinMarketCapStats = (val) => {
  return {
    type: COIN_MARKET_CAP,
    payload: val
  };
}
