import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';
import EncryptWallet from '../../InitialSetupPage/EncryptWallet';
import {connect} from "react-redux";
import * as actions from "../../../actions";

class Encrypt extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('complete');
    hash.push('/setup/complete');
  }

  render() {
    return (
      <div>
        Encrypt the wallet bruh
        <EncryptWallet />
        <Button onClick={this.nextStep}>Complete Setup</Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(Encrypt);
