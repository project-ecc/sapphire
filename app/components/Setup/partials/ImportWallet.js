import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';
import ImportWalletPartial from '../../InitialSetupPage/ImportWallet';
import {connect} from "react-redux";
import * as actions from "../../../actions";

class ImportWallet extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('importprivatekeys');
    hash.push('/setup/keys');
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

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(ImportWallet);
