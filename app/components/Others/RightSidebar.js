import React, { Component } from 'react';

class RightSidebar extends Component {
  render () {
    return (
      <div className="right-sidebar">
        { this.props.children }
      </div>
    );
  }
}

export default RightSidebar;
