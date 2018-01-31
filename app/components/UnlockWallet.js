import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
import Wallet from '../utils/wallet';

const wallet = new Wallet();

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
    const el = this.refs.second;
    TweenMax.set($('.mancha'), {css: {display: "block"}})
    TweenMax.fromTo($('.mancha'), 0.3, {autoAlpha:0}, { autoAlpha:1, ease: Linear.easeNone});
    TweenMax.fromTo(el, 0.3, {css: {top: "-50%", opacity:0}}, {css: {top: "30%", opacity:1}, ease: Linear.easeOut, onComplete: callback});
  }

  componentWillLeave (callback) {
    const el = this.refs.second;
    TweenMax.fromTo($('.mancha'), 0.3, {autoAlpha:1}, { autoAlpha:0, ease: Linear.easeNone});
    TweenMax.fromTo(el, 0.3, {css: {top: "30%", opacity:1}}, {css: {top: "-50%", opacity:0}, ease: Linear.easeIn, onComplete: callback});
  }

  showWrongPassword(){
    TweenMax.to('#wrongPassword', 0.2, {autoAlpha: 1, scale: 1, onComplete: () => {
      setTimeout(() => {
        TweenMax.to('#wrongPassword', 0.2, {autoAlpha: 0, scale: 0.5});
      }, 2000)
    }});
  }

  unlockWallet(){
    var self = this;
     wallet.walletpassphrase(this.props.passwordVal, 3000000).then((data) => {
      console.log("data: ", data)
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
        <p style={{fontSize: "18px", color:"#b4b7c8", paddingTop: "20px"}}>Unlock your wallet</p>
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "20px"}}>This process unlocks your wallet for staking. You will still be required to enter a password to send <span className="ecc">ECC</span>.</p>
        <input className="privateKey" type="password" style={{width: "400px", position: "relative", top: "20px", color:"#b4b7c8", margin: "0 0", marginBottom: "30px"}} value={this.props.passwordVal} onChange={this.handleChange} autoFocus></input>
        <div>
          <p id="wrongPassword" style= {{position: "absolute", width: "100%", color: "#d09128", visibility: "hidden"}}>Wrong password</p>
        </div>
        <div onClick={this.handleCancel} className="buttonUnlock" style={{background: "-webkit-linear-gradient(top, #7f7f7f 0%,#4d4d4d 100%)", color: "#d9daef", bottom: "10px", left:"100px"}}>
          Cancel
        </div>
        <div onClick={this.handleConfirm} className="buttonUnlock" style={{background: "-webkit-linear-gradient(top, rgb(214, 167, 91) 0%, rgb(162, 109, 22) 100%)", color: "#d9daef", bottom: "10px", left:"300px"}}>
          Confirm
        </div>
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