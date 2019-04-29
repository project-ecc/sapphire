import React, {Component} from 'react';
import classNames from 'classnames';

class Dot extends Component {
  render() {
    const color = this.props.color || 'primary';
    const size = this.props.size || 14;

    return (
      <div className={classNames(`bg-${color}`, 'dot', this.props.className)} style={{ width: `${size}px`, height: `${size}px` }} />
    );
  }
}

export default Dot;
