import React, { Component } from 'react';
import AddressBook from './AddressBook';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import TransitionGroup from 'react-transition-group/TransitionGroup';
import $ from 'jquery';
import Input from '../Others/Input';
const tools = require('../../utils/tools');

class Send extends Component {
  constructor(props) {
    super(props);
    this.handleClear = this.handleClear.bind(this);
    this.confirmSend = this.confirmSend.bind(this);
    this.handleChangeAmount = this.handleChangeAmount.bind(this);
    this.handleChangeAddress = this.handleChangeAddress.bind(this);
  }

  componentDidMount(){
    if(this.props.address)
      TweenMax.set('#addressSend', {autoAlpha: 0});
    if(this.props.amount)
      TweenMax.set('#amountSend', {autoAlpha: 0});
  }

  handleClear() {
    this.props.setAmountSend("");
    this.props.setAddressSend("");
    this.props.setUsernameSend("");
    TweenMax.set('#amountSend', {autoAlpha: 1});
    TweenMax.set('#addressSend', {autoAlpha: 1});
  }

  confirmSend() {
    if(this.props.amount == "" || isNaN(this.props.amount) == 1){
      tools.highlightInput('#inputAmountSend', 1)
    }
    if(this.props.address == ""){
      tools.highlightInput('#inputAddressSend', 1)
    }
    if(this.props.address != "" && this.props.amount != "" && Number(this.props.amount) > 0){
      if(this.props.amount > this.props.balance){
        tools.showTemporaryMessage('#message', this.props.lang.notEnoughBalance);
        tools.highlightInput('#inputAmountSend', 2.1)
      }
      else{
        this.props.wallet.validate(this.props.address).then((isAddressValid) => {
        if (!isAddressValid.isvalid) {
          tools.showTemporaryMessage('#message', this.props.lang.invalidFailedAddress);
          tools.highlightInput('#inputAddressSend', 2.1)
        } else {
          this.props.setSendingECC(true);
        }
        }).catch((err) => {
          console.log(err);
        });
      }
    }
  }

  handleChangeAddress(event){
    const address = event.target.value;
    if(address.length == 0){
      TweenMax.set('#addressSend', {autoAlpha: 1});
      this.props.setUsernameSend("");
    }
    else
      TweenMax.set('#addressSend', {autoAlpha: 0});

    this.props.setAddressSend(address);
  }

  handleChangeAmount(event){
    const amount = event.target.value;
    if(amount.length == 0)
      TweenMax.set('#amountSend', {autoAlpha: 1});
    else
      TweenMax.set('#amountSend', {autoAlpha: 0});

    this.props.setAmountSend(amount);
  }

  render() {
    let clearButton = require('../../../resources/images/clearButton-orange.png');
    return (
      <div className="panel">
        <AddressBook sendPanel={true}/>
          <p id="message">{ this.props.lang.addressCopiedBelow }</p>
          <div style={{width: "632px", margin: "0 auto"}}>
            <Input
              divStyle={{display: "inline"}}
              placeholder= { this.props.lang.ansNameOrAddress }
              placeholderId="addressSend"
              placeHolderClassName="inputPlaceholder sendPlaceholder"
              value={this.props.address}
              handleChange={this.handleChangeAddress.bind(this)}
              type="text"
              inputStyle={{top: "60px", width: "80%", textAlign: "left", marginBottom: "50px"}}
              inputId="inputAddressSend"
            />
            <img id="clearButton" onClick={this.handleClear} src={clearButton}/>
            <Input
              divStyle={{display: "inline"}}
              placeholder= { this.props.lang.amount }
              placeholderId="amountSend"
              placeHolderClassName="inputPlaceholder sendPlaceholder sendPlaceholderAmount"
              value={this.props.amount}
              handleChange={this.handleChangeAmount.bind(this)}
              type="text"
              inputStyle={{top: "30px", width: "80%", textAlign: "left"}}
              inputId="inputAmountSend"
            />
            <div onClick={this.confirmSend} className="buttonUnlock sendButton">
              Send
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
