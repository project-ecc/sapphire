import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
import Wallet from '../../utils/wallet';
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
    this.wallet = new Wallet();
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
      this.wallet.command(batch).then((data) => {
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

    this.wallet.command(batch).then((data) => {
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
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "10px"}}>Name: {this.props.username} </p>
        <p style={{color: "#555d77", fontSize: "14px", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "10px", fontWeight:"600"}}>({this.props.address})</p>
        </div>
      )
    }else{
      return(
        <div>
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "10px"}}>Address: <span style={{fontSize:"14px"}}>{this.props.address}</span> </p>
        </div>
      )
    }
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="second" id="unlockPanel" style={{height: "350px", top: "22%"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p style={{fontSize: "18px", color:"#b4b7c8", paddingTop: "20px"}}>Confirm transaction</p>
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "25px"}}>Amount: {tools.formatNumber(Number(this.props.amount))} <span className="ecc">ECC</span></p>
        {this.getNameOrAddressHtml()}
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "center", margin: "0 auto", paddingTop: "25px"}}>Please type your password</p>
        <input className="privateKey" type="password" style={{width: "400px", position: "relative", top: "20px", color:"#b4b7c8", margin: "0 0", marginBottom: "30px"}} value={this.props.passwordVal} onChange={this.handleChange} autoFocus></input>
        <div>
          <p id="wrongPassword" style= {{position: "absolute", width: "100%", color: "#d09128", visibility: "hidden"}}>Wrong password</p>
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
    staking: state.chains.staking
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(SendConfirmation));