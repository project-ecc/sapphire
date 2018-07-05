import React, { Component } from 'react';
import EllipsisLoader from './EllipsisLoader';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import $ from 'jquery';
const Tools = require('../../utils/tools');
var classNames = require('classnames');

class ConfirmButtonPopup extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps){
    if(!this.props.loading && nextProps.loading){
      Tools.disableInput(this.props.inputId);
    }
    else if(this.props.loading && !nextProps.loading){
      Tools.enableInput(this.props.inputId);
    }
  }

  componentWillUnmount(){
    this.props.setPopupLoading(false);
  }

  render() {
      let hasLoader = true;
      if(this.props.hasLoader === false)
        hasLoader = false;


      var buttonClass = classNames({
        'buttonPrimary': true,
        'buttonPrimary--is-popup-btn': hasLoader
      });

      if(this.props.className){
        buttonClass += " " + this.props.className;
      }

      const loader = hasLoader ? <EllipsisLoader /> : null;
      const text = hasLoader && this.props.loading ? this.props.textLoading : this.props.text;
      return (
        <div onClick={ this.props.loading ? () => {} : this.props.handleConfirm} id={this.props.buttonId ? this.props.buttonId : "confirmButtonPopup"} className={buttonClass}>
          {text}
          {this.props.loading && loader}
        </div>
      );
  }
}

const mapStateToProps = state => {
  return{
    loading: state.application.popupLoading
  };
};


export default connect(mapStateToProps, actions)(ConfirmButtonPopup);
