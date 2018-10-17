import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import * as actions from '../../../actions/index';
import Input from '../../Others/Input';
import Tools from './../../../utils/tools';
import { addContact, findContact, getContacts } from '../../../Managers/SQLManager';
import Toast from '../../../globals/Toast/Toast';

class ContactModal extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.search = this.search.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onSelectAddress = this.onSelectAddress.bind(this);
    this.addContact = this.addContact.bind(this);

    this.state = {
      open: false,
      results: [],
      ans: false,
      newContact: {
        ansOrName: '',
        name: null,
        code: null,
        address: null
      }
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

  /**
   * Perform search
   * @returns {Promise<void>}
   */
  async search() {
    try {
      const response = await Tools.searchForUsernameOrAddress(
        this.props.wallet,
        this.state.newContact.ansOrName
      );
      const payload = {};
      this.setState({
        results: response.addresses,
        ans: response.ans,
        ...payload
      });
    } catch (err) {
      this.setState({
        results: [],
        ans: false
      });
      console.log('Error searching for ANS Name / Address');
    }
  }

  /**
   * On search value changed
   * @param val
   */
  onSearchChanged(val) {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }

    this.setState({
      newContact: {
        ...this.state.newContact,
        ansOrName: val,
        address: null
      }
    });

    this.timeout = setTimeout(() => {
      this.search();
    }, 500);
  }

  /**
   * Make a contact selection from the suggestions
   * @param address
   * @param name
   * @param code
   */
  onSelectAddress(address, name, code) {
    this.setState({
      newContact: {
        ...this.state.newContact,
        address: address,
        name: name,
        code: code
      }
    });
    console.log(this.state.newContact);
  }

  /**
   * Add the contact
   * @returns {Promise<void>}
   */
  async addContact() {
    if (this.state.newContact.address === null) {
      return;
    }
    const ans = this.state.ans
    const { code, name, address } = this.state.newContact;
    const checkContact = await findContact(ans ? `${name}#${code}` : address);

    // User is already a contact
    if (checkContact.length > 0) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.contactAlreadyExists,
        color: 'red'
      });
      return;
    }

    // All good - add the contact!
    await addContact({ name, address, code, ans }, ans);

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
        ansOrName: '',
        name: null,
        code: null,
        address: null
      }
    })
  }

  renderSearchBox() {
    return (
      <Input
        placeholder={this.props.lang.ansNameOrAddress}
        value={this.state.newContact.ansOrName}
        handleChange={(val) => this.onSearchChanged(val)}
        type="text"
        autoFocus
        isLeft
        onSubmit={this.search}
      />
    );
  }

  renderResults() {
    let title = <div>{ this.props.lang.noResults }</div>;
    if (this.state.ans && this.state.results.length > 0) {
      title = <div>{ this.props.lang.ansRecords } ({ this.state.results.length }):</div>;
    } else if (!this.state.ans && this.state.results.length > 0) {
      title = <div>{ this.props.lang.results }</div>;
    }

    return (
      <div>
        <div className="mb-2">{ title }</div>
        <div className="radioGroup">
          {this.state.results.map((val, index) => {
            let label = `${val.Name}#${val.Code}`;
            if (!this.state.ans) {
              label = `${val.address}`;
            }
            const address = (this.state.ans ? val.Address : val.address);
            const name = (this.state.ans ? val.Name : null);
            const code = (this.state.ans ? val.Code : null);
            const className = (this.state.newContact.address === address ? 'selected' : '');
            return (
              <div key={index} onClick={this.onSelectAddress.bind(this, address, name, code)} className={className}>
                {label}
              </div>
            );
          })}
        </div>
        <div className="mt-2 d-flex justify-content-end">
          <Button color="primary" disabled={this.state.newContact.address === null} onClick={this.addContact}>Add Contact</Button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>{this.props.lang.addContact}</ModalHeader>
        <ModalBody>
          {this.renderSearchBox()}
          <hr />
          {this.renderResults()}
        </ModalBody>
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
