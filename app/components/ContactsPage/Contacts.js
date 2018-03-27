import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
import AddressBook from '../SendTransactions/AddressBook';
import low from '../../utils/low';
import Input from '../Others/Input';

class Contacts extends Component {
  constructor(props) {
    super(props);
    this.handleChangeNewContactName = this.handleChangeNewContactName.bind(this);
    this.handleChangeNewContactAddress = this.handleChangeNewContactAddress.bind(this);
    this.addContact = this.addContact.bind(this);
    this.addNormalAddress = this.addNormalAddress.bind(this);
    this.resetFields = this.resetFields.bind(this);
  }

  componentDidMount(){
    if(this.props.newContactName)
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});
    if(this.props.newContactAddress)
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 0});
  }

  handleChangeNewContactName(event){
    const name = event.target.value;
    if(name.length == 0)
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 1});
    else 
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});

    this.props.setNewContactName(name);

  }

  handleChangeNewContactAddress(event){
    const address = event.target.value;
    if(address.length == 0)
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 1});
    else 
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 0});

    this.props.setNewContactAddress(address);
  }

  addContact(){
    if(this.props.newContactName == "" && this.props.newContactAddress == ""){
      TweenMax.to('#newContactAddress', 0.3, {css:{borderBottom: "2px solid #d09128"}});
      TweenMax.to('#newContactAddress', 0.3, {css:{borderBottom: "2px solid #1c2340"}, delay: 1});
    }
    else if(this.props.newContactAddress != ""){
      //normal address
      console.log("adding normal address")
      this.addNormalAddress();
    }
    else{
      //ANS address
    }
  }

  addressAlreadyExists(){
    TweenMax.fromTo('#addressExists', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressExists', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  addressAddedSuccessfuly(){
    TweenMax.fromTo('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  addressInvalid(){
    TweenMax.fromTo('#addressInvalid', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressInvalid', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  addNormalAddress() {
    this.props.wallet.validate(this.props.newContactAddress).then((isAddressValid) => {
      console.log(isAddressValid)
        if (isAddressValid.isvalid) {
          const tt = low.get('friends').find({ address: this.props.newContactAddress }).value();
          if (tt != null) {
            this.addressAlreadyExists();
            this.resetFields();
            return;
          } else {
            const name = this.props.newContactName;
            const address = this.props.newContactAddress;
            if (address !== '') {
              low.get('friends').push({ name, address }).write();
              const friendList = low.get('friends').value();
              this.props.setContacts(friendList);
              //this is a temporary workaround because setContacts is not triggering a re-render of AddressBook.js
              this.props.setHoveredAddress(["a"]);
              this.resetFields();
              this.addressAddedSuccessfuly();
            }
          }
        } 
        else{
          this.addressInvalid()
          this.resetFields(false);
        }
        
    }).catch((err) => {
      console.log(err);
    });
  }


  resetFields(){
    this.props.setNewContactAddress("");
    TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 1});
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
          <p id="addressInvalid" className="contactsMessage">{ this.props.lang.invalidAddress }</p>
        </div>
        <div id="inputAddress" style={{width: "750px", margin: "0 auto", position: "relative", marginTop:"80px"}}>
          <div style={{display: "inline-block", width: "70%", position: "relative"}}>
            <Input 
              divStyle={{}}
              placeholder= { this.props.lang.name }
              placeholderId="addressNamePlaceHolder"
              placeHolderClassName="inputPlaceholder inputPlaceholderReceive"
              value={this.props.newContactName}
              handleChange={this.handleChangeNewContactName.bind(this)}
              type="text"
              inputStyle={{textAlign: "left", margin: "0 0", width:"100%"}}
              inputId="inputAddressSend"
            />
            <Input 
              divStyle={{position: "relative",  marginTop: "10px"}}
              placeholder= { this.props.lang.address }
              placeholderId="addressAccountPlaceHolder"
              placeHolderClassName="inputPlaceholder inputPlaceholderReceive"
              value={this.props.newContactAddress}
              handleChange={this.handleChangeNewContactAddress.bind(this)}
              type="text"
              inputStyle={{textAlign: "left", margin: "0 0", width:"100%"}}
              inputId="inputAddressSend"
            />
          </div>
            <div onClick={this.addContact} className="buttonUnlock addContactButton">
            { this.props.lang.addContact }
            </div>
            <p id="ansExplanation" style={{display: "inline-block", fontSize: "14px", position: "relative", top:"15px", width:"660px"}}>{ this.props.lang.ansExplanation1 } <span className="ecc">{ this.props.lang.ansExplanation2 }</span> { this.props.lang.ansExplanation3 }</p>
          </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    newContactName: state.application.newContactName,
    newContactAddress: state.application.newContactAddress,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Contacts);
