import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import * as actions from '../../../actions/index';
import {getPlatformFileName, getPlatformName, grabWalletDir} from "../../../utils/platform.service";
import {unzipFile} from "../../../utils/downloader";
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
    this.props.settellUserUpdateFailed(false);
    this.props.setUpdatingApplication(false);
    event.emit('initial_setup', false);
  }

  retryDownload() {
    event.emit('downloadDaemon');
  }

  async unzipAndCopyDaemon(fileName){
    return new Promise(async (resolve, reject) => {
      const walletDir = grabWalletDir();
      const unzipped = await unzipFile(fileName, walletDir);
      if (!unzipped) reject(unzipped);
      const latestDaemonVersion = fileName.split('-')[1];
      let fileLocation =  '/bin/eccoind';
      if(getPlatformName() === 'win32' || getPlatformName() === 'win64'){
        fileLocation = '\\bin\\eccoind.exe';
      }
      console.log(fileLocation);
      console.log(getPlatformName());
      fs.renameSync(walletDir + "eccoin-"+ latestDaemonVersion + fileLocation, walletDir + getPlatformFileName(), function (err) {
        if (err) reject(err)
        console.log('Successfully renamed - AKA moved!')
        resolve(true);
      });
    });

  }

  async manualDaemonUpdate(){
    const extension = getPlatformName() === ('win32' || 'win64') ? 'zip' :  'gz';
    console.log('called open file');
    dialog.showOpenDialog({ title: this.props.lang.selectAFileName,
      filters: [

        { extensions: [extension] }

      ] }, (fileNames) => {
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
        this.unzipAndCopyDaemon(fileName).then((result) => {
          Toast({
            title: this.props.lang.success,
            message: 'Imported! starting wallet',
            color: 'red'
          });
          event.emit('initial_setup')
          this.props.settellUserUpdateFailed({
            updateFailed: false,
            downloadMessage: ''
          });
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
          <p> { this.props.downloadMessage }</p>
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
    downloadMessage: state.application.downloadMessage,
    wallet: state.application.wallet,
    guiUpdate: state.startup.guiUpdate,
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(FullscreenModal);
