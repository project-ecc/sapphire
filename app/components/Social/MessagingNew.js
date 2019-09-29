import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';
import {CloseCircleOutlineIcon, PlusIcon} from 'mdi-react';
import moment from 'moment';

import Body from './../Others/Body';
import Header from './../Others/Header';
import RightSidebar from './../Others/RightSidebar';
import * as actions from '../../actions';
import AddressBook from '../Send/partials/AddressBook';
import ContactModal from '../Contacts/partials/ContactModal';
import {deleteContact} from '../../Managers/SQLManager';

const event = require('./../../utils/eventhandler');

class MessagingNew extends Component {
  constructor(props) {
    super(props);
    this.addContact = this.addContact.bind(this);
    this.openContact = this.openContact.bind(this);
    this.loadUser = this.loadUser.bind(this);
    console.log(props.location.state)
    console.log(props.match)
    this.state = {
      viewingContact:         {
        name: "Dylan",
        id: "1",
        routingId: "jankjnwdokmawd"
      },
      users : [
        {
          name: "Dylan",
          id: "1",
          routingId: "jankjnwdokmawd"
        },
        {
          name: "Nick",
          id: "2",
          routingId: "omaiknwuniwiund"
        }
      ],
      messages: [
        {

        }
      ]
    };
    this.loadUser()
  }

  async addContact() {
    this.modal.getWrappedInstance().toggle(true);
  }

  openContact(contact) {
    this.setState({
      viewingContact: contact
    });
  }

  async loadUser(){
    let user = null;
    const eventID = this.props.match.params.id
    this.state.users.map((object, key) => {
      if (object.id == eventID) {
        this.openContact(object)
      }
    })
  }

  async loadMessages() {

  }

  async deleteAddress(friend) {
    await deleteContact(friend);
    event.emit('reloadContacts');
    this.setState({
      viewingContact: null
    })
  }

  render() {

    const friend = this.state.viewingContact;
    console.log(friend)

    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            { friend != null ? friend.name : "New Message"}
          </Header>
          <Body noPadding className="scrollable">
          <AddressBook onContactClick={this.openContact} selected={friend !== null ? friend.id : null} />

          <div className="d-flex justify-content-center mt-5">
            <Button color="primary" onClick={this.addContact}>
              { this.props.lang.newContact }
              <PlusIcon className="ml-2" />
            </Button>
          </div>
          </Body>

          <ContactModal ref={(e) => { this.modal = e; }} />
        </div>

        <RightSidebar id="contactRightSidebar" className={friend === null ? 'hide' : ''}>
          <div className="d-flex">
            <Button color="link" onClick={() => this.openContact(null)}>
              Close
              <CloseCircleOutlineIcon className="ml-2" />
            </Button>
          </div>
          { friend && (
            <div className="p-3">
              { friend.name }
              <div className="small-text transactionInfoTitle">
                {friend.routingId !== null ? friend.routingId : 'Unknown Route'}
              </div>
              <div className="mt-4">
                <p className="transactionInfoTitle"><span className="desc2 small-header">Friend since</span></p>
                <p><span className="desc3 small-text selectableText">{moment(friend.timeStamp).format('dddd, MMMM Do YYYY')}</span></p>
              </div>
              <div className="d-flex justify-content-end mt-5">
                <Button color="danger" size="sm" onClick={this.deleteAddress.bind(this, friend)}>
                  Delete Contact
                </Button>
              </div>
            </div>
          )}
        </RightSidebar>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(MessagingNew);
