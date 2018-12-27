import React, { Component } from 'react';
import { TweenMax } from 'gsap';
import { connect } from 'react-redux';
import renderHTML from 'react-render-html';
import { Table } from 'reactstrap';
import * as actions from '../../../actions/index';

import { getContacts, deleteContact } from '../../../Managers/SQLManager';

const ansAddresImage = require('../../../../resources/images/ans_address.png');
const Tools = require('../../../utils/tools');
const { clipboard } = require('electron');

const moment = require('moment');
const event = require('./../../../utils/eventhandler');

moment.locale('en');

class AddressBook extends Component {
  constructor(props) {
    super(props);
    this._handleInput = this._handleInput.bind(this);
    this.rowClicked = this.rowClicked.bind(this);
    this.loadContacts = this.loadContacts.bind(this);
  }

  componentDidMount() {
    this.loadContacts();

    event.on('reloadContacts', this.loadContacts);
  }

  getAddressDiplay(address) {
    if (address.ans) {
      return (
        <div>
          <img src={ansAddresImage} />
        </div>
      );
    }
    return null;
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
    event.removeListener('reloadContacts', this.loadContacts);
  }

  _handleInput(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    this.setState({ [name]: value });
  }


  rowClicked = (friend, index) => (e) => {
    clipboard.writeText(friend.address.address);
    // $('#message').text(this.props.lang.addressCopiedBelow);
    TweenMax.fromTo('#message', 0.2, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1 });
    TweenMax.to('#message', 0.2, { autoAlpha: 0, scale: 0.5, delay: 3 });
    TweenMax.set('#addressSend', { autoAlpha: 0 });
    this.props.setAddressSend(friend.address.address);
    if (friend.name === '') {
      this.props.setAddressOrUsernameSend(undefined);
    } else this.props.setAddressOrUsernameSend(friend.name);
    this.forceUpdate();
  }

  async loadContacts() {
    const friendList = await getContacts();
    this.props.setContacts(friendList);
  }

  // Temporary function in case prop doesn't contain a clicker
  clickContact() {}

  render() {
    const clickContact = this.props.onContactClick || this.clickContact;

    return (
      <Table responsive hover borderless className="tableCustom">
        <thead>
          <tr>
            <th style={{ width: '50px' }} />
            <th>Name</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          { this.props.friends.length > 0 ?
            this.props.friends.map((friend, index) => {
              const selected = this.props.selected === friend.id;
              return (
                <tr key={index} className={`${selected ? 'selected' : ''} cursor-pointer`} onClick={() => clickContact(friend)}>
                  <td>
                    {friend.ansrecord != null ? <img src={ansAddresImage} style={{ padding: '0 5px 3px 0' }} /> : null}
                  </td>
                  <td>
                    {friend.ansrecord != null ? renderHTML(`${friend.ansrecord.name}<span className="Receive__ans-code">#${friend.ansrecord.code} </span> `) : friend.name}
                  </td>
                  <td className="transactionInfoTitle">
                    {friend.address !== null ? friend.address.address : 'Unknown Address'}
                  </td>
                </tr>
              );
            })
          : (
            <tr>
              <td className="text-center" colspan="3">
                No contacts to display.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    friends: state.application.friends
  };
};

export default connect(mapStateToProps, actions)(AddressBook);
