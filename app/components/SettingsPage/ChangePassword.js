import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax, TimelineMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
import Wallet from '../../utils/wallet';
import CloseButtonPopup from '../Others/CloseButtonPopup';
const tools = require('../../utils/tools')

class ChangePassword extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
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
    tools.animatePopupIn(this.refs.pointer, callback, "22%");
  }

  componentWillLeave (callback) {
    tools.animatePopupOut(this.refs.pointer, callback)
  }

  showWrongPassword(){
    tools.showTemporaryMessage('#wrongPassword');
  }

  
  componentDidLeave(callback) {
  }  

  componentDidMount(){

  }

  handlePasswordChange(event, type) {
    if(type == 1)
      this.props.setPassword(event.target.value);
    else if(type == 2)
      this.props.passwordConfirmation(event.target.value)
  }

  handleConfirm(){
  }

  handleCancel(){
    this.props.setChangingPassword(false)
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="pointer" id="unlockPanel" style={{height: "300px", top: "22%", overflowX: "hidden"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p style={{fontSize: "18px", color:"#b4b7c8", paddingTop: "20px"}}>Change Password</p>
        <div style={{position:"relative", width:"300px", margin:"0 auto"}}>
          <p id="enterPasswordRepeat" style={{position:"absolute",top: "2px", width: "300px", textAlign: "center", color: "#555d77", fontSize: "15px", fontWeight: "600", zIndex:"-1"}}>Current Password</p>
          <input className="privateKey passwordInput" style={{marginBottom: "10px", color: "#555d77", fontSize: "15px", fontWeight: "600"}} type="text" value={this.props.passwordVal} onChange={this.handleConfirmationPassword}></input>
        </div>
      </div>
      );
    } 
};


const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    passwordValConfirmation: state.application.passwordConfirmation,
    newPassword: state.application.newPassword
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(ChangePassword));