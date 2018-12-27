import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { PlusIcon, CloseCircleOutlineIcon } from 'mdi-react';
import moment from 'moment';
import renderHTML from 'react-render-html';

import Body from './../Others/Body';
import Header from './../Others/Header';
import RightSidebar from './../Others/RightSidebar';
import * as actions from '../../actions';
import AddressBook from '../SendTransactions/partials/AddressBook';
import ContactModal from './partials/ContactModal';
import { deleteContact } from '../../Managers/SQLManager';

const event = require('./../../utils/eventhandler');
const ansAddressImage = require('../../../resources/images/ans_address.png');

class Index extends Component {
  constructor(props) {
    super(props);
    this.addContact = this.addContact.bind(this);
    this.openContact = this.openContact.bind(this);

    this.state = {
      viewingContact: null
    };
  }

  async addContact() {
    this.modal.getWrappedInstance().toggle(true);
  }

  openContact(contact) {
    console.log('CLICKED CONTACT', contact);
    this.setState({
      viewingContact: contact
    });
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

    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            { this.props.lang.contacts }
          </Header>
          <Body noPadding className="scrollable">
            <AddressBook sendPanel={false} onContactClick={this.openContact} selected={friend !== null ? friend.id : null} />

            <div className="d-flex justify-content-center mt-5">
              <Button color="primary" onClick={this.addContact}>
                { this.props.lang.newContact }
                <PlusIcon className="ml-2" />
              </Button>
            </div>
          </Body>

          <ContactModal ref={(e) => { this.modal = e; }} />
        </div>

        { friend && (
          <RightSidebar id="contactRightSidebar">
            <div className="d-flex">
              <Button color="link" onClick={() => this.openContact(null)}>
                Close
                <CloseCircleOutlineIcon className="ml-2" />
              </Button>
            </div>
            <div className="p-3">
              { friend.ansrecord !== null ? (
                <div>
                  <img src={ansAddressImage} style={{ padding: '0 5px 3px 0' }} />
                  renderHTML(`${friend.ansrecord.name}<span className="Receive__ans-code">#${friend.ansrecord.code} </span> `)
                </div>
              ) : (
                <div>
                  { friend.name }
                </div>
              )}
              <div className="small-text transactionInfoTitle">
                {friend.address !== null ? friend.address.address : 'Unknown Address'}
              </div>
              <div className="mt-4">
                <p className="transactionInfoTitle"><span className="desc2 small-header">Friend since</span></p>
                <p><span className="desc3 small-text selectableText">{moment(friend.createdAt).format('dddd, MMMM Do YYYY')}</span></p>
              </div>
              {/* <div> */}
              {/* <p className="transactionInfoTitle"><span className="desc2 small-header">Sent</span></p> */}
              {/* <p><span className="desc3 small-text selectableText">115.00923 ECC</span></p> */}
              {/* </div> */}
              {/* <div> */}
              {/* <p className="transactionInfoTitle"><span className="desc2 small-header">Received</span></p> */}
              {/* <p><span className="desc3 small-text selectableText">500.355 ECC</span></p> */}
              {/* </div> */}
              <div className="d-flex justify-content-end mt-5">
                <Button color="danger" size="sm" onClick={this.deleteAddress.bind(this, friend)}>
                  Delete Contact
                </Button>
              </div>
            </div>
          </RightSidebar>
        )}
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

export default connect(mapStateToProps, actions)(Index);
