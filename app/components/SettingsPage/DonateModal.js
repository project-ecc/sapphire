import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';

import $ from 'jquery';

const Tools = require('../../utils/tools');

class DonateModal extends React.Component {
  constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.reset = this.reset.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.animated = false;
  }


  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  componentWillUnmount() {
  }


  showMessage(message){
    $('.Send__message-status').text(message);
    Tools.showTemporaryMessage('.Send__message-status');
    setTimeout(() => {
      $('.Send__message-status').text(this.props.lang.addressCopiedBelow)
    }, 2500)
  }

  reset(){

  }

  handleConfirm(){
    if(this.props.passwordVal === ""){
      this.showWrongPassword();
      return;
    }
    this.sendECC();
  }

  handleCancel(){
    this.props.setSendingECC(false);
  }

  handleClick(val){
    this.props.setUsernameSend(val.Name, "#"+val.Code);
    this.props.setAddressSend(val.Address);
    if(this.animated) return;
    this.animated = true;
    TweenMax.to('#unlockPanel', 0.3, {css:{top: "10%"}})
    TweenMax.to('#unlockPanel', 0.3, {css:{height: "520px"}})
    TweenMax.set('#labels', {css:{display: "block", visibility: "hidden"}, delay: 0.3})
    TweenMax.set('#send_inputs', {css:{display: "block", visibility: "hidden"}, delay: 0.3})
    TweenMax.fromTo('#labels', 0.3, {y: 30}, {y: 0, autoAlpha: 1, delay: 0.3})
    TweenMax.to('#send_inputs', 0.3,  {autoAlpha: 1, delay: 0.5})
  }

  render() {
    if(this.props.selectedGoal == null){
      return null
    }
    return (
      <div ref="second" >
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.confirmTransaction }</p>
        <div id="send_inputs" >
          <Input
            placeholder= { this.props.lang.password }
            inputId="sendPasswordId"
            placeholderId= "password"
            value={this.props.passwordVal}
            handleChange={this.props.setPassword}
            style={{marginTop: "40px", width: "70%"}}
            type="password"
            autoFocus
            onSubmit={this.handleConfirm}
          />
          <div>
            <p id="wrongPassword" className="wrongPassword" style={{marginBottom: "14px"}}>Wrong password</p>
          </div>
          <ConfirmButtonPopup
            inputId={"#sendPasswordId"}
            handleConfirm={this.handleConfirm}
            textLoading={this.props.lang.confirming}
            text={ this.props.lang.confirm }
          />
        </div>
      </div>
    );
  }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,

  };
};


export default connect(mapStateToProps, actions)(DonateModal);
