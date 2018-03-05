import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import $ from 'jquery';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
const event = require('../../utils/eventhandler');
const tools = require('../../utils/tools');

class ConfirmNewAddress extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.createNormalAddress = this.createNormalAddress.bind(this);
    this.getConfirmationText = this.getConfirmationText.bind(this);
  }

  createNormalAddress(){
    this.props.wallet.createNewAddress(this.props.account).then((newAddress) => {
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
  	if(this.props.ansAddress){
  		return(
  			<p className="confirmationText">Press confirm to create an <span className="ecc">ANS address</span> named "{this.props.username}"</p>
  		)
  	}
  	else if(!this.props.ansAddress && this.props.account == ""){
  		return(
  			<p className="confirmationText">Press confirm to create a <span className="ecc">normal address</span> under an unnamed account</p>	
  		)
  	}
	else if(!this.props.ansAddress && this.props.account != ""){
  		return(
  			<p className="confirmationText">Press confirm to create a <span className="ecc">normal address</span> under an account named "{this.props.account}". Note that this address is not recognized by name in the network, create an <span className="ecc">ANS address</span> for that functionality.</p>	
  		)
  	}
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div style={{height: "auto !important", textAlign: "center"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">Confirm New Address</p>
       	{this.getConfirmationText()}
        <ConfirmButtonPopup handleConfirm={this.handleConfirm} text="Confirm"/>
      </div>
      );
    } 
};


const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    username: state.application.newAddressName,
    ansAddress: state.application.creatingAnsAddress,
    account: state.application.newAddressAccount,
    wallet: state.application.wallet
  };
};


export default connect(mapStateToProps, actions)(ConfirmNewAddress);