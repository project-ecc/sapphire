import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import * as actions from '../../../actions/index';
import Input from '../../Others/Input';
import Tools from './../../../utils/tools';

class ContactModal extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.search = this.search.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);

    this.state = {
      open: false,
      results: [],
      ans: false,
      newContact: {
        ansOrName: '',
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

  toggle(forceVal) {
    this.setState({
      open: (typeof (forceVal) === 'boolean' ? forceVal : !this.state.open)
    });
  }

  async search() {
    try {
      const response = await Tools.searchForUsernameOrAddress(
        this.props.wallet,
        this.state.newContact.ansOrName
      );
      let payload = {}
      if (response.addresses.length === 1) {
        payload = {
          newContact: {
            ...this.state.newContact,
            address: (response.ans ? response.addresses[0].Address : response.addresses[0].address)
          }
        };
      }
      this.setState({
        results: response.addresses,
        ans: response.ans,
        ...payload
      });
    } catch (err) {
      this.setState({
        results: [],
        ans: false,
        newContact: {
          ...this.state.newContact,
          address: null
        }
      });
      console.log('Error searching for ANS Name / Address');
    }
  }

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
    }
    else if (!this.state.ans && this.state.results.length > 0) {
      title = <div>{ this.props.lang.results }</div>;
    }

    return (
      <div>
        <div className="mb-2">{ title }</div>
        <RadioGroup value={this.state.newContact.address}>
          {this.state.results.map((val, index) => {
            let label = `${val.Name}#${val.Code}`;
            if (!this.state.ans) {
              label = `${val.address}`;
            }
            const address = (this.state.ans ? val.Address : val.address);
            return (
              <RadioButton key={index} value={address}>
                {label}
              </RadioButton>
            );
          })}
        </RadioGroup>
        <div className="mt-2 d-flex justify-content-end">
          <Button color="primary" disabled={this.state.newContact.address === null}>Add Contact</Button>
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
