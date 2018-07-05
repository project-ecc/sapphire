import React, { Component } from 'react';
import { BackButton } from '../../utils/svgs';

class PopupBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="PopupBar">
        {BackButton("PopupBar__back-button")}
        <p className="PopupBar__title">{this.props.title}</p>
        <span className="PopupBar__close-button" onClick={this.props.handleClose}>x</span>
      </div>
    );
  }
}

export default PopupBar;
