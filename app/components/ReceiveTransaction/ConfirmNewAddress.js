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
  			<p className="confirmationText">{ this.props.lang.ansCreateConfirm1 } <span className="ecc">{ this.props.lang.ansCreateConfirm2 }</span> { this.props.lang.ansCreateConfirm3 } "{this.props.username}".</p>
  		)
  	}
  	else if(!this.props.ansAddress && this.props.account == ""){
  		return(
  			<p className="confirmationText">{ this.props.lang.normalCreateConfirm1 } <span className="ecc">{ this.props.lang.normalCreateConfirm2 }</span> { this.props.lang.normalCreateConfirm3 }.</p>	
  		)
  	}
	else if(!this.props.ansAddress && this.props.account != ""){
  		return(
  			<p className="confirmationText">{ this.props.lang.normalCreateConfirm1 } <span className="ecc">{ this.props.lang.normalCreateConfirm2 }</span> { this.props.lang.normalCreateConfirm4 } "{this.props.account}". { this.props.lang.normalCreateConfirm5 }  <span className="ecc">{ this.props.lang.ansCreateConfirm2 }</span> { this.props.lang.normalCreateConfirm6 }.</p>	
  		)
  	}
  }

  render() { 
     return (
      <div style={{height: "auto !important", textAlign: "center", width: "535px"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.confirmNewAddress }</p>
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