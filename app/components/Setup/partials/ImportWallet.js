import React, {Component} from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {ipcRenderer} from 'electron';
import {connect} from "react-redux";
import * as actions from "../../../actions";
import {ArrowRightIcon, KeyIcon, UploadIcon} from 'mdi-react';

class ImportWallet extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
    this.importPrivateKeysStep = this.importPrivateKeysStep.bind(this);

    this.closeModal = this.closeModal.bind(this);
    this.openFile = this.openFile.bind(this);
    this.sendActionImportCancelled = this.sendActionImportCancelled.bind(this);
    this.sendActionImportedWallet = this.sendActionImportedWallet.bind(this);
    this.sendActionImportStarted = this.sendActionImportStarted.bind(this);

    this.state = {
      /*
        -1 = Finished uploading
        0 = not importing
        1 = importing
        2 = error when importing
        3 = imported successfully
      */
      importing: 0
    };
  }

  componentWillMount() {
    ipcRenderer.on('importedWallet', this.sendActionImportedWallet);
    ipcRenderer.on('importStarted', this.sendActionImportStarted);
    ipcRenderer.on('importCancelled', this.sendActionImportCancelled);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('importedWallet', this.sendActionImportedWallet);
    ipcRenderer.removeListener('importStarted', this.sendActionImportStarted);
    ipcRenderer.removeListener('importCancelled', this.sendActionImportCancelled);
  }

  nextStep() {
    this.props.setStepInitialSetup('encrypt');
  }

  importPrivateKeysStep() {
    this.props.setStepInitialSetup('importprivatekeys');
  }

  sendActionImportedWallet() {
    this.setState({
      importing: 3
    });
  }

  sendActionImportCancelled() {
    this.setState({
      importing: 2
    });
  }

  sendActionImportStarted() {
    this.setState({
      importing: 1
    });
  }

  openFile() {
    if (this.state.importing) { return; }
    ipcRenderer.send('importWallet');
    this.setState({
      importing: 1
    });
  }

  closeModal () {
    this.setState({
      importing: (this.state.importing === 3 ? -1 : 0)
    });
  }

  render() {
    return (
      <div>
        <p id="welcome">
          { this.props.lang.importWallet }
        </p>
        <p>
          { this.props.lang.importExistingWallet }
        </p>
        <div>
          { this.state.importing === 0 && (
            <Button onClick={this.openFile} className="mt-3" color="white" size="lg">
              { this.props.lang.selectFile }
              <UploadIcon className="ml-2" />
            </Button>
          )}
        </div>
        <div className="mt-5">
          <Button onClick={this.importPrivateKeysStep} color="primary" active>
            Import Private Key
            <KeyIcon className="ml-2" />
          </Button>
          <Button onClick={this.nextStep} className="ml-3" color="primary">
            Continue
            <ArrowRightIcon className="ml-2" />
          </Button>
        </div>

        <Modal isOpen={this.state.importing > 0}>
          <ModalHeader>
            { this.props.lang.import }
          </ModalHeader>
          <ModalBody>
            { this.state.importing === 1 && (
              <span>{ this.props.lang.importingYourWallet }</span>
            )}
            { this.state.importing === 2 && (
              <span>{ this.props.lang.errorImportingWallet }</span>
            )}
            { this.state.importing === 3 && (
              <span>{ this.props.lang.imported }</span>
            )}
          </ModalBody>
          { this.state.importing !== 1 && (
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
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(ImportWallet);
