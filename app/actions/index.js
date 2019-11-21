import {ipcRenderer} from 'electron';
import {
  ADD_TO_DEBUG_LOG,
  BACKUP_OPERATION_IN_PROGRESS,
  BLOCK_INDEX_PAYMENT,
  CHAIN_INFO,
  CHANGED_THEME,
  CHECKING_DAEMON_STATUS_PRIVKEY,
  CLOSING_APPLICATION,
  COIN_MARKET_CAP,
  CONTACTS,
  CREATING_ADDRESS,
  DAEMON_CREDENTIALS,
  DAEMON_ERROR,
  DAEMON_ERROR_POPUP,
  DAEMON_RUNNING,
  DONATION_GOALS,
  EARNINGS_CHECKED,
  ECC_POST,
  FILE_DOWNLOAD_STATUS,
  FILTER_EARNINGS_TIME,
  FILTER_EARNINGS_TYPE,
  INDEXING_TRANSACTIONS,
  LOADING,
  LOCATION_TO_EXPORT,
  MINIMIZE_ON_CLOSE,
  MINIMIZE_TO_TRAY,
  NEWS_CHECKED,
  NEWS_NOTIFICATION,
  NEWS_NOTIFICATIONS,
  OPERATIVE_SYSTEM_NOTIFICATIONS,
  PAYMENT_CHAIN_SYNC,
  POPUP_LOADING,
  SELECTED_CURRENCY,
  SELECTED_THEME,
  SELECTED_THEME_BACKUP,
  SET_DAEMON_VERSION,
  SET_LANGUAGE,
  SET_TEMPORARY_BALANCE,
  SHOW_ZERO_BALANCE,
  STAKING,
  STAKING_NOTIFICATIONS,
  STAKING_REWARD,
  START_AT_LOGIN,
  STEP_INITIAL_SETUP,
  TOLD_USER_UPDATE_FAILED,
  TRANSACTIONS_DATA,
  TRANSACTIONS_PAGE,
  TRANSACTIONS_TYPE,
  TRAY,
  UNENCRYPTED_WALLET,
  UPDATE_APPLICATION,
  UPDATE_AVAILABLE,
  UPDATING_APP,
  USER_ADDRESSES,
  WALLET_INFO,
  WALLET_INFO_SEC,
  WAS_STAKING,
  INITIAL_BLOCK_DOWNLOAD,
  BLOCKS_AND_HEADERS,
  SIZE_ON_DISK,
  UPDATE_FAILED_MESSAGE, SERVER_DAEMON_VERSION, LOCAL_DAEMON_VERSION, MINING_INFO, BLOCK_CHAIN_CONNECTED, BETA_MODE,
  INITIAL_SETUP
} from './types';

export const setWalletCredentials = (args) => {
  return {
    type: DAEMON_CREDENTIALS,
    payload: args
  };
};

export const setDaemonRunning = (args) => {
  return {
    type: DAEMON_RUNNING,
    payload: args
  };
};

export const setUpdateFailedMessage = (val) => {
  return {
    type: UPDATE_FAILED_MESSAGE,
    payload: val
  }
};

export const getSetup = () => dispatch => {
  ipcRenderer.send('app:ready');
};

export const setStepInitialSetup = (step) => {
  return {
    type: STEP_INITIAL_SETUP,
    payload: step
  };
};

export const setLang = () => {
  return {
    type: SET_LANGUAGE
  };
};

export const updatePaymentChainSync = (percentage) => {
  return	{
    type: PAYMENT_CHAIN_SYNC,
    payload: percentage
  };
};

export const setInitialBlockDownload = (value) => {
  return {
    type: INITIAL_BLOCK_DOWNLOAD,
    payload: value
  };
};

export const setBlocksAndHeaders = (val) => {
  return {
    type: BLOCKS_AND_HEADERS,
    payload: { blocks: val.blocks, headers: val.headers}
  };
};

