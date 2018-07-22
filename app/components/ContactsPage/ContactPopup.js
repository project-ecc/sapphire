import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../../actions';
import PopupBar from '../Others/PopupBar';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';

import $ from 'jquery';
import {addContact, getContacts} from "../../Managers/SQLManager";

const Tools = require('../../utils/tools');

class ContactPopup extends React.Component {
 constructor(props) {
    super(props);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.addressAddedSuccessfuly = this.addressAddedSuccessfuly.bind(this);
    this.state = {
      selected: {},
      contactName: ''
    };
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  componenDidMount(){
    this.hasBackButton = this.props.contactToAdd.multipleAddresses ? true : false;
  }

  componentWillUnmount() {

  }

  handleInput(event){
    this.setState({
      contactName: event
    });
  }

  handleClick(val){
   this.setState({
     selected: val
   })
    console.log(val)
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

    this.props.setAddingContact(true, {name, address, code, ans});
    await addContact({name, address, code, ans}, ans);

    const friendList = await getContacts();
    console.log(friendList)
    this.props.setContacts(friendList);
    this.props.setNewContactAddress('')
    this.addressAddedSuccessfuly()
    this.props.setAddingContact(false);
  }

  handleCancel(){
    this.props.setAddingContact(false);
  }

  addressAddedSuccessfuly(){
    TweenMax.fromTo('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  getNameOrAddressHtml(){
   const self = this
    console.log(this.props.foundAnsAddresses)
    if(this.props.foundAnsAddresses.length > 0){
      return(
        <div>
          <p className="multipleAddresses">{this.props.foundAnsAddresses.length} {this.props.lang.foundMultipleUsernames}.</p>
          <div className="ansAddressesList">
            {this.props.foundAnsAddresses.map((val) => {
              return(
                <p key={val.Code} onClick={self.handleClick.bind(self, val)} className="ansAddressesList-item">{val.Name}#{val.Code}</p>
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
     return (
      <div ref="second" style={{height: "300px"}}>
        <PopupBar title="Add Contact" handleClose={this.handleCancel}/>
        {this.getNameOrAddressHtml()}

          <ConfirmButtonPopup
            inputId={"#sendPasswordId"}
            handleConfirm={this.handleConfirm}
            text="Confirm"
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
    newContactAddress: state.application.newContactAddress
  };
};


export default connect(mapStateToProps, actions)(ContactPopup);
