import {
	HOVERED_SIDEBAR,
	UNHOVERED_SIDEBAR,
	SELECTED_SIDEBAR,
	SIDEBAR_HIDDEN
} from '../actions/types';


const INITIAL_STATE = {
        walletHovered: false,
        overviewHovered: false,
        sendHovered: false,
        addressesHovered: false,
        transactionsHovered: false,
        fileStorageHovered: false,
        customerHovered: false,
        viewFilesHovered: false,
        galleryHovered: false,
        providerHovered: false,
        messagingHovered: false,
        walletSelected: true,
        overviewSelected: true,
        sendSelected: false,
        addressesSelected: false,
        transactionsSelected: false,
        fileStorageSelected: false,
        customerSelected: false,
        viewFilesSelected: false,
        gallerySelected: false,
        providerSelected: false,
        messagingSelected: false,
        contactsSelected: false,
        sidebarHidden: false
}

export default(state = INITIAL_STATE, action) => {
	if(action.type == HOVERED_SIDEBAR){
		switch(action.payload){
			case 'wallet': return {...state, walletHovered: true};
			case 'overview': return {...state, overviewHovered: true};
			case 'send': return {...state, sendHovered: true};
			case 'addresses': return {...state, addressesHovered: true};
			case 'transactions': return {...state, transactionsHovered: true};
			case 'fileStorage': return {...state, fileStorageHovered: true};
			case 'messaging': return {...state, messagingHovered: true};
			case 'contacts': return {...state, contactsHovered: true};
		}
	}
	else if(action.type == SIDEBAR_HIDDEN){
		return {...state, sidebarHidden: action.payload}
	}
	else if(action.type == UNHOVERED_SIDEBAR){
		switch(action.payload){
			case 'wallet': return {...state, walletHovered: false};
			case 'overview': return {...state, overviewHovered: false};
			case 'send': return {...state, sendHovered: false};
			case 'addresses': return {...state, addressesHovered: false};
			case 'transactions': return {...state, transactionsHovered: false};
			case 'fileStorage': return {...state, fileStorageHovered: false};
			case 'messaging': return {...state, messagingHovered: false};
			case 'contacts': return {...state, contactsHovered: false};
		}
	}
	else if(action.type == SELECTED_SIDEBAR){
		const reset = {
	        walletSelected: false,
	        overviewSelected: false,
	        sendSelected: false,
	        addressesSelected: false,
	        transactionsSelected: false,
	        fileStorageSelected: false,
	        customerSelected: false,
	        viewFilesSelected: false,
	        gallerySelected: false,
	        providerSelected: false,
	        messagingSelected: false,
	        contactsSelected: false
		};

		switch(action.payload){

			case 'wallet': 

			const overviewSelected = true;
			if(state.sendSelected || state.addressesSelected || state.transactionsSelected)
				overviewSelected = false;

			return {...state, 	        
		        sendSelected: false,
		        addressesSelected: false,
		        transactionsSelected: false,
		        fileStorageSelected: false,
		        customerSelected: false,
		        viewFilesSelected: false,
		        gallerySelected: false,
		        providerSelected: false,
		        messagingSelected: false,
		        contactsSelected: false, 
		        walletSelected: true, 
	        	overviewSelected: overviewSelected
	    	};
			case 'overview': return {...state, 		        
				sendSelected: false,
		        addressesSelected: false,
		        transactionsSelected: false,
		        fileStorageSelected: false,
		        customerSelected: false,
		        viewFilesSelected: false,
		        gallerySelected: false,
		        providerSelected: false,
		        messagingSelected: false,
		        contactsSelected: false,
		        walletSelected: true, 
		        overviewSelected: true
		     };
			case 'send': return {...state, 		        
				sendSelected: true,
		        addressesSelected: false,
		        transactionsSelected: false,
		        fileStorageSelected: false,
		        customerSelected: false,
		        viewFilesSelected: false,
		        gallerySelected: false,
		        providerSelected: false,
		        messagingSelected: false,
		        contactsSelected: false,
		        walletSelected: true, 
		        overviewSelected: false
		    };
			case 'addresses': return {...state, 
			    sendSelected: false,
		        transactionsSelected: false,
		        fileStorageSelected: false,
		        customerSelected: false,
		        viewFilesSelected: false,
		        gallerySelected: false,
		        providerSelected: false,
		        messagingSelected: false,
		        contactsSelected: false,
		        walletSelected: true, 
		        addressesSelected: true,
		        overviewSelected: false
		    };
			case 'transactions': return {...state, 		       
				sendSelected: false,
		        addressesSelected: false,
		        fileStorageSelected: false,
		        customerSelected: false,
		        viewFilesSelected: false,
		        gallerySelected: false,
		        providerSelected: false,
		        messagingSelected: false,
		        contactsSelected: false,
		        walletSelected: true, 
		        transactionsSelected: true,
		        overviewSelected: false
		    };
			case 'fileStorage': return {...state, 		        
				sendSelected: false,
		        addressesSelected: false,
		        transactionsSelected: false,
		        customerSelected: false,
		        viewFilesSelected: false,
		        gallerySelected: false,
		        providerSelected: false,
		        messagingSelected: false,
		        contactsSelected: false,
		        fileStorageSelected: true,
		        walletSelected: false, 
		    };
			case 'messaging': return {...state, 		        
				sendSelected: false,
		        addressesSelected: false,
		        transactionsSelected: false,
		        fileStorageSelected: false,
		        customerSelected: false,
		        viewFilesSelected: false,
		        gallerySelected: false,
		        providerSelected: false,
		        contactsSelected: false,
		        messagingSelected: true,
		        walletSelected: false,
		        overviewSelected: false
		    };
			case 'contacts': return {...state, 		        
				sendSelected: false,
		        addressesSelected: false,
		        transactionsSelected: false,
		        fileStorageSelected: false,
		        customerSelected: false,
		        viewFilesSelected: false,
		        gallerySelected: false,
		        providerSelected: false,
		        messagingSelected: false,
		        contactsSelected: true,
		        walletSelected: false,
		        overviewSelected: false
		    };
		}
	}
	return state;
}