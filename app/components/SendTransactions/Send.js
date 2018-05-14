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
  }

  confirmSend() {
    if(this.props.amount === "" || isNaN(this.props.amount) === 1){
      Tools.highlightInput('#inputAmountSend', 1000)
    }
    if(this.props.address === ""){
      Tools.highlightInput('#inputAddressSend', 1000)
    }
    if(this.props.address !== "" && this.props.amount !== "" && Number(this.props.amount) > 0){
      if(Number(this.props.amount) > Number(this.props.balance)){
        Tools.showTemporaryMessage('.Send__message-status', this.props.lang.notEnoughBalance);
        Tools.highlightInput('#inputAmountSend', 2100)
      }
      else{
        this.props.wallet.validate(this.props.address).then((isAddressValid) => {
        if (!isAddressValid.isvalid) {
          Tools.showTemporaryMessage('.Send__message-status', this.props.lang.invalidFailedAddress);
          Tools.highlightInput('#inputAddressSend', 2100)
        } else {
          this.props.setSendingECC(true);
        }
        }).catch((err) => {
          console.log(err);
        });
      }
    }
  }

  render() {
    let clearButton = require('../../../resources/images/clearButton-orange.png');
    return (
      <div className="panel Send">
        <AddressBook sendPanel={true}/>
          <p className="Send__message-status">{ this.props.lang.addressCopiedBelow }</p>
          <div className="Send__form">
            <div className="Send__inputs-wrapper">
              <Input
                placeholder= { this.props.lang.ansNameOrAddress }
                placeholderId="addressSend"
                value={this.props.address}
                handleChange={this.props.setAddressSend}
                type="text"
                inputId="inputAddressSend"
                style={{marginBottom: "25px"}}
                autoFocus
                isLeft
              />
              <Input
                placeholder= { this.props.lang.amount }
                placeholderId="amountSend"
                value={this.props.amount}
                handleChange={this.props.setAmountSend}
                type="text"
                inputId="inputAmountSend"
                isLeft
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
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    address: state.application.addressSend,
    name: state.application.userNameToSend,
    amount: state.application.amountSend,
    balance: state.chains.balance,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Send);
