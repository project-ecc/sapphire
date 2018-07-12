import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import AddressBook from './AddressBook';
import * as actions from '../../actions';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import Input from '../Others/Input';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup'

import $ from 'jquery';

const Tools = require('../../utils/tools');

class Send extends Component {
  constructor(props) {
    super(props);
    this.handleClear = this.handleClear.bind(this);
    this.confirmSend = this.confirmSend.bind(this);
  }

  handleClear() {
    this.props.setAmountSend("");
    this.props.setAddressSend("");
    this.props.setUsernameSend("");
    this.props.setAddressOrUsernameSend("");
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
        Tools.showTemporaryMessage('.Send__message-status', this.props.lang.notEnoughBalance);
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
          Tools.showTemporaryMessage('.Send__message-status', this.props.lang.invalidFailedAddress);
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
        <div><h1>SEND VALUE</h1></div>
          <p className="Send__message-status">{ this.props.lang.addressCopiedBelow }</p>
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
  return{
    lang: state.startup.lang,
    addressOrUsername: state.application.addressOrUsernameSend,
    amount: state.application.amountSend,
    balance: state.chains.balance,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Send);
