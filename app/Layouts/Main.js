import React, { Component } from 'react';
import { renderRoutes } from 'react-router-config';
import { Switch } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import {connect} from "react-redux";
import * as actions from '../actions';
import Sections from '../containers/Sections';

class Main extends Component {
  /* Sidebar content is dynamic */
  sidebar () {
    const Sidebar = this.props.route.sidebar;
    return (
      <Sidebar />
    );
  }

  render () {
    const { route, location } = this.props;
    const currentKey = location.pathname || '/';
    const timeout = { enter: 150, exit: 250 };

    return (
      <div className="d-flex w-100">
        { this.sidebar() }
        <div className="w-100 position-relative" style={{overflow: 'auto'}}>
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
