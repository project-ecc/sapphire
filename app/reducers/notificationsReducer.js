import {
  EARNINGS_CHECKED,
  NEWS_CHECKED,
  NEWS_NOTIFICATION,
  NEWS_NOTIFICATIONS,
  OPERATIVE_SYSTEM_NOTIFICATIONS,
  RESET_STAKING_EARNINGS,
  STAKING_NOTIFICATION,
  STAKING_NOTIFICATIONS
} from '../actions/types';

import notificationsInfo from '../utils/notificationsInfo';

// I might end up splitting notifications, so that there is a tab specific to messaging, unsure...
// too many clicks to get to something is also no good.

const INITIAL_STATE = {
  lastCheckedNews: notificationsInfo.get('info').value().lastCheckedNews,
  lastCheckedEarnings: notificationsInfo.get('info').value().lastCheckedEarnings,
  operativeSystemNotificationsEnabled: false,
  newsNotificationsEnabled: false,
  stakingNotificationsEnabled: false,
  entries: {
    total: 0,
    differentKinds: 0,
    last: '',
    messaging: { messages: [], date: GetOldDate() },
    news: { total: 0, date: GetOldDate() },
    stakingEarnings: { total: 0, count: 0, date: GetOldDate() },
	  // ansPayments: {total: 0.00001, firstDueDate: new Date().setDate(31), payments: [{cost:0.00001,
    // dueDate: new Date().setDate(31)}, {cost:0.00010, dueDate: new Date().setDate(28)}]},
    ansPayments: { payments: [] },
    warnings: []
  }
};

export default(state = INITIAL_STATE, action) => {
  if (action.type == OPERATIVE_SYSTEM_NOTIFICATIONS) {
    return { ...state, operativeSystemNotificationsEnabled: action.payload };
  }	else if (action.type == NEWS_NOTIFICATIONS) {
    return { ...state, newsNotificationsEnabled: action.payload };
  }	else if (action.type == STAKING_NOTIFICATIONS) {
    return { ...state, stakingNotificationsEnabled: action.payload };
  }	else if (action.type == EARNINGS_CHECKED) {
    const entries = Object.assign({}, state.entries);
    entries.total -= entries.stakingEarnings.count;
    entries.stakingEarnings.count = 0;
    entries.stakingEarnings.total = 0;
    entries.differentKinds -= 1;
    if (entries.differentKinds < 0) entries.differentKinds = 0;
    if (entries.last == 'earnings') {
      entries.last = 'news';
    }
    UpdateNotificationInfo(state.lastCheckedNews, action.payload);
    return { ...state, lastCheckedEarnings: action.payload, entries };
  }	else if (action.type == NEWS_CHECKED) {
    const entries = Object.assign({}, state.entries);
    if (entries.news.total != 0) {
      const differentKinds = entries.differentKinds;
      entries.total -= entries.news.total;
      entries.news.total = 0;
      entries.differentKinds = differentKinds - 1;
			// there is a bug where it goes negative, this is a temporary fix
      if (entries.differentKinds < 0) entries.differentKinds = 0;
    }

    UpdateNotificationInfo(action.payload, state.lastCheckedEarnings);
    	return { ...state, lastCheckedNews: action.payload, entries };
  }	else if (action.type == NEWS_NOTIFICATION) {
    const entries = Object.assign({}, state.entries);
    if (entries.news.total == 0) {
      entries.differentKinds += 1;
      if (entries.last == '') { entries.last = 'news'; }
    }
    entries.total = entries.total += 1;
    entries.news.total = entries.news.total += 1;
    if (action.payload > entries.news.date) {
      entries.news.date = action.payload;
    }

    return { ...state, entries };
  } else if (action.type == RESET_STAKING_EARNINGS) {
    const entries = Object.assign({}, state.entries);

    if (entries.stakingEarnings.count > 0) {
      const differentKinds = entries.differentKinds;
      entries.differentKinds = differentKinds - 1;
      entries.total -= entries.stakingEarnings.count;
      entries.stakingEarnings.count = 0;
      entries.stakingEarnings.total = 0;
      entries.stakingEarnings.date = GetOldDate();
      entries.last = 'news';
    }
    return { ...state, entries };
  }	else if (action.type == STAKING_NOTIFICATION) {
    const entries = Object.assign({}, state.entries);
    const differentKinds = entries.differentKinds;
    if (entries.stakingEarnings.count == 0) {
      entries.differentKinds = differentKinds + 1;
      if (entries.last == '' || entries.last == 'news') { entries.last = 'earnings'; }
    }
    entries.total += 1;
    entries.stakingEarnings.count = entries.stakingEarnings.count += 1;
    entries.stakingEarnings.total = entries.stakingEarnings.total += action.payload.earnings;
    if (action.payload.date > entries.stakingEarnings.date) {
      entries.stakingEarnings.date = action.payload.date;
    }
    UpdateNotificationInfo(state.lastCheckedNews, action.payload.date);
    return { ...state, entries };
  }
  return state;
};

function UpdateNotificationInfo(lastCheckedNews, lastCheckedEarnings) {
  notificationsInfo.set('info', { lastCheckedNews, lastCheckedEarnings, lastCheckedChat: {} }).write();
}


function GetOldDate() {
  return new Date(new Date().setFullYear(2000)).getTime();
}
