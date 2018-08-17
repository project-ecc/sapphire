import React, { Component } from 'react';
import { connect } from 'react-redux';
import renderHTML from 'react-render-html';

import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import {SELECTED_PANEL, SELECTED_SIDEBAR} from "../../actions/types";

const Tools = require('../../utils/tools');

class DonateModal extends React.Component {
  constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    this.renderGoals = this.renderGoals.bind(this);
    // this._handleKeyPress = this._handleKeyPress.bind(this);
  }

  _handleKeyPress = (e) => {
    console.log(e);
    if (e.key === 'Enter') {
      this.handleConfirm();
    }
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
    console.log(this.props.goal.cryptos)
  }

  componentWillUnmount() {
    Tools.showFunctionIcons();
    this.props.setSelectedGoal({})
  }
  componentDidUpdate(p1,p2){
    console.log(p1)
    console.log(p2)
  }

  handleECCDonation(eccObject){
    this.props.setDonationPopup(false)
    this.props.setAddressSend(eccObject.address)
    this.props.setAddressOrUsernameSend(eccObject.address)
    this.props.setSelectedPanel('send')
    this.props.setSettings(false);
  }

  handleCancel(){
    this.props.setDonationPopup(false)
  }

  renderGoals(){
    const cryptos = new Map(Object.entries(this.props.goal.cryptos));
    let goalArray = []

    cryptos.forEach((value, key, map) => {
      goalArray.push({ticker: key, address: value.address, balance: value.balance})
    })
    return goalArray.map((t, index) => {
      if(t.ticker == 'eth') return
      return (
        <div key={index}>
          <p className="popupTitle">{t.ticker}</p>
          <p className="selectableText">{t.address}</p>
          <p className="">{Tools.formatNumber(t.balance)}</p>
          {t.ticker == 'ecc' ? <div className="buttonPrimary caps" onClick={this.handleECCDonation.bind(this, t)}>
            <span className="fa fa-gift"></span> Donate Now!</div> : null}
        </div>
      )
    })
  }
  render() {

    return (
      <div style={{height: "100%", display: 'block', overflow: 'auto', width: '535px', margin: 'auto 0', padding: '10px',  minHeight: '400px'}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{this.props.goal.name}</p>
        <p className="">{this.props.goal.description}</p>
        {this.renderGoals()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    goal: state.application.selectedGoal
  };
};


export default connect(mapStateToProps, actions)(DonateModal);
