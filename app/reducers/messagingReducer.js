import {
		MESSAGING_SHOW_TITLE_TOPBAR,
		MESSAGING_INPUT_VAL,
		NEW_MESSAGE,
		MESSAGING_MOBILE_VIEW,
		SHOWING_CHAT_LIST_ONLY,
		MESSAGE_ID,
		IN_MESSAGING
} from '../actions/types';


const INITIAL_STATE = {showingTitleTopBar: false, chatsPreview:[{address: "Sapphire", date: "9:12 PM", lastMessage: "hello! Welcome to the preview of ECC's Secure Messaging service.", seen: false, id: 1, active: false}, {address: "Gustavo Mauricio", date: "3/27/2018", lastMessage: "which hopefully is bug free", seen: true, id: 2, active: false}], inputValue: "", 
	messages: {
		1:[{mine: false, body: "hello! Welcome to the preview of ECC's Secure Messaging service.", date: "16:12"}],
		2:[
		{mine: false, body: "hello!", date: "19:02"},
		{mine: true, body: "hey man, whats up", date: "19:03"},
		{mine: false, body: "eh not much, ecc still 10 sats? :(", date: "19:07"},
		{mine: true, body: "yea feels bad", date: "19:12"},
		{mine: true, body: "could be worse", date: "19:12"},
		{mine: true, body: "what are you doing today?", date: "20:02"},
		{mine: false, body: "looking at bitcoin, u?", date: "20:04"},
		{mine: true, body: "lol unhealty m8", date: "20:05"},
		{mine: true, body: "i'm just coding this kinda neat wallet", date: "20:05"},
		{mine: true, body: "which hopefully is bug free", date: "20:05"},
		]}, 
		mobileView: false, selectedId: 1, showingChatListOnly: false, activeContactName: "Sapphire", inMessaging: false}

export default(state = INITIAL_STATE, action) => {
   	if(action.type == MESSAGING_SHOW_TITLE_TOPBAR){
		return {...state, showingTitleTopBar: action.payload}
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
		let messages = Object.assign({},state.messages);
		messages[action.payload.id].push(action.payload.message);

		let previews = Object.assign([], state.chatsPreview);
		let preview = undefined;
		for(let i = 0; i < previews.length; i++){
			if(previews[i].id == state.selectedId)
				preview = previews[i];
		}
		if(!preview){
			preview = {};
			previews.push(preview);
		}
		preview.address = action.payload.activeContactName;
		if((state.activeContactName == preview.address || previews.length == 0) && state.inMessaging && !state.showingChatListOnly) {
			preview.active = true;
			preview.seen = true;
		}
		else{
			console.log("HERERERERERERER")
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