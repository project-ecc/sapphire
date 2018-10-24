import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import startupReducer from './startupReducer';
import initialSetupReducer from './initialSetupReducer';
import chainsReducer from './chainsReducer';
import applicationReducer from './applicationReducer';
import earningsExpensesReducer from './earningsExpensesReducer';
import notificationsReducer from './notificationsReducer';
import messagingReducer from './messagingReducer';

const rootReducer = combineReducers({
	startup: startupReducer,
	setup: initialSetupReducer,
	chains: chainsReducer,
	application: applicationReducer,
	earningsExpenses: earningsExpensesReducer,
	notifications: notificationsReducer,
	messaging: messagingReducer,
    router
});

export default rootReducer;
