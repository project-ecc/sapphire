import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import Wallet from '../../utils/wallet';

class EncryptWallet extends React.Component {
 constructor() {
    super();
    this.wallet = new Wallet();
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmationPassword = this.handleConfirmationPassword.bind(this);
    this.checkIfEncrypted = this.checkIfEncrypted.bind(this);
    this.showEncryptWallet = this.showEncryptWallet.bind(this);
    this.showWalletEncrypted = this.showWalletEncrypted.bind(this);
    this.encryptWallet = this.encryptWallet.bind(this);
    this.startWallet = this.startWallet.bind(this);
  }
  
 componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {
  }
  
  componentWillEnter (callback) {
    const el = this.refs.second;
    TweenMax.set(el, {willChange: "transform, opacity"});
    TweenMax.fromTo(el, 0.3, {x: 600, opacity: 0}, {x: 0, opacity:1,ease: Linear.easeNone, onComplete: callback});
    if(this.props.checkEncrypted){
      TweenMax.set('#encryptWallet', {autoAlpha: 0});
      TweenMax.set('#checkingWallet', {autoAlpha: 1});
    }
    this.props.isEncrypting(true);
  }
  
  checkIfEncrypted(){
    this.wallet.help().then((data) => {
      if (data.indexOf('walletlock') > -1) {
        this.showWalletEncrypted();
        } else {
        this.showEncryptWallet();
        }
      }).catch((err) => {
      console.log("error checking if encrypted: ", err)
      var self = this;
      setTimeout(function(){
        self.checkIfEncrypted();
      }, 1000);
    });
  }

  showEncryptWallet(){
    this.props.isEncrypting(true);
    TweenMax.to('#checkingWallet', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#encryptWallet', 0.2, {autoAlpha: 1, scale: 1});
  }

  showWalletEncrypted(){
    this.props.isEncrypting(false);
    TweenMax.to('#checkingWallet', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#encrypting', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#walletEncrypted', 0.2, {autoAlpha: 1, scale: 1});
  }

  showEncryptingWallet(){
    this.props.isEncrypting(true);
    TweenMax.to('#encryptWallet', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#encrypting', 0.2, {autoAlpha: 1, scale: 1});
  }

  componentDidEnter() {
  }

  componentWillLeave (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.3, {x: 0, opacity: 1}, {x: -600, opacity: 0, ease: Linear.easeNone, onComplete: callback});
  }
  
  componentDidLeave(callback) {
  }

  componentWillMount(){
    if(this.props.checkEncrypted){
      var self = this;
      setTimeout(() => {
        self.checkIfEncrypted();
      }, 2000);
    }
  }

  handlePasswordChange(event){
      let pw = event.target.value;
    if(pw.length == 0){
      TweenMax.set('#enterPassword', {autoAlpha: 1});
    }
    else 
      TweenMax.set('#enterPassword', {autoAlpha: 0});

    this.props.password(pw);
  }

  handleConfirmationPassword(event){
    let pw = event.target.value;
    if(pw.length == 0){
      TweenMax.set('#enterPasswordRepeat', {autoAlpha: 1});
    }
    else 
      TweenMax.set('#enterPasswordRepeat', {autoAlpha: 0});

    this.props.passwordConfirmation(pw);
  }

  encryptWallet(){
    if(this.props.passwordValue != this.props.passwordConfirmationValue || (this.props.passwordValue.length == 0)){
      TweenMax.fromTo('#passwordError', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1.2});
      TweenMax.to('#passwordError', 0.3, {scale: 1, delay: 0.2});
      TweenMax.to('#passwordError', 0.3, {autoAlpha: 0, scale: 0.5, delay: 3.5});
      return;
    }
    this.showEncryptingWallet();
    this.wallet.encryptWallet(this.props.passwordValue).then((data) =>{
      if (data.code === -1 || data.code === -28) {
        console.log("failed to encrypt: ", data)
        var self = this;
        setTimeout(function(){
          self.encryptWallet();
        }, 1000);
      } 
      else {
        this.showWalletEncrypted();
        var self = this;
        setTimeout(function(){
            self.startWallet();
        }, 5000)
        console.log("encrypted! ", data)
      }
      }).catch((err) => {
        console.log("error encrypting wallet: ", err)
    });
  }

  startWallet(){
    this.wallet.walletstart((result) => {
      if (result) {
        console.log("started daemon")
      }
      else console.log("ERROR ", result)
    });
  }

  toRender(){
    return (
      <div>
        <div id="checkingWallet">
          <p style={{fontWeight:"300"}} className="centerText">
           Checking if your wallet is encrypted...
           </p>
        </div>
        <div id="walletEncrypted">
          <p className="centerText" style={{width: "500px", left: "50%", marginLeft: "-250px", fontWeight:"300"}}>
           Your wallet is encrypted, well done!<br></br>Please write down the password somewhere as there is no way to recover it.
           </p>
        </div>
        <div id="encrypting">
          <p style={{fontWeight:"300"}}  className="centerText">
           Encrypting your wallet...
           </p>
        </div>
        <div id="encryptWallet">
          <p style={{fontWeight:"300"}}  className="subTitle">
          Encrypt your wallet
          </p>

          <div style={{position:"relative", width:"300px", margin:"0 auto"}}>
            <p id="enterPassword" style={{position:"absolute",top: "2px", width: "300px", textAlign: "center", color: "#555d77", fontSize: "15px", fontWeight: "600", zIndex:"-1"}}>Enter Password</p>
            <input className="privateKey passwordInput" style={{color: "#555d77", fontSize: "15px", fontWeight: "600"}} type="text" value={this.props.passwordValue} onChange={this.handlePasswordChange}></input>
          </div>
          <div style={{position:"relative", width:"300px", margin:"0 auto"}}>
            <p id="enterPasswordRepeat" style={{position:"absolute",top: "2px", width: "300px", textAlign: "center", color: "#555d77", fontSize: "15px", fontWeight: "600", zIndex:"-1"}}>Repeat Password</p>
            <input className="privateKey passwordInput" style={{marginBottom: "10px", color: "#555d77", fontSize: "15px", fontWeight: "600"}} type="text" value={this.props.passwordConfirmationValue} onChange={this.handleConfirmationPassword}></input>
          </div>
          <p id="passwordError" style={{fontSize: "15px", fontWeight: "bold", color: "#d09128", visibility: "hidden"}}>{this.props.passwordValue != this.props.passwordConfirmationValue ? "passwords do not match" : "password can't be empty"}</p>
           <div style={{marginTop: "25px"}} onClick={this.encryptWallet} id="importButton">
             Encrypt
           </div>
        </div>
      </div>
    )
  }

  render() { 
     return (
      <div ref="second" style={{height: "330px"}}>
        {this.toRender()}
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordValue: state.setup.password,
    passwordConfirmationValue: state.setup.confirmationPassword
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(EncryptWallet));