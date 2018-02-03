import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
import Wallet from '../../utils/wallet';
const event = require('../../utils/eventhandler');

class ConfirmNewAddress extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.createNormalAddress = this.createNormalAddress.bind(this);
    this.getConfirmationText = this.getConfirmationText.bind(this);
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
    const el = this.refs.second;
    TweenMax.set($('.mancha'), {css: {display: "block"}})
    TweenMax.fromTo($('.mancha'), 0.3, {autoAlpha:0}, { autoAlpha:1, ease: Linear.easeNone});
    TweenMax.fromTo(el, 0.3, {css: {top: "-50%", opacity:0}}, {css: {top: "22%", opacity:1}, ease: Linear.easeOut, onComplete: callback});
  }

  componentWillLeave (callback) {
    const el = this.refs.second;
    TweenMax.fromTo($('.mancha'), 0.3, {autoAlpha:1}, { autoAlpha:0, ease: Linear.easeNone});
    TweenMax.fromTo(el, 0.3, {css: {top: "22%", opacity:1}}, {css: {top: "-50%", opacity:0}, ease: Linear.easeIn, onComplete: callback});
  }

  createNormalAddress(){
    this.wallet.createNewAddress(this.props.account).then((newAddress) => {
    	console.log(newAddress)
      	event.emit('newAddress');
      	this.props.setCreatingAddress(false);
    }).catch((err) => {
       console.log("error creating address: ", err)
    });
  }
  
  createAnsAddress(){

  }

  componentDidLeave(callback) {
  }  

  componentDidMount(){
  }

  handleConfirm(){
    if(!this.props.ansAddress)
    	this.createNormalAddress();
  }

  handleCancel(){
    this.props.setCreatingAddress(false);
  }

  getConfirmationText(){
  	let style= {
  		fontSize: "16px",
  		width: "90%",
  		margin: "0 auto",
      textAlign: "justify",
      fontWeight: "500"
  	}
  	if(this.props.ansAddress){
  		return(
  			<p style={style}>Press confirm to create an <span className="ecc">ANS address</span> named "{this.props.username}"</p>
  		)
  	}
  	else if(!this.props.ansAddress && this.props.account == ""){
  		return(
  			<p style={style}>Press confirm to create a <span className="ecc">normal address</span> under an unnamed account</p>	
  		)
  	}
	else if(!this.props.ansAddress && this.props.account != ""){
  		return(
  			<p style={style}>Press confirm to create a <span className="ecc">normal address</span> under an account named "{this.props.account}". Note that this address is not recognized by name in the network, create an <span className="ecc">ANS address</span> for that functionality.</p>	
  		)
  	}
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="second" id="unlockPanel" style={{top: "22%", height: "auto"}}>
        <p style={{fontSize: "18px", color:"#b4b7c8", paddingTop: "20px", paddingBottom:"30px"}}>Confirm New Address</p>
       	{this.getConfirmationText()}
       	<div style={{marginTop: "30px", height: "36px", marginBottom: "10px"}}>
	        <div onClick={this.handleCancel} className="buttonUnlock" style={{background: "-webkit-linear-gradient(top, #7f7f7f 0%,#4d4d4d 100%)", color: "#d9daef", left:"100px"}}>
	          Cancel
	        </div>
	        <div onClick={this.handleConfirm} className="buttonUnlock" style={{background: "-webkit-linear-gradient(top, rgb(214, 167, 91) 0%, rgb(162, 109, 22) 100%)", color: "#d9daef", left:"300px"}}>
	          Confirm
	        </div>
        </div>
      </div>
      );
    } 
};


const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    username: state.application.newAddressName,
    ansAddress: state.application.creatingAnsAddress,
    account: state.application.newAddressAccount
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(ConfirmNewAddress));