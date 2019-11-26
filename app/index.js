import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {HashRouter as Router, Redirect, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import Root from './App';
import {configureStore} from './store/configureStore';
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
 module.hot.accept();
}
