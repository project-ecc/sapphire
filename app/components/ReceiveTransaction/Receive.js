import React, { Component } from 'react';
import ConfirmNewAddress from './ConfirmNewAddress';
import { traduction } from '../../lang/lang';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import $ from 'jquery';
import TransitionGroup from 'react-transition-group/TransitionGroup';
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
      TweenMax.to('#tableOwnAddresses', 0.2, {top: 0})
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
    $('#rows').css("height", $('#tableOwnAddresses').height()-128)
    let numberOfChildren = addresses.length;
    let totalSize = numberOfChildren * 40; //40px height of each row
    let sizeOfContainer = $('#tableOwnAddresses').height()-128;
    let sizeOfContainerWidth = $('#tableOwnAddresses').width();
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
    TweenMax.to('#tableOwnAddresses', 0.2, {top: 50})
    TweenMax.to('#imageAns', 0.2, {top: 55})
  }

  handleChangeAddressCreationToNormal(){
    if(!this.props.ansAddress) return;
    this.props.setCreateAddressAns(false)
    TweenMax.to('#addressAccount', 0.2, {top: -38})
    TweenMax.fromTo('#ansExplanation', 0.2, {top: 15}, {top: -15, autoAlpha: 0})
    TweenMax.to('#addressName', 0.2, {autoAlpha: 0})
    TweenMax.to('#tableOwnAddresses', 0.2, {top: 0})
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
      <div className="sendPanel" style={{height: "100%", width: "100%", paddingLeft: "40px", paddingRight: "40px", overflowX: "hidden"}}>
        <div style={{textAlign: "center", position: "relative", top: "25px", fontSize: "14px", fontWeight:"600"}}>
        <p onClick={this.handleChangeAddressCreationToAns} style={{display: "inline-block", color: this.props.ansAddress ? "#aeacf3" : "#555d77", cursor: "pointer"}}>ANS</p><span style={{position: "relative", padding: "0px 20px", color:"#555d77"}}>/</span><p onClick={this.handleChangeAddressCreationToNormal} style={{display: "inline-block", cursor: "pointer", color: this.props.ansAddress ?"#555d77" : "#aeacf3"}}>Normal Address</p>
        </div>
        <div id="inputAddress" style={{width: "750px", margin: "0 auto", position: "relative", marginTop:"60px"}}>
          <div style={{display: "inline-block", width: "70%", position: "relative"}}>
          <div id="addressName">
              <p id="addressNamePlaceHolder" style={{position:"absolute", top: "5px", color: "#555d77", fontSize: "15px", fontWeight: "600", left: "2px"}}>Name</p>
              <input className="privateKey" type="text" style={{textAlign: "left", margin: "0 0", width:"100%", display: "inline-block", position: "relative", color:"#555d77", fontWeight:"600", fontSize:"15px"}} value={this.props.newAddressName} onChange={this.handleChangeNameAddress} autoFocus></input>
            </div>
            <div id="addressAccount" style={{position: "relative",  marginTop: "10px"}}>
              <p id="addressAccountPlaceHolder" style={{position:"absolute", top: "5px", color: "#555d77", fontSize: "15px", fontWeight: "600", left: "2px"}}>Account (optional)</p>
              <input className="privateKey" type="text" style={{textAlign: "left", margin: "0 0", width:"100%", display: "inline-block", position: "relative", color:"#555d77", fontWeight:"600", fontSize:"15px"}} value={this.props.newAddressAccount} onChange={this.handleChangeAccountAddress}></input>
            </div>
          </div>
            <div onClick={this.handleCreateNewAddress} className="buttonUnlock" style={{marginLeft: "20px", display: "inline-block", background: "-webkit-linear-gradient(top, rgb(214, 167, 91) 0%, rgb(162, 109, 22) 100%)", color: "#d9daef", width: "auto", padding: "0px 20px"}}>
             {this.props.ansAddress ? "Create ANS Address" : "Create Normal Address"}
            </div>
            <p id="ansExplanation" style={{display: "inline-block", color: "#555d77", fontSize: "14px", fontWeight: "600", position: "relative", top:"15px", visibility: this.props.ansAddress ? "visible" : "hidden"}}>ANS addresses are recognized by name in the network and have a cost of 0.00000005 <span className="ecc">ecc</span> per month</p>
          </div>

         <div id="tableOwnAddresses" style={{height:"60%", backgroundColor: "#1c2340", position: "relative", top: "50px", boxShadow: "0 4px 11px -6px black"}}>
          <div style={{width: "100%", height:"67px", boxShadow: "0 2px 4px -3px rgba(0, 0, 0, 0.74)"}}>
            <p className="tableHeader" style={{paddingTop: "4px", paddingLeft: "5%", color: "#b4b7c8"}}>Your Addresses</p>
            <p style={{paddingTop: "1px", paddingLeft: "5%", color: "#555d77", fontSize: "14px", fontWeight: "600"}}>All your normal and ANS addresses</p>
            <div style={{position: "absolute", width: "100%", top: "36px", right:"4%", textAlign: "right"}}>
              <p onClick={this.filterClicked.bind(this, "ans")} style={{paddingTop: "1px", color: this.props.filterAns ? "#a4a3e6" : "#555d77", fontSize: "14px", fontWeight: "600", display:"inline-block", cursor:"pointer"}}>ANS Addresses</p>
              <p onClick={this.filterClicked.bind(this, "normal")} style={{paddingTop: "1px", marginLeft: "30px", color: this.props.filterNormal ? "#a4a3e6" : "#555d77", fontSize: "14px", fontWeight: "600", display:"inline-block", cursor:"pointer"}}>Normal Addreses</p>
              <p onClick={this.filterClicked.bind(this, "all")} style={{paddingTop: "1px", marginLeft: "30px", color: this.props.filterAll ? "#a4a3e6" : "#555d77", fontSize: "14px", fontWeight: "600", display:"inline-block", cursor:"pointer"}}>All</p>
            </div>
          </div>
          <div className="container" style={{width: "100%", marginTop: "5px", padding: "0 0"}}>
              <div className="row rowDynamic" style={{height: "55px", margin: "0 0", width:"100%"}}>
                <div className="col-sm-3 headerAddresses" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingLeft: "5%", paddingTop: "16px", fontWeight: "600"}}>{this.props.filterAll ? "ACCOUNT" : this.props.filterNormal ? "ACCOUNT" : "NAME"}</div>
                <div id="addressHeader" className="col-sm-6 headerAddresses" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingTop: "16px", fontWeight: "600"}}>{this.props.filterAll ? "ADDRESS / NAME" : "ADDRESS"}</div>
                <div id="addressHeader" className="col-sm-3 headerAddresses" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingTop: "16px", fontWeight: "600"}}>AMOUNT</div>
              </div>
            <div id="rows" className="container" style={{width: "100%", padding: "0 0"}}>
            {this.props.userAddresses.map((address, index) => {
              if(this.props.filterAll || this.props.filterNormal && !address.ans || this.props.filterAns && address.ans){
                counter++;
                return (
                  <div className="row rowDynamic normalWeight" style={{cursor: "pointer", fontSize: "15px", color: "#9099b7", margin: "0 0", width:"100%", height: "40px", backgroundColor: self.props.selectedAddress && address.address == self.props.selectedAddress.address ? "#212136" : counter % 2 != 0 ? "transparent" : "#1b223d"}} key={`address_${index}`}>
                    <div className="col-sm-3" style={{paddingLeft: "5%", paddingTop: "9px"}} onClick={self.rowClicked.bind(self, address)}>
                      {address.account}
                    </div>
                    <div className="col-sm-6" style={{paddingTop: "9px"}} onClick={self.rowClicked.bind(self, address)}>
                      {address.address}
                    </div>
                    <div className="col-sm-3" style={{paddingTop: "9px"}} onClick={self.rowClicked.bind(self, address)}>
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
        <div id="imageAns" style={{position: "relative", top: "55px"}}>
          <img src={ansAddresImage} />
          <p style={{fontSize:"14px", color: "#555d77", display: "inline-block", marginLeft: "10px", fontWeight: "600", position: "relative", top: "2px"}}>ANS Address</p>
          <div>
          <p id="addressCreatedSuccessfully" style={{fontSize: "15px", color: "#d09128", display: "inline-block", position: "absolute", top: "2px", width:"100%", textAlign: "center", fontWeight: "600", visibility: "hidden"}}> Address Created Successfully!<br></br><span style={{cursor: "pointer", textDecoration: "underline"}} className="ecc" onClick={this.goToBackupPage.bind(this)}>Click here to backup your wallet</span></p>
          <p style={{fontSize:"13px", color: "#a4a3e6", display: "inline-block", marginLeft: "10px", position: "absolute", top: "2px", right: "0px", cursor: "pointer", fontWeight: "600"}}> {this.props.selectedAddress && this.props.selectedAddress.ans ? "Disable ANS subscription" : this.props.selectedAddress ? "Upgrade to ANS Address" : ""}</p>
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