import React, {Component} from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {LockIcon} from 'mdi-react';
import {connect} from "react-redux";
import * as actions from "../../../actions";
import Toast from "../../../globals/Toast/Toast";
import event from '../../../utils/eventhandler';

class Encrypt extends Component {
  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);

    this.checkIfEncrypted = this.checkIfEncrypted.bind(this);
    this.showEncryptWallet = this.showEncryptWallet.bind(this);
    this.showWalletEncrypted = this.showWalletEncrypted.bind(this);
    this.encryptWallet = this.encryptWallet.bind(this);
    this.checkIfWalletRunning = this.checkIfWalletRunning.bind(this);

    this.state = {
      password: '',
      password_confirm: '',
      /*
        0 = Not encrypting
        1 = Encrypting
        2 = Checking wallet
        3 = Encrypted
       */
      encrypting: 0
    };
    this.checkIfWalletRunning()
    this.checkIfEncrypted()

  }

  checkIfWalletRunning(){
    if(this.props.daemonRunning === false){
      event.emit('start');
    }
  }

  checkIfEncrypted() {
    this.props.wallet.help().then((data) => {
      if (data.indexOf('walletlock') > -1) {
        this.showWalletEncrypted();
      } else {
        this.showEncryptWallet();
      }
    }).catch((err) => {
      console.log('error checking if encrypted: ', err);
      const self = this;
      setTimeout(() => {
        self.checkIfEncrypted();
      }, 1000);
    });
  }

  showEncryptWallet() {
    this.setState({
      encrypting: 0
    });
  }

  showWalletEncrypted() {
    this.setState({
      encrypting: 3
    });
  }

  showEncryptingWallet() {
    this.setState({
      encrypting: 1
    });
  }

  onTextFieldChange(key, e) {
    const value = e.target.value;
    const payload = {};
    payload[key] = value;
    this.setState(payload);
  }

  encryptWallet() {
    if (this.state.password.length < 1) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.passwordCantBeEmpty,
        color: 'red'
      });
      return;
    } else if (this.state.password !== this.state.password_confirm) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.passwordsDoNotMatch,
        color: 'red'
      });
      return;
    }

    this.showEncryptingWallet();
    this.props.wallet.encryptWallet(this.state.password).then((data) => {
      const self = this;
      if (data.code === -1 || data.code === -28) {
        console.log('failed to encrypt: ', data);
        setTimeout(() => {
          self.encryptWallet();
        }, 1000);
      } else {
        this.showWalletEncrypted();
        this.props.setUnencryptedWallet(false);
        setTimeout(() => {
          event.emit('start');
        }, 5000);
        console.log('encrypted! ', data);
      }
    }).catch((err) => {
      console.log('error encrypting wallet: ', err);
    });
  }

  closeModal() {
    this.props.setStepInitialSetup('complete');
  }

  render() {
    return (
      <div>
        <p id="welcome">
          { this.props.lang.encryptWallet }
        </p>
        <div className="mt-3">
          <Input
            style={{ width: '400px' }}
            placeholder={this.props.lang.enterPassword}
            value={this.state.password}
            onChange={(e) => { this.onTextFieldChange('password', e); }}
            type="password"
            className="ml-auto mr-auto mb-2"
          />
          <Input
            placeholder={this.props.lang.repeatPassword}
            value={this.state.password_confirm}
            onChange={(e) => { this.onTextFieldChange('password_confirm', e); }}
            type="password"
            style={{ width: '400px' }}
            className="ml-auto mr-auto"
          />

          <Button size="lg" color="white" style={{color:'white'}}className="mt-3" onClick={this.encryptWallet}>
            { this.props.lang.encrypt }
            <LockIcon className="ml-2" />
          </Button>
        </div>

        <Modal isOpen={this.state.encrypting > 0}>
          <ModalHeader>
            { this.props.lang.encryptWallet }
          </ModalHeader>
          <ModalBody>
            { this.state.encrypting === 1 && (
              <div>
                <p>{ this.props.lang.encrypting }</p>
              </div>
            )}
            { this.state.encrypting === 2 && (
              <div>
                <p>{ this.props.lang.checkingWallet }</p>
              </div>
            )}
            { this.state.encrypting === 3 && (
              <div>
                <p>{ this.props.lang.walletEncrypted1 }</p>
                <p>{ this.props.lang.walletEncrypted2 }</p>
                <p>{ this.props.lang.walletEncrypted3 }</p>
              </div>
            )}
          </ModalBody>
          { this.state.encrypting === 3 && (
            <ModalFooter>
              <Button color="primary" onClick={this.closeModal}>
                { this.props.lang.close }
              </Button>
            </ModalFooter>
          )}
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    daemonRunning: state.application.daemonRunning
  };
};


export default connect(mapStateToProps, actions)(Encrypt);
