import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
const tools = require('../../utils/tools')
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';

class SendConfirmation extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.sendECC = this.sendECC.bind(this);
    this.getNameOrAddressHtml = this.getNameOrAddressHtml.bind(this);
  }
  
 componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {

  }
  
  componentWillEnter (callback) {
    callback();
  }
  
  componentDidEnter(callback) {
    tools.animatePopupIn(this.refs.second, callback, "22%");
  }

  componentWillLeave (callback) {
    tools.animatePopupOut(this.refs.second, callback)
  }

  showWrongPassword(){
    tools.showTemporaryMessage('#wrongPassword');
  }

  sendECC(){
    var self = this;
    var wasStaking = this.props.staking;
    this.unlockWallet(false, 5, () => {
      var batch = [];
      console.log(self.props.amount)
      var obj = {
        method: 'sendToAddress', parameters: [self.props.address, self.props.amount]
      }
      batch.push(obj)
      this.props.wallet.command(batch).then((data) => {
        if(wasStaking){
            self.unlockWallet(true, 31556926, () => {
           });
        }
        else{ 
          self.props.setStaking(false);
        }
        self.props.setPassword("");
        self.props.setSendingECC(false);
        self.props.setUsernameSend("");
        self.props.setAmountSend("");
        self.props.setAddressSend("");
        self.props.showMessage("Sent successfully!")
      }).catch((err) => {
        this.props.setPassword("");
        console.log("err sending ecc: ", err);
      });
    })
    
  }

  unlockWallet(flag, time, callback){
    var self = this;
    var batch = [];
    var obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    }
    batch.push(obj)

    this.props.wallet.command(batch).then((data) => {
      console.log("data: ", data)
      data = data[0];
      if (data !== null && data.code === -14) {
        self.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
          console.log("daemong ain't working mate :(")
      } else if (data === null) {
          callback();
      } else {
        console.log("error unlocking wallet: ", data)
      }
    }).catch((err) => {
      console.log("err unlocking wallet: ", err);
    });
  }
  
  componentDidLeave(callback) {
  }  

  componentDidMount(){
    $(document).keypress(function(e) {
      if(e.which == 13) {
          console.log("enter pressed")
      }
    });
  }

  handleChange(event) {
    this.props.setPassword(event.target.value);
  }

  handleConfirm(){
    if(this.props.passwordVal == ""){
      this.showWrongPassword();
      return;
    }
    this.sendECC();
  }

  handleCancel(){
    this.props.setSendingECC(false);
  }

  getNameOrAddressHtml(){
    if(this.props.username != "" && this.props.username != undefined){
      return(
        <div>
          <p className="labelSend">Name: {this.props.username} </p>
          <p className="labelAddressSend">({this.props.address})</p>
        </div>
      )
    }else{
      return(
        <div>
          <p className="labelSend">Address: <span style={{fontSize:"14px"}}>{this.props.address}</span> </p>
        </div>
      )
    }
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="second" id="unlockPanel" style={{height: this.props.username != "" && this.props.username != undefined ? "350px" : "318px", top: "22%"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">Confirm transaction</p>
        <p className="labelAmountSend">Amount: {tools.formatNumber(Number(this.props.amount))} <span className="ecc">ECC</span></p>
        {this.getNameOrAddressHtml()}
        <p id="pleaseTypePassword">Please type your password</p>
        <input className="inputCustom inputSend" type="password" value={this.props.passwordVal} onChange={this.handleChange} autoFocus></input>
        <div>
          <p id="wrongPassword" className="wrongPassword">Wrong password</p>
        </div>
        <ConfirmButtonPopup handleConfirm={this.handleConfirm} text="Confirm"/>
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    amount: state.application.amountSend,
    address: state.application.addressSend,
    username: state.application.userNameToSend,
    staking: state.chains.staking,
    wallet: state.application.wallet
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(SendConfirmation));