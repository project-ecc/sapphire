import {combineReducers} from 'redux';
import startupReducer from './startupReducer';
import initialSetupReducer from './initialSetupReducer';
import chainsReducer from './chainsReducer';
import applicationReducer from './applicationReducer';
import earningsExpensesReducer from './earningsExpensesReducer';
import notificationsReducer from './notificationsReducer';

const rootReducer = combineReducers({
	startup: startupReducer,
	setup: initialSetupReducer,
	chains: chainsReducer,
	application: applicationReducer,
	earningsExpenses: earningsExpensesReducer,
	notifications: notificationsReducer
});

export default rootReducer;
