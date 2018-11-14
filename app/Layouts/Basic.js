import React, { Component } from 'react';
import Sections from '../containers/Sections';
import { renderRoutes } from 'react-router-config';

class Basic extends Component {
  render() {
    const { route } = this.props;
    return (
      <div id="page">
        <Sections />
        {renderRoutes(route.routes)}
      </div>
    );
  }
}

export default Basic;
