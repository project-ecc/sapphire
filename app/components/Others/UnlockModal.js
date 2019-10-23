import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Input, Modal, ModalBody, ModalHeader} from 'reactstrap';

import * as actions from '../../actions/index';
import Toast from '../../globals/Toast/Toast';

class UnlockModal extends Component {
  constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.unlockWallet = this.unlockWallet.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: false,
      unlocking: false
    };
  }

  toggle() {
    if (this.state.unlocking) { return; }
    this.setState({
      open: !this.state.open,
      password: ''
    });
  }

  setUnlocking(val = false) {
    this.setState({
      unlocking: val
    });
  }

  wrongPasswordToast() {
    Toast({
      title: this.props.lang.error,
      message: this.props.lang.wrongPassword,
      color: 'red'
    });
  }

  async unlockWallet() {
    // const updated = await Tools.updateConfig(1);
    // if (updated){
    let forStaking = this.props.forStaking == true;
    const batch = [];
    const obj = {
      method: 'walletpassphrase', parameters: [this.state.password, 31556926, forStaking]
    };
    batch.push(obj);

    this.setUnlocking(true);

    return this.props.wallet.command(batch).then((data) => {
      let result = false;
      console.log('data: ', data);
      data = data[0];
      if (data !== null && data.code === -14) {
        this.wrongPasswordToast();
        this.setUnlocking();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
        console.log("daemong ain't working mate :(");
        this.setUnlocking();
      } else if (data === null) {
        this.setUnlocking();
        this.toggle();
        result = true;
      } else {
        console.log('error unlocking wallet: ', data);
        this.setUnlocking();
      }
      return result;
    }).catch((err) => {
      console.log('err unlocking wallet: ', err);
      this.setUnlocking();
      return false;
    });
    // }
  }

  handleConfirm() {
    if (this.state.password.length < 1) {
      this.wrongPasswordToast();
      return;
    }

    this.unlockWallet().then((result) => {
      if (!result) return;
      this.props.onUnlock();
    });
  }

  onFieldChange(e) {
    const val = e.target.value;
    this.setState({
      password: val
    });
  }

  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>
          { this.props.lang.unlockWallet }
        </ModalHeader>
        <ModalBody>
          <div>{ this.props.children }</div>
          <Input
            placeholder={this.props.lang.password}
            value={this.state.password}
            onChange={this.onFieldChange}
            type="password"
            className="mt-4"
            onKeyPress={event => {
              if (event.key === "Enter") {
                this.handleConfirm();
              }
            }}
          />
          <div className="d-flex justify-content-end mt-2">
            <Button onClick={this.handleConfirm} color="primary">
              { this.props.lang.confirm }
            </Button>
          </div>
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

export default connect(mapStateToProps, actions, null, { withRef: true })(UnlockModal);
