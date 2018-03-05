import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import Input from '../Others/Input';

class EncryptWallet extends React.Component {
 constructor() {
    super();
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmationPassword = this.handleConfirmationPassword.bind(this);
    this.checkIfEncrypted = this.checkIfEncrypted.bind(this);
    this.showEncryptWallet = this.showEncryptWallet.bind(this);
    this.showWalletEncrypted = this.showWalletEncrypted.bind(this);
    this.encryptWallet = this.encryptWallet.bind(this);
    this.startWallet = this.startWallet.bind(this);
  }

  checkIfEncrypted(){
    this.props.wallet.help().then((data) => {
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

  componentWillMount(){
    if(!this.props.notInitialSetup){
      this.props.wallet.walletstart((result) => {
        if (result) {
          console.log("started daemon")
        }
      });
    }

    if(this.props.checkEncrypted){
      var self = this;
      setTimeout(() => {
        self.checkIfEncrypted();
      }, 2000);
    }
  }

  componentDidMount(){
    console.log("Check if encrypted: ", this.props.checkEncrypted)
    if(this.props.checkEncrypted){
      TweenMax.set(this.refs.encryptWallet, {autoAlpha: 0});
      TweenMax.set(this.refs.checkingWallet, {autoAlpha: 1});
    }
    this.props.isEncrypting(true);
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
    this.props.wallet.encryptWallet(this.props.passwordValue).then((data) =>{
      if (data.code === -1 || data.code === -28) {
        console.log("failed to encrypt: ", data)
        var self = this;
        setTimeout(function(){
          self.encryptWallet();
        }, 1000);
      } 
      else {
        this.props.password("");
        this.props.passwordConfirmation("");
        this.showWalletEncrypted();
        var self = this;
        setTimeout(function(){
            self.startWallet();
            //making sure >_>
            setTimeout(function(){
              self.startWallet();
            }, 7000)
        }, 5000)
        console.log("encrypted! ", data)
      }
      }).catch((err) => {
        console.log("error encrypting wallet: ", err)
    });
  }

  startWallet(){
    this.props.wallet.walletstart((result) => {
      if (result) {
        console.log("started daemon")
      }
      else console.log("ERROR ", result)
    });
  }

  toRender(){
    return (
      <div>
        <div ref="checkingWallet" id="checkingWallet">
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
        <div ref="encryptWallet" id="encryptWallet">
          <p style={{fontWeight:"300"}}  className="subTitle">
          Encrypt your wallet
          </p>
          <div className="inputDivPassword">
            <Input 
              divStyle={{width: "200px"}}
              placeholder= "Enter Password"
              placeholderId="enterPassword"
              value={this.props.passwordValue}
              handleChange={this.handlePasswordChange.bind(this)}
              type="password"
              inputStyle={{width: "200px"}}
            />
          </div>
          <div className="inputDivPassword">
            <Input 
              divStyle={{marginTop: "20px", paddingBottom: "8px", width: "200px"}}
              placeholder= "Repeat Password"
              placeholderId="enterPasswordRepeat"
              value={this.props.passwordConfirmationValue}
              handleChange={this.handleConfirmationPassword.bind(this)}
              type="password"
              inputStyle={{width: "200px"}}
            />
          </div>
          <p id="passwordError" style={{fontSize: "15px", fontWeight: "bold", color: "#d09128", visibility: "hidden"}}>{this.props.passwordValue != this.props.passwordConfirmationValue ? "Passwords do not match" : "Password can't be empty"}</p>
           <div style={{marginTop: "8px"}} onClick={this.encryptWallet} id="importButton">
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
    passwordConfirmationValue: state.setup.confirmationPassword,
    wallet: state.application.wallet,
    totalSteps: state.startup.totalSteps
  };
};


export default connect(mapStateToProps, actions)(EncryptWallet);