import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';
import ImportWalletPartial from '../../InitialSetupPage/ImportWallet';

class ImportWallet extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    hash.push('/setup/encrypt');
  }

  render() {
    return (
      <div>
        Import the wallet mate
        <ImportWalletPartial />
        <Button onClick={this.nextStep}>Continue</Button>
      </div>
    );
  }
}

export default ImportWallet;
