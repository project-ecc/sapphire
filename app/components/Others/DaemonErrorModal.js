import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from '../../actions/index';
import {getDebugUri} from '../../utils/platform.service';
import {Button, Col, Modal, ModalBody, ModalHeader, Row} from 'reactstrap';

const event = require('../../utils/eventhandler');
const fs = require('fs-extra');
const dialog = require('electron').remote.require('electron').dialog;

class DaemonErrorModal extends Component {
  constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    this.exportDebugLogFile = this.exportDebugLogFile.bind(this);
    this.rebootDaemonWithReIndex = this.rebootDaemonWithReIndex.bind(this);
  }

  _handleKeyPress = (e) => {
    console.log(e);
    if (e.key === 'Enter') {
      this.handleConfirm();
    }
  };

  exportDebugLogFile() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        return;
      }

      const backupLocation = `${folderPaths}/debug.log`;
      try {
        fs.copySync(getDebugUri(), backupLocation);
      } catch (e) {
        console.log(e);
      }
    });
  }

  rebootDaemonWithReIndex(){
    this.props.setDaemonError('');
    this.props.setDaemonErrorPopup(false);
    console.log('in here')
    event.emit('start', true);
  }

  handleCancel() {
    this.props.setDaemonErrorPopup(false);
  }

  renderReIndexWindow() {
    let needsReindexing = false
    const captureStrings = [
      'Corrupted block database detected',
      'Aborted block database rebuild. Exiting.',
      'ERROR: VerifyDB():'
    ];

    if (captureStrings.some((v) => { return this.props.daemonError.indexOf(v) > -1; })) {
      needsReindexing = true
    }
    if(needsReindexing && this.props.daemonErrorPopup){
      return (
        <div>
          <Row style={{textAlign: 'center'}}>
            <Col>
              <h3>Oops!</h3>
              <p className="backupSuccessful">It looks like Sapphire is unable to load ECC's blockchain:</p>
              <p className="backupSuccessful">{this.props.daemonError}</p>
              <Button size="sm" outline color="warning" onClick={this.rebootDaemonWithReIndex} className="buttonPrimary caps">Fix Now</Button>
            </Col>
          </Row>
        </div>
      );
    }
  }
  renderDaemonErrorPopup(){
    if(this.props.daemonErrorPopup){
      return (
        <div>
          <Row style={{position:'absolute',bottom:'20px', left: '15px', width: '300px'}}>
          <Col>
            <Button size="sm" outline color="warning" onClick={this.exportDebugLogFile} className="buttonPrimary caps">Export Debug file</Button>
            <p className="backupSuccessful">If you are stuck on your issue please join our discord below, report your issue in #support and attach the
              above debug file</p>
            <a href="https://discord.gg/wAV3n2q" target="_blank">https://discord.gg/wAV3n2q</a>
          </Col>
        </Row>
        </div>
      );
    }
  }
  render() {
    return (
      <Modal isOpen className="fullscreenModal" style={{textAlign: 'center'}}>
        <ModalHeader>
          { this.props.lang.error }
        </ModalHeader>
        <ModalBody>
          <div>
            <div style={{
              height: '100%',
              display: 'block',
              overflow: 'auto',
              margin: 'auto 0',
              padding: '10px',
              minHeight: '400px'
            }}>
              {this.renderReIndexWindow()}
            </div>
            {this.renderDaemonErrorPopup()}
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    daemonError: state.application.daemonError,
    daemonErrorPopup: state.application.daemonErrorPopup
  };
};


export default connect(mapStateToProps, actions)(DaemonErrorModal);
