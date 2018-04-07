import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import $ from 'jquery';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';
const event = require('../../utils/eventhandler');
const tools = require('../../utils/tools');

class ConfirmNewAddress extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createNormalAddress = this.createNormalAddress.bind(this);
    this.getConfirmationText = this.getConfirmationText.bind(this);
  }

  createNormalAddress(){
    this.props.wallet.createNewAddress(this.props.account).then((newAddress) => {
    	console.log(newAddress);
      	event.emit('newAddress');
      	this.props.setCreatingAddress(false);
    }).catch((err) => {
       console.log("error creating address: ", err)
    });
  }

  createAnsAddress() {
    let newAddress;
    this.props.wallet.createNewAddress()
      .then(address => {
        console.log(address);
        newAddress = address;
        return this.props.wallet.sendMoney(newAddress, 1.01);
      })
      .then(() => {
        return this.props.wallet.createNewANSAddress(newAddress, this.props.username);
      })
      .then(address => {
        console.log(address);
        event.emit('newAddress');
        this.props.setCreatingAddress(false);  
      })
      .catch(err => {
        console.log('error creating ANS address: ', err);
      });
  }

  componentDidLeave(callback) {
  }

  componentDidMount(){
  }

  handleConfirm(){
    if (!this.props.ansAddress) {
      this.createNormalAddress();
    } else {
      this.unlockWallet(false, 5, () => {
        this.createAnsAddress();
      });
    }
  }

  handleCancel(){
    this.props.setCreatingAddress(false);
  }

  handleChange(event) {
    const pw = event.target.value;
    if(pw.length == 0)
      TweenMax.set('#password', {autoAlpha: 1});
    else
      TweenMax.set('#password', {autoAlpha: 0});

    this.props.setPassword(pw);
  }

  unlockWallet(flag, time, callback){
    var batch = [];
    var obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      console.log("data: ", data);
      data = data[0];
      if (data !== null && data.code === -14) {
        this.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
          console.log("Daemon not running - Dev please look into this and what exactly triggered it");
      } else if (data === null) {
          callback();
      } else {
        console.log("error unlocking wallet: ", data)
      }
    }).catch((err) => {
      console.log("err unlocking wallet: ", err);
    });
  }

  getConfirmationText(){
  	if(this.props.ansAddress){
  		return(
        <div>
          <p className="confirmationText" style={{ marginBottom: '25px' }}>{ this.props.lang.ansCreateConfirm1 } <span className="ecc">{ this.props.lang.ansCreateConfirm2 }</span> { this.props.lang.ansCreateConfirm3 } "{this.props.username}".</p>
          <Input
            divStyle={{width: "400px", marginTop: "20px"}}
            placeholder= { this.props.lang.password }
            placeholderId= "password"
            placeHolderClassName="inputPlaceholder inputPlaceholderUnlock"
            value={this.props.passwordVal}
            handleChange={this.handleChange.bind(this)}
            type="password"
            inputStyle={{width: "400px", top: "20px", marginBottom: "30px"}}
          />
        </div>
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
        <ConfirmButtonPopup handleConfirm={this.handleConfirm} text="Confirm" style={{position: 'relative', marginTop: '30px', bottom: "10px", left:"205px"}}/>
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    username: state.application.newAddressName,
    ansAddress: state.application.creatingAnsAddress,
    account: state.application.newAddressAccount,
    wallet: state.application.wallet,
    passwordVal: state.application.password,
  };
};


export default connect(mapStateToProps, actions)(ConfirmNewAddress);