export const setSizeOnDisk = (val) => {
  return {
    type : SIZE_ON_DISK,
    payload: val
  }
}

export const updateBlockIndexPayment = (value) => {
  return	{
    type: BLOCK_INDEX_PAYMENT,
    payload: value
  };
};

export const setStaking = (val) => {
  return {
    type: STAKING,
    payload: val
  };
};

export const setTransactionsPage = (val) => {
  return {
    type: TRANSACTIONS_PAGE,
    payload: val
  };
};

export const setTransactionsData = (data, type) => {
  return {
    type: TRANSACTIONS_DATA,
    payload: { data, type }
  };
};

export const setUserAddresses = (val) => {
  return {
    type: USER_ADDRESSES,
    payload: val
  };
};

export const setCreatingAddress = (val) => {
  return {
    type: CREATING_ADDRESS,
    payload: val
  };
};

export const setContacts = (val) => {
  return {
    type: CONTACTS,
    payload: val
  };
};

export const setTray = (val) => {
  return {
    type: TRAY,
    payload: val
  };
};

export const setStartAtLogin = (val) => {
  return {
    type: START_AT_LOGIN,
    payload: val
  };
};

export const setMinimizeToTray = (val) => {
  return {
    type: MINIMIZE_TO_TRAY,
    payload: val
  };
};

export const setMinimizeOnClose = (val) => {
  return {
    type: MINIMIZE_ON_CLOSE,
    payload: val
  };
};

export const setLocationToExport = (val) => {
  return {
    type: LOCATION_TO_EXPORT,
    payload: val
  };
};

export const setBackupOperationInProgress = (val) => {
  return {
    type: BACKUP_OPERATION_IN_PROGRESS,
    payload: val
  };
};

export const setIndexingTransactions = (val) => {
  return {
    type: INDEXING_TRANSACTIONS,
    payload: val
  };
};

export const setStakingReward = (val) => {
  return {
    type: STAKING_REWARD,
    payload: val
  };
};

export const setFilterEarningsTime = (val) => {
  return {
    type: FILTER_EARNINGS_TIME,
    payload: val
  };
};

export const setFilterEarningsStaking = () => {
  return {
    type: FILTER_EARNINGS_STAKING
  };
};

export const setFilterEarningsFileStorage = () => {
  return {
    type: FILTER_EARNINGS_FILE_STORAGE
  };
};

export const setFilterEarningsAll = () => {
  return {
    type: FILTER_EARNINGS_ALL
  };
};

export const setFilterEarningsType = (val) => {
  return {
    type: FILTER_EARNINGS_TYPE,
    payload: val
  };
};

export const setWasStaking = () => {
  return {
    type: WAS_STAKING
  };
};

export const setCheckingDaemonStatusPrivKey = (val) => {
  return {
    type: CHECKING_DAEMON_STATUS_PRIVKEY,
    payload: val
  };
};

export const setUpdateApplication = (val) => {
  return {
    type: UPDATE_APPLICATION,
    payload: val
  };
};

export const setUpdatingApplication = (val) => {
  return {
    type: UPDATING_APP,
    payload: val
  };
};

export const setUpdateAvailable = (val) => {
  return {
    type: UPDATE_AVAILABLE,
    payload: { daemonUpdate: val.daemonUpdate }
  };
};

export const setNewsChecked = (val) => {
  return {
    type: NEWS_CHECKED,
    payload: val
  };
};

export const setEarningsChecked = (val) => {
  return {
    type: EARNINGS_CHECKED,
    payload: val
  };
};

export const setUnencryptedWallet = (val) => {
  return {
    type: UNENCRYPTED_WALLET,
    payload: val
  };
};

export const setOperativeSystemNotifications = (val) => {
  return {
    type: OPERATIVE_SYSTEM_NOTIFICATIONS,
    payload: val
  };
};

export const setNewsNotifications = (val) => {
  return {
    type: NEWS_NOTIFICATIONS,
    payload: val
  };
};

