import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import * as actions from '../../../actions/index';
import {getPlatformFileName, getPlatformName, grabWalletDir} from "../../../utils/platform.service";
import {moveFile, unzipFile} from "../../../utils/downloader";
import Toast from '../../../globals/Toast/Toast';

const dialog = require('electron').remote.dialog;
const event = require('../../../utils/eventhandler');
const fs = require("fs");

class FullscreenModal extends Component {
  constructor(props) {
    super(props);
    this.handleDismissUpdateFailed = this.handleDismissUpdateFailed.bind(this);
    this.retryDownload = this.retryDownload.bind(this);
    this.manualDaemonUpdate = this.manualDaemonUpdate.bind(this);
    this.unzipAndCopyDaemon = this.unzipAndCopyDaemon.bind(this);
  }

  handleDismissUpdateFailed() {
    this.props.settellUserUpdateFailed({
      updateFailed: false,
      downloadMessage: ''
    });

    const version = this.props.installedDaemonVersion === -1 ? this.props.installedDaemonVersion : parseInt(this.props.installedDaemonVersion.replace(/\D/g, ''));

    if (version === -1){
      this.props.setUpdateFailedMessage("Sapphire is unable to start without a daemon installed please manually update");
    } else if (version < this.props.requiredDaemonVersion){
      this.props.setUpdateFailedMessage("Sapphire is unable to start with this version of the blockchain daemon, please update manually");
    } else {
      this.props.setUpdatingApplication(false);
      event.emit('initial_setup', false);
    }
  }

  retryDownload() {
    event.emit('initial_setup');
  }

  async unzipAndCopyDaemon(fileName){
    return new Promise(async (resolve, reject) => {
      const walletDirectory = grabWalletDir();
      const unzipped = await unzipFile(fileName, walletDirectory);
      if (!unzipped) reject(unzipped);
      const latestDaemonVersion = fileName.split('-')[1];


      const platFileName = getPlatformFileName();
      let fileLocation = '/bin/eccoind';
      if (getPlatformName() === 'win32' || getPlatformName() === 'win64') {
        fileLocation = '\\bin\\eccoind.exe';
      }
      const oldLocation = `${walletDirectory}eccoin-${latestDaemonVersion}${fileLocation}`;
      const newLocation = walletDirectory + platFileName;
      console.log(oldLocation);
      console.log(newLocation);
      const moved = await moveFile(oldLocation, newLocation);

      if (moved === true){
        resolve(true);
      }
      reject({message: 'Cannot move daemon file'});
    });

  }

  async manualDaemonUpdate(){
    const extension = getPlatformName() === ('win32' || 'win64') ? 'zip' :  'gz';
    console.log('called open file');
    dialog.showOpenDialog({ title: this.props.lang.selectAFileName,
      filters: [

        { extensions: [extension] }

      ] }, async (fileNames) => {
      if (fileNames === undefined) {
        return;
      }
      const fileName = fileNames[0];
      if (fileName.indexOf('eccoin') == -1) {
        dialog.showMessageBox({
          title: this.props.lang.wrongFileSelected,
          message: this.props.lang.pleaseSelectAFileNamed,
          type: 'error',
          buttons: ['OK']
        }, () => {
          this.manualDaemonUpdate();
        });
      } else {
        console.log(fileName)
        await this.unzipAndCopyDaemon(fileName).then((result) => {
          console.log('ready to load')
          this.props.settellUserUpdateFailed({
            updateFailed: false,
            downloadMessage: ''
          });
          Toast({
            title: this.props.lang.success,
            message: 'Imported! starting wallet',
            color: 'green'
          });
          event.emit('initial_setup')

        }).catch((err) => {
          console.log(err)
          Toast({
            title: this.props.lang.error,
            message: err.message,
            color: 'red'
          });
        });
      }
    });
  }

  render() {
    return (
      <Modal isOpen className="fullscreenModal">
        <ModalHeader>
          Daemon Update Failed
        </ModalHeader>
        <ModalBody>
          <h4>The Daemon was unable to update</h4>
          <p> { this.props.updateFailedMessage }</p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.manualDaemonUpdate}>Manual Update</Button>
          <Button color="primary" onClick={this.handleDismissUpdateFailed}>{ this.props.lang.dismiss }</Button>
          <Button color="primary" onClick={this.retryDownload}>{ this.props.lang.retry }</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    loading: state.startup.loading,
    updateFailedMessage: state.application.updateFailedMessage,
    wallet: state.application.wallet,
    daemonServerVersion: state.application.daemonServerVersion,
    installedDaemonVersion: state.application.installedDaemonVersion,
    requiredDaemonVersion: state.application.requiredDaemonVersion
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(FullscreenModal);
