import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Button } from 'reactstrap';
import { ArrowRightIcon } from 'mdi-react';

import Body from './../Others/Body';
import Header from './../Others/Header';

import AddressBook from './partials/AddressBook';
import * as actions from '../../actions';

import Toast from '../../globals/Toast/Toast';

const { clipboard } = require('electron');
const Tools = require('../../utils/tools');

class Index extends Component {
  constructor(props) {
    super(props);

    this.confirmSend = this.confirmSend.bind(this);
    this.onContactClick = this.onContactClick.bind(this);

    this.state = {
      address: '',
      amount: 0
    };
  }


  async confirmSend() {
    if (this.state.amount < 1 || isNaN(this.state.amount) === 1) {
      Toast({
        color: 'red',
        message: this.props.lang.enterValidAmount
      });
      return;
    }

    if (this.state.address.length < 1) {
      Toast({
        color: 'red',
        message: this.props.lang.enterValidAddress
      });
      return;
    }

    if (Number(this.state.amount) > Number(this.props.balance)) {
      Toast({
        message: this.props.lang.notEnoughBalance,
        color: 'red'
      });
      return;
    }

    let result;
    try {
      result = await Tools.searchForUsernameOrAddress(this.props.wallet, this.state.address);
      if (result.ans && result.addresses.length === 1) {
        this.props.setUsernameSend(result.addresses[0].Name, `#${result.addresses[0].Code}`);
        this.props.setAddressSend(result.addresses[0].Address);
      } else if (result) {
        this.props.setAddressSend(result.addresses[0].address);
      }
    } catch (err) {
      console.log('err: ', err);
    }

    if (!result) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.invalidFailedAddress,
        color: 'red'
      });
    } else {
      // this.props.setSendingECC(true);
    }
  }

  onContactClick(contact) {
    let sendTo = null;
    if (contact.address !== null) {
      sendTo = contact.address.address;
    }

    if (sendTo === null) {
      Toast({
        message: this.props.lang.contactInvalidAddress,
        color: 'red'
      });
      return;
    }

    this.setState({
      address: sendTo
    });
    clipboard.writeText(sendTo);
    Toast({
      message: this.props.lang.addressCopiedBelow
    });
  }

  onTextFieldChange(key, e) {
    const value = e.target.value;
    const payload = {};
    payload[key] = value;
    this.setState(payload);
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header titleClassName="d-flex justify-content-between">
          <div>{ this.props.lang.send }</div>
          <div className="text-right">
            <p className="normalWeight homePanelTitleOne" style={{ fontSize: '14px' }}>Available { this.props.lang.balance }</p>
            <p className="normalWeight" style={{ fontSize: '20px' }}>{this.props.balance} <span className="ecc">ecc</span></p>
          </div>
        </Header>
        <Body noPadding>
          <div className="row flex-row-reverse">
            <div className="col-md-5">
              <div>
                <Input
                  placeholder={this.props.lang.address}
                  value={this.state.address}
                  type="text"
                  onChange={e => this.onTextFieldChange('address', e)}
                />
                <Input
                  className="mt-3"
                  placeholder={this.props.lang.amount}
                  value={this.state.amount}
                  type="number"
                  onChange={e => this.onTextFieldChange('amount', e)}
                />
                <div className="mt-3 d-flex justify-content-end">
                  <Button onClick={this.confirmSend} color="primary">
                    { this.props.lang.send }
                    <ArrowRightIcon className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-md-7">
              <AddressBook onContactClick={this.onContactClick}>
                <div className="pl-3 pr-3 pt-2 pb-2">
                  <p className="headerDescription">{ this.props.lang.selectAContactToSend1 } <span className="ecc">ecc</span> { this.props.lang.selectAContactToSend2 }</p>
                </div>
              </AddressBook>
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
    staking: state.chains.isStaking,
    balance: Tools.formatNumber(balance),
    // temporary fix...
    total: Tools.formatNumber(balance + staking + newMint + unconfirmedBalance + immatureBalance),
    unconfirmed: Tools.formatNumber(unconfirmedBalance),
    stakingVal: Tools.formatNumber(staking),
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Index);
