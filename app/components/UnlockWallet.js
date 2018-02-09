import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
import Wallet from '../utils/wallet';
const tools = require('../utils/tools')
const wallet = new Wallet();
import CloseButtonPopup from './Others/CloseButtonPopup';
import ConfirmButtonPopup from './Others/ConfirmButtonPopup';

class UnlockWallet extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.unlockWallet = this.unlockWallet.bind(this);
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
    tools.animatePopupIn(this.refs.second, callback, "30%");
  }

  componentWillLeave (callback) {
    tools.animatePopupOut(this.refs.second, callback)
  }

  showWrongPassword(){
    tools.showTemporaryMessage('#wrongPassword');
  }

  unlockWallet(){
    tools.updateConfig(1);
    var self = this;
    var batch = [];
    var obj = {
      method: 'reloadconfig', parameters: ["staking"],
      method: 'walletpassphrase', parameters: [this.props.passwordVal, 31556926, true]
    }
    batch.push(obj)

    wallet.command(batch).then((data) => {
      console.log("data: ", data)
      data = data[0];
      if (data !== null && data.code === -14) {
        self.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
        console.log("daemong ain't working mate :(")
      } else if (data === null) {
        self.props.setUnlocking(false);
        setTimeout(() => {
          self.props.setStaking(true);
        }, 300)
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
      this.props.setPassword("");
      return;
    }
    this.unlockWallet();
  }

  handleCancel(){
    this.props.setUnlocking(false);
  }
  
  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="second" id="unlockPanel">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p style={{fontSize: "18px", color:"#b4b7c8", paddingTop: "20px"}}>Unlock your wallet</p>
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "20px"}}>This process unlocks your wallet for staking. You will still be required to enter a password to send <span className="ecc">ECC</span>.</p>
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
    passwordVal: state.application.password
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(UnlockWallet));