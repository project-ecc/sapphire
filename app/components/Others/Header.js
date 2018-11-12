import React, { Component } from 'react';

class Header extends Component {
  render () {
    return (
      <div className="header">
        <div className="title">{ this.props.children }</div>
      </div>
    );
  }
}

export default Header;