export const setStakingNotifications = (val) => {
  return {
    type: STAKING_NOTIFICATIONS,
    payload: val
  };
};

export const setClosingApplication = () => {
  return {
    type: CLOSING_APPLICATION
  };
};

export const setTheme = (val) => {
  return {
    type: SELECTED_THEME,
    payload: val
  };
};

export const setThemeBackup = (val) => {
  return {
    type: SELECTED_THEME_BACKUP,
    payload: val
  };
};

export const setChangedTheme = (val) => {
  return {
    type: CHANGED_THEME,
    payload: val
  };
};

export const setDaemonVersion = (val) => {
  return {
    type: SET_DAEMON_VERSION,
    payload: val
  };
};

export const setTemporaryBalance = (val) => {
  return {
    type: SET_TEMPORARY_BALANCE,
    payload: val
  };
};

export const setFileDownloadStatus = (val) => {
  return {
    type: FILE_DOWNLOAD_STATUS,
    payload: val
  };
};

export const settellUserUpdateFailed = (val) => {
  return {
    type: TOLD_USER_UPDATE_FAILED,
    payload: val
  };
};

export const setLoading = val => {
  return {
    type: LOADING,
    payload: val
  };
};

export const setPopupLoading = (val) => {
  return {
    type: POPUP_LOADING,
    payload: val
  };
};

export const setShowZeroBalance = (val) => {
  return {
    type: SHOW_ZERO_BALANCE,
    payload: val
  };
};

export const setTransactionType = (val) => {
  return {
    type: TRANSACTIONS_TYPE,
    payload: val
  };
};

export const setAppendToDebugLog = (val) => {
  return {
    type: ADD_TO_DEBUG_LOG,
    payload: val
  };
};
export const setSelectedCurrency = (val) => {
  return {
    type: SELECTED_CURRENCY,
    payload: val
  };
};

export const setDonationGoals = (val) => {
  return {
    type: DONATION_GOALS,
    payload: val
  };
};

export const setDaemonErrorPopup = (val) => {
  return {
    type: DAEMON_ERROR_POPUP,
    payload: val
  };
};

export const setDaemonError = (val) => {
  return {
    type: DAEMON_ERROR,
    payload: val
  };
};

export const walletInfo = (val) => {
  return {
    type: WALLET_INFO,
    payload: { balance: val.balance, newmint: val.newmint, staking: val.stake }
  };
};

export const walletInfoSec = (val) => {
  return {
    type: WALLET_INFO_SEC,
    payload: {
      unconfirmedBalance: val.unconfirmed_balance, immatureBalance: val.immature_balance
    }
  };
};

export const chainInfo = (val) => {
  return {
    type: CHAIN_INFO,
    payload: {
      staking: val.stake, unlocked_until: val.unlocked_until, connections: val.connections, blocks: val.blocks, headers: val.headers
    }
  };
};

export const miningInfo = (val) => {
  return {
    type: MINING_INFO,
    payload: {
      generatepos: val.generatepos
    }
  };
};

export const setEccPosts = (val) => {
  return {
    type: ECC_POST,
    payload: val
  };
};

export const setNewsNotification = (val) => {
  return {
    type: NEWS_NOTIFICATION,
    payload: val
  };
};

export const setBlockChainConnected = (val) => {
  return {
    type: BLOCK_CHAIN_CONNECTED,
    payload: val
  };
};

export const setCoinMarketCapStats = (val) => {
  return {
    type: COIN_MARKET_CAP,
    payload: val
  };
};

export const setServerDaemonVersion = (val) => {
  return {
    type: SERVER_DAEMON_VERSION,
    payload: val
  };
};

export const setLocalDaemonVersion = (val) => {
  return {
    type: LOCAL_DAEMON_VERSION,
    payload: val
  };
};

export const setBetaMode = (val) => {
  return {
    type: BETA_MODE,
    payload: val
  };
};

export const setInitialSetup = (value) => {
  return {
    type: INITIAL_SETUP,
    payload: value
  };
};
