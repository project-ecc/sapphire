import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';

import {PlusIcon} from 'mdi-react';

import * as actions from '../../../actions';

const event = require('../../../utils/eventhandler');

class TransactionModal extends Component {
  constructor(props) {
    super(props);

    this.handleConfirm = this.handleConfirm.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      open: false,
      sendAdresses: [],
      receiveAddresses: [],
      transaction: {}
    };
  }

  async componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.transactionId !== prevProps.transactionId) {
     await this.loadTransactionData(this.props.transactionId);
    }
  }

  async loadTransactionData(txid){
    const data = await this.props.wallet.getTransaction(txid);
    const sendAddresses = [];
    const receiveAddresses = [];
    data.details.forEach(function (item, index) {
      if(item.category === 'send'){
        sendAddresses.push(item);
      } else{
        receiveAddresses.push(item);
      }

      this.setState({
        sendAddresses: sendAddresses,
        receiveAddresses: receiveAddresses,
        transaction: data
      });

      console.log(this.state.sendAdresses);
      console.log(this.state.receiveAddresses);
    });
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }


  async handleConfirm() {
  }


  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>
          Transaction
        </ModalHeader>
        <ModalBody>
          <div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={this.handleConfirm}>
            { this.props.lang.create }
            <PlusIcon className="ml-2" />
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    blockPayment: state.chains.blockPayment
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(TransactionModal);
