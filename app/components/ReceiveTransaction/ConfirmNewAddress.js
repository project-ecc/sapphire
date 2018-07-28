import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';
import ansAddressesInfo from '../../utils/ansAddressesInfo';
import renderHTML from 'react-render-html';

import $ from 'jquery';
import {getAddress} from "../../Managers/SQLManager";

const event = require('../../utils/eventhandler');
const Tools = require('../../utils/tools');

// This is temporary until ANS is enabled
const ansEnabled = false;

class ConfirmNewAddress extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.createNormalAddress = this.createNormalAddress.bind(this);
    this.getConfirmationText = this.getConfirmationText.bind(this);
    this.saveNewlyCreatedAnsAddress = this.saveNewlyCreatedAnsAddress.bind(this);
    this.state = {
      createdAddress: false
    }
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  componentWillUnmount()
  {
    Tools.showFunctionIcons();
    this.props.setNewAddressNamePopup("");
    this.props.setPassword('');
  }

  createNormalAddress(){
    this.props.wallet.createNewAddress(this.props.account).then((newAddress) => {
      	event.emit('newAddress');
        this.props.setPopupLoading(false)
      	this.props.setCreatingAddress(false);
    }).catch((err) => {
       console.log("error creating address: ", err)
       this.props.setPopupLoading(false)
    });
  }

  // createNewAnsAddress() {
  //   let newAddress;
  //   this.props.wallet.createNewAddress()
  //     .then(address => {
  //       newAddress = address;
  //       return this.props.wallet.sendMoney(newAddress, 51);
  //     })
  //     .then(() => {
  //       return this.createANSAddress(newAddress);
  //     })
  //     .catch(err => {
  //       console.log('error creating ANS address: ', err);
  //       if(err.message.indexOf("Insufficient funds") !== -1){
  //         Tools.showTemporaryMessage('#wrongPassword', "Not enough funds in the address. You need to have a little over 50 ECC to account for the transfer fees.", 7000, this.props.lang.wrongPassword);
  //       }
  //       this.props.setPopupLoading(false)
  //     });
  // }

  async setAddressPendingUpgrade(add){
   // save to DB here
   let address = await getAddress(add)
   address.status = 'pendingAns';
   await address.save();
  }

  async createANSAddress(address) {
    console.log(address)
    console.log(this.props.usernamePopup)
    return await this.props.wallet.createNewANSAddress(address, this.props.usernamePopup)
      .then(async response => {
        console.log(response)
        await this.setAddressPendingUpgrade(address);
        TweenMax.to('#ConfirmNewAddress__content', 0.2, {autoAlpha: 0, scale: 0.5});
        TweenMax.fromTo('#ConfirmNewAddress__success-message', 0.2, {autoAlpha: 0, scale: 0.2}, {
          autoAlpha: 1,
          scale: 1
        });
        //TweenMax.set('#unlockPanel', {height: "331px"});
        TweenMax.to('#unlockPanel', 1, {height: "220px", delay: 0.2});
        this.props.setPopupLoading(false)
      })
      .catch(err => {
        console.log('error creating ANS address: ', err);
        if(err.message.indexOf("Insufficient funds") !== -1){
          Tools.showTemporaryMessage('#wrongPassword', "Not enough funds in the address. You need to have a little over 50 ECC to account for the transfer fees.", 7000, this.props.lang.wrongPassword);
        }
        else if(err.message.indexOf("there can only be") !== -1){
          Tools.showTemporaryMessage('#wrongPassword', this.props.lang.ansInputsError, 7000, this.props.lang.wrongPassword);
        }
        else if(err.message.indexOf("Username contains invalid") !== -1){
          Tools.showTemporaryMessage('#wrongPassword', this.props.lang.usernamInvalid, 7000, this.props.lang.wrongPassword);
        }
        else if(err.message.indexOf("maxiumum length of") !== -1){
          Tools.showTemporaryMessage('#wrongPassword', this.props.usernameTooBig, 5000, this.props.lang.wrongPassword);
        }
        this.props.setPopupLoading(false)
      });
  }


  async handleConfirm(){

    console.log('is address selected', this.props.selectedAddress);
    console.log('is upgrading address', this.props.upgradingAddress);
    console.log('created address', this.state.createdAddress);
    if(this.state.createdAddress === true){
      this.props.setPopupLoading(false)
      this.props.setCreatingAddress(false);
      this.props.setUpgradingAddress(false);
      this.props.setNewAddressName(name);
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 1});
      return;
    }

    this.props.setPopupLoading(true)
    if (!this.props.ansAddress && !this.props.upgradingAddress) {
      this.createNormalAddress();
    } else {
      await this.unlockWallet(false, 30, async () => {
        // if (this.props.selectedAddress && this.props.upgradingAddress) {
          await this.createANSAddress(this.props.selectedAddress.address);
        // } else  {
          // this.createNewAnsAddress();
        // }
      });
    }

    // reset the dialog test afterwould
    this.props.setPassword('');
    this.props.setCreatingAddress(false);
    this.props.setUpgradingAddress(false);
  }

  handleCancel(){
    this.props.setPassword('');
    this.props.setCreatingAddress(false);
    this.props.setUpgradingAddress(false);
  }

  unlockWallet(flag, time, callback){
    let batch = [];
    let obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {

      console.log(data)
      data = data[0];
      if (data !== null && (data.code === -14 || data.code === -1)) {
        Tools.showTemporaryMessage('#wrongPassword');
        this.props.setPopupLoading(false)
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
    const successMessageToRender = (
      <div id="ConfirmNewAddress__success-message" style={{position: "absolute", top:"0px", width:"100%", fontSize:"15px", visibility: "hidden"}}>
        <p>Success! We will notify you when your ANS address is ready.</p>
        <p style={{marginTop: "20px"}}>It can take anywhere from 5 minutes to 10 minutes.</p>
      </div>
    )


   if(this.props.ansAddress && !this.props.upgradingAddress) {
  		return(
        <div style={{position: "relative"}}>
          <div id="ConfirmNewAddress__content">
            <p className="confirmationText" style={{ marginBottom: '25px' }}>{ this.props.lang.ansCreateConfirm1 } <span className="ecc">{ this.props.lang.ansCreateConfirm2 }</span> { this.props.lang.ansCreateConfirm3 } "{this.props.username}".</p>
            <Input
              placeholder={ this.props.lang.password }
              placeholderId= "password"
              value={this.props.passwordVal}
              handleChange={this.props.setPassword}
              type="password"
              inputId="passwordAnsId"
              style={{width: "70%"}}
              autoFocus
              onSubmit={this.handleConfirm}
            />
          </div>
          {successMessageToRender}
        </div>
      )
    } else if(this.props.upgradingAddress) {
      return (
       <div style={{position: "relative"}}>
          <div id="ConfirmNewAddress__content">
            <p className="confirmationText" style={{ marginBottom: '25px' }}>{renderHTML(this.props.lang.ansUsernameAndPassword)}.</p>
            <Input
              divId="addressName"
              placeholder= { this.props.lang.name }
              placeholderId="addressNamePopupPlaceHolder"
              value={this.props.usernamePopup}
              handleChange={this.props.setNewAddressNamePopup}
              type="text"
              inputId="usernameAnsId"
              autoFocus={true}
              style={{width: "70%", marginBottom: "20px"}}
              onSubmit={this.handleConfirm}
            />
            <Input
              placeholder= { this.props.lang.password }
              placeholderId= "password"
              value={this.props.passwordVal}
              handleChange={this.props.setPassword}
              type="password"
              inputId="passwordAnsId"
              style={{width: "70%", marginBottom: "10px"}}
              onSubmit={this.handleConfirm}
            />
          </div>
           {successMessageToRender}
        </div>
      )
  	} else if(!this.props.ansAddress && this.props.account === ""){
  		return(
  			<p className="confirmationText">{ this.props.lang.normalCreateConfirm1 } <span className="ecc">{ this.props.lang.normalCreateConfirm2 }</span>.</p>
  		)
  	} else if(!this.props.ansAddress && this.props.account !== ""){
  		return(
  			<p className="confirmationText">{ this.props.lang.normalCreateConfirm1 } <span className="ecc">{ this.props.lang.normalCreateConfirm2 }</span> { this.props.lang.normalCreateConfirm4 } "{this.props.account}". { this.props.lang.normalCreateConfirm5 }  <span className="ecc">{ this.props.lang.ansCreateConfirm2 }</span> { this.props.lang.normalCreateConfirm6 }.</p>
  		)
  	}
  }

  render() {
     return (
      <div className="CreateAddressPopup">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <div>
          <p className="popupTitle">{ this.props.upgradingAddress ? this.props.lang.upgradingAns : this.props.lang.confirmNewAddress }</p>
          {this.getConfirmationText()}
          <p id="wrongPassword" style={{width: "75%", margin: "13px auto 66px"}} className="wrongPassword">{ this.props.lang.wrongPassword }</p>
        </div>
        <ConfirmButtonPopup
          inputId="#passwordAnsId, #usernameAnsId"
          textLoading={this.props.lang.confirming}
          text={this.props.lang.confirm}
          handleConfirm={this.handleConfirm}
          className="CreateAddressPopup__form-confirm-btn"
        />
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    username: state.application.newAddressName,
    usernamePopup: state.application.newAddressNamePopup,
    ansAddress: state.application.creatingAnsAddress,
    upgradingAddress: state.application.upgradingAddress,
    selectedAddress: state.application.selectedAddress,
    account: state.application.newAddressAccount,
    wallet: state.application.wallet,
    passwordVal: state.application.password,
    blockPayment: state.chains.blockPayment
  };
};


export default connect(mapStateToProps, actions)(ConfirmNewAddress);
