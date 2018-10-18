import React, { Component } from 'react';
import { renderRoutes } from 'react-router-config';
import {connect} from "react-redux";
import * as actions from '../actions';
import Sidebar from './../containers/Sidebar';

class Main extends Component {
  render () {
    const { route } = this.props

    return (
      <div>
        <Sidebar />
        {renderRoutes(route.routes)}
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
