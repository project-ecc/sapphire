import React, {Component} from 'react';
import classnames from 'classnames';

class Header extends Component {
  render() {
    return (
      <div className={classnames('header', this.props.className)}>
        <div className={classnames('title', this.props.titleClassName)}>{ this.props.children }</div>
      </div>
    );
  }
}

export default Header;
