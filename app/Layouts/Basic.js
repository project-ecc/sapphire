import React, {Component} from 'react';
import Sections from './partials/Sections';
import {renderRoutes} from 'react-router-config';

class Basic extends Component {
  render() {
    const { route } = this.props;
    return (
      <div id="page">
        <Sections />
        <div>
          {renderRoutes(route.routes)}
        </div>
      </div>
    );
  }
}

export default Basic;
