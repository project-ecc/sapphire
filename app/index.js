import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import Root from './App';
import { configureStore } from './store/configureStore';
import './app.global.scss';

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
  module.hot.accept('./App', () => {
    const NextRoot = require('./App'); // eslint-disable-line global-require
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
