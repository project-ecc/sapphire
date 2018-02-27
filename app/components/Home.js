import React, { Component } from 'react';
import { exchanges } from '../utils/exchange';
import { traduction } from '../lang/lang';
import glob from 'glob';
const event = require('../utils/eventhandler');
const homedir = require('os').homedir();
const lang = traduction();
import { connect } from 'react-redux';
import ToggleButton from 'react-toggle';
import * as actions from '../actions';
import TransitionGroup from 'react-transition-group/TransitionGroup';
const tools = require('../utils/tools')

class Home extends Component {
  constructor(props) {
    super(props);
    this.processStakingClicked = this.processStakingClicked.bind(this);
    this.lockWallet = this.lockWallet.bind(this);
    this.getEarnings = this.getEarnings.bind(this);
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
    tools.updateConfig(0);
    var self = this;
    var batch = [];
    var obj = {
      method: 'reloadconfig', parameters: ["staking"],
      method: 'walletlock', parameters: []
    }
    batch.push(obj)

    this.props.wallet.command(batch).then((data) => {
      console.log("data: ", data)
      data = data[0];
     if (data !== null && data.code === 'ECONNREFUSED') {
        console.log("daemong ain't working mate :(")
      } else if (data === null) {
        self.props.setStaking(false);
      } else {
        console.log("error unlocking wallet: ", data)
      }
    }).catch((err) => {
      console.log("err unlocking wallet: ", err);
    });
  }

  lockWallet(){
    var self = this;
    this.props.wallet.walletlock().then((data) => {
        if (data === null) {
          self.props.setStaking(false);
        } else {
          console.log("error unlocking: ", data)
        }
      }).catch((err) => {
        console.log("exception unlocking: ", err)
      });
  }

  earningsFilterClicked(filter){
    this.props.setFilterEarningsTime(filter);    
  }

  earningsTypeFilterClicked(filter){
    this.props.setFilterEarningsType(filter);    
  }

  expensesFilterClicked(filter){
    this.props.setFilterExpensesTime(filter);    
  }

  expensesTypeFilterClicked(filter){
    this.props.setFilterExpensesType(filter);    
  }

  getEarnings(){
    //filter all
    if(this.props.allTimeEarningsSelected && this.props.allEarningsSelected)
      return this.props.fileStorageAllTimeEarnings + this.props.stakingAllTimeEarnings;
    else if(this.props.monthEarningsSelected && this.props.allEarningsSelected)
      return this.props.fileStorageMonthEarnings + this.props.stakingMonthEarnings;
    else if(this.props.weekEarningsSelected && this.props.allEarningsSelected)
      return this.props.fileStorageWeekEarnings + this.props.stakingWeekEarnings;
    //filter file storage
    else if(this.props.fileStorageEarningsSelected && this.props.allTimeEarningsSelected)
      return this.props.fileStorageAllTimeEarnings;
    else if(this.props.fileStorageEarningsSelected && this.props.monthEarningsSelected)
      return this.props.fileStorageMonthEarnings;
    else if(this.props.fileStorageEarningsSelected && this.props.weekEarningsSelected)
      return this.props.fileStorageWeekEarnings;
    //filter staking
    else if(this.props.stakingEarningsSelected && this.props.allTimeEarningsSelected)
      return this.props.stakingAllTimeEarnings;
    else if(this.props.stakingEarningsSelected && this.props.monthEarningsSelected)
      return this.props.stakingMonthEarnings;
    else if(this.props.stakingEarningsSelected && this.props.weekEarningsSelected)
      return this.props.stakingWeekEarnings;
  }

