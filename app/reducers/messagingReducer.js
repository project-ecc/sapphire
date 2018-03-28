import {
		MESSAGING_SHOW_TITLE_TOPBAR,
		MESSAGING_INPUT_VAL
} from '../actions/types';


const INITIAL_STATE = {showingTitleTopBar: false, chatsPreview:[{address: "John", date: "9:12 PM", lastMessage: "uh yes, it is that good...", seen: false, id: 1, active: false}, {address: "Gustavo Mauricio", date: "3/27/2018", lastMessage: "ecc is dope! so they say", seen: true, id: 2, active: true}, {address: "Marta", date: "7/02/2018", lastMessage: "what a great that today", seen: true, id: 3, active: false}, {address: "Mariana", date: "8/10/2018", lastMessage: "morning!", seen: true, id: 4, active: false}], inputValue: ""}

export default(state = INITIAL_STATE, action) => {
   	if(action.type == MESSAGING_SHOW_TITLE_TOPBAR){
		return {...state, showingTitleTopBar: action.payload}
	}
	else if(action.type == MESSAGING_INPUT_VAL){
		return {...state, inputValue: action.payload}
	}

	return state;
}