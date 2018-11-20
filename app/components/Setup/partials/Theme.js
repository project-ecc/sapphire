import React, { Component } from 'react';
import ThemeSelectorStep from '../../InitialSetupPage/ThemeSelectorStep';
import { Button } from 'reactstrap';
import hash from '../../../router/hash';

class Theme extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    hash.push('/setup/import');
  }

  render() {
    return (
      <div>
        Select ur theme mate
        <ThemeSelectorStep />
        <Button onClick={this.nextStep}>Import Wallet</Button>
      </div>
    );
  }
}

export default Theme;
