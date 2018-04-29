import React, { Component } from 'react';
import { connect } from 'react-redux';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { traduction } from '../../lang/lang';
import * as actions from '../../actions';
import Input from '../Others/Input';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import $ from 'jquery';
const lang = traduction();
const { clipboard } = require('electron');
const ansAddresImage = require('../../../resources/images/ans_address.png');
var classNames = require('classnames');

// This is temporary until ANS is enabled
const ansEnabled = false;

class Receive extends Component {

  constructor(props) {
    super(props);
    this.handleChangeAccountAddress = this.handleChangeAccountAddress.bind(this);
    this.handleCreateNewAddress = this.handleCreateNewAddress.bind(this);
    this.rowClicked = this.rowClicked.bind(this);
    this.handleChangeAddressCreationToAns = this.handleChangeAddressCreationToAns.bind(this);
    this.handleChangeAddressCreationToNormal = this.handleChangeAddressCreationToNormal.bind(this);
    this.handleChangeNameAddress = this.handleChangeNameAddress.bind(this);
  }

  componentDidMount() {
    $( window ).on('resize', () => {
      this.updateTable(this.props.userAddresses);
    });
    this.updateTable(this.props.userAddresses);
    if(this.props.newAddressName)
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});
    if(this.props.newAddressAccount)
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 0});
    if(!this.props.ansAddress){
      //TweenMax.to('#addressAccount', 0.2, {top: -38});
      TweenMax.to('#addressName', 0.2, {autoAlpha: 0.4});
      TweenMax.to('.tableCustom', 0.2, {top: 0});
      TweenMax.to('#imageAns', 0.2, {top: 6})
      $("#addressName input").attr("disabled", true);
    }
  }

  componentWillReceiveProps(props){
    if(this.props.userAddresses.length !== props.userAddresses.length){
      TweenMax.fromTo('#addressCreatedSuccessfully', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
      TweenMax.to('#addressCreatedSuccessfully', 0.2, {autoAlpha: 0, scale: 0.5, delay: 5});
    }
    this.updateTable(this.props.userAddresses);
  }

  componentWillUnmount() {
    this.props.setSelectedAddress(undefined);
    $( window ).off('resize');
    this.props.setNewAddressAccount("");
    this.props.setNewAddressName("");
  }

  componentDidUpdate(){
    this.updateTable(this.props.userAddresses);
  }

  updateTable(addresses){
    $('#rows').css("height", $('.tableCustom').height()-128);
    let numberOfChildren = addresses.length;
    let totalSize = numberOfChildren * 40; //40px height of each row
    let sizeOfContainer = $('.tableCustom').height()-128;
    let sizeOfContainerWidth = $('.tableCustom').width();
    $('.rowDynamic').css("width", sizeOfContainerWidth);

    if(sizeOfContainer < totalSize){
      $('#rows').css("overflow-y", "auto");
      $('.headerAddresses').css("left", "-3px");
    } else{
      $(rows).css("overflow-y", "hidden");
      $('.headerAddresses').css("left", "0px");
    }
  }

  getAddressDiplay(address) {
    if (address.ans) {
      return (
        <div>
          <img src={ansAddresImage} />
        </div>
      )
    } else {
      if (ansEnabled) {
        return (
          <p id="upgradeAns" onClick={this.handleUpgradeAddress.bind(this)}>{this.props.lang.upgradeToANS}</p>
        )
      } else {
        return (
          <p></p>
        )
      }
    }
  }

  handleCreateNewAddress(skipCheck) {
    if(this.props.ansAddress && this.props.newAddressName === "" && !skipCheck){
      //animate line
    } else{
      this.props.setCreatingAddress(true);
    }
  }

  handleUpgradeAddress() {
    this.props.setUpgradingAddress(true);
    this.props.setCreateAddressAns(true);
    this.handleCreateNewAddress(true);
  }

  rowClicked(address){
    this.props.setSelectedAddress(address);
  }

  handleChangeAddressCreationToAns(){
    if(this.props.ansAddress) return;
    this.props.setCreateAddressAns(true);
    //TweenMax.to('#addressAccount', 0.2, {top: 0});
    TweenMax.fromTo('#ansExplanation', 0.2, {top: -15}, {top: 15, autoAlpha: 1});
    TweenMax.to('#addressName', 0.2, {autoAlpha: 1});
    TweenMax.to('.tableCustom', 0.2, {top: 50});
    TweenMax.to('#imageAns', 0.2, {top: 55});
    $("#addressName input").attr("disabled", false);
    $("#addressName input").focus();
  }

  handleChangeAddressCreationToNormal(){
    if(!this.props.ansAddress) return;
    this.props.setCreateAddressAns(false);
    //TweenMax.to('#addressAccount', 0.2, {top: -38});
    TweenMax.fromTo('#ansExplanation', 0.2, {top: 15}, {top: -15, autoAlpha: 0});
    TweenMax.to('#addressName', 0.2, {autoAlpha: 0.4});
    TweenMax.to('.tableCustom', 0.2, {top: 0});
    TweenMax.to('#imageAns', 0.2, {top: 6});
    $("#addressName input").attr("disabled", true);
    this.props.setNewAddressName("");
    TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 1});
  }

  handleChangeAccountAddress(event){
    const account = event.target.value;
    if(account.length === 0)
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 1});
    else
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 0});

    this.props.setNewAddressAccount(account);
  }

  handleChangeNameAddress(event){
    const name = event.target.value;
    if(name.length === 0) {
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 1});
    } else {
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});
    }

    this.props.setNewAddressName(name);
  }

  goToBackupPage(){
    this.props.setSettingsOptionSelected("Wallet");
    this.props.setSettings(true);
  }

  filterClicked(type){
    console.log(type);
    if(type === "all")
      this.props.setFilterOwnAddresses("all");
    else if(type === "normal")
      this.props.setFilterOwnAddresses("normal");
    else if(type === "ans")
      this.props.setFilterOwnAddresses("ans");
  }

  render() {
    let counter = 0;
    let rowClassName = "row normalWeight tableRowCustom";
    let nameHeader = classNames({
      'col-sm-3 headerAddresses tableRowHeader columnPaddingFixAns': this.props.filterAns,
      'col-sm-1 headerAddresses tableRowHeader': !this.props.filterAns,
    });
    let addressHeader = classNames({
      'col-sm-6 headerAddresses tableRowHeader columnPaddingFixAns': this.props.filterAns,
      'col-sm-7 headerAddresses tableRowHeader': !this.props.filterAns,
    });
    let amountHeader = classNames({
      'col-sm-3 headerAddresses tableRowHeader columnPaddingFixAns': this.props.filterAns,
      'col-sm-4 headerAddresses tableRowHeader': !this.props.filterAns,
    });

    let nameColumn = classNames({
      'col-sm-3 tableColumn tableColumnFixReceive selectableText columnPaddingFixAns': this.props.filterAns,
      'col-sm-1 tableColumn tableColumnFixReceive selectableText': !this.props.filterAns,
    });

    let addressColumn = classNames({
      'col-sm-6 tableColumn selectableText columnPaddingFixAns': this.props.filterAns,
      'col-sm-7 tableColumn selectableText': !this.props.filterAns,
    });

    let amountColumn = classNames({
      'col-sm-3 tableColumn selectableText columnPaddingFixAns': this.props.filterAns,
      'col-sm-4 tableColumn selectableText': !this.props.filterAns,
    });


    return (
      <div className="panel">
        <div id="headerReceive">
          <p className={this.props.ansAddress ? "typeSelectorReceive textSelected" : "typeSelectorReceive textSelectable"}  onClick={this.handleChangeAddressCreationToAns}>ANS</p>
          <span>/</span>
          <p className={this.props.ansAddress ? "typeSelectorReceive textSelectable" : "typeSelectorReceive textSelected"} onClick={this.handleChangeAddressCreationToNormal}>{ this.props.lang.normalAddress }</p>
        </div>
        <div id="inputAddress">
          <div style={{display: "inline-block", width: "70%", position: "relative"}}>
            <Input
              divId="addressName"
              divStyle={{display: "inline"}}
              placeholder= { this.props.lang.name }
              placeHolderClassName="inputPlaceholder inputPlaceholderReceive"
              placeholderId="addressNamePlaceHolder"
              value={this.props.newAddressName}
              handleChange={this.handleChangeNameAddress.bind(this)}
              type="text"
              inputStyle={{textAlign: "left", width:"100%", display: "inline-block"}}
              autoFocus={true}
            />
            {/*<Input
              divId="addressAccount"
              divStyle={{position: "relative",  marginTop: "10px"}}
              placeholder= { this.props.lang.accountOptional }
              placeHolderClassName="inputPlaceholder inputPlaceholderReceive"
              placeholderId="addressAccountPlaceHolder"
              value={this.props.newAddressAccount}
              handleChange={this.handleChangeAccountAddress.bind(this)}
              type="text"
              inputStyle={{textAlign: "left", width:"100%", display: "inline-block"}}
            />*/}
          </div>
           <ConfirmButtonPopup handleConfirm={this.handleCreateNewAddress} style={{marginLeft: "20px", display: "inline-block", width: "auto", padding: "0px 20px"}} text={ this.props.ansAddress ? this.props.lang.createANSAddress : this.props.lang.createNormalAddress }/>
            <p id="ansExplanation" style={{visibility: this.props.ansAddress ? "visible" : "hidden"}}>{ this.props.lang.ansCost1 } 50 <span className="ecc">ecc</span> { this.props.lang.ansCost2 }.</p>
         </div>

         <div className="tableCustom">
          <div className="tableHeaderBig tableHeaderNormal">
            <p className="tableHeaderTitle">{ this.props.lang.yourAddresses }</p>
            <p className="headerDescription">{ this.props.lang.allYourNormalAndANS }</p>
            <div id="tableFiltersReceive">
              <p className= {this.props.filterAns ? "tableFilterReceive textSelected" : "tableFilterReceive textSelectable"} onClick={this.filterClicked.bind(this, "ans")}>{ this.props.lang.ansAddresses }</p>
              <p className= {this.props.filterNormal ? "tableFilterReceive textSelected fixMarginReceive" : "tableFilterReceive textSelectable fixMarginReceive"} onClick={this.filterClicked.bind(this, "normal")}>{ this.props.lang.normalAddresses }</p>
              <p className= {this.props.filterAll ? "tableFilterReceive textSelected fixMarginReceive" : "tableFilterReceive textSelectable fixMarginReceive"}onClick={this.filterClicked.bind(this, "all")}>All</p>
            </div>
          </div>
          <div className="tableContainer">
              <div className="row rowDynamic">
                <div className={nameHeader}>{this.props.filterAll ? "" : this.props.filterNormal ? "" : this.props.lang.name}</div>
                <div id="addressHeader" className={addressHeader}>{this.props.filterAll ? this.props.lang.address + " / " + this.props.lang.name : this.props.lang.address}</div>
                <div id="addressHeader" className={amountHeader}>{ this.props.lang.amount }</div>
              </div>
            <div id="rows">
            {this.props.userAddresses.map((address, index) => {
              if(this.props.filterAll || this.props.filterNormal && !address.ans || this.props.filterAns && address.ans){
                counter++;
                return (
                  <div className= {this.props.selectedAddress && address.address === this.props.selectedAddress.address ? rowClassName + " tableRowSelected" : counter % 2 !== 0 ? rowClassName : rowClassName + " tableRowEven"} key={`address_${index}`}>
                    <div className={nameColumn} onClick={this.rowClicked.bind(this, address)}>
                      {this.props.filterAns ? address.address : this.getAddressDiplay(address)}
                    </div>
                    <div className={addressColumn} onClick={this.rowClicked.bind(this, address)}>
                      {this.props.filterAns ? address.normalAddress : address.address}
                    </div>
                    <div className={amountColumn} onClick={this.rowClicked.bind(this, address)}>
                      {address.amount}
                    </div>
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
          <div>
            <p id="addressCreatedSuccessfully"> { this.props.lang.addressCreatedSuccessfully }<br></br><span className="ecc" onClick={this.goToBackupPage.bind(this)}>{ this.props.lang.clickToBackupWallet }</span></p>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    newAddressName: state.application.newAddressName,
    userAddresses: state.application.userAddresses,
    ansAddress: state.application.creatingAnsAddress,
    selectedAddress: state.application.selectedAddress,
    newAddressAccount: state.application.newAddressAccount,
    filterAll: state.application.filterAllOwnAddresses,
    filterNormal: state.application.filterNormalOwnAddresses,
    filterAns: state.application.filterAnsOwnAddresses,
  };
};

export default connect(mapStateToProps, actions)(Receive);
