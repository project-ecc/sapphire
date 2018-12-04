import React, { Component } from 'react';
import ThemeSelectorStep from '../../InitialSetupPage/ThemeSelectorStep';
import { ArrowRightIcon } from 'mdi-react';
import { Button } from 'reactstrap';
import hash from '../../../router/hash';
import {connect} from "react-redux";
import * as actions from "../../../actions";

class Theme extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('importwallet');
    hash.push('/setup/import');
  }

  render() {
    return (
      <div>
        <p id="welcome">
          { this.props.lang.selectTheme }
        </p>
        <p>
          { this.props.lang.changeLater }
        </p>
        <ThemeSelectorStep />
        <Button onClick={this.nextStep} color="primary" className="mt-3">
          Import Wallet
          <ArrowRightIcon className="ml-2" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(Theme);
