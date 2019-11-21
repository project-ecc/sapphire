import React, {Component} from 'react';
import classnames from 'classnames';

class Footer extends Component {
  render() {
    return (
      <div className={classnames('footer', this.props.className)}>
        <div className={classnames('title', this.props.titleClassName)}>{ this.props.children }</div>
      </div>
    );
  }
}

export default Footer;
