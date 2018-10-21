import React, { Component } from 'react';
import { renderRoutes } from 'react-router-config';
import { Switch } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import {connect} from "react-redux";
import * as actions from '../actions';
import Sidebar from './../containers/Sidebar';

class Main extends Component {
  render () {
    const { route, location } = this.props
    const currentKey = location.pathname.split('/')[1] || '/'
    const timeout = { enter: 150, exit: 250 }

    return (
      <div id="page">
        <Sidebar />
        <div className="container-fluid">
          <TransitionGroup component="main">
            <CSSTransition key={currentKey} timeout={timeout} classNames="pageTransition" appear>
              <Switch location={location}>
                {renderRoutes(route.routes)}
              </Switch>
            </CSSTransition>
          </TransitionGroup>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    theme: state.application.theme
  };
};

export default connect(mapStateToProps, actions)(Main);
