import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import $ from 'jquery';
const Tools = require('../../utils/tools');
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';

class SendConfirmation extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.sendECC = this.sendECC.bind(this);
    this.getNameOrAddressHtml = this.getNameOrAddressHtml.bind(this);
  }

  showWrongPassword(){
    Tools.showTemporaryMessage('#wrongPassword');
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  componentWillUnmount()
  {
    Tools.showFunctionIcons();
  }

  sendECC(){
    let wasStaking = this.props.staking;
    this.unlockWallet(false, 5, () => {
      var batch = [];
      console.log(this.props.amount);
      var obj = {
        method: 'sendToAddress', parameters: [this.props.address, this.props.amount]
      };
      batch.push(obj);
      this.props.wallet.command(batch).then((data) => {
        if(wasStaking){
            this.unlockWallet(true, 31556926, () => {
           });
        }
        else{
          this.props.setStaking(false);
        }
        this.props.setTemporaryBalance(balance - this.props.amount)
        this.props.setPassword("");
        this.props.setSendingECC(false);
        this.props.setUsernameSend("");
        this.props.setAmountSend("");
        this.props.setAddressSend("");
        $('#message').text(this.props.lang.sentSuccessfully);
        Tools.showTemporaryMessage('#message');
        setTimeout(() => {
          $('#message').text(this.props.lang.addressCopiedBelow)
        }, 2500)
      }).catch((err) => {
        this.props.setPassword("");
        console.log("err sending ecc: ", err);
      });
    })

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

  handleChange(event) {
    const pw = event.target.value;
    if(pw.length == 0)
      TweenMax.set('#password', {autoAlpha: 1});
    else
      TweenMax.set('#password', {autoAlpha: 0});

    this.props.setPassword(pw);
  }

  handleConfirm(){
    if(this.props.passwordVal == ""){
      this.showWrongPassword();
      return;
    }
    this.sendECC();
  }

  handleCancel(){
    this.props.setSendingECC(false);
  }

  getNameOrAddressHtml(){
    if(this.props.username != "" && this.props.username != undefined){
      return(
        <div>
          <p className="labelSend">{ this.props.lang.name }: {this.props.username} </p>
          <p className="labelAddressSend">({this.props.address})</p>
        </div>
      )
    }else{
      return(
        <div>
          <p className="labelSend">{ this.props.lang.address }: <span style={{fontSize:"14px"}}>{this.props.address}</span> </p>
        </div>
      )
    }
  }

  render() {
     return (
      <div ref="second" style={{height: this.props.username != "" && this.props.username != undefined ? "324px" : "293px", top: "22%"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.confirmTransaction }</p>
        <p className="labelAmountSend">{ this.props.lang.amount }: {Tools.formatNumber(Number(this.props.amount))} <span className="ecc">ECC</span></p>
        {this.getNameOrAddressHtml()}
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
        <div>
          <p id="wrongPassword" className="wrongPassword">Wrong password</p>
        </div>
        <ConfirmButtonPopup handleConfirm={this.handleConfirm} text="Confirm"/>
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    amount: state.application.amountSend,
    address: state.application.addressSend,
    username: state.application.userNameToSend,
    staking: state.chains.staking,
    wallet: state.application.wallet,
    balance: state.chains.balance
  };
};


export default connect(mapStateToProps, actions)(SendConfirmation);
