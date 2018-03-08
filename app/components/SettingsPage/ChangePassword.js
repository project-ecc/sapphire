import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax, TimelineMax} from "gsap";
import $ from 'jquery';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';
const Tools = require('../../utils/tools')

class ChangePassword extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  showWrongPassword(){
    Tools.showTemporaryMessage('#wrongPassword');
  }

  componentWillUnmount(){
    this.props.setPassword("");
    this.props.passwordConfirmation("");
    this.props.setNewPassword("");
  }
  
  handlePasswordChange(event) {
    let pw = event.target.value;
    if(pw.length == 0){
      TweenMax.set('#enterPassword', {autoAlpha: 1});
    }
    else 
      TweenMax.set('#enterPassword', {autoAlpha: 0});
    
    this.props.setPassword(pw);
  }

  handlePasswordConfirmationChange(event){
    let pw = event.target.value;
    if(pw.length == 0){
      TweenMax.set('#enterPasswordRepeat', {autoAlpha: 1});
    }
    else 
      TweenMax.set('#enterPasswordRepeat', {autoAlpha: 0});

    this.props.passwordConfirmation(pw)
  }

  handleNewPasswordChange(event){
    let pw = event.target.value;
    if(pw.length == 0){
      TweenMax.set('#enterPasswordConfirmation', {autoAlpha: 1});
    }
    else 
      TweenMax.set('#enterPasswordConfirmation', {autoAlpha: 0});

    this.props.setNewPassword(pw)
  }

  changePassword(){
    var wasStaking = this.props.isStaking;
    this.props.wallet.walletChangePassphrase(this.props.passwordVal, this.props.newPassword).then((data)=>{
      if(data == null){
        if(wasStaking){

        }
        Tools.showTemporaryMessage('#wrongPassword', "Operation Successfull!");
        setTimeout(()=>{
          this.props.setChangingPassword(false)
        }, 2000)
      }
      else if(data.code && data.code == -14){
        Tools.showTemporaryMessage('#wrongPassword', "Wrong Password");
      }
    })
    .catch((err) => {
      console.error(err);
    });
  }

  handleConfirm(){
    if(this.props.passwordVal == "" || this.props.passwordValConfirmation == "" || this.props.newPassword == ""){
      Tools.showTemporaryMessage('#wrongPassword', 'Please fill all fields');
    }
    else if(this.props.passwordVal != this.props.passwordValConfirmation){
      Tools.showTemporaryMessage('#wrongPassword', "Passwords don't match");
    }
    else{
      this.changePassword();
    }
  }

  handleCancel(){
    this.props.setChangingPassword(false)
  }

  render() { 
     return (
      <div className="changePassword">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">Change Password</p>
        <Input 
          divStyle={{marginTop: "45px", width: "300px"}}
          placeholder= "Current Password"
          placeholderId="enterPassword"
          value={this.props.passwordVal}
          handleChange={this.handlePasswordChange.bind(this)}
          type="password"
          inputStyle={{width: "300px"}}
        />
        <Input 
          divStyle={{marginTop: "20px", width: "300px"}}
          placeholder= "Repeat Password"
          placeholderId="enterPasswordRepeat"
          value={this.props.passwordValConfirmation}
          handleChange={this.handlePasswordConfirmationChange.bind(this)}
          type="password"
          inputStyle={{width: "300px"}}
        />
        <Input 
          divStyle={{marginTop: "20px", width: "300px"}}
          placeholder= "New Password"
          placeholderId="enterPasswordConfirmation"
          value={this.props.newPassword}
          handleChange={this.handleNewPasswordChange.bind(this)}
          type="password"
          inputStyle={{width: "300px"}}
        />
        <p id="wrongPassword" className="wrongPassword" style= {{paddingTop:"10px"}}>Wrong password</p>
        <ConfirmButtonPopup handleConfirm={this.handleConfirm} text="Confirm"/>
      </div>
      );
    } 
};


const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    passwordValConfirmation: state.setup.confirmationPassword,
    newPassword: state.application.newPassword,
    isStaking: state.chains.isStaking,
    wallet: state.application.wallet
  };
};


export default connect(mapStateToProps, actions)(ChangePassword);