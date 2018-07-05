import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax, TimelineMax} from "gsap";
import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';
import $ from 'jquery';
const Tools = require('../../utils/tools');

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

  changePassword(){
    let wasStaking = this.props.isStaking;
    this.props.wallet.walletChangePassphrase(this.props.passwordVal, this.props.newPassword).then((data)=>{
      if(data === null){
        if(wasStaking){

        }
        Tools.showTemporaryMessage('#wrongPassword', this.props.lang.operationSuccessful );
        setTimeout(()=>{
          this.props.setChangingPassword(false)
        }, 2000)
      }
      else if(data.code && data.code === -14){
        Tools.showTemporaryMessage('#wrongPassword', this.props.lang.wrongPasswordProper );
      }
      this.props.setPopupLoading(false)
    })
    .catch((err) => {
      console.error(err);
      this.props.setPopupLoading(false)
    });
  }

  handleConfirm(){
    if(this.props.passwordVal === "" || this.props.passwordValConfirmation === "" || this.props.newPassword === ""){
      Tools.showTemporaryMessage('#wrongPassword', this.props.lang.fillAllFields );
    }
    else if(this.props.newPassword !== this.props.passwordValConfirmation){
      Tools.showTemporaryMessage('#wrongPassword', this.props.lang.passwordsDontMatch );
    }
    else{
      this.props.setPopupLoading(true);
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
        <p className="popupTitle">{ this.props.lang.changePassword }</p>
        <Input
          placeholder= { this.props.lang.currentPassword }
          placeholderId="enterPassword"
          value={this.props.passwordVal}
          handleChange={this.props.setPassword}
          type="password"
          inputId="enterPasswordId"
          onSubmit={this.handleConfirm}
          style={{marginTop: "30px", marginBottom: "25px", width: "60%"}}
          autoFocus
        />
        <Input
          placeholder= {  this.props.lang.newPassword}
          placeholderId="enterPasswordRepeat"
          value={this.props.passwordValConfirmation}
          handleChange={this.props.passwordConfirmation}
          type="password"
          inputId="newPasswordId"
          onSubmit={this.handleConfirm}
          style={{marginBottom: "25px", width: "60%"}}
        />
        <Input
          placeholder= { this.props.lang.repeatPassword }
          placeholderId="enterPasswordConfirmation"
          value={this.props.newPassword}
          handleChange={this.props.setNewPassword}
          type="password"
          inputId="repeatNewPasswordId"
          onSubmit={this.handleConfirm}
          style={{width: "60%"}}
        />
        <p id="wrongPassword" className="wrongPassword" style= {{paddingTop:"10px", marginTop:"0px"}}>{ this.props.lang.wrongPassword }</p>
        <ConfirmButtonPopup inputId={"#enterPasswordId, #enterPasswordId, #repeatNewPasswordId"} handleConfirm={this.handleConfirm} textLoading={this.props.lang.confirming} text={ this.props.lang.confirm }/>
      </div>
      );
    }

}

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
