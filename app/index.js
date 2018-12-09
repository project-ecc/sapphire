import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore } from './store/configureStore';
import './app.global.scss';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';


const store = configureStore({});
render(
  <AppContainer>
    <Provider store={store}>
      <Router>
        <div>
          <Route exact path="/" component={() => <Redirect to="/coin" />} />
          <Root />
        </div>
      </Router>
    </Provider>
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <Provider store={store}>
          <Router>
            <NextRoot store={store} history={history} />
          </Router>
        </Provider>
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
