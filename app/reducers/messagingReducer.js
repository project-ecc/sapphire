import {
		MESSAGING_SHOW_TITLE_TOPBAR,
		MESSAGING_INPUT_VAL,
		NEW_MESSAGE,
		MESSAGING_MOBILE_VIEW,
		SHOWING_CHAT_LIST
} from '../actions/types';


const INITIAL_STATE = {showingTitleTopBar: false, chatsPreview:[{address: "Sapphire", date: "9:12 PM", lastMessage: "uh yes, it is that good...", seen: false, id: 1, active: false}, {address: "Gustavo Mauricio", date: "3/27/2018", lastMessage: "ecc is dope! so they say", seen: true, id: 2, active: true}, {address: "Marta", date: "7/02/2018", lastMessage: "what a great that today", seen: true, id: 3, active: false}, {address: "Mariana", date: "8/10/2018", lastMessage: "morning!", seen: true, id: 4, active: false}], inputValue: "", 
	messages: {2:[
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
		]}, mobileView: false, selectedId: 1, showingChatList: true, activeContactName: "Sapphire"}

export default(state = INITIAL_STATE, action) => {
   	if(action.type == MESSAGING_SHOW_TITLE_TOPBAR){
		return {...state, showingTitleTopBar: action.payload}
	}
	else if(action.type == SHOWING_CHAT_LIST){
		return {...state, showingChatList: action.payload}
	}
	else if(action.type == MESSAGING_MOBILE_VIEW){
		return {...state, mobileView: action.payload}
	}
	else if(action.type == NEW_MESSAGE){
		let messages = Object.assign({},state.messages);
		messages[action.payload.id].push(action.payload.message);

		let previews = Object.assign([], state.chatsPreview);
		previews[1].lastMessage	= action.payload.message.body;
		previews[1].date = action.payload.message.date;

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