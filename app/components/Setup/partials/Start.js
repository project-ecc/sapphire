import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';

class Start extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    hash.push('/setup/theme');
  }

  render() {
    return (
      <div>
        Welcome to Sapphire. Get started.
        <Button onClick={this.nextStep}>Select Theme</Button>
      </div>
    );
  }
}

export default Start;
