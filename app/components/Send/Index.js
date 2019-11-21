import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Input} from 'reactstrap';
import {ArrowRightIcon} from 'mdi-react';

import Body from './../Others/Body';
import Header from './../Others/Header';
import UnlockModal from './../Others/UnlockModal';
import StakingPartial from '../Settings/cards/StakingCard';

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
    this.sendECC = this.sendECC.bind(this);

    this.state = {
      address: '',
      amount: 0
    };
  }


  async confirmSend() {

    if (this.props.initialBlockDownload === true) {
      Toast({
        color: 'red',
        message: 'You cannot send ECC until you are fully Synced'
      });
      return;
    }

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
      result = await this.props.wallet.validate(this.state.address);
    } catch (err) {
      console.log('err: ', err);
    }

    if (!result.isvalid) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.invalidFailedAddress,
        color: 'red'
      });
    } else {
      this.unlockModal.getWrappedInstance().toggle();
    }
  }

  sendECC() {
    const wasStaking = this.props.staking;
    const batch = [];
    const obj = {
      method: 'sendToAddress', parameters: [this.state.address, this.state.amount]
    };
    batch.push(obj);
    this.props.wallet.command(batch).then((data) => {
      if (data && data[0] && typeof data[0] === 'string') {
        if (wasStaking) {
          this.unlockWallet(true, 31556926, () => {
          });
        } else {
          this.props.setStaking(false);
        }
        this.resetForm();
        this.props.setTemporaryBalance(this.props.balance - this.state.amount);
        Toast({
          title: this.props.lang.success,
          message: this.props.lang.sentSuccessfully
        });
      } else {
        throw ('Failed to send');
      }
    }).catch((err) => {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.failedToSend,
        color: 'red'
      });
      this.resetForm();
    });
  }

  resetForm () {
    this.setState({
      address: '',
      amount: 0
    });
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
          <div>{ this.props.lang.sendCoins }</div>
          <div className="text-right">
            <p className="normalWeight homePanelTitleOne" style={{ fontSize: '14px' }}>Available { this.props.lang.balance }</p>
            <p className="normalWeight" style={{ fontSize: '20px' }}>{this.props.balance} <span className="ecc">ecc</span></p>
          </div>
        </Header>
        <Body noPadding>
          { this.props.staking && this.props.isUnlocked && (
            <StakingPartial />
          )}
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
                  <Button onClick={this.confirmSend} color="primary" disabled={this.props.staking}>
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

        <UnlockModal ref={(e) => { this.unlockModal = e; }} onUnlock={this.sendECC}>
          <p>
            { this.props.lang.unlockWalletForSend }
          </p>
          <p className="mt-4">
            <b>{ this.props.lang.amount }:</b> {Tools.formatNumber(Number(this.state.amount))}
            <span className="ecc ml-1">ecc</span>
            <span className="ml-2">({`${Tools.formatNumber(Number(this.state.amount * this.props.selectedCurrencyValue))} ${this.props.selectedCurrency.toUpperCase()}`})</span>
          </p>
          <p className="labelSend">
            <b>{ this.props.lang.address }:</b>
            <span className="ml-1">
              {this.state.address}
            </span>
          </p>
        </UnlockModal>
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
    wallet: state.application.wallet,
    selectedCurrency: state.application.selectedCurrency,
    selectedCurrencyValue: state.application.coinMarketCapStats.price,
    initialBlockDownload: state.chains.initialDownload,
    isUnlocked: state.chains.unlockedUntil > 0
  };
};

export default connect(mapStateToProps, actions)(Index);
