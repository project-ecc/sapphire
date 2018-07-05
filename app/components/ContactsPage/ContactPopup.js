import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../../actions';
import PopupBar from '../Others/PopupBar';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';

import $ from 'jquery';

const Tools = require('../../utils/tools');

class ContactPopup extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  componenDidMount(){
    this.hasBackButton = this.props.contactToAdd.multipleAddresses ? true : false;
  }

  componentWillUnmount()
  {

  }

  handleConfirm(){
    this.props.callback();
  }

  handleCancel(){
    this.props.setAddingContact(false);
  }

  getNameOrAddressHtml(){
    console.log(this.props.contactToAdd)
    if(this.props.justName){
      return(
        <div>
        </div>
      )
    }
   else{
      return(
        <div>
        </div>
      )
    }
  }

  render() {
     return (
      <div ref="second" style={{height: "300px"}}>
        <PopupBar title="Add Contact" handleClose={this.handleCancel}/>
        {this.getNameOrAddressHtml()}

          <ConfirmButtonPopup
            inputId={"#sendPasswordId"}
            handleConfirm={this.handleConfirm}
            text="Confirm"
            textLoading={this.props.lang.confirming}
            text={ this.props.lang.confirm }
          />
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    contactToAdd: state.application.contactToAdd
  };
};


export default connect(mapStateToProps, actions)(ContactPopup);
