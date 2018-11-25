import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import Wallet from '../../utils/wallet';
import * as actions from '../../actions';

class Connector extends Component {
  constructor(props) {
    super(props);
    this.cycle = this.cycle.bind(this);

    this.interval = 5000;
    this.wallet = null

    this.listenToEvents();
  }

  /**
   * Subscribe the daemon to manager events
   */
  listenToEvents() {
    ipcRenderer.on('daemonCredentials', this.createWallet.bind(this));
  }

  /**
   * Create the wallet instance
   * @param event
   * @param arg
   */
  createWallet(event, arg) {
    this.props.setWalletCredentials(arg)
  }

  /**
   * Main Daemon cycle
   */
  cycle() {

  }

  render() {
    return null;
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Connector);
