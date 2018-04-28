import React, { Component } from 'react';
import { connect } from 'react-redux';
import renderHTML from 'react-render-html';

import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';

const Tools = require('../../utils/tools');

class ActionResultPopup extends React.Component {
 constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    // this._handleKeyPress = this._handleKeyPress.bind(this);
  }

  _handleKeyPress = (e) => {
   console.log(e);
    if (e.key === 'Enter') {
      this.handleConfirm();
    }
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  componentWillUnmount()
  {
    Tools.showFunctionIcons();
  }

  handleCancel(){
    this.props.setActionPopupResult({flag: false, successful: false, message: ''});
  }

  render() {
     return (
      <div style={{height: "150px"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.successful ? this.props.lang.operationSuccessful.replace('!', '') : this.props.lang.operationFailed }</p>
        {renderHTML(this.props.message)}
      </div>
      );
    }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
  };
};


export default connect(mapStateToProps, actions)(ActionResultPopup);
