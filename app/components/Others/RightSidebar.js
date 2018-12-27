import React, { Component } from 'react';

class RightSidebar extends Component {
  render () {
    return (
      <div {...this.props} className="right-sidebar">
        { this.props.children }
      </div>
    );
  }
}

export default RightSidebar;
