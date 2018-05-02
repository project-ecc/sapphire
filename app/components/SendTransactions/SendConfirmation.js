import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';

import $ from 'jquery';

const Tools = require('../../utils/tools');

class SendConfirmation extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.sendECC = this.sendECC.bind(this);
    this.getNameOrAddressHtml = this.getNameOrAddressHtml.bind(this);
    this.reset = this.reset.bind(this);
    this.showMessage = this.showMessage.bind(this);
  }

  showWrongPassword(){
    Tools.showTemporaryMessage('#wrongPassword');
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  componentWillUnmount()
  {
    Tools.showFunctionIcons();
  }

  sendECC(){
    let wasStaking = this.props.staking;
    this.props.setPopupLoading(true)
    this.unlockWallet(false, 5, () => {
      var batch = [];
      console.log(this.props.amount);
      var obj = {
        method: 'sendToAddress', parameters: [this.props.address, this.props.amount]
      };
      batch.push(obj);
      this.props.wallet.command(batch).then((data) => {
        if(data && data[0] && typeof data[0] === 'string'){
          if(wasStaking){
              this.unlockWallet(true, 31556926, () => {
             });
          }
          else{
            this.props.setStaking(false);
          }
          this.reset();
          this.props.setTemporaryBalance(this.props.balance - this.props.amount);
          this.showMessage(this.props.lang.sentSuccessfully);
        }
        else{
          this.showMessage(this.props.lang.failedToSend);
          this.reset();
        }
      }).catch((err) => {
        this.showMessage(this.props.lang.failedToSend);
        this.reset();
      });
    })
  }

  showMessage(message){
    $('#message').text(message);
    Tools.showTemporaryMessage('#message');
    setTimeout(() => {
      $('#message').text(this.props.lang.addressCopiedBelow)
    }, 2500)
  }

  reset(){
    this.props.setPopupLoading(false)
    this.props.setPassword("");
    this.props.setSendingECC(false);
    this.props.setUsernameSend("");
    this.props.setAmountSend("");
    this.props.setAddressSend("");
    TweenMax.set('#amountSend', {autoAlpha: 1});
    TweenMax.set('#addressSend', {autoAlpha: 1});
  }

  unlockWallet(flag, time, callback){
    var batch = [];
    var obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      console.log("data: ", data);
      data = data[0];
      if (data !== null && data.code === -14) {
        this.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
          console.log("Daemon not running - Dev please look into this and what exactly triggered it");
      } else if (data === null) {
          callback();
          return;
      } else {
        console.log("error unlocking wallet: ", data)
      }
      this.props.setPopupLoading(false)
    }).catch((err) => {
      this.props.setPopupLoading(false)
      console.log("err unlocking wallet: ", err);
    });
  }

  handleChange(event) {
    const pw = event.target.value;
    if(pw.length === 0)
      TweenMax.set('#password', {autoAlpha: 1});
    else
      TweenMax.set('#password', {autoAlpha: 0});

    this.props.setPassword(pw);
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

  getNameOrAddressHtml(){
    if(this.props.username !== "" && this.props.username !== undefined){
      return(
        <div>
          <p className="labelSend">{ this.props.lang.name }: {this.props.username} </p>
          <p className="labelAddressSend">({this.props.address})</p>
        </div>
      )
    }else{
      return(
        <div>
          <p className="labelSend">{ this.props.lang.address }: <span style={{fontSize:"14px"}}>{this.props.address}</span> </p>
        </div>
      )
    }
  }

  render() {
     return (
      <div ref="second" style={{height: this.props.username !== "" && this.props.username !== undefined ? "324px" : "293px", top: "22%"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.confirmTransaction }</p>
        <p className="labelAmountSend">{ this.props.lang.amount }: {Tools.formatNumber(Number(this.props.amount))} <span className="ecc">ECC</span></p>
        {this.getNameOrAddressHtml()}
          <Input
            divStyle={{width: "400px", marginTop: "20px"}}
            placeholder= { this.props.lang.password }
            inputId="sendPasswordId"
            placeholderId= "password"
            placeHolderClassName="inputPlaceholder inputPlaceholderUnlock"
            value={this.props.passwordVal}
            handleChange={this.handleChange.bind(this)}
            type="password"
            inputStyle={{width: "400px", top: "20px", marginBottom: "30px"}}
            autoFocus={true}
          />
        <div>
          <p id="wrongPassword" className="wrongPassword">Wrong password</p>
        </div>
        <ConfirmButtonPopup inputId={"#sendPasswordId"} handleConfirm={this.handleConfirm} text="Confirm" textLoading={this.props.lang.confirming} text={ this.props.lang.confirm }/>
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    amount: state.application.amountSend,
    address: state.application.addressSend,
    username: state.application.userNameToSend,
    staking: state.chains.isStaking,
    wallet: state.application.wallet,
    balance: state.chains.balance
  };
};


export default connect(mapStateToProps, actions)(SendConfirmation);
