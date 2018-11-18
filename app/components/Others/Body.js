import React, { Component } from 'react';
import classnames from 'classnames';

class Body extends Component {
  render() {
    const classNames = {
      'body': true,
      ...(this.props.className || {})
    }
    return (
      <div className={classnames('body', this.props.className)}>
        <div className="container-fluid">
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default Body;
