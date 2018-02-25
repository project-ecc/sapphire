import {
	NOTIFICATIONS_POPUP,
	NEWS_CHECKED,
	EARNINGS_CHECKED,
	NEWS_NOTIFICATION
} from '../actions/types';

import notificationsInfo from '../utils/notificationsInfo';

//I might end up splitting notifications, so that there is a tab specific to messaging, unsure... too many clicks to get to something is also no good.

const INITIAL_STATE = {popupEnabled: false, lastCheckedNews: notificationsInfo.get('info').value().lastCheckedNews, lastCheckedEarnings: notificationsInfo.get('info').value().lastCheckedEarnings, entries: {
	total: 0,
    messaging: {messages: [], date: GetOldDate()}, 
	news: {total: 0, date: GetOldDate()}, 
	earnings: {total: 0, earnings: [], date: GetOldDate()}, 
	payments: {total: 0, payments: []}, 
	warnings: [], 
	update: false
	}
}

export default(state = INITIAL_STATE, action) => {
	if(action.type == NOTIFICATIONS_POPUP){
		return {...state, popupEnabled: action.payload}
	}
	else if(action.type == EARNINGS_CHECKED){
		UpdateNotificationInfo(state.lastCheckedNews, action.payload);
		return {...state, lastCheckedEarnings: action.payload}
	}
	else if(action.type == NEWS_CHECKED){
		let entries = Object.assign({}, state.entries);
		entries["total"] = entries["total"] - entries["news"].total;
		entries["news"].count = 0;
		UpdateNotificationInfo(action.payload, state.lastCheckedEarnings, entries: entries);
		return {...state, lastCheckedNews: action.payload, entries: entries}
	}
	else if(action.type == NEWS_NOTIFICATION){
		let entries = Object.assign({}, state.entries);
		entries["total"] = entries["news"].total+=1;
		entries["news"].count = entries["news"].count+=1;
		if(action.payload > entries["news"].date){
			entries["news"].date = action.payload;
		}
		return {...state, entries: entries}
	}
	return state;
}

function UpdateNotificationInfo(lastCheckedNews, lastCheckedEarnings){
	notificationsInfo.set('info', {lastCheckedNews: lastCheckedNews, lastCheckedEarnings: lastCheckedEarnings, lastCheckedChat: {}}).write();
}


function GetOldDate(){
	return new Date(new Date().setFullYear(2000)).getTime();
}