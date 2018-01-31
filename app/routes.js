/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/Pages/HomePage';
import AboutPage from './containers/Pages/AboutPage';
import SecurityPage from './containers/Pages/SecurityPage';
import ReceivePage from './containers/Pages/ReceivePage';
import TransactionPage from './containers/Pages/TransactionPage';
import SendPage from './containers/Pages/SendPage';
import SettingsPage from './containers/Pages/SettingsPage';
import ContactsPage from './containers/Pages/ContactsPage';
import NetworkStatsPage from './containers/Pages/NetworkStatsPage';

export default function Routes({route}) {

  return (
    <App route={route}>
      <Switch>
        <Route path="/contacts" component={ContactsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/transaction" component={TransactionPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/receive" component={ReceivePage} />
        <Route path="/send" component={SendPage} />
        <Route path="/security" component={SecurityPage} />
        <Route path="/networkStats" component={NetworkStatsPage} />
        <Route path="/" component={HomePage} />
      </Switch>
    </App>
  );
}
