import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TweenMax } from 'gsap';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Input } from 'reactstrap';
import { PlusIcon } from 'mdi-react';

import * as actions from '../../../actions/index';
import Toast from '../../../globals/Toast/Toast';
import hash from '../../../router/hash';
import ActionModal from './../../Others/ActionModal';

import { getAddress } from '../../../Managers/SQLManager';

const event = require('../../../utils/eventhandler');

// This is temporary until ANS is enabled
const ansEnabled = false;

class NewAddressModal extends Component {
  constructor(props) {
    super(props);

    this.handleConfirm = this.handleConfirm.bind(this);
    this.createNormalAddress = this.createNormalAddress.bind(this);
    this.getConfirmationText = this.getConfirmationText.bind(this);
    this.setAddressPendingUpgrade = this.setAddressPendingUpgrade.bind(this);
    this.toggle = this.toggle.bind(this);
    this.selectType = this.selectType.bind(this);

    this.state = {
      type: 'normal',
      name: '',
      password: '',
      open: false
    };
  }

  componentWillUnmount() {
    this.props.setNewAddressNamePopup('');
    this.props.setPassword('');
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

  onFieldChange(key, e) {
    const value = e.target.value;
    const payload = {};
    payload[key] = value;
    this.setState(payload);
  }

  goToBackupPage() {
    hash.push('/settings/wallet');
  }

  createNormalAddress() {
    const vm = this;
    this.props.wallet.createNewAddress(this.props.account).then((newAddress) => {
      event.emit('newAddress');
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

  // createNewAnsAddress() {
  //   let newAddress;
  //   this.props.wallet.createNewAddress()
  //     .then(address => {
  //       newAddress = address;
  //       return this.props.wallet.sendMoney(newAddress, 51);
  //     })
  //     .then(() => {
  //       return this.createANSAddress(newAddress);
  //     })
  //     .catch(err => {
  //       console.log('error creating ANS address: ', err);
  //       if(err.message.indexOf("Insufficient funds") !== -1){
  //         Tools.showTemporaryMessage('#wrongPassword', "Not enough funds in the address. You need to have a little over 50 ECC to account for the transfer fees.", 7000, this.props.lang.wrongPassword);
  //       }
  //       this.props.setPopupLoading(false)
  //     });
  // }

  async setAddressPendingUpgrade(add) {
   // save to DB here
    const address = await getAddress(add);
    address.status = 'upgrading';
    await address.save();
  }

  async createANSAddress(address) {
    return await this.props.wallet.createNewANSAddress(address, this.props.usernamePopup)
      .then(async response => {
        console.log(response);
        await this.setAddressPendingUpgrade(address);
        TweenMax.to('#ConfirmNewAddress__content', 0.2, { autoAlpha: 0, scale: 0.5 });
        this.successModal.getWrappedInstance().toggle();
        // TweenMax.set('#unlockPanel', {height: "331px"});
        TweenMax.to('#unlockPanel', 1, { height: '220px', delay: 0.2 });
        this.props.setPopupLoading(false);
      })
      .catch(err => {
        console.log('error creating ANS address: ', err);
        if (err.message.indexOf('Insufficient funds') !== -1) {
          Toast({
            title: this.props.lang.error,
            message: this.props.lang.addressNotEnoughFunds,
            color: 'red'
          });
        } else if (err.message.indexOf('there can only be') !== -1) {
          Toast({
            title: this.props.lang.error,
            message: this.props.lang.ansInputsError,
            color: 'red'
          });
        } else if (err.message.indexOf('Username contains invalid') !== -1) {
          Toast({
            title: this.props.lang.error,
            message: this.props.lang.usernamInvalid,
            color: 'red'
          });
        } else if (err.message.indexOf('maxiumum length of') !== -1) {
          Toast({
            title: this.props.lang.error,
            message: this.props.lang.usernameTooBig,
            color: 'red'
          });
        }
        this.props.setPopupLoading(false);
      });
  }


  async handleConfirm() {
    console.log('is address selected', this.props.selectedAddress);
    console.log('is upgrading address', this.props.upgradingAddress);
    console.log('created address', this.state.createdAddress);

    if (this.state.type === 'normal') {
      this.createNormalAddress();
    } else {
      await this.unlockWallet(false, 30, async () => {
        // if (this.props.selectedAddress && this.props.upgradingAddress) {
        await this.createANSAddress(this.props.selectedAddress.address);
        // } else  {
          // this.createNewAnsAddress();
        // }
      });
    }

    // reset the dialog test afterwould
    // this.setState({
    //   type: 'normal',
    //   name: '',
    //   password: ''
    // });
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
    if (this.state.type === 'ans') {
      return (
        <div className="mt-4">
          <div id="ConfirmNewAddress__content">
            <Input
              placeholder={this.props.lang.ansName}
              value={this.state.name}
              onChange={(e) => this.onFieldChange('name', e)}
            />
            <Input
              placeholder={this.props.lang.password}
              value={this.state.password}
              onChange={(e) => this.onFieldChange('password', e)}
              type="password"
              className="mt-2"
            />
            <p className="mt-2">{ this.props.lang.ansCost1 } 50 <span className="ecc">ecc</span> { this.props.lang.ansCost2 }.</p>
          </div>
        </div>
      );
    } else if (this.state.type === 'normal' && this.props.account === '') {
  		return (
    <p className="confirmationText">{ this.props.lang.normalCreateConfirm1 } <span className="ecc">{ this.props.lang.normalCreateConfirm2 }</span>.</p>
  		);
  	} else if (this.state.type === 'normal' && this.props.account !== '') {
  		return (
    <p className="confirmationText">{ this.props.lang.normalCreateConfirm1 } <span className="ecc">{ this.props.lang.normalCreateConfirm2 }</span> { this.props.lang.normalCreateConfirm4 } "{this.props.account}". { this.props.lang.normalCreateConfirm5 }                                <span className="ecc">{ this.props.lang.ansCreateConfirm2 }</span> { this.props.lang.normalCreateConfirm6 }.</p>
  		);
  	}
  }

  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>
          { this.props.lang.newAddress }
        </ModalHeader>
        <ModalBody>
          {/* Select Address Type */}
          <div className="radioGroup">
            <div className={this.state.type === 'normal' ? 'selected' : ''} onClick={() => this.selectType('normal')}>
              Normal
            </div>
            <div className={this.state.type === 'ans' ? 'selected' : ''} onClick={() => this.selectType('ans')}>
              ANS
            </div>
          </div>
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

        <ActionModal
          ref={(e) => { this.successModal = e; }}
          body={(
            <div>
              <p>{ this.props.lang.ansSuccess1 }</p>
              <p className="mt-4">{ this.props.lang.ansSuccess2 }</p>
            </div>
          )}
        />
      </Modal>
    );
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    username: state.application.newAddressName,
    usernamePopup: state.application.newAddressNamePopup,
    ansAddress: state.application.creatingAnsAddress,
    upgradingAddress: state.application.upgradingAddress,
    selectedAddress: state.application.selectedAddress,
    account: state.application.newAddressAccount,
    wallet: state.application.wallet,
    passwordVal: state.application.password,
    blockPayment: state.chains.blockPayment
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(NewAddressModal);
