import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
const Tools = require('../../utils/tools');
import CloseButtonPopup from '../Others/CloseButtonPopup';
import renderHTML from 'react-render-html';

class ActionResultPopup extends React.Component {
 constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    // this._handleKeyPress = this._handleKeyPress.bind(this);
  }

  _handleKeyPress = (e) => {
   console.log(e)
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
    this.props.setActionPopupResult({flag: false, successful: false, message: ''})
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
