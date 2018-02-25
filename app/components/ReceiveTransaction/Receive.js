import React, { Component } from 'react';
import ConfirmNewAddress from './ConfirmNewAddress';
import { traduction } from '../../lang/lang';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import $ from 'jquery';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import Input from '../Others/input';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
const lang = traduction();
const { clipboard } = require('electron');


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
    const self = this;
    $( window ).on('resize', function() {
      self.updateTable(self.props.userAddresses);
    });
    this.updateTable(this.props.userAddresses);
    if(this.props.newAddressName)
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});
    if(this.props.newAddressAccount)
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 0});
    if(!this.props.ansAddress){
      TweenMax.to('#addressAccount', 0.2, {top: -38})
      TweenMax.to('#addressName', 0.2, {autoAlpha: 0})
      TweenMax.to('.tableCustom', 0.2, {top: 0})
      TweenMax.to('#imageAns', 0.2, {top: 6})
    }
  }

  componentWillReceiveProps(props){
    if(this.props.userAddresses.length != props.userAddresses.length){
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
    $('#rows').css("height", $('.tableCustom').height()-128)
    let numberOfChildren = addresses.length;
    let totalSize = numberOfChildren * 40; //40px height of each row
    let sizeOfContainer = $('.tableCustom').height()-128;
    let sizeOfContainerWidth = $('.tableCustom').width();
    $('.rowDynamic').css("width", sizeOfContainerWidth);
    if(sizeOfContainer < totalSize){
      $('#rows').css("overflow-y", "auto");
      $('.headerAddresses').css("left", "-3px");
    }
    else{
      $(rows).css("overflow-y", "hidden");
      $('.headerAddresses').css("left", "0px");
    }
  }


  handleCreateNewAddress() {
      if(this.props.ansAddress && this.props.newAddressName == ""){
        //animate line
      }
      else{
        this.props.setCreatingAddress(true);
      }
  }


  rowClicked(address){
    this.props.setSelectedAddress(address);
  }

  handleChangeAddressCreationToAns(){
    if(this.props.ansAddress) return;
    this.props.setCreateAddressAns(true)
    TweenMax.to('#addressAccount', 0.2, {top: 0})
    TweenMax.fromTo('#ansExplanation', 0.2, {top: -15}, {top: 15, autoAlpha: 1})
    TweenMax.to('#addressName', 0.2, {autoAlpha: 1})
    TweenMax.to('.tableCustom', 0.2, {top: 50})
    TweenMax.to('#imageAns', 0.2, {top: 55})
  }

  handleChangeAddressCreationToNormal(){
    if(!this.props.ansAddress) return;
    this.props.setCreateAddressAns(false)
    TweenMax.to('#addressAccount', 0.2, {top: -38})
    TweenMax.fromTo('#ansExplanation', 0.2, {top: 15}, {top: -15, autoAlpha: 0})
    TweenMax.to('#addressName', 0.2, {autoAlpha: 0})
    TweenMax.to('.tableCustom', 0.2, {top: 0})
    TweenMax.to('#imageAns', 0.2, {top: 6})
  }

  handleChangeAccountAddress(event){
    const account = event.target.value;
    if(account.length == 0)
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 1});
    else 
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 0});

    this.props.setNewAddressAccount(account);
  }

  handleChangeNameAddress(event){
    const name = event.target.value;
    if(name.length == 0)
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 1});
    else 
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});

    this.props.setNewAddressName(name);
  }

  goToBackupPage(){
    this.props.setSettingsOptionSelected("Wallet");
    this.props.setSettings(true);
  }

  filterClicked(type){
    console.log(type)
    if(type == "all")
      this.props.setFilterOwnAddresses("all");
    else if(type == "normal")
      this.props.setFilterOwnAddresses("normal");
    else if(type == "ans")
      this.props.setFilterOwnAddresses("ans");
  }

  render() {
    let ansAddresImage = require('../../../resources/images/ans_address.png');
    var self = this;
    let counter = 0;
    return (
      <div className="panel">
        <div id="headerReceive">
          <p className="typeSelectorReceive" onClick={this.handleChangeAddressCreationToAns} style={{color: this.props.ansAddress ? "#aeacf3" : "#555d77"}}>ANS</p>
          <span>/</span>
          <p className="typeSelectorReceive" onClick={this.handleChangeAddressCreationToNormal} style={{color: this.props.ansAddress ?"#555d77" : "#aeacf3"}}>Normal Address</p>
        </div>
        <div id="inputAddress">
          <div style={{display: "inline-block", width: "70%", position: "relative"}}>
            <Input 
              divId="addressName"
              divStyle={{display: "inline"}}
              placeholder= "Name"
              placeHolderClassName="inputPlaceholder inputPlaceholderReceive"
              placeholderId="addressNamePlaceHolder"
              value={this.props.newAddressName}
              handleChange={this.handleChangeNameAddress.bind(this)}
              type="text"
              inputStyle={{textAlign: "left", width:"100%", display: "inline-block"}}
            />
            <Input 
              divId="addressAccount"
              divStyle={{position: "relative",  marginTop: "10px"}}
              placeholder= "Account (optional)"
              placeHolderClassName="inputPlaceholder inputPlaceholderReceive"
              placeholderId="addressAccountPlaceHolder"
              value={this.props.newAddressAccount}
              handleChange={this.handleChangeAccountAddress.bind(this)}
              type="text"
              inputStyle={{textAlign: "left", width:"100%", display: "inline-block"}}
            />
          </div>
           <ConfirmButtonPopup handleConfirm={this.handleCreateNewAddress} style={{marginLeft: "20px", display: "inline-block", width: "auto", padding: "0px 20px"}} text={this.props.ansAddress ? "Create ANS Address" : "Create Normal Address"}/>
            <p id="ansExplanation" style={{visibility: this.props.ansAddress ? "visible" : "hidden"}}>ANS addresses are recognized by name in the network and have a cost of 0.00000005 <span className="ecc">ecc</span> per month</p>
         </div>

         <div className="tableCustom">
          <div className="tableHeaderBig">
            <p className="tableHeader">Your Addresses</p>
            <p className="headerDescription">All your normal and ANS addresses</p>
            <div id="tableFiltersReceive">
              <p className="tableFilterReceive" onClick={this.filterClicked.bind(this, "ans")} style={{ color: this.props.filterAns ? "#a4a3e6" : "#555d77"}}>ANS Addresses</p>
              <p className="tableFilterReceive fixMarginReceive" onClick={this.filterClicked.bind(this, "normal")} style={{color: this.props.filterNormal ? "#a4a3e6" : "#555d77"}}>Normal Addreses</p>
              <p className="tableFilterReceive fixMarginReceive" onClick={this.filterClicked.bind(this, "all")} style={{color: this.props.filterAll ? "#a4a3e6" : "#555d77"}}>All</p>
            </div>
          </div>
          <div className="container tableContainer">
              <div className="row rowDynamic">
                <div className="col-sm-3 headerAddresses headerAddressFix">{this.props.filterAll ? "ACCOUNT" : this.props.filterNormal ? "ACCOUNT" : "NAME"}</div>
                <div id="addressHeader" className="col-sm-6 headerAddresses">{this.props.filterAll ? "ADDRESS / NAME" : "ADDRESS"}</div>
                <div id="addressHeader" className="col-sm-3 headerAddresses">AMOUNT</div>
              </div>
            <div id="rows" className="container">
            {this.props.userAddresses.map((address, index) => {
              if(this.props.filterAll || this.props.filterNormal && !address.ans || this.props.filterAns && address.ans){
                counter++;
                return (
                  <div className="row rowDynamic normalWeight tableRowCustom" style={{backgroundColor: self.props.selectedAddress && address.address == self.props.selectedAddress.address ? "#212136" : counter % 2 != 0 ? "transparent" : "#1b223d"}} key={`address_${index}`}>
                    <div className="col-sm-3 tableColumn tableColumnFixReceive" onClick={self.rowClicked.bind(self, address)}>
                      {address.account}
                    </div>
                    <div className="col-sm-6 tableColumn" onClick={self.rowClicked.bind(self, address)}>
                      {address.address}
                    </div>
                    <div className="col-sm-3 tableColumn" onClick={self.rowClicked.bind(self, address)}>
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
          <p className="ansLabel">ANS Address</p>
          <div>
            <p id="addressCreatedSuccessfully"> Address Created Successfully!<br></br><span className="ecc" onClick={this.goToBackupPage.bind(this)}>Click here to backup your wallet</span></p>
            <p id="upgradeAns"> {this.props.selectedAddress && this.props.selectedAddress.ans ? "Disable ANS subscription" : this.props.selectedAddress ? "Upgrade to ANS Address" : ""}</p>
          </div>
        </div>
        <TransitionGroup>
            { this.props.creatingAddress ? <ConfirmNewAddress/> : null}
        </TransitionGroup>
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
    creatingAddress: state.application.creatingAddress,
    newAddressAccount: state.application.newAddressAccount,
    filterAll: state.application.filterAllOwnAddresses,
    filterNormal: state.application.filterNormalOwnAddresses,
    filterAns: state.application.filterAnsOwnAddresses,
  };
};

export default connect(mapStateToProps, actions)(Receive);