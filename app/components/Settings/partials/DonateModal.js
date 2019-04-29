import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalHeader} from 'reactstrap';
import {GiftIcon} from 'mdi-react';

import hash from './../../../router/hash';
import * as actions from '../../../actions/index';

const Tools = require('../../../utils/tools');

class DonateModal extends Component {
  constructor() {
    super();

    this.state = {
      open: false
    };

    this.renderGoals = this.renderGoals.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  handleECCDonation(eccObject) {
    this.toggle();
    // this.props.setAddressSend(eccObject.address);
    hash.push('/coin/send');
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
          {t.ticker == 'ecc' && (
            <Button color="warning mt-1" size="sm" onClick={this.handleECCDonation.bind(this, t)}>
              { this.props.lang.donateNow }
              <GiftIcon className="ml-2" />
            </Button>
          )}
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
