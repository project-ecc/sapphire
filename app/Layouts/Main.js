import React, { Component } from 'react';
import SubRoute from './../router/SubRoute';
import {connect} from "react-redux";
import * as actions from '../actions';
import Sidebar from './../containers/Sidebar';

class Main extends Component {
  render () {
    const { routes } = this.props

    return (
      <div>
        <Sidebar />
        {routes.map((route, i) => <SubRoute key={i} {...route} />)}
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
