import React, { Component } from 'react';
import { renderRoutes } from 'react-router-config';

class Settings extends Component {
  render() {
    const { route } = this.props

    return (
      <div>
        {renderRoutes(route.routes)}
      </div>
    );
  }
}

export default Settings;
