import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TweenMax, TimelineMax } from 'gsap';
import { ipcRenderer } from 'electron';
import { Button, Modal, ModalHeader, ModalBody, Input } from 'reactstrap';
import { ArrowRightIcon, ContentSaveOutlineIcon } from 'mdi-react';

import * as actions from '../../../actions/index';

import Toast from '../../../globals/Toast/Toast';

const Tools = require('../../../utils/tools');
const os = require('os');
const { clipboard } = require('electron');

const fs = require('fs');
const jsPDF = require('jspdf');

class ExportPrivateKeysModal extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.generatePDF = this.generatePDF.bind(this);
    this.handleDisplayKeys = this.handleDisplayKeys.bind(this);
    this.onPasswordFieldChange = this.onPasswordFieldChange.bind(this);

    this.toPrint = [];
    this.state = {
      toDisplay: {},
      open: false,
      /**
       * Panel:
       * 0 = Enter Password
       * 1 = Export Options
       * 2 = View onscreen
       * 3 = Export to PDF
       */
      panel: 0,
      password: ''
    };
    this.addressesToCopy = '';
  }

  showWrongPassword () {
    Toast({
      title: this.props.lang.error,
      message: this.props.lang.wrongPassword,
      color: 'red'
    });
  }

  onPasswordFieldChange (e) {
    const value = e.target.value
    this.setState({
      password: value
    });
  }

  getPasswordPanel() {
    if (this.state.panel !== 0) { return; }
    return (
      <div id="passwordPanel">
        <p>{ this.props.lang.exportWarning }</p>
        <div>
          <Input
            className="mt-3"
            placeholder={this.props.lang.password}
            value={this.state.password}
            onChange={this.onPasswordFieldChange}
            type="password"
          />
          <div className="d-flex justify-content-end mt-2">
            <Button color="primary" onClick={this.handleConfirm}>
              { this.props.lang.next }
              <ArrowRightIcon className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  toggle() {
    this.setState({
      open: !this.state.open,
      panel: 0,
      password: ''
    });
  }

  handleDisplayKeys() {
    this.setState({
      panel: 2
    });
  }

  /** Handle user submit password */
  handleConfirm() {
    if (this.state.password.length < 1) {
      this.showWrongPassword();
      return;
    }
    this.unlockWallet(false, 30, async () => {
      await this.getDataToExport();
    });
  }

  async getDataToExport() {
    const wasStaking = this.props.staking;
    const addresses = this.props.addresses;
    const batch = [];
    const addressesArray = [];
    addresses.map((address) => {
      batch.push({
        method: 'dumpprivkey', parameters: [address.address]
      });
      addressesArray.push(address.address);
    });

    const privKeys = await this.getPrivateKeys(batch);
    let counter = 1;
    const aux = [];
    const keys = [];


    for (let i = 0; i < addressesArray.length; i++) {
      aux.push(addressesArray[i]);
      aux.push(privKeys[i]);
      aux.push('');

      keys[i] = { publicKey: addressesArray[i], privateKey: privKeys[i] };

      counter++;
      if (counter === 24 || i === addressesArray.length - 1) {
        this.toPrint.push([]);
        for (let j = 0; j < aux.length; j++) { this.toPrint[this.toPrint.length - 1].push(aux[j]); }
        aux.length = 0;
        counter = 1;
      }
    }
    this.setState({ toDisplay: keys });
    console.log(this.state.toDisplay);
    this.props.setPopupLoading(false);
    if (wasStaking) {
      this.unlockWallet(true, 31556926, () => {});
    } else {
      this.props.setStaking(false);
    }
    TweenMax.to('#passwordPanel', 0.3, { x: '-100%' });
    TweenMax.to('#exportOptions', 0.3, { css: { left: '0%' } });
    TweenMax.to('#confirmButtonPopup', 0.3, { x: '-450px', autoAlpha: 0 });
    setTimeout(() => {
      TweenMax.set('#confirmButtonPopup', { x: '-50%' });
    }, 300);
    this.setState({
      panel: 2
    })
    this.props.setPassword('');
  }

  unlockWallet(flag, time, callback) {
    const batch = [];
    const obj = {
      method: 'walletpassphrase', parameters: [this.state.password, time, flag]
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      data = data[0];
      if (data !== null && data.code === -14) {
        this.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
        console.log("daemong ain't working mate :(");
      } else if (data === null) {
        // this.props.setPopupLoading(false);
        callback();
      } else {
        console.log('error unlocking wallet: ', data);
      }
      // this.props.setPopupLoading(false);
    }).catch((err) => {
      console.log('err unlocking wallet: ', err);
      // this.props.setPopupLoading(false);
    });
  }

  export() {
    this.generatePDF();
  }

  generatePDF() {
    const doc = new jsPDF();
    doc.setFontSize(10);
    doc.text(this.toPrint[0], 10, 10);
    for (let i = 1; i < this.toPrint.length; i++) {
      doc.addPage();
      doc.text(this.toPrint[i], 10, 10);
    }
    doc.save('printMe.pdf');
    this.toPrint = [];
    this.toggle();
    // this.props.setBackupOperationCompleted(true);
  }

  getPrivateKeys(batch) {
    return new Promise((resolve, reject) => {
      this.props.wallet.command(batch).then((data) => {
        resolve(data);
      }).catch((err) => {
        console.log(err);
        reject(null);
      });
    });
  }

  getLocationToExportPanel() {
    if (this.state.panel !== 3) { return; }
    return (
      <div id="setLocationPanel">
        <p className="mb-3">{ this.props.lang.exportFormat }:</p>
        <p className="pdfExample">{`<${this.props.lang.publicAddress}>`}</p>
        <p className="pdfExample">{`<${this.props.lang.privateKey}>`}</p>
        <p className="pdfExample">{`<${this.props.lang.lineBreak}>`}</p>

        <div className="mt-4 d-flex justify-content-center">
          <Button color="primary" onClick={this.generatePDF}>
            { this.props.lang.savePDF }
            <ContentSaveOutlineIcon className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  renderExportOptions() {
    if (this.state.panel !== 1) { return; }
    return (
      <div id="exportOptions">
        <p>{ this.props.lang.exportPrivKeyDesc }</p>
        <div className="d-flex justify-content-center mt-4">
          <Button color="dark" onClick={this.handleDisplayKeys}>
            { this.props.lang.viewOnScreen }
          </Button>
          <Button color="dark" className="ml-2" onClick={this.handlePanels}>
            { this.props.lang.exportToPdf }
          </Button>
        </div>
      </div>
    );
  }

  handleMouseEnterAddress(id) {
    TweenMax.set(id, { autoAlpha: 1 });
  }

  handleMouseLeaveAddress(id) {
    TweenMax.set(id, { autoAlpha: 0 });
  }

  handleCopyAddressClicked(publicAddress, privateAddress, element) {
    const toCopy = publicAddress + os.EOL + privateAddress;
    clipboard.writeText(toCopy);
    TweenMax.to(element, 0.1, { scale: 1.1 });
    TweenMax.to(element, 0.1, { scale: 1, delay: 0.1 });
  }

  renderdisplayKeys() {
    if (this.state.panel !== 2 || this.state.toDisplay === null) {
      return;
    }
    let counter = 0;
    console.log(this.state.toDisplay);
    const keys = Object.keys(this.state.toDisplay).map((key) => {
      const pubKey = this.state.toDisplay[key].publicKey;
      const privKey = this.state.toDisplay[key].privateKey;
      this.addressesToCopy += pubKey + os.EOL;
      this.addressesToCopy += privKey + os.EOL;
      this.addressesToCopy += os.EOL;
      counter += 1;
      return (
        <div onMouseEnter={this.handleMouseEnterAddress.bind(this, `#copyPrivKey${counter}`)} onMouseLeave={this.handleMouseLeaveAddress.bind(this, `#copyPrivKey${counter}`)} className="keysItem" key={key}>
          <p onClick={this.handleCopyAddressClicked.bind(this, pubKey, privKey, `#copyPrivKey${counter}`)} id={`copyPrivKey${counter}`} className="copyPrivKey">copy</p>
          <p>{pubKey}</p>
          <p>{privKey}</p>
        </div>
      );
    }
    );
    return (
      <div id="displayKeys">
        <p className="mb-3">
          {`${this.props.lang.listing} ${keys.length}  ${keys.length === 1 ? this.props.lang.addressInFormat : this.props.lang.addressesInFormat}:`}
        </p>
        <p className="pdfExample">{`<${this.props.lang.publicAddress}>`}</p>
        <p className="pdfExample">{`<${this.props.lang.privateKey}>`}</p>
        <div className="keysHolder">
          {keys}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.state.open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>{ this.props.lang.exportPrivateKeys }</ModalHeader>
          <ModalBody>
            {this.getPasswordPanel()}
            {this.renderExportOptions()}
            {this.getLocationToExportPanel()}
            {this.renderdisplayKeys()}
          </ModalBody>
        </Modal>
      </div>
    );
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    passwordVal: state.application.password,
    locationToExport: state.application.locationToExport,
    wallet: state.application.wallet,
    staking: state.chains.isStaking,
    addresses: state.application.userAddresses
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(ExportPrivateKeysModal);
