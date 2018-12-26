import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import AddressBook from './partials/AddressBook';
import * as actions from '../../actions';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import Input from '../Others/Input';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup'

import $ from 'jquery';
import Toast from "../../globals/Toast/Toast";

const Tools = require('../../utils/tools');

class Index extends Component {
  constructor(props) {
    super(props);
    this.handleClear = this.handleClear.bind(this);
    this.confirmSend = this.confirmSend.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
  }

  handleClear() {
    this.props.setAmountSend("");
    this.props.setAddressSend("");
    this.props.setUsernameSend("");
    this.props.setAddressOrUsernameSend("");
  }

  async _handleKeyPress(e) {
    if (e.key === 'Enter') {
    console.log('do validate');
    await this.confirmSend()
    }
  }


  async confirmSend() {
    if(this.props.amount === "" || isNaN(this.props.amount) === 1){
      Tools.highlightInput('#inputAmountSend', 1000)
    }
    if(this.props.addressOrUsername === ""){
      Tools.highlightInput('#inputAddressSend', 1000)
    }
    if(this.props.addressOrUsername !== "" && this.props.amount !== "" && Number(this.props.amount) > 0){
      if(Number(this.props.amount) > Number(this.props.balance)){
        Toast({
          message: this.props.lang.notEnoughBalance,
          color: 'red'
        });
        Tools.highlightInput('#inputAmountSend', 2100)
      }
      else{
        let result;
        try{
          result = await Tools.searchForUsernameOrAddress(this.props.wallet, this.props.addressOrUsername);
          if(result.ans && result.addresses.length === 1){
            this.props.setUsernameSend(result.addresses[0].Name, "#"+result.addresses[0].Code);
            this.props.setAddressSend(result.addresses[0].Address);
          }
          else if(result && result.ans && result.addresses.length > 1){
            this.props.setMultipleAnsAddresses(result.addresses);
          }
          else if(result){
            this.props.setAddressSend(result.addresses[0].address);
          }
        }catch(err){
          console.log("err: ", err)
        }

        if (!result) {
          Toast({
            title: this.props.lang.error,
            message: this.props.lang.invalidFailedAddress,
            color: 'red'
          });
          Tools.highlightInput('#inputAddressSend', 2100)
        }
        else{
          this.props.setSendingECC(true);
        }
      }
    }
  }

  render() {
    let clearButton = require('../../../resources/images/clearButton-orange.png');
    return (
      <div className="panel Send">
        <div style={{marginTop: "45px"}}>
          <div className="text-center" style={{marginTop: "100px !important"}} id="balanceInfo">
            <div className="row" style={{margin: "0px 0px", textAlign: "center"}}>
              <div className="col-sm-12"  style={{padding: "0 0"}}>
                <p className="normalWeight homePanelTitleOne" id="balance" style={{fontSize: "20px"}}>Available { this.props.lang.balance }</p>
                <p className="normalWeight" style={{fontSize: "20px"}}>{this.props.balance} <span className="ecc">ecc</span></p>
              </div>
            </div>
          </div>
        </div>
          <div className="Send__form">
            <div className="Send__inputs-wrapper">
              <Input
                placeholder= { this.props.lang.ansNameOrAddress }
                placeholderId="addressSend"
                value={this.props.addressOrUsername}
                handleChange={this.props.setAddressOrUsernameSend}
                type="text"
                inputId="inputAddressSend"
                style={{marginBottom: "25px"}}
                autoFocus
                isLeft
                onSubmit={this.confirmSend}
                onKeyPress={this._handleKeyPress}
              />
              <Input
                placeholder= { this.props.lang.amount }
                placeholderId="amountSend"
                value={this.props.amount}
                handleChange={this.props.setAmountSend}
                type="number"
                inputId="inputAmountSend"
                isLeft
                onSubmit={this.confirmSend}
                onKeyPress={this._handleKeyPress}
              />
            </div>
            <div className="Send__form-buttons">
              <img className="Send__form-clear-btn" onClick={this.handleClear} src={clearButton}/>
              <ConfirmButtonPopup
                className="Send__form-confirm-btn"
                text="Send"
                handleConfirm={this.confirmSend}
                hasLoader={false}
              />
            </div>
          </div>
        <AddressBook sendPanel={true}/>
      </div>
    );
  }
}

const mapStateToProps = state => {
  let balance = !state.chains.balance ? 0 : state.chains.balance;
  let staking = !state.chains.staking ? 0 : state.chains.staking;
  let newMint = !state.chains.newMint ? 0 : state.chains.newMint;
  let unconfirmedBalance = !state.chains.unconfirmedBalance ? 0 : state.chains.unconfirmedBalance;
  let immatureBalance = !state.chains.immatureBalance ? 0 : state.chains.immatureBalance;
  return{
    staking: state.chains.isStaking,
    balance: Tools.formatNumber(balance),
    //temporary fix...
    total: Tools.formatNumber(balance + staking + newMint + unconfirmedBalance + immatureBalance),
    unconfirmed: Tools.formatNumber(unconfirmedBalance),
    stakingVal: Tools.formatNumber(staking),
    lang: state.startup.lang,
    addressOrUsername: state.application.addressOrUsernameSend,
    amount: state.application.amountSend,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Index);
