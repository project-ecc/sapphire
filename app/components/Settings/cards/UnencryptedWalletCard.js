import React, {Component} from 'react';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {Button, Card, CardText, CardTitle, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import * as actions from '../../../actions';
import Toast from '../../../globals/Toast/Toast';

class UnencryptedWalletCard extends Component {
  constructor (props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.lockWallet = this.lockWallet.bind(this);
    this.showEncryptWallet = this.showEncryptWallet.bind(this);
    this.showWalletEncrypted = this.showWalletEncrypted.bind(this);
    this.showEncryptingWallet = this.showEncryptingWallet.bind(this);

    this.state = {
      open: false,
      /*
        0 = Not encrypting
        1 = Encrypting
        2 = Checking wallet
        3 = Encrypted
       */
      encrypting: 0
    };
  }

  toggle() {
    this.setState({
      open: !this.state.open,
      password: '',
      password_confirm: ''
    });
  }

  showEncryptWallet() {
    this.setState({
      encrypting: 0
    });
  }

  showWalletEncrypted() {
    this.setState({
      encrypting: 3,
      open: false,
      password: '',
      password_confirm: ''
    });
  }

  showEncryptingWallet() {
    this.setState({
      encrypting: 1
    });
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

  handleConfirm() {
    if (this.state.password.length < 1 || this.state.password_confirm.length < 1) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.fillAllFields,
        color: 'red'
      });
    } else if (this.state.password !== this.state.password_confirm) {
      Toast({
        title: this.props.lang.error,
        message: this.props.lang.passwordsDontMatch,
        color: 'red'
      });
    } else {
      this.lockWallet();
    }
  }

  async lockWallet() {
    await this.props.wallet.walletstop();
    this.showEncryptingWallet();
    this.props.wallet.encryptWallet(this.state.password).then((data) => {
      const self = this;
      if (data.code === -1 || data.code === -28) {
        console.log('failed to encrypt: ', data);
        setTimeout(() => {
          self.lockWallet();
        }, 1000);
      } else {
        this.showWalletEncrypted();
        this.props.setUnencryptedWallet(false);
        Toast({
          message: this.props.lang.walletEncrypted1,
          color: 'green'
        });
        setTimeout(() => {
          ipcRenderer.send('start');
        }, 5000);
        console.log('encrypted! ', data);
      }
    }).catch((err) => {
      console.log('error encrypting wallet: ', err);
    });
  }

  onTextFieldChange(key, e) {
    const value = e.target.value;
    const payload = {};
    payload[key] = value;
    this.setState(payload);
  }

  render() {
    return (
      <div>
        <Card body inverse className="bg-gradient-red standout mb-5">
          <CardTitle>{ this.props.lang.walletUnencrypted }</CardTitle>
          <CardText>{ this.props.lang.walletUnencryptedMessage }</CardText>
          <div className="d-flex justify-content-end">
            <Button color="danger" className="mt-2" onClick={this.toggle}>
              { this.props.lang.fixProblem }
            </Button>
          </div>
        </Card>

        <Modal isOpen={this.state.open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>
            { this.props.lang.encryptWallet }
          </ModalHeader>
          <ModalBody>
            <Input
              placeholder={this.props.lang.newPassword}
              value={this.state.password}
              onChange={e => this.onTextFieldChange('password', e)}
              type="password"
              className="mt-4"
            />
            <Input
              placeholder={this.props.lang.repeatPassword}
              value={this.state.password_confirm}
              onChange={e => this.onTextFieldChange('password_confirm', e)}
              type="password"
              className="mt-2"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="warning" onClick={this.handleConfirm}>Set Password</Button>
          </ModalFooter>
        </Modal>

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
    unencryptedWallet: state.startup.unencryptedWallet
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(UnencryptedWalletCard);
