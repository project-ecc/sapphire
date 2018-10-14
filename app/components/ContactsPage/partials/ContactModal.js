import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, CustomInput } from 'reactstrap';
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
            address: response.addresses[0].Address
          }
        };
      }
      this.setState({
        results: response.addresses,
        ans: response.ans,
        ...this.state.newContact,
        ...payload
      });
      console.log(response);
    } catch (err) {
      this.setState({
        results: [],
        ans: false,
        ...this.state.newContact,
        newContact: {
          address: null
        }
      });
      console.log('Error searching for ANS Name / Address', err);
    }
  }

  onSearchChanged(val) {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }

    this.setState({
      newContact: {
        ...this.state.newContact,
        ansOrName: val
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
        { title }
        <div>
          {this.state.results.map((val, index) => {
            const label = `${val.Name}#${val.Code}`;
            return (
              <CustomInput key={index} id={`contactAddGroup${index}`} type="radio" label={label} name="contactAddGroup" checked={this.state.newContact.address === val.Address} />
            );
          })}
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
