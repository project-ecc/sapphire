import React, {Component} from 'react';

class CloseButtonPopup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div onClick={this.props.handleClose} className="closeButtonPopup">
        <span>x</span>
      </div>
    );
  }
}

export default CloseButtonPopup;
