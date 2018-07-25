import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../../actions';
import PopupBar from '../Others/PopupBar';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';

import {addContact, getContacts, findContact} from "../../Managers/SQLManager";

const Tools = require('../../utils/tools');

import $ from 'jquery';

class ContactPopup extends React.Component {
 constructor(props) {
    super(props);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.addressAddedSuccessfuly = this.addressAddedSuccessfuly.bind(this);
    this.cleanupAfterPopup = this.cleanupAfterPopup.bind(this);
    this.state = {
      selected: {},
      contactName: ''
    };
  }

  componentWillMount(){
    this.props.setSelectedAddress(undefined);
    Tools.hideFunctionIcons();
  }

  componenDidMount(){
    this.hasBackButton = this.props.contactToAdd.multipleAddresses ? true : false;
  }

  componentWillUnmount() {
    this.setState({
      contactName: '',
      selected: {}
    })
  }

  handleInput(event){
    this.setState({
      contactName: event
    });
  }

 

  handleClick(val,index){
   this.setState({
     selected: val
   });
   this.props.setSelectedAddress(val);
  }

  async handleConfirm(){

    let name = '';
    let address = '';
    let code = '';
    let ans = false;

    if(this.state.selected.length > 0 || this.props.foundAnsAddresses.length > 0){
      const selected = this.state.selected;

      name = selected.Name;
      address = selected.Address;
      code = selected.Code;
      ans = true;
    } else {
      name = this.state.contactName;
      address = this.props.newContactAddress;
    }


    const tt = await findContact(ans == true ? name + '#' + code : name)
    console.log(tt)
    if (tt.length > 0) {
      this.addressAlreadyExists();
      this.cleanupAfterPopup();
    }
    // add the contact
    this.props.setAddingContact(true, {name, address, code, ans});
    await addContact({name, address, code, ans}, ans);

    //refresh the redux store with new contacts
    const friendList = await getContacts();
    console.log(friendList)
    this.props.setContacts(friendList);


    this.addressAddedSuccessfuly();
    this.cleanupAfterPopup();
  }

  cleanupAfterPopup(){
    //clean up afterwould.
    this.props.setNewContactAddress('')
    this.props.setMultipleAnsAddresses([]);
    this.props.setAddingContact(false);
  }

  handleCancel(){
    this.cleanupAfterPopup()
  }

  addressAddedSuccessfuly(){
    TweenMax.fromTo('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }
  addressAlreadyExists(){
    TweenMax.fromTo('#addressExists', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressExists', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  getNameOrAddressHtml(){
   const self = this
    if(this.props.foundAnsAddresses.length > 0 && this.props.newContactAddress == ''){
      return(
        <div>
          <p className="multipleAddresses">{this.props.foundAnsAddresses.length} {this.props.lang.foundMultipleUsernames}.</p>
          <div className="ansAddressesList">
           
            {this.props.foundAnsAddresses.map((val, index) => {
              const className = this.state.val === val ? 'ansAddressesList-item-selected' : 'ansAddressesList-item'; 
              const selectedAddress = this.props.selectedAddress;
              return(
                  <div className = {(val === selectedAddress) ? "ansAddressesList-item-selected" : "ansAddressesList-item"}>
                  <p key={val.Code} onClick={self.handleClick.bind(self, val, index)} >{val.Name}#{val.Code}</p>
                </div>
              );
            })}
          </div>
        </div>
      )
    } else{
      return (
        <div>
          <div id="send_inputs">
            <Input
              placeholder= { this.props.lang.name }
              inputId="sendPasswordId"
              placeholderId= "password"
              handleChange={evt => this.handleInput(evt)}
              style={{marginTop: "40px", width: "70%"}}
              type="text"
              autoFocus
              onSubmit={this.handleConfirm}
            />
            <div>
              <p style={{marginBottom: "14px"}}>{this.props.lang.address}</p>
              <p style={{marginBottom: "14px"}}>({this.props.newContactAddress})</p>
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    let rowClassName = "row normalWeight tableRowCustom";
     return (
      <div ref="second" style={{height: "300px"}}>
        <PopupBar title="Add Contact" handleClose={this.handleCancel}/>
        {this.getNameOrAddressHtml()}

          <ConfirmButtonPopup
            inputId={"#sendPasswordId"}
            handleConfirm={this.handleConfirm}
            textLoading={this.props.lang.confirming}
            text={ this.props.lang.confirm }
          />
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    contactToAdd: state.application.contactToAdd,
    foundAnsAddresses: state.application.ansAddressesFound,
    newContactAddress: state.application.newContactAddress,
    selectedAddress: state.application.selectedAddress
  };
};


export default connect(mapStateToProps, actions)(ContactPopup);
