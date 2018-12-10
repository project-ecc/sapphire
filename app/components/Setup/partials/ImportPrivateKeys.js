import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { ArrowRightIcon } from 'mdi-react';
import ImportPrivateKey from '../../InitialSetupPage/ImportPrivateKey';
import * as actions from '../../../actions';

class ImportPrivateKeys extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('encrypt');
  }

  render() {
    return (
      <div>
        <p id="welcome">
          { this.props.lang.importPrivateKey }
        </p>
        <p>
          { this.props.lang.writeDownAPrivateKeyToImport }
        </p>
        <ImportPrivateKey>
          <Button onClick={this.nextStep} color="link">
            Later
          </Button>
        </ImportPrivateKey>
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
