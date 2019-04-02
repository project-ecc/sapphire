import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap';
import * as actions from '../../../actions/index';
import Input from '../../Others/Input';
import Tools from './../../../utils/tools';
import { addContact, findContact, getContacts } from '../../../Managers/SQLManager';
import Toast from '../../../globals/Toast/Toast';

class ContactModal extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.addContact = this.addContact.bind(this);

    this.state = {
      open: false,
      name: '',
      address: ''
    };
  }

  componentDidMount() {
    this.timeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  /**
   * Toggle the modal state (open/closed)
   * @param forceVal
   */
  toggle(forceVal) {
    this.setState({
      open: (typeof (forceVal) === 'boolean' ? forceVal : !this.state.open)
    });
  }


  onTextFieldChange(key, e) {
    const value = e;
    const payload = {};
    payload[key] = value;
    this.setState(payload);
  }


  /**
   * Add the contact
   * @returns {Promise<void>}
   */
  async addContact() {
    if (this.state.name.length === 0 || this.state.name.length === 0) {
      return;
    }
    const checkContact = await findContact(this.state.name);

    // User is already a contact
    if (checkContact.length > 0) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.contactAlreadyExists,
        color: 'red'
      });
      return;
    }

    const contactObject = {
      name: this.state.name,
      address: this.state.address
    };

    // All good - add the contact!
    await addContact(contactObject);

    // refresh the redux store with new contacts
    const friendList = await getContacts();
    this.props.setContacts(friendList);

    Toast({
      title: this.props.lang.success,
      message: this.props.lang.contactAddedSuccessfully
    });

    this.toggle(false);
    this.setState({
      newContact: {
        name: null,
        address: null
      }
    })
  }

  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>{this.props.lang.addContact}</ModalHeader>
        <ModalBody>
          <Input
            placeholder={this.props.lang.name}
            value={this.state.name}
            handleChange={e => this.onTextFieldChange('name', e)}
            type="text"
            autoFocus
            isLeft
          />
          <Input
            placeholder={this.props.lang.address}
            value={this.state.address}
            handleChange={e => this.onTextFieldChange('address', e)}
            type="text"
            autoFocus
            isLeft
          />
          <hr />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={this.state.address.length === 0 || this.state.length === 0} onClick={this.addContact}>Add Contact</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions, null, { withRef: true })(ContactModal);
