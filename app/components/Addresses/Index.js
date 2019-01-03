import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import * as actions from '../../actions';
import Input from '../Others/Input';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import $ from 'jquery';
import renderHTML from 'react-render-html';
import TableToggle from '../Settings/TableToggle';
import NewAddressModal from './partials/NewAddressModal';

import Header from './../Others/Header';
import Body from './../Others/Body';

const ansAddresImage = require('../../../resources/images/ans_address.png');
const classNames = require('classnames');
const Tools = require('../../utils/tools');


class Index extends Component {
  constructor(props) {
    super(props);
    this.handleChangeAccountAddress = this.handleChangeAccountAddress.bind(this);
    this.rowClicked = this.rowClicked.bind(this);
    this.handleChangeAddressCreationToAns = this.handleChangeAddressCreationToAns.bind(this);
    this.handleChangeNameAddress = this.handleChangeNameAddress.bind(this);
    this.handleUpgradeAddress = this.handleUpgradeAddress.bind(this);
    this.toggleZeroBalanceAddresses = this.toggleZeroBalanceAddresses.bind(this);
    this.openNewAddressModal = this.openNewAddressModal.bind(this);
  }

  componentDidMount() {
    this.updateTable(this.props.userAddresses);
    if (this.props.newAddressName) { TweenMax.set('#addressNamePlaceHolder', { autoAlpha: 0 }); }
    if (this.props.newAddressAccount) { TweenMax.set('#addressAccountPlaceHolder', { autoAlpha: 0 }); }
    if (!this.props.ansAddress) {
      // TweenMax.to('#addressAccount', 0.2, {top: -38});
      TweenMax.to('#addressName', 0.2, { autoAlpha: 0.4 });
      TweenMax.to('.tableCustom', 0.2, { top: 0 });
      TweenMax.to('#imageAns', 0.2, { top: 6 });
      $('#addressName input').attr('disabled', true);
    }
  }

  componentWillReceiveProps(props) {
    this.updateTable(this.props.userAddresses);
  }

  openNewAddressModal () {
    this.confirmAddressModal.getWrappedInstance().toggle();
  }

  componentWillUnmount() {
    this.props.setSelectedAddress(undefined);
    $(window).off('resize');
    this.props.setNewAddressAccount('');
    this.props.setNewAddressName('');
  }

  componentDidUpdate() {
    this.updateTable(this.props.userAddresses);
  }

  updateTable(addresses) {
    $('#rows').css('height', $('.tableCustom').height() - 128);
    const numberOfChildren = addresses.length;
    const totalSize = numberOfChildren * 40; // 40px height of each row
    const sizeOfContainer = $('.tableCustom').height() - 128;
    const sizeOfContainerWidth = $('.tableCustom').width();
    $('.rowDynamic').css('width', sizeOfContainerWidth);

    if (sizeOfContainer < totalSize) {
      $('#rows').css('overflow-y', 'auto');
      $('.headerAddresses').css('left', '-3px');
    } else {
      $(rows).css('overflow-y', 'hidden');
      $('.headerAddresses').css('left', '0px');
    }
  }

  getAddressDiplay(address) {
    if (address.ansrecords.length > 0) {
      return (
        <div>
          <img src={ansAddresImage} />
        </div>
      );
    }
    return null;
  }

  handleUpgradeAddress() {
    this.props.setUpgradingAddress(true);
    this.props.setCreateAddressAns(true);
    this.handleCreateNewAddress();
  }

  toggleZeroBalanceAddresses() {
    this.props.setShowZeroBalance(!this.props.showZeroBalance);
  }

  rowClicked(address) {
    this.props.setSelectedAddress(address);
  }

  handleChangeAddressCreationToAns() {
    if (this.props.ansAddress) return;
    this.props.setCreateAddressAns(true);
    // TweenMax.to('#addressAccount', 0.2, {top: 0});
    TweenMax.fromTo('#ansExplanation', 0.2, { top: -15 }, { top: 15, autoAlpha: 1 });
    TweenMax.to('#addressName', 0.2, { autoAlpha: 1 });
    TweenMax.to('.tableCustom', 0.2, { top: 50 });
    TweenMax.to('#imageAns', 0.2, { top: 55 });
    $('#addressName input').attr('disabled', false);
    $('#addressName input').focus();
  }

