import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';
import ImportPrivateKey from '../../InitialSetupPage/ImportPrivateKey';

class ImportPrivateKeys extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    hash.push('/setup/complete');
  }

  render() {
    return (
      <div>
        Import private keys bruh
        <ImportPrivateKey notInitialSetup={false} />
        <Button onClick={this.nextStep}>Select Theme</Button>
      </div>
    );
  }
}

export default ImportPrivateKeys;
