import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Card, CardTitle} from 'reactstrap';

import * as actions from '../../actions/index';
import Header from '../Others/Header';
import Body from '../Others/Body';

import UnencryptedWalletPartial from '../Settings/cards/UnencryptedWalletCard';

const Tools = require('../../utils/tools');

class Index extends Component {
  constructor(props) {
    super(props);
    this.getEarnings = this.getEarnings.bind(this);
  }

  earningsFilterClicked(filter) {
    this.props.setFilterEarningsTime(filter);
  }

  earningsTypeFilterClicked(filter) {
    this.props.setFilterEarningsType(filter);
  }

  buildFilterObject(modifier, val) {
    return {
      modifier,
      val,
    };
  }

  getEarnings() {
    // Getting clever
    const timeFilter = [
      this.buildFilterObject('AllTime', this.props.allTimeEarningsSelected),
      this.buildFilterObject('Month', this.props.monthEarningsSelected),
      this.buildFilterObject('Week', this.props.weekEarningsSelected),
    ].filter(f => f.val)[0];

    const typeFilter = [
      this.buildFilterObject(['staking'], this.props.allEarningsSelected),
      this.buildFilterObject(['staking'], this.props.stakingEarningsSelected),
    ].filter(f => f.val)[0];

    return typeFilter.modifier
                  .map(modifier => `${modifier}${timeFilter.modifier}Earnings`)
                  .reduce((accumulator, val) => accumulator + parseFloat(this.props[val]), 0);
  }


  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          { this.props.lang.overview }
        </Header>
        <Body noPadding>
          { this.props.unencryptedWallet && (
            <UnencryptedWalletPartial />
          )}
          <Card body inverse className="homeSection text-center bg-gradient-blue standout" id="balanceInfo">
            <CardTitle id="balance" style={{ fontSize: '25px' }}>{ this.props.lang.balance }</CardTitle>
            <div className="row">
              <div className="col-sm-4" style={{ padding: '0 0' }}>
                <CardTitle className="text-white-50 mb-0"><small>{ this.props.lang.staking }</small></CardTitle>
                <p className="normalWeight">{this.props.stakingVal} <span className="ecc text-white">ecc</span></p>
              </div>
              <div className="col-sm-4" style={{ padding: '0 0' }}>
                <p className="normalWeight" style={{ fontSize: '20px' }}>{this.props.balance} <span className="ecc text-white">ecc</span></p>
                <CardTitle className="text-white-50 mt-4 mb-0"><small>{ this.props.lang.total }</small></CardTitle>
                <p className="normalWeight">{this.props.total} <span className="ecc text-white">ecc</span></p>
              </div>
              <div className="col-sm-4" style={{ padding: '0 0' }}>
                <CardTitle className="text-white-50 mb-0"><small>{ this.props.lang.unconfirmed }</small></CardTitle>
                <p className="normalWeight">{this.props.unconfirmed} <span className="ecc text-white">ecc</span></p>
              </div>
            </div>
          </Card>

          <div className="homeSection" id="earnings">
            <div className="row">
              <div className="col-sm-4 align-self-left" style={{ padding: '0 0' }}>
                <div id="earningsOptions">
                  <div className="arrowHome" />
                  <div id="earningsFirst">
                    <p className="normalWeight homePanelTitleOne" style={{ fontSize: '20px' }}>{ this.props.lang.earnings }</p>
                  </div>
                  <p onClick={this.earningsTypeFilterClicked.bind(this, 'staking')} className={this.props.stakingEarningsSelected ? 'earningsFilters textSelected' : 'earningsFilters textSelectableHome'}> { this.props.lang.staking } </p>
                  <p onClick={this.earningsTypeFilterClicked.bind(this, 'all')} className={this.props.allEarningsSelected ? 'earningsFilters textSelected' : 'earningsFilters textSelectableHome'}> { this.props.lang.all }</p>
                </div>
              </div>
              <div className="col-sm-4 text-center" style={{ padding: '0 0' }}>
                <p className="normalWeight" style={{ fontSize: '20px', position: 'relative', top: '60px' }}>{Tools.formatNumber(this.getEarnings())} <span className="ecc">ecc</span></p>
                <p onClick={this.earningsFilterClicked.bind(this, 'week')} className={this.props.weekEarningsSelected ? 'earningsFiltersDate textSelected' : 'earningsFiltersDate textSelectableHome'}>{ this.props.lang.lastWeek }</p>
                <p onClick={this.earningsFilterClicked.bind(this, 'month')} className={this.props.monthEarningsSelected ? 'earningsFiltersDate textSelected' : 'earningsFiltersDate textSelectableHome'}>{ this.props.lang.lastMonth }</p>
                <p onClick={this.earningsFilterClicked.bind(this, 'allTime')} className={this.props.allTimeEarningsSelected ? 'earningsFiltersDate textSelected' : 'earningsFiltersDate textSelectableHome'}> { this.props.lang.all }</p>
              </div>
            </div>
          </div>
        </Body>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const balance = !state.chains.balance ? 0 : state.chains.balance;
  const staking = !state.chains.staking ? 0 : state.chains.staking;
  const newMint = !state.chains.newMint ? 0 : state.chains.newMint;
  const unconfirmedBalance = !state.chains.unconfirmedBalance ? 0 : state.chains.unconfirmedBalance;
  const immatureBalance = !state.chains.immatureBalance ? 0 : state.chains.immatureBalance;

  return {
    lang: state.startup.lang,
    isStaking: state.chains.isStaking,
    staking: state.chains.staking,
    balance: Tools.formatNumber(balance),
    // temporary fix...
    total: Tools.formatNumber(parseFloat(balance) + parseFloat(staking) + parseFloat(newMint) + parseFloat(unconfirmedBalance) + parseFloat(immatureBalance)),
    unconfirmed: Tools.formatNumber(unconfirmedBalance),
    stakingVal: Tools.formatNumber(staking),
    unencryptedWallet: state.startup.unencryptedWallet,

    // Earnings stuff
    allEarningsSelected: state.earningsExpenses.allEarningsSelected,
    stakingEarningsSelected: state.earningsExpenses.stakingEarningsSelected,

    weekEarningsSelected: state.earningsExpenses.weekEarningsSelected,
    monthEarningsSelected: state.earningsExpenses.monthEarningsSelected,
    allTimeEarningsSelected: state.earningsExpenses.allTimeEarningsSelected,

    stakingAllTimeEarnings: state.application.totalStakingRewards,
    stakingWeekEarnings: state.application.lastWeekStakingRewards,
    stakingMonthEarnings: state.application.lastMonthStakingRewards,

    wallet: state.application.wallet,
    notifications: state.notifications.entries,
  };
};

export default connect(mapStateToProps, actions)(Index);
