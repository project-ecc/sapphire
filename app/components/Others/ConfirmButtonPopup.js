import React, { Component } from 'react';

class ConfirmButtonPopup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div onClick={this.props.handleConfirm} id="confirmButtonPopup" className="buttonUnlock" style={{background: "-webkit-linear-gradient(top, rgb(214, 167, 91) 0%, rgb(162, 109, 22) 100%)", color: "#d9daef", bottom: "10px", left:"205px"}}>
        {this.props.text}
      </div>
    );
  }
}

export default ConfirmButtonPopup;
