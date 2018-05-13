import React, { Component } from 'react';
import EllipsisLoader from './EllipsisLoader';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import $ from 'jquery';
const Tools = require('../../utils/tools');

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

      const loader = hasLoader ? <EllipsisLoader /> : null;
      const text = hasLoader && this.props.loading ? this.props.textLoading : this.props.text;
      return (
        <div onClick={ this.props.loading ? () => {} : this.props.handleConfirm} id={this.props.buttonId ? this.props.buttonId : "confirmButtonPopup"} className="buttonPrimary" style={this.props.style? this.props.style : {bottom: "10px", left:"205px"}}>
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
