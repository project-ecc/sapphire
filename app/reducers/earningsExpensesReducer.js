import {
	FILTER_EARNINGS_TIME,
	FILTER_EARNINGS_TYPE,
	FILTER_EXPENSES_TYPE,
	FILTER_EXPENSES_TIME
} from '../actions/types';


const INITIAL_STATE = {allEarningsSelected: true, fileStorageEarningsSelected: false, stakingEarningsSelected: false, weekEarningsSelected: false, monthEarningsSelected: false, allTimeEarningsSelected: true, fileStorageExpensesSelected: false, messagingExpensesSelected: false, ansExpensesSelected: false, allExpensesSelected: false, weekExpenseseSelected: false, monthExpenseseSelected: false, allTimeExpensesSelected: true};

export default(state = INITIAL_STATE, action) => {
 if(action.type == FILTER_EXPENSES_TYPE){
		var fileStorage = false;
		var messaging = false;
		var all = false;
		var ans = false;
		switch(action.payload){
			case "fileStorage":
				fileStorage = true;
				break;
			case "messaging":
				messaging = true;
				break;
			case "ans":
				ans = true;
				break;
			case "all":
				all = true;
				break;
		}
		return{...state, fileStorageExpensesSelected: fileStorage, messagingExpensesSelected: messaging, ansExpensesSelected: ans, allExpensesSelected: all}
	}
	else if(action.type == FILTER_EXPENSES_TIME){
		var week = false;
		var month = false;
		var allTime = false;
		switch(action.payload){
			case "week":
				week = true;
				break;
			case "month":
				month = true;
				break;
			case "allTime":
				allTime = true;
				break;
		}
		return{...state, weekExpensesSelected: week, monthExpensesSelected: month, allTimeExpensesSelected: allTime}
	}
	else if(action.type == FILTER_EARNINGS_TYPE){
		var fileStorage = false;
		var staking = false;
		var all = false;
		switch(action.payload){
			case "fileStorage":
				fileStorage = true;
				break;
			case "staking":
				staking = true;
				break;
			case "all":
				all = true;
				break;
		}
		return{...state, fileStorageEarningsSelected: fileStorage, stakingEarningsSelected: staking, allEarningsSelected: all}
	}
	else if(action.type == FILTER_EARNINGS_TIME){
		console.log(action.payload);
		var week = false;
		var month = false;
		var allTime = false;
		switch(action.payload){
			case "week":
				week = true;
				break;
			case "month":
				month = true;
				break;
			case "allTime":
				allTime = true;
				break;
		}
		return{...state, weekEarningsSelected: week, monthEarningsSelected: month, allTimeEarningsSelected: allTime}
	}
	return state;
}
