import React, { Component } from 'react';

class ConfirmButtonPopup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
      return (
        <div onClick={this.props.handleConfirm} id={this.props.buttonId ? this.props.buttonId : "confirmButtonPopup"} className="buttonPrimary" style={this.props.style? this.props.style : {bottom: "10px", left:"205px"}}>
          {this.props.text}
        </div>
      );
  }
}

export default ConfirmButtonPopup;
