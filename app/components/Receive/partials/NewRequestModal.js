import React, {Component} from 'react';
import {connect} from 'react-redux';
import {TweenMax} from 'gsap';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {PlusIcon} from 'mdi-react';

import * as actions from '../../../actions/index';
import Toast from '../../../globals/Toast/Toast';
import hash from '../../../router/hash';

import {addAddress} from '../../../Managers/SQLManager';

const event = require('../../../utils/eventhandler');

class NewRequestModal extends Component {
  constructor(props) {
    super(props);

    this.handleConfirm = this.handleConfirm.bind(this);
    this.createNormalAddress = this.createNormalAddress.bind(this);
    this.getConfirmationText = this.getConfirmationText.bind(this);

    this.toggle = this.toggle.bind(this);
    this.selectType = this.selectType.bind(this);
    this.state = {
      open: false,
    };
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  selectType(type) {
    this.setState({
      type
    });
  }


  goToBackupPage() {
    hash.push('/settings/wallet');
  }

  createNormalAddress() {
    const vm = this;
    this.props.wallet.createNewAddress().then(async (newAddress) => {
      console.log(newAddress);
      await addAddress(newAddress, true);
      event.emit('newAddress', newAddress);
      Toast({
        title: this.props.lang.addressCreatedSuccessfullyTitle,
        message: this.props.lang.addressCreatedSuccessfully,
        buttons: [
          {
            title: this.props.lang.clickToBackupWallet,
            method() { vm.goToBackupPage(); }
          }
        ]
      });
    }).catch((err) => {
      console.log('error creating address: ', err);
    });
  }


  async handleConfirm() {

    this.createNormalAddress();

  }

  unlockWallet(flag, time, callback) {
    const batch = [];
    const obj = {
      method: 'walletpassphrase', parameters: [this.state.password, time, flag]
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      console.log(data);
      data = data[0];
      if (data !== null && (data.code === -14 || data.code === -1)) {
        Toast({
          title: this.props.lang.error,
          message: this.props.lang.wrongPassword,
          color: 'red'
        });
        this.props.setPopupLoading(false);
      } else if (data !== null && data.code === 'ECONNREFUSED') {
        console.log('Daemon not running - Dev please look into this and what exactly triggered it');
      } else if (data === null) {
        callback();
      } else {
        console.log('error unlocking wallet: ', data);
      }
    }).catch((err) => {
      console.log('err unlocking wallet: ', err);
    });
  }

  getConfirmationText() {
    return (
      <p className="confirmationText">{ this.props.lang.normalCreateConfirm1 } <span className="ecc">{ this.props.lang.normalCreateConfirm2 }</span>.</p>
    );
  }


  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>
          { this.props.lang.newAddress }
        </ModalHeader>
        <ModalBody>
          <div>
            {this.getConfirmationText()}
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


export default connect(mapStateToProps, actions, null, { withRef: true })(NewRequestModal);
