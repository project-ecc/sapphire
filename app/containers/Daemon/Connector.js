import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

class Connector extends Component {
  constructor(props) {
    super(props);
    this.cycle = this.cycle.bind(this);

    this.interval = 5000;
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

export default Connector;
