import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';
import EncryptWallet from '../../InitialSetupPage/EncryptWallet';

class Encrypt extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    hash.push('/setup/keys');
  }

  render() {
    return (
      <div>
        Encrypt the wallet bruh
        <EncryptWallet />
        <Button onClick={this.nextStep}>Select Theme</Button>
      </div>
    );
  }
}

export default Encrypt;
