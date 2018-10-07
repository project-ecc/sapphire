import React, { Component } from 'react';
import {addContact, findContact, getContacts} from "../../Managers/SQLManager";
import * as actions from '../../actions';
import { connect } from 'react-redux';
import AddressBook from '../SendTransactions/AddressBook';
import Input from '../Others/Input';
import Toast from "../../globals/Toast/Toast";
const Tools = require('../../utils/tools');


class Contacts extends Component {
  constructor(props) {
    super(props);
    this.addContact = this.addContact.bind(this);
    this.addNormalAddress = this.addNormalAddress.bind(this);
    this.resetFields = this.resetFields.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.addingContact = false;
  }

  componentDidMount(){
    if(this.props.newContactName)
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});
  }

  async addContact(){
    if(this.props.newContactName === ""){
      Tools.highlightInput("#inputName, #inputAddressVal", 1000)
    }
    else{
      await this.addNormalAddress();
    }
  }

  async _handleKeyPress(e) {
    if (e.key === 'Enter') {
      console.log('do validate');
      await this.addContact()
    }
  }

  componentWillUnmount(){
    this.props.setAddingContact(false);
  }

  addressAlreadyExists(){
    TweenMax.fromTo('#addressExists', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressExists', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  addressAddedSuccessfuly(){
    TweenMax.fromTo('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  async addNormalAddress() {
    let result;
    let code = "";
    let ans = false;
    let address = "";
    let name = "";
    let multipleAddresses = false;
    this.addingContact = true;
    try{
      result = await Tools.searchForUsernameOrAddress(this.props.wallet, this.props.newContactName);
      console.log(result)
      if(result.ans && result.addresses.length === 1){
        name = result.addresses[0].Name;
        address = result.addresses[0].Address;
        code = result.addresses[0].Code;
        ans = true;
      }
      else if(result.ans && result.addresses.length > 1){
        multipleAddresses = true;
      }
      else{
        address = result.addresses[0].address;
        ans = false;
      }
    }catch(err){
      console.log("err: ", err)
    }

    if (!result) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.invalidAddress,
        color: 'red'
      });
      this.resetFields(false);
    }
    else{
      if(!multipleAddresses){
        const tt = await findContact(ans == true ? name + '#' + code : name)
        console.log(tt)
        if (tt.length > 0) {
          this.addressAlreadyExists();
          this.resetFields();
          return;
        }


        if(result.ans){
          await addContact({name, address, code, ans}, result.ans);
          const friendList = await getContacts();
          console.log(friendList)
          // const friendList = low.get('friends').value();
          this.props.setContacts(friendList);
          this.addressAddedSuccessfuly();
        }else {
          this.props.setNewContactAddress(address)
          this.props.setAddingContact(true);
        }
      }
      else{
        this.props.setMultipleAnsAddresses(result.addresses);
        this.props.setAddingContact(true);
      }
      //this is a temporary workaround because setContacts is not triggering a re-render of AddressBook.js
      this.props.setHoveredAddress(["a"]);
      this.resetFields();
    }
  }

  resetFields(){
    this.props.setNewContactName("");
    TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 1});
  }

  render() {
    return (
      <div className="panel">
        <AddressBook sendPanel={false}/>
        <div style={{position: "relative", top: "60px"}}>
          <p id="addressExists" className="contactsMessage">{ this.props.lang.contactAlreadyExists }</p>
          <p id="addressAdded" className="contactsMessage">{ this.props.lang.contactAddedSuccessfully }</p>
        </div>
        <div id="inputAddress" style={{width: "650px", margin: "0 auto", display:"flex", justifyContent: "space-between", marginTop:"100px"}}>
          <Input
            placeholder= { this.props.lang.ansNameOrAddress }
            placeholderId="addressNamePlaceHolder"
            value={this.props.newContactName}
            handleChange={this.props.setNewContactName}
            type="text"
            inputId="inputName"
            style={{width: "75%", paddingRight: "30px"}}
            autoFocus
            isLeft
            onKeyPress={this._handleKeyPress}
            onSubmit={this.addContact}
          />
          <div onClick={this.addContact} className="buttonPrimary addContactButton">
          { this.props.lang.addContact }
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    newContactName: state.application.newContactName,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Contacts);
