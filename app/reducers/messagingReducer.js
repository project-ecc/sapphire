import {
		MESSAGING_SHOW_TITLE_TOPBAR,
		MESSAGING_INPUT_VAL,
		NEW_MESSAGE,
		MESSAGING_MOBILE_VIEW,
		SHOWING_CHAT_LIST_ONLY,
		MESSAGE_ID,
		IN_MESSAGING,
		MESSAGING_ENABLED,
		USER_CHECKED_GRIFFITH_CHAT,
		USER_HAS_HOVERED_OPTIONS_ICON,
		USER_HAS_CLICKED_BUTTON
} from '../actions/types';


const INITIAL_STATE = {showingTitleTopBar: false, chatsPreview:[], inputValue: "", messages: {}, mobileView: false, selectedId: 1, showingChatListOnly: false, activeContactName: "Sapphire", inMessaging: false, warning:true, enabled: false, userHoveredOptionsIcon: false, userHasCheckedGriffithChat: false, clickedSearchButton: false, clickedBinButton: false, clickedSendEccButton: false, clickedFileButton: false, clickedNotificationsButton: false, clickedSearchInputButton: false, clickAddContactButton: false, clickChatListButton: false, sentMessageAboutFullMessagingMode: false}

export default(state = INITIAL_STATE, action) => {
   	if(action.type == MESSAGING_SHOW_TITLE_TOPBAR){
		return {...state, showingTitleTopBar: action.payload}
	}
	else if(action.type == USER_HAS_CLICKED_BUTTON){
		let clickedSearchButton = state.clickedSearchButton;
		let clickedBinButton = state.clickedBinButton;
		let clickedSendEccButton = state.clickedSendEccButton;
		let clickedFileButton = state.clickedFileButton;
		let clickedNotificationsButton = state.clickedNotificationsButton;
		let clickedSearchInputButton = state.clickedSearchInputButton;
		let clickAddContactButton = state.clickAddContactButton;
		let clickChatListButton = state.clickChatListButton;
		let sentMessageAboutFullMessagingMode = state.sentMessageAboutFullMessagingMode;

		switch(action.payload.clickType){
			case "search": 
				clickedSearchButton = true; break;
			case "bin": 
				clickedBinButton = true; break;
			case "sendEcc": 
				clickedSendEccButton = true; break;
			case "file": 
				clickedFileButton = true; break;
			case "notifications": 
				clickedNotificationsButton = true; break;
			case "searchInput": 
				clickedSearchInputButton = true; break;
			case "add":
				clickAddContactButton = true; break;
			case "chatList":
				clickChatListButton = true; break;
			case "fullMessaging":
				sentMessageAboutFullMessagingMode = true; break;
		}

		return {...state, clickedSearchButton: clickedSearchButton, clickedBinButton: clickedBinButton, clickedSendEccButton: clickedSendEccButton, clickedFileButton: clickedFileButton, clickedNotificationsButton: clickedNotificationsButton, clickedSearchInputButton: clickedSearchInputButton, clickAddContactButton: clickAddContactButton, clickChatListButton: clickChatListButton, sentMessageAboutFullMessagingMode: sentMessageAboutFullMessagingMode}
	}
	else if(action.type == USER_HAS_HOVERED_OPTIONS_ICON){
		return {...state, userHoveredOptionsIcon: action.payload}
	}
	else if(action.type == USER_CHECKED_GRIFFITH_CHAT){
		return {...state, userHasCheckedGriffithChat: action.payload}
	}
	else if(action.type == MESSAGING_ENABLED){
		return {...state, enabled: action.payload}
	}
	else if(action.type == MESSAGE_ID){
		let previews = Object.assign([], state.chatsPreview);
		if(previews.length > 0){
			for(let i = 0; i < previews.length; i++){
				if(previews[i].id == action.payload.id){
					previews[i].seen= true;
					previews[i].active = true;
				}
			}
		}
		return {...state, selectedId: action.payload.id, activeContactName: action.payload.address, chatsPreview: previews}
	}
	else if(action.type == SHOWING_CHAT_LIST_ONLY){
		return {...state, showingChatListOnly: action.payload}
	}
	else if(action.type == MESSAGING_MOBILE_VIEW){
		return {...state, mobileView: action.payload}
	}
	else if(action.type == IN_MESSAGING){
		return {...state, inMessaging: action.payload}
	}
	else if(action.type == NEW_MESSAGE){
		let id = action.payload.id;
		let messages = Object.assign({},state.messages);
		if(!messages[id]){
			messages[id] = [];
		}
		messages[id].push(action.payload.message);

		let previews = Object.assign([], state.chatsPreview);
		let preview = undefined;
		for(let i = 0; i < previews.length; i++){
			if(previews[i].id == id)
				preview = previews[i];
		}
		if(!preview){
			preview = {};
			previews.push(preview);
		}
		preview.address = action.payload.activeContactName;
		preview.id = id;
		if((state.activeContactName == preview.address || previews.length == 0) && state.inMessaging && !state.showingChatListOnly) {
			preview.active = true;
			preview.seen = true;
		}
		else{
			preview.active = false;
			preview.seen = false;
		}

		preview.lastMessage	= action.payload.message.body;
		preview.date = action.payload.message.date;

		return {...state, messages: messages, chatsPreview: previews}
	}
	else if(action.type == MESSAGING_INPUT_VAL){
		return {...state, inputValue: action.payload}
	}

	return state;
}

function sortByDate(array){
	array.sort(function(a, b) {
	    a = new Date(a.dateModified);
	    b = new Date(b.dateModified);
	    return a>b ? -1 : a<b ? 1 : 0;
	});
}