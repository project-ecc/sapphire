import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../actions';
import CloseButtonPopup from './Others/CloseButtonPopup';
import ConfirmButtonPopup from './Others/ConfirmButtonPopup';
import Input from './Others/Input';

import $ from 'jquery';

const Tools = require('../utils/tools');

class UnlockWallet extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.unlockWallet = this.unlockWallet.bind(this);
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  async unlockWallet(){
    //const updated = await Tools.updateConfig(1);
    //if (updated){
        let batch = [];
        let obj = {
          method: 'walletpassphrase', parameters: [this.props.passwordVal, 31556926, true]
        };
        batch.push(obj);

        return this.props.wallet.command(batch).then((data) => {
          let result = false;
          console.log("data: ", data);
          data = data[0];
          if (data !== null && data.code === -14) {
            Tools.showTemporaryMessage('#wrongPassword');
          } else if (data !== null && data.code === 'ECONNREFUSED') {
            console.log("daemong ain't working mate :(")
          } else if (data === null) {
            this.props.setPassword("");
            this.props.setUnlocking(false);
            result = true;
          } else {
            console.log("error unlocking wallet: ", data)
          }
          this.props.setPopupLoading(false)
          return result;
        }).catch((err) => {
          console.log("err unlocking wallet: ", err);
          this.props.setPopupLoading(false)
          return false;
        });
     // }
  }

  componentWillUnmount()
  {
    this.props.setPopupLoading(false)
    this.props.setPassword("");
    Tools.showFunctionIcons();
  }

  handleConfirm(){
    if(this.props.passwordVal === ""){
      Tools.showTemporaryMessage('#wrongPassword');
      this.props.setPassword("");
      return;
    }
    this.props.setPopupLoading(true)
    this.unlockWallet().then((result) => {
      if(!result) return;
      return this.props.wallet.setGenerate().then(() => {
        setTimeout(() => this.props.setStaking(true), 1000)
      });
    });
  }

  handleCancel(){
    this.props.setUnlocking(false);
  }

  render() {
     return (
      <div className="UnlockWallet">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.unlockWallet }</p>
        <p style={{fontSize: "16px", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "20px"}}>{this.props.lang.unlockWalletExplanation1 + " " + this.props.lang.unlockWalletExplanation2} <span className="ecc">ECC</span>.</p>
        <div className="UnlockWallet__form">
          <Input
            style={{marginTop: "25px"}}
            placeholder= { this.props.lang.password }
            placeholderId= "password"
            value={this.props.passwordVal}
            handleChange={ this.props.setPassword}
            type="password"
            inputId="unlockWalletPassword"
            autoFocus
            onSubmit={this.handleConfirm}
          />
          <div>
            <p id="wrongPassword" >{ this.props.lang.wrongPassword }</p>
          </div>
        </div>
        <ConfirmButtonPopup
          inputId="#unlockWalletPassword"
          handleConfirm={this.handleConfirm}
          textLoading={this.props.lang.confirming}
          text={ this.props.lang.confirm }
          className="UnlockWallet__form-confirm-btn"
        />
      </div>
      );
    }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    wallet: state.application.wallet
  };
};


export default connect(mapStateToProps, actions)(UnlockWallet);
