import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';
import ImportPrivateKey from '../../InitialSetupPage/ImportPrivateKey';
import {connect} from "react-redux";
import * as actions from "../../../actions";

class ImportPrivateKeys extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('encrypt');
    hash.push('/setup/encrypt');
  }

  render() {
    return (
      <div>
        Import private keys bruh
        <ImportPrivateKey notInitialSetup={false} />
        <Button onClick={this.nextStep}>Next Step</Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(ImportPrivateKeys);
