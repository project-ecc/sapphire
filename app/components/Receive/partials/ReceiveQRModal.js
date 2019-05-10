import React, {Component} from 'react';
import {connect} from 'react-redux';
import {TweenMax} from 'gsap';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';

import * as actions from '../../../actions/index';

const QRCode = require('qrcode.react');

const event = require('../../../utils/eventhandler');

class NewRequestModal extends Component {
  constructor(props) {
    super(props);

    this.setGeneratingCode = this.setGeneratingCode.bind(this);
    this.toggle = this.toggle.bind(this);
    this.selectType = this.selectType.bind(this);

    this.state = {
      message: '',
      amount: 0,
      label: '',
      address: this.props.address,
      generateCode: false,
      open: false
    };
  }

  toggle() {
    this.setState({
      open: !this.state.open,
      message: '',
      amount: 0,
      label: '',
      address: null,
      generateCode: false
    });
  }

  selectType(type) {
    this.setState({
      type
    });
  }

  onFieldChange(key, e) {
    this.setState({
      generateCode: false
    });
    const value = e.target.value;
    const payload = {};
    payload[key] = value;
    this.setState(payload);
  }

  setGeneratingCode(){
    console.log(this.state)
    this.setState({
      generateCode: true
    });
  }

  buildUriString(){
    let uri = "ecc:";
    uri += this.props.address + "?amount=" + this.state.amount

    if(this.state.message){
      uri += "&message=" + this.state.message
    }
    if(this.state.label){
      uri += "&label=" + this.state.label
    }
    console.log(uri)
    return uri;
  }

  generateQrCode(){
    if(this.props.address !== null){
      return (
        <div>
          <p style={{userSelect:'all'}}>{this.props.address}</p>
          <Input
            placeholder="Amount"
            value={this.state.amount}
            onChange={e => this.onFieldChange('amount', e)}
            type="text"
            className="mt-4"
          />
          <Input
            placeholder="Label"
            value={this.state.label}
            onChange={e => this.onFieldChange('label', e)}
            type="text"
            className="mt-4"
          />
          <Input
            placeholder="Message"
            value={this.state.message}
            onChange={e => this.onFieldChange('message', e)}
            type="text"
            className="mt-4"
          />

        </div>
      );
    }
    return null;
  }

  renderQrCode(){
    if(this.state.generateCode){
      return (
        <div style={{textAlign:'center', padding:'15px'}}>
          <QRCode renderAs="svg" includeMargin="true" value={this.buildUriString()} />
        </div>
      );
    }
    return null;
  }

  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>
           Generate QR Code
        </ModalHeader>
        <ModalBody>
          <div>
            {this.generateQrCode()}
            {this.renderQrCode()}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="success"  onClick={() => { this.setGeneratingCode() }}>
            Generate QR Code
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    blockPayment: state.chains.blockPayment
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(NewRequestModal);
