import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax, TimelineMax} from "gsap";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import * as actions from '../../../actions/index';
import CloseButtonPopup from '../../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../../Others/ConfirmButtonPopup';
import Input from '../../Others/Input';
import $ from 'jquery';
import Toast from "../../../globals/Toast/Toast";
const Tools = require('../../../utils/tools');

class ChangePasswordModal extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: false,
      password_current: '',
      password: '',
      password_confirm: ''
    };
  }

  componentWillUnmount() {
   this.setState({
     password_current: '',
     password: '',
     password_confirm: ''
   });
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  changePassword(){
    let wasStaking = this.props.isStaking;
    this.props.wallet.walletChangePassphrase(this.props.passwordVal, this.props.newPassword).then((data)=>{
      if(data === null){
        if(wasStaking){

        }
        Toast({
          message: this.props.lang.operationSuccessful
        });
        setTimeout(()=>{
          this.toggle();
        }, 2000)
      }
      else if(data.code && data.code === -14){
        Toast({
          title: this.props.lang.error,
          message: this.props.lang.wrongPasswordProper,
          color: 'red'
        });
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
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.fillAllFields,
        color: 'red'
      });
    }
    else if(this.props.newPassword !== this.props.passwordValConfirmation){
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.passwordsDontMatch,
        color: 'red'
      });
    }
    else{
      this.props.setPopupLoading(true);
      this.changePassword();
    }
  }

  render() {
     return (
      <div>
        <Modal isOpen={this.state.open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>{ this.props.lang.changePassword }</ModalHeader>
          <ModalBody>
            <Input
              placeholder={ this.props.lang.currentPassword }
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
            <ConfirmButtonPopup inputId={"#enterPasswordId, #enterPasswordId, #repeatNewPasswordId"} handleConfirm={this.handleConfirm} textLoading={this.props.lang.confirming} text={ this.props.lang.confirm }/>
          </ModalBody>
        </Modal>
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


export default connect(mapStateToProps, actions, null, { withRef: true })(ChangePasswordModal);
