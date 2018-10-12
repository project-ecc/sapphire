import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import * as actions from '../../../actions/index';
import ConfirmButtonPopup from '../../Others/ConfirmButtonPopup';
import Input from '../../Others/Input';

import {addContact, getContacts, findContact} from "../../../Managers/SQLManager";
import Toast from "../../../globals/Toast/Toast";

const Tools = require('../../../utils/tools');

class ContactModal extends React.Component {
 constructor(props) {
    super(props);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.cleanupAfterPopup = this.cleanupAfterPopup.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      selected: {},
      contactName: '',
      open: false
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
    this.props.setSelectedAddress(undefined);
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

  toggle(forceVal) {
    this.setState({
      open: (typeof(forceVal) === 'boolean' ? forceVal : !this.state.open)
    });
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


    const tt = await findContact(ans === true ? name + '#' + code : name)
    if (tt.length > 0) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.contactAlreadyExists,
        color: 'red'
      });
      this.cleanupAfterPopup();
    }
    // add the contact
    await addContact({name, address, code, ans}, ans);

    //refresh the redux store with new contacts
    const friendList = await getContacts();
    this.props.setContacts(friendList);

    Toast({
      title: this.props.lang.success,
      message: this.props.lang.contactAddedSuccessfully
    });
    this.cleanupAfterPopup();
  }

  // reset state when modal is closed
  cleanupAfterPopup(){
    //clean up afterwould.
    this.props.setNewContactAddress('')
    this.props.setMultipleAnsAddresses([]);
    this.toggle(false);
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
                  <div key={index} className = {(val === selectedAddress) ? "ansAddressesList-item-selected" : "ansAddressesList-item"}>
                    <p onClick={self.handleClick.bind(self, val, index)} >{val.Name}#{val.Code}</p>
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
      <Modal isOpen={this.state.open} toggle={this.toggle} ref="second" style={{height: "300px"}}>
        <ModalHeader toggle={this.toggle}>{this.props.lang.addContact}</ModalHeader>
        <ModalBody>
        {this.getNameOrAddressHtml()}
        </ModalBody>

          <ConfirmButtonPopup
            inputId={"#sendPasswordId"}
            handleConfirm={this.handleConfirm}
            textLoading={this.props.lang.confirming}
            text={ this.props.lang.confirm }
          />
      </Modal>
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


export default connect(mapStateToProps, actions, null, { withRef: true })(ContactModal);
