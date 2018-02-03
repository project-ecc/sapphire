import React, { Component } from 'react';
import low from '../../utils/low';
import Wallet from '../../utils/wallet';
import {TweenMax} from "gsap";
const { clipboard } = require('electron');
import { connect } from 'react-redux';
import * as actions from '../../actions';
import $ from 'jquery';
const wallet = new Wallet();

class AddressBook extends Component {
  constructor(props) {
    super(props);
    this._handleInput = this._handleInput.bind(this);
    this.rowClicked = this.rowClicked.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.getHeaderText = this.getHeaderText.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  componentDidMount() {
    const friendList = low.get('friends').value();
    this.props.setContacts(friendList);
    const self = this;  
    $( window ).on('resize', function() {
      self.updateTable(self.props.friends);
    });
    this.updateTable(friendList);
  }

  updateTable(friendList){
    $('#rows').css("height", $('#tableAddresses').height()-128)
    let numberOfChildren = friendList.length;
    let totalSize = numberOfChildren * 40; //40px height of each row
    let sizeOfContainer = $('#tableAddresses').height()-128;
    if(sizeOfContainer < totalSize){
      $('#rows').css("overflow-y", "auto");
      $('.headerAddresses').css("left", "-3px");
    }
    else{
      $(rows).css("overflow-y", "hidden");
      $('.headerAddresses').css("left", "0px");
    }
  }

  componentDidUpdate(){
    this.updateTable(this.props.friends);
  }

  componentWillUnmount() {
    $( window ).off('resize');
  }

  _handleInput(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    this.setState({ [name]: value });
  }

  rowClicked(friend) {
    if(!this.props.sendPanel) return;
    clipboard.writeText(friend.address);
    $('#message').text("Address copied below")
    TweenMax.fromTo('#message', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#message', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
    TweenMax.set('#addressSend', {autoAlpha: 0});
    this.props.setAddressSend(friend.address);
    if(friend.name == "")
      this.props.setUsernameSend(undefined);
    else this.props.setUsernameSend(friend.name);
  }

  getHeaderText(){
    if(this.props.sendPanel){
      return(
        <p style={{paddingTop: "1px", paddingLeft: "5%", color: "#555d77", fontSize: "14px", fontWeight: "600"}}>Select a contact to send <span className="ecc">ecc</span> to</p>
      )
    }
    else{
      return null;
    }
  }
  handleMouseEnter(friend){
    if(this.props.sendPanel) return;
    this.props.setHoveredAddress(friend);
  }

  handleMouseLeave(){
    if(this.props.sendPanel) return;
    this.props.setHoveredAddress(undefined);
  }

  deleteAddress(friend){
    low.get('friends').remove({ address: friend.address }).write();
    const friendList = low.get('friends').value();
    this.props.setContacts(friendList);
  }

  componentWillReceiveProps(){
  }

  render() {
    const self = this;
    let bin = require('../../../resources/images/delete-contact.ico');

    return (
      <div id="tableAddresses" style={{height:"60%", backgroundColor: "#1c2340", position: "relative", top: "50px", boxShadow: "0 4px 11px -6px black"}}>
        <div style={{width: "100%", height: this.props.sendPanel ? "67px" : "46px", boxShadow: "0 2px 4px -3px rgba(0, 0, 0, 0.74)"}}>
          <p className="tableHeader" style={{paddingTop: this.props.sendPanel ? "4px" : "7px", paddingLeft: "5%", color: "#b4b7c8"}}>Contacts</p>
          {this.getHeaderText()}
        </div>
        <div className="container" style={{width: "100%", marginTop: "5px", padding: "0 0"}}>
            <div className="row" style={{height: "55px"}}>
              <div className="col-sm-4" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingLeft: "10%", paddingTop: "16px", fontWeight: "600"}}>NAME</div>
              <div id="addressHeader" className="col-sm-7 headerAddresses" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingTop: "16px", fontWeight: "600"}}>ADDRESS</div>
              <div className="col-sm-1 headerAddresses"></div>
            </div>
          <div id="rows" className="container" style={{width: "100%", padding: "0 0"}}>
          {this.props.friends.map((friend, index) => {
            let cr = '';
            if (index % 2 === 0) {
              cr = 'stripped';
            }
            return (
              <div className="row normalWeight" onClick={self.rowClicked.bind(self, friend)} onMouseLeave={self.handleMouseLeave} onMouseEnter={self.handleMouseEnter.bind(self, friend)} style={{cursor: this.props.sendPanel ? "pointer" : "default", fontSize: "15px", color: "#9099b7", height: "40px", backgroundColor: index % 2 != 0 ? "transparent" : "#1b223d"}} key={`friend_${index}`}>
                <div className="col-sm-4" style={{paddingLeft: "10%", paddingTop: "9px"}}>
                  {friend.name}
                </div>
                <div className="col-sm-7" style={{paddingTop: "9px"}}>
                  {friend.address}
                </div>
                <div className="col-sm-1" style={{paddingTop: "9px"}}>
                  <img onClick={this.deleteAddress.bind(self, friend)} style={{cursor: "pointer", visibility: this.props.hoveredAddress == friend ? "visible" : "hidden", width:"20px"}}src={bin}/>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    hoveredAddress: state.application.hoveredAddress,
    friends: state.application.friends
  };
};

export default connect(mapStateToProps, actions)(AddressBook);
