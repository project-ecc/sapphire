import React, { Component } from 'react';
import AddressBook from './AddressBook';
import SendConfirmation from './SendConfirmation';
import Wallet from '../../utils/wallet';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import TransitionGroup from 'react-transition-group/TransitionGroup';
import $ from 'jquery';
const tools = require('../../utils/tools')

class Send extends Component {
  constructor(props) {
    super(props);
    this.handleClear = this.handleClear.bind(this);
    this.confirmSend = this.confirmSend.bind(this);
    this.handleChangeAmount = this.handleChangeAmount.bind(this);
    this.handleChangeAddress = this.handleChangeAddress.bind(this);
    this.wallet = new Wallet();
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
    var self = this;
    if(this.props.amount == "" || Number(this.props.amount) == 0){
      tools.highlightInput('#inputAmountSend', 1)
    }
    if(this.props.address == ""){
      tools.highlightInput('#inputAddressSend', 1)
    }
    if(this.props.address != "" && this.props.amount != "" && Number(this.props.amount) > 0){
      if(this.props.amount > this.props.balance){
        tools.showTemporaryMessage('#message', "Not enough balance");
        tools.highlightInput('#inputAmountSend', 2.1)
      }
      else{
        this.wallet.validate(this.props.address).then((isAddressValid) => {
        if (!isAddressValid.isvalid) {
          tools.showTemporaryMessage('#message', "Invalid address");
          tools.highlightInput('#inputAddressSend', 2.1)
        } else {
          self.props.setSendingECC(true);
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
      <div className="sendPanel" style={{height: "100%", width: "100%", paddingLeft: "40px", paddingRight: "40px"}}>
        <AddressBook sendPanel={true}/>
          <p id="message" style={{position: "relative", textAlign: "center", color: "#d09128", fontSize: "15px", visibility: "hidden", top: "65px"}}>Address copied below</p>
          <div style={{width: "632px", margin: "0 auto"}}>
            <p id="addressSend" style={{position:"relative",top: "85px", width: "80%", textAlign: "left", color: "#555d77", fontSize: "15px", fontWeight: "600", left: "2px"}}>ANS Name / Address</p>
            <input id="inputAddressSend" value={this.props.address} onChange={this.handleChangeAddress} style={{fontWeight: "600", position:"relative", top: "60px", width: "80%", textAlign: "left", color: "#555d77", fontSize: "15px"}} className="privateKey" type="text"></input>
            <img style={{position: "relative", top: "67px", left: "50%", marginLeft: "-38%", cursor: "pointer"}} onClick={this.handleClear} src={clearButton}/>

            <p id="amountSend" style={{position:"relative",top: "60px", width: "80%", textAlign: "left", color: "#555d77", fontSize: "15px", fontWeight: "600", left: "2px"}}>Amount</p>
            <input id="inputAmountSend" value={this.props.amount} onChange={this.handleChangeAmount} style={{fontWeight: "600", position:"relative",top: "30px", width: "80%", textAlign: "left", color: "#555d77", fontSize: "15px"}} className="privateKey" type="number"></input>
            <div onClick={this.confirmSend} className="buttonUnlock" style={{fontWeight: "600", background: "-webkit-linear-gradient(top, rgb(214, 167, 91) 0%, rgb(162, 109, 22) 100%)", color: "#d9daef", display: "inline-block", textAlign: "center", position: "relative", top: "27px", left:"20px"}}>
            Send
            </div>
          </div>
          <TransitionGroup component={"article"}>
             { this.props.sending ? <SendConfirmation showMessage={this.animateMessage}/> : null}
          </TransitionGroup>
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
    sending: state.application.sendingEcc,
    balance: state.chains.balance
  };
};

export default connect(mapStateToProps, actions)(Send);