  getExpenses(){
    //filter all
    if(this.props.allTimeExpensesSelected && this.props.allExpensesSelected)
      return this.props.fileStorageAllTimeExpenses + this.props.messagingAllTimeExpenses + this.props.ansAllTimeExpenses;
    else if(this.props.monthExpensesSelected && this.props.allExpensesSelected)
      return this.props.fileStorageMonthExpenses + this.props.messagingMonthExpenses + this.props.ansMonthExpenses;
    else if(this.props.weekExpensesSelected && this.props.allExpensesSelected)
      return this.props.fileStorageWeekExpenses + this.props.messagingWeekExpenses + this.ansWeekExpenses;
    //filter file storage
    else if(this.props.fileStorageExpensesSelected && this.props.allTimeExpensesSelected)
      return this.props.fileStorageAllTimeExpenses;
    else if(this.props.fileStorageExpensesSelected && this.props.monthExpensesSelected)
      return this.props.fileStorageMonthExpenses;
    else if(this.props.fileStorageExpensesSelected && this.props.weekExpensesSelected)
      return this.props.fileStorageWeekExpenses;
    //filter messaging
    else if(this.props.messagingExpensesSelected && this.props.allTimeExpensesSelected)
      return this.props.messagingAllTimeExpenses;
    else if(this.props.messagingExpensesSelected && this.props.monthExpensesSelected)
      return this.props.messagingMonthExpenses;
    else if(this.props.messagingExpensesSelected && this.props.weekExpensesSelected)
      return this.props.messagingWeekExpenses;
    //filter ans
    else if(this.props.ansExpensesSelected && this.props.allTimeExpensesSelected)
      return this.props.ansAllTimeExpenses;
    else if(this.props.ansExpensesSelected && this.props.monthExpensesSelected)
      return this.props.ansMonthExpenses;
    else if(this.props.ansExpensesSelected && this.props.weekExpensesSelected)
      return this.props.ansWeekExpenses;
  }

