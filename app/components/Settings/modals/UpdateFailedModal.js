import React, {Component} from 'react';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import * as actions from '../../../actions/index';

const event = require('../../../utils/eventhandler');

class FullscreenModal extends Component {
  constructor(props) {
    super(props);
    this.handleDismissUpdateFailed = this.handleDismissUpdateFailed.bind(this);
  }

  handleDismissUpdateFailed() {
    this.props.settellUserUpdateFailed(false);
    this.props.setUpdatingApplication(false);
    ipcRenderer.send('start');

    if (this.props.guiUpdate) {
      event.emit('runMainCycle');
    }
  }

  render() {
    return (
      <Modal isOpen className="fullscreenModal">
        <ModalHeader></ModalHeader>
        <ModalBody>
          { this.props.downloadMessage }
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.handleDismissUpdateFailed}>{ this.props.lang.dismiss }</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    loading: state.startup.loading,
    downloadMessage: state.application.downloadMessage,
    wallet: state.application.wallet,
    guiUpdate: state.startup.guiUpdate
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(FullscreenModal);
