import React, {Component} from 'react';
import {connect} from 'react-redux';
import {TimelineMax, TweenMax} from 'gsap';
import {Button, Input, Modal, ModalBody, ModalHeader} from 'reactstrap';
import {ArrowRightIcon, ContentSaveOutlineIcon} from 'mdi-react';

import * as actions from '../../../actions/index';

import Toast from '../../../globals/Toast/Toast';

const Tools = require('../../../utils/tools');
const os = require('os');
const { clipboard } = require('electron');

const fs = require('fs');
import jsPDF from 'jspdf'

class ExportPrivateKeysModal extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.generatePDF = this.generatePDF.bind(this);

    this.toPrint = [];
    this.state = {
      open: false,
    };
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  async generatePDF() {
    try {
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
      console.log(privKeys)
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
      console.log(this.toPrint)
      const doc = new jsPDF();
      doc.setFontSize(10);
      doc.text(this.toPrint[0], 10, 10);
      for (let i = 1; i < this.toPrint.length; i++) {
        doc.addPage();
        doc.text(this.toPrint[i], 10, 10);
      }
      doc.save('printMe.pdf');

      Toast({
        title: this.props.lang.success,
        message: 'Private Keys Exported!',
        color: 'green'
      });

      this.toPrint = [];
    } catch (e) {
      Toast({
        title: this.props.lang.error,
        message: 'Cannot Export Private Keys',
        color: 'red'
      });
    }

    this.toggle();
  }

  async getPrivateKeys(batch) {
    return new Promise(async (resolve, reject) => {
      await this.props.wallet.command(batch).then((data) => {
        console.log(data)
        resolve(data);
      }).catch((err) => {
        console.log(err);
        reject(null);
      });
    });
  }

  getLocationToExportPanel() {
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

  render() {
    return (
      <div>
        <Modal isOpen={this.state.open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>{ this.props.lang.exportPrivateKeys }</ModalHeader>
          <ModalBody>
            {this.getLocationToExportPanel()}
          </ModalBody>
        </Modal>
      </div>
    );
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    isStaking: state.chains.isStaking,
    addresses: state.application.userAddresses
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(ExportPrivateKeysModal);