  render() {
    let fileStorageEarnings = require('../../resources/images/fileStorage-default.png');
    if(this.props.fileStorageEarningsSelected)
      fileStorageEarnings = require('../../resources/images/fileStorage-blue.png');

    let fileStorageExpenses = require('../../resources/images/fileStorage-default.png');
    if(this.props.fileStorageExpensesSelected)
      fileStorageExpenses = require('../../resources/images/fileStorage-blue.png');

    let messaging = require('../../resources/images/messaging-default.png');
    if(this.props.messagingExpensesSelected)
      messaging = require('../../resources/images/messaging-blue.png');

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
                    <img onClick={this.earningsTypeFilterClicked.bind(this, "fileStorage")} style={{display: "inline-block",  cursor: "pointer", paddingLeft:"20px", position:"relative", top: "103px", left: "12px"}} src={fileStorageEarnings}/>
                    <p onClick={this.earningsTypeFilterClicked.bind(this, "staking")} style = {{color: this.props.stakingEarningsSelected ? "#aeacf3" : "#85899e"}} className="earningsFilters"> Staking </p>
                    <p onClick={this.earningsTypeFilterClicked.bind(this, "all")} style = {{color: this.props.allEarningsSelected ? "#aeacf3" : "#85899e"}} className="earningsFilters"> All</p>
                </div>
              </div>    
              <div className="col-sm-4 text-center"  style={{padding: "0 0"}}>
                  <p className="normalWeight" style={{fontSize: "20px", position: "relative", top: "60px"}}>{tools.formatNumber(this.getEarnings())} <span className="ecc">ecc</span></p>
                    <p onClick={this.earningsFilterClicked.bind(this, "week")} style = {{color: this.props.weekEarningsSelected ? "#aeacf3" : "#85899e"}} className="earningsFiltersDate">Last Week</p>
                    <p onClick={this.earningsFilterClicked.bind(this, "month")} style = {{color: this.props.monthEarningsSelected ? "#aeacf3" : "#85899e"}} className="earningsFiltersDate">Last Month</p>
                    <p onClick={this.earningsFilterClicked.bind(this, "allTime")} style = {{color: this.props.allTimeEarningsSelected ? "#aeacf3" : "#85899e"}} className="earningsFiltersDate"> All</p>
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
                    <img onClick={this.expensesTypeFilterClicked.bind(this, "messaging")} style={{display: "inline-block",  cursor: "pointer", paddingLeft:"20px", position:"relative", top: "103px", left: "12px"}} src={messaging}/>
                    <img onClick={this.expensesTypeFilterClicked.bind(this, "fileStorage")} style={{display: "inline-block",  cursor: "pointer", paddingLeft:"20px", position:"relative", top: "103px", left: "12px"}} src={fileStorageExpenses}/>
                    <p onClick={this.expensesTypeFilterClicked.bind(this, "ans")} style = {{color: this.props.ansExpensesSelected ? "#aeacf3" : "#85899e"}} className="earningsFilters"> ANS </p>
                    <p onClick={this.expensesTypeFilterClicked.bind(this, "all")} style = {{color: this.props.allExpensesSelected ? "#aeacf3" : "#85899e"}} className="earningsFilters"> All</p>
                </div>
              </div>    
              <div className="col-sm-4 text-center"  style={{padding: "0 0"}}>
                  <p className="normalWeight" style={{fontSize: "20px", position: "relative", top: "60px"}}>0 <span className="ecc">ecc</span></p>
                    <p onClick={this.expensesFilterClicked.bind(this, "week")} style = {{color: this.props.weekExpensesSelected ? "#aeacf3" : "#85899e"}} className="earningsFiltersDate">Last Week</p>
                    <p onClick={this.expensesFilterClicked.bind(this, "month")} style = {{color: this.props.monthExpensesSelected ? "#aeacf3" : "#85899e"}} className="earningsFiltersDate">Last Month</p>
                    <p onClick={this.expensesFilterClicked.bind(this, "allTime")} style = {{color: this.props.allTimeExpensesSelected ? "#aeacf3" : "#85899e"}} className="earningsFiltersDate"> All</p>
              </div>  
              <div className="col-sm-4  text-center"  style={{padding: "0 0"}}>
                  <p className="normalWeight" style={{fontSize: "16px", paddingTop: "15px"}}>Next Payments</p>
              </div>           
            </div>
          </div>
        </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    staking: state.chains.isStaking,
    balance: tools.formatNumber(state.chains.balance),

    //Earnings stuff
    allEarningsSelected: state.earningsExpenses.allEarningsSelected,
    fileStorageEarningsSelected: state.earningsExpenses.fileStorageEarningsSelected,
    stakingEarningsSelected: state.earningsExpenses.stakingEarningsSelected,

    weekEarningsSelected: state.earningsExpenses.weekEarningsSelected,
    monthEarningsSelected: state.earningsExpenses.monthEarningsSelected,
    allTimeEarningsSelected: state.earningsExpenses.allTimeEarningsSelected,

    stakingAllTimeEarnings: state.application.totalStakingRewards,
    stakingWeekEarnings: state.application.lastWeekStakingRewards,
    stakingMonthEarnings: state.application.lastMonthStakingRewards,

    fileStorageAllTimeEarnings: state.application.totalFileStorageRewards,
    fileStorageWeekEarnings: state.application.lastWeekFileStorageRewards,
    fileStorageMonthEarnings: state.application.lastMonthFileStorageRewards,

    //Expenses stuff
    allExpensesSelected: state.earningsExpenses.allExpensesSelected,
    fileStorageExpensesSelected: state.earningsExpenses.fileStorageExpensesSelected,
    messagingExpensesSelected: state.earningsExpenses.messagingExpensesSelected,
    ansExpensesSelected: state.earningsExpenses.ansExpensesSelected,

    weekExpensesSelected: state.earningsExpenses.weekExpensesSelected,
    monthExpensesSelected: state.earningsExpenses.monthExpensesSelected,
    allTimeExpensesSelected: state.earningsExpenses.allTimeExpensesSelected,

    messagingAllTimeExpenses: state.application.totalmessagingExpenses,
    messagingWeekExpenses: state.application.lastWeekmessagingExpenses,
    messagingMonthExpenses: state.application.lastMonthStakingExpenses,

    fileStorageAllTimeExpenses: state.application.totalFileStorageExpenses,
    fileStorageWeekExpenses: state.application.lastWeekFileStorageExpenses,
    fileStorageMonthExpenses: state.application.lastMonthFileStorageExpenses,

    ansAllTimeExpenses: state.application.totalAnsExpenses,
    ansWeekExpenses: state.application.lastWeekAnsExpenses,
    ansMonthExpenses: state.application.lastMonthAnsExpenses,

    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Home);