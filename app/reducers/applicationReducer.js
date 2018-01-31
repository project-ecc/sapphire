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
		BACKUP_OPERATION_COMPLETED
} from '../actions/types';


const INITIAL_STATE = {unlocking: false, password: "", userNameToSend: "", amountSend: "", addressSend: "", sendingEcc: false, transactionsPage: 0, transactionsLastPage: false, transactionsRequesting: false, newAddressName: "", newAddressAccount: "", friends: [], userAddresses: [], creatingAnsAddress: true, selectedAddress: undefined, creatingAddress: false, newContactName: "", newContactAddress:"", hoveredAddress: undefined, settings: false, hideTrayIcon: false, minimizeOnClose: false, minimizeToTray: false, startAtLogin: false, exportingPrivateKeys: false, panelExportPrivateKey: 1, locationToExport: "", filterAllOwnAddresses: true, filterNormalOwnAddresses: false, filterAnsOwnAddresses: false, backupOperationCompleted: false}

export default(state = INITIAL_STATE, action) => {
    if(action.type == UNLOCKING){
		return {...state, unlocking: action.payload}
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
	else if(action.type == BACKUP_OPERATION_COMPLETED){
		return {...state, backupOperationCompleted: action.payload}
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
			return {...state, sendingEcc: action.payload, password: ""}
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
	return state;
}