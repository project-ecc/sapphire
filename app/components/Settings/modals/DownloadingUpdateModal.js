import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Modal, ModalBody, ModalHeader} from 'reactstrap';
import * as actions from '../../../actions/index';

class DownloadingUpdateModal extends Component {
  render() {
    return (
      <Modal isOpen className="fullscreenModal">
        <ModalHeader>
          { this.props.lang.loading }
        </ModalHeader>
        <ModalBody>
          { this.props.downloadMessage }
          { this.props.percentage !== null && (
            <div>
              { this.props.percentage }%
            </div>
          )}
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    downloadMessage: state.application.downloadMessage,
    percentage: state.application.downloadPercentage
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(DownloadingUpdateModal);
