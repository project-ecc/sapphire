import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Input, Modal, ModalBody, ModalHeader} from 'reactstrap';
import Toast from '../../../globals/Toast/Toast';
import * as actions from '../../../actions/index';

class ChangePasswordModal extends Component {
  constructor(props) {
    super(props);

    this.handleConfirm = this.handleConfirm.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: false,
      password_current: '',
      password: '',
      password_confirm: ''
    };
  }

  toggle() {
    this.setState({
      open: !this.state.open,
      password_current: '',
      password: '',
      password_confirm: ''
    });
  }

  changePassword() {
    const wasStaking = this.props.isStaking;
    this.props.wallet.walletChangePassphrase(this.state.password, this.state.password_confirm).then((data) => {
      if (data === null) {
        if (wasStaking) {

        }
        Toast({
          message: this.props.lang.operationSuccessful
        });
        setTimeout(() => {
          this.toggle();
        }, 2000);
      } else if (data.code && data.code === -14) {
        Toast({
          title: this.props.lang.error,
          message: this.props.lang.wrongPasswordProper,
          color: 'red'
        });
      }1;
      this.props.setPopupLoading(false);
    })
    .catch((err) => {
      console.error(err);
      this.props.setPopupLoading(false);
    });
  }

  handleConfirm() {
    if (this.state.password_current.length < 1 || this.state.password.length < 1 || this.state.password_confirm.length < 1) {
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
      this.props.setPopupLoading(true);
      this.changePassword();
    }
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
        <Modal isOpen={this.state.open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>{ this.props.lang.changePassword }</ModalHeader>
          <ModalBody>
            <Input
              placeholder={this.props.lang.currentPassword}
              value={this.state.password_current}
              onChange={e => this.onTextFieldChange('password_current', e)}
              type="password"
              autoFocus
            />
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
            <div className="d-flex justify-content-end mt-4">
              <Button onClick={this.handleConfirm} color="primary">
                { this.props.lang.confirm }
              </Button>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    isStaking: state.chains.isStaking,
    wallet: state.application.wallet
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(ChangePasswordModal);
