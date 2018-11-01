import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import hash from './../../../router/hash';
import * as actions from '../../../actions/index';
const Tools = require('../../../utils/tools');

class DonateModal extends Component {
  constructor() {
    super();

    this.state = {
      open: false
    }

    this.renderGoals = this.renderGoals.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidUpdate(p1, p2) {
    console.log(p1);
    console.log(p2);
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  handleECCDonation(eccObject) {
    this.toggle()
    this.props.setAddressSend(eccObject.address);
    this.props.setAddressOrUsernameSend(eccObject.address);
    hash.push('/send');
  }

  renderGoals() {
    const cryptos = new Map(Object.entries(this.props.goal.cryptos));
    const goalArray = [];

    cryptos.forEach((value, key, map) => {
      goalArray.push({ ticker: key, address: value.address, balance: value.balance });
    });
    return goalArray.map((t, index) => {
      if (t.ticker == 'eth') return;
      return (
        <div key={index} style={{ border: '1px solid rgb(64, 52, 33)', padding: '7px 10px', marginBottom: '10px', textAlign: 'center', borderRadius: '5px' }}>
          <p className="popupTitle" style={{ fontWeight: 700, color: 'white', paddingTop: '0px', textTransform: 'uppercase' }}>{t.ticker}</p>
          <p className="selectableText" style={{ fontSize: '0.75em' }}>{t.address}</p>
          <p className="">{Tools.formatNumber(t.balance)}</p>
          {t.ticker == 'ecc' ? <div className="buttonPrimary caps" onClick={this.handleECCDonation.bind(this, t)}>
            <span className="fa fa-gift" /> Donate Now!</div> : null}
        </div>
      );
    });
  }
  render() {
    return (
      <div>
        {this.props.goal !== null &&
          <Modal isOpen={this.state.open} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>{ this.props.goal.name }</ModalHeader>
            <ModalBody>
              <p className="" style={{ marginBottom: '20px' }}>{this.props.goal.description}</p>
              {this.renderGoals()}
            </ModalBody>
          </Modal>
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(DonateModal);
