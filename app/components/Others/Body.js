import React, {Component} from 'react';
import classnames from 'classnames';

class Body extends Component {
  render() {
    return (
      <div className={classnames('body', this.props.className)}>
        <div className={`container-fluid ${this.props.noPadding ? 'pl-0 pr-0' : ''}`}>
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default Body;