  handleChangeAccountAddress(event) {
    const account = event.target.value;
    if (account.length === 0) { TweenMax.set('#addressAccountPlaceHolder', { autoAlpha: 1 }); } else { TweenMax.set('#addressAccountPlaceHolder', { autoAlpha: 0 }); }

    this.props.setNewAddressAccount(account);
  }

  handleChangeNameAddress(event) {
    const name = event.target.value;
    if (name.length === 0) {
      TweenMax.set('#addressNamePlaceHolder', { autoAlpha: 1 });
    } else {
      TweenMax.set('#addressNamePlaceHolder', { autoAlpha: 0 });
    }

    this.props.setNewAddressName(name);
  }

  filterClicked(type) {
    if (type === 'all') { this.props.setFilterOwnAddresses('all'); } else if (type === 'normal') { this.props.setFilterOwnAddresses('normal'); } else if (type === 'ans') { this.props.setFilterOwnAddresses('ans'); }
  }

  render() {
    let counter = 0;
    const rowClassName = 'row normalWeight tableRowCustom';
    const nameHeader = classNames({
      'col-sm-3 headerAddresses tableRowHeader columnPaddingFixAns': this.props.filterAns,
      'col-sm-1 headerAddresses tableRowHeader': !this.props.filterAns,
    });
    const addressHeader = classNames({
      'col-sm-6 headerAddresses tableRowHeader columnPaddingFixAns': this.props.filterAns,
      'col-sm-6 headerAddresses tableRowHeader': !this.props.filterAns,
    });
    const amountHeader = classNames({
      'col-sm-3 headerAddresses tableRowHeader columnPaddingFixAns': this.props.filterAns,
      'col-sm-3 headerAddresses tableRowHeader': !this.props.filterAns,
    });

    const statusHeader = classNames({
      'col-sm-2 headerAddresses tableRowHeader': this.props.filterAll
    });

    const nameColumn = classNames({
      'col-sm-3 tableColumn tableColumnFixReceive selectableText columnPaddingFixAns': this.props.filterAns,
      'col-sm-1 tableColumn tableColumnFixReceive selectableText': !this.props.filterAns,
    });

    const addressColumn = classNames({
      'col-sm-6 tableColumn selectableText columnPaddingFixAns': this.props.filterAns,
      'col-sm-6 tableColumn selectableText': !this.props.filterAns,
    });

    const amountColumn = classNames({
      'col-sm-3 tableColumn selectableText columnPaddingFixAns': this.props.filterAns,
      'col-sm-3 tableColumn selectableText': !this.props.filterAns,
    });

    const statusColumn = classNames({
      'col-sm-2 tableColumn selectableText': this.props.filterAll
    });

    const selectedAddress = this.props.selectedAddress;

    console.log('ADDRESSES', this.props.userAddresses);
    return (
      <div className="padding-titlebar">
        <Header>
          { this.props.lang.addresses }
        </Header>
        <Body noPadding>
          <div className="panel Receive">
            <div className="tableCustom">
              <div className="tableHeaderBig tableHeaderNormal">
                <div className="row col-sm-12" style={{ justifyContent: 'space-between' }}>
                  <div className="col-sm-6">
                    <p className="tableHeaderTitle">{ this.props.lang.yourAddresses }</p>
                    <p className="headerDescription">{ this.props.lang.allYourNormalAndANS }</p>
                  </div>
                  <div className="row col-sm-6" style={{ justifyContent: 'flex-end', padding: '10px 0px 0px 0px' }}>
                    <div className="row col-sm-4" style={{ minWidth: '285px', textAlign: 'right' }}>
                      <p className="headerDescription" style={{ width: '100%', paddingRight: '10px' }}>{this.props.lang.showZeroBalances}</p>
                    </div>
                    <div className="row col-sm-4" style={{ maxWidth: '85px', justifyContent: 'flex-end' }}>
                      <TableToggle
                        keyVal={1}
                        handleChange={this.toggleZeroBalanceAddresses}
                        checked={this.props.showZeroBalance}
                      />
                    </div>
                  </div>
                </div>


                <div id="tableFiltersReceive">
                  <p className={this.props.filterAns ? 'tableFilterReceive textSelected' : 'tableFilterReceive textSelectable'} onClick={this.filterClicked.bind(this, 'ans')}>{ this.props.lang.ansAddresses }</p>
                  <p className={this.props.filterNormal ? 'tableFilterReceive textSelected fixMarginReceive' : 'tableFilterReceive textSelectable fixMarginReceive'} onClick={this.filterClicked.bind(this, 'normal')}>{ this.props.lang.normalAddresses }</p>
                  <p className={this.props.filterAll ? 'tableFilterReceive textSelected fixMarginReceive' : 'tableFilterReceive textSelectable fixMarginReceive'}onClick={this.filterClicked.bind(this, 'all')}>All</p>
                </div>
              </div>
              <div className="tableContainer">
                <div className="row rowDynamic">
                  <div className={nameHeader}>{this.props.filterAll ? '' : this.props.filterNormal ? '' : this.props.lang.name}</div>
                  <div id="addressHeader" className={addressHeader}>{this.props.filterAll ? `${this.props.lang.address} / ${this.props.lang.name}` : this.props.lang.address}</div>
                  <div id="addressHeader" className={amountHeader}>{ this.props.lang.amount }</div>
                  {this.props.filterAll ? <div id="statusHeader" className={statusHeader}>{ this.props.lang.status}</div> : null}
                </div>
                <div id="rows">
                  {this.props.userAddresses.map((address, index) => {
                    if (this.props.filterAll || this.props.filterNormal && !address.ansrecords.length > 0 || this.props.filterAns && address.ansrecords.length > 0) {
                      counter++;
                      if (this.props.showZeroBalance === false && address.current_balance === 0) {
                        return;
                      }
                      return (
                        <div className={selectedAddress && ((address.address === selectedAddress.address && !selectedAddress.ansrecords.length > 0) || (selectedAddress.ansrecords.length > 0 && `${address.address}#${address.ansrecords[0]}` === `${selectedAddress.address}#${selectedAddress.ansrecords[0]}`)) ? `${rowClassName} tableRowSelected` : counter % 2 !== 0 ? rowClassName : `${rowClassName} tableRowEven`} key={`address_${index}`}>
                          <div className={nameColumn} onClick={this.rowClicked.bind(this, address)}>
                            {this.props.filterAns ? address.ansrecords.length > 0 ? renderHTML(`${address.ansrecords[0].name}<span className="Receive__ans-code">#${address.ansrecords[0].code}</span>`) : address.address : this.getAddressDiplay(address)}
                          </div>
                          <div className={addressColumn} onClick={this.rowClicked.bind(this, address)}>
                            {this.props.filterAns ? address.address : address.ansrecords.length > 0 ? renderHTML(`${address.ansrecords[0].name}<span className="Receive__ans-code">#${address.ansrecords[0].code}</span>`) : address.address}
                          </div>
                          <div className={amountColumn} onClick={this.rowClicked.bind(this, address)}>
                            {address.current_balance}
                          </div>
                          {this.props.filterAll ? <div className={statusColumn} onClick={this.rowClicked.bind(this, address)}>
                            <span className="Receive__ans-code">{address.status}</span>
                          </div> : null}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
            <div id="imageAns">
              <img src={ansAddresImage} />
              <p className="ansLabel">{ this.props.lang.ansAddresses }</p>
              <p className="Receive__upgrade-text" onClick={this.handleUpgradeAddress} style={{ visibility: selectedAddress ? selectedAddress.ansrecords.length > 0 ? 'hidden' : 'visible' : 'hidden' }}>Upgrade to ANS address</p>
            </div>
          </div>

          <Button size="lg" onClick={this.openNewAddressModal}>Create New</Button>
        </Body>

        <NewAddressModal ref={(e) => { this.confirmAddressModal = e; }} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    newAddressName: state.application.newAddressName,
    userAddresses: state.application.userAddresses,
    ansAddress: state.application.creatingAnsAddress,
    selectedAddress: state.application.selectedAddress,
    newAddressAccount: state.application.newAddressAccount,
    filterAll: state.application.filterAllOwnAddresses,
    filterNormal: state.application.filterNormalOwnAddresses,
    filterAns: state.application.filterAnsOwnAddresses,
    upgradingAddress: state.application.upgradingAddress,
    showZeroBalance: state.application.showZeroBalance
  };
};

export default connect(mapStateToProps, actions)(Index);
