import React, { Component } from 'react';
import Wallet from '../utils/wallet';
import { exchanges } from '../utils/exchange';
import { traduction } from '../lang/lang';
import glob from 'glob';
const event = require('../utils/eventhandler');
const homedir = require('os').homedir();
const lang = traduction();
const wallet = new Wallet();
import { connect } from 'react-redux';
import ToggleButton from 'react-toggle';
import * as actions from '../actions';
import UnlockWallet from './UnlockWallet';
import TransitionGroup from 'react-transition-group/TransitionGroup';
const tools = require('../utils/tools')

class Home extends Component {
  constructor(props) {
    super(props);
    this.processStakingClicked = this.processStakingClicked.bind(this);
    this.lockWallet = this.lockWallet.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  processStakingClicked(){
    if(!this.props.staking)
      this.props.setUnlocking(true);
    else this.lockWallet();
  }

  lockWallet(){
    var self = this;
    wallet.walletlock().then((data) => {
        if (data === null) {
          self.props.setStaking(false);
        } else {
          console.log("error unlocking: ", data)
        }
      }).catch((err) => {
        console.log("exception unlocking: ", err)
      });
  }

  render() {
    let fileStorage = require('../../resources/images/fileStorage-blue.png');
    if(this.props.fileStorageEarnings)
      fileStorage = require('../../resources/images/fileStorage-orange.png');
    let messaging = require('../../resources/images/messaging-blue.png');
    if(this.props.fileStorageEarnings)
      fileStorage = require('../../resources/images/messaging-orange.png');
    const stakingEarningsColor = this.props.stakingEarnings ? "#aeacf3" : "#85899e";
    const allEarningsColor = this.props.allEarnings ? "#aeacf3" : "#85899e";

    return (
        <div id ="homeSections">
          <div className="homeSection text-center" id="balanceInfo">
            <div className="row">
              <div className="col-sm-4"  style={{padding: "0 0"}}>
                <p className="darker stakingBalance">Staking</p>
                <p className="normalWeight">0 <span className="ecc">ecc</span></p>
                <div style={{width: "52px", margin: "0 auto", marginTop: "10px"}}>
                <ToggleButton
                  checked={this.props.staking}
                  onChange={() => {
                    this.processStakingClicked();
                  }} />
                </div>
              </div>
              <div className="col-sm-4"  style={{padding: "0 0"}}>
                <p className="normalWeight" id="balance" style={{fontSize: "20px"}}>Balance</p>
                <p className="normalWeight" style={{fontSize: "20px"}}>{this.props.balance} <span className="ecc">ecc</span></p>
                <p className="darker totalBalance">Total</p>
                <p className="normalWeight">{this.props.balance} <span className="ecc">ecc</span></p>
              </div>
              <div className="col-sm-4"  style={{padding: "0 0"}}>
                <p className="darker unconfirmedBalance">Unconfirmed</p>
                <p className="normalWeight">0 <span className="ecc">ecc</span></p>
              </div>
            </div>
          </div>
          <div className="homeSection"  id="earnings">
            <div className="row">
              <div className="col-sm-4 align-self-left" style={{padding: "0 0"}}>
                <div id="earningsOptions">
                  <div className="arrow"></div>
                  <div id="earningsFirst">
                    <p className="normalWeight" style={{fontSize: "20px"}}>Earnings</p>
                  </div> 
                    <img style={{display: "inline-block",  cursor: "pointer", paddingLeft:"20px", position:"relative", top: "103px", left: "12px"}} src={fileStorage}/>
                    <p style = {{color: stakingEarningsColor}} className="earningsFilters"> Staking </p>
                    <p style = {{color: allEarningsColor}} className="earningsFilters"> All</p>
                </div>
              </div>    
              <div className="col-sm-4 text-center"  style={{padding: "0 0"}}>
                  <p className="normalWeight" style={{fontSize: "20px", position: "relative", top: "60px"}}>0 <span className="ecc">ecc</span></p>
                    <p style = {{color: stakingEarningsColor}} className="earningsFiltersDate"> 7 days </p>
                    <p style = {{color: stakingEarningsColor}} className="earningsFiltersDate"> Last Month </p>
                    <p style = {{color: allEarningsColor}} className="earningsFiltersDate"> All</p>
              </div>        
            </div>
          </div>
          <div className="homeSection" id="expenses">
            <div className="row">
              <div className="col-sm-4 align-self-left"  style={{padding: "0 0"}}>
                <div id="earningsOptions">
                  <div className="arrow arrowExpenses"></div>
                  <div id="earningsFirst">
                    <p className="normalWeight" style={{fontSize: "20px"}}>Expenses</p>
                  </div> 
                    <img style={{display: "inline-block",  cursor: "pointer", paddingLeft:"20px", position:"relative", top: "103px", left: "12px"}} src={messaging}/>
                    <img style={{display: "inline-block",  cursor: "pointer", paddingLeft:"20px", position:"relative", top: "103px", left: "12px"}} src={fileStorage}/>
                    <p style = {{color: stakingEarningsColor}} className="earningsFilters"> ANS </p>
                    <p style = {{color: allEarningsColor}} className="earningsFilters"> All</p>
                </div>
              </div>    
              <div className="col-sm-4 text-center"  style={{padding: "0 0"}}>
                  <p className="normalWeight" style={{fontSize: "20px", position: "relative", top: "60px"}}>0 <span className="ecc">ecc</span></p>
                    <p style = {{color: stakingEarningsColor}} className="earningsFiltersDate"> 7 days </p>
                    <p style = {{color: stakingEarningsColor}} className="earningsFiltersDate"> Last Month </p>
                    <p style = {{color: allEarningsColor}} className="earningsFiltersDate"> All</p>
              </div>  
              <div className="col-sm-4  text-center"  style={{padding: "0 0"}}>
                  <p className="normalWeight" style={{fontSize: "16px", paddingTop: "15px"}}>Next Payments</p>
              </div>           
            </div>
          </div>
          <TransitionGroup>
             { this.props.unlocking ? <UnlockWallet/> : null}
          </TransitionGroup>
        </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    staking: state.chains.staking,
    balance: tools.formatNumber(state.chains.balance),
    allEarnings: true,
    fileStorageEarnings: false,
    stakingEarnings: false,
    sevenDaysEarnings: false,
    monthEarnings: false,
    allTimeEarnings: true,
    unlocking: state.application.unlocking
  };
};

export default connect(mapStateToProps, actions)(Home);