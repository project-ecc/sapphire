import React, {Component} from 'react';

const classNames = require('classnames');

class RightSidebar extends Component {
  render() {
    return (
      <div {...this.props} className={classNames('right-sidebar', this.props.className)}>
        { this.props.children }
      </div>
    );
  }
}

export default RightSidebar;
