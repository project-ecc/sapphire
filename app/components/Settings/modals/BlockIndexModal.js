import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import * as actions from '../../../actions/index';

class BlockIndexModal extends Component {
  render() {
    return (
      <Modal isOpen className="fullscreenModal">
        <ModalHeader>
          { this.props.lang.loading }
        </ModalHeader>
        <ModalBody>
          { this.props.loadingMessage }
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    loadingMessage: state.startup.loadingMessage,
    loading: state.startup.loading
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(BlockIndexModal);
