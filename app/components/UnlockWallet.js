import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import {TweenMax} from "gsap";
import $ from 'jquery';
const Tools = require('../utils/tools');
import CloseButtonPopup from './Others/CloseButtonPopup';
import ConfirmButtonPopup from './Others/ConfirmButtonPopup';
import Input from './Others/Input';

class UnlockWallet extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.unlockWallet = this.unlockWallet.bind(this);
  }

  unlockWallet(){
    //Tools.updateConfig(1).then((updated) => {
      //if(updated) {
        let batch = [];
        let obj = {
          method: 'reloadconfig', parameters: ["staking"],
          method: 'walletpassphrase', parameters: [this.props.passwordVal, 31556926, true]
        };
        batch.push(obj);

        this.props.wallet.command(batch).then((data) => {
          console.log("data: ", data);
          data = data[0];
          if (data !== null && data.code === -14) {
            Tools.showTemporaryMessage('#wrongPassword');
          } else if (data !== null && data.code === 'ECONNREFUSED') {
            console.log("daemong ain't working mate :(")
          } else if (data === null) {
            this.props.setPassword("");
            this.props.setUnlocking(false);
            setTimeout(() => {
              this.props.setStaking(true);
            }, 300)
          } else {
            console.log("error unlocking wallet: ", data)
          }
        }).catch((err) => {
          console.log("err unlocking wallet: ", err);
        });
      //}
    //})
    //.catch((error) => {
     // console.log(error);
    //});
  }

  componentWillUnmount()
  {
    this.props.setPassword("");
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
      Tools.showTemporaryMessage('#wrongPassword');
      this.props.setPassword("");
      return;
    }
    this.unlockWallet();
  }

  handleCancel(){
    this.props.setUnlocking(false);
  }

  render() {
     return (
      <div className="unlockWallet">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.unlockWallet }</p>
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "left", margin: "0 auto", paddingTop: "20px"}}>{ this.props.lang.unlockWalletExplanation1 }<br></br>{ this.props.lang.unlockWalletExplanation2 } <span className="ecc">ECC</span>.</p>
          <Input
            divStyle={{width: "400px"}}
            placeholder= { this.props.lang.password }
            placeholderId= "password"
            placeHolderClassName="inputPlaceholder inputPlaceholderUnlock"
            value={this.props.passwordVal}
            handleChange={this.handleChange.bind(this)}
            type="password"
            inputStyle={{width: "400px", top: "20px", marginBottom: "30px"}}
          />
        <div>
          <p id="wrongPassword" className="wrongPassword">{ this.props.lang.wrongPassword }</p>
        </div>
        <ConfirmButtonPopup handleConfirm={this.handleConfirm} text={ this.props.lang.confirm }/>
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
