import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';
import {connect} from "react-redux";
import * as actions from "../../../actions";

class Start extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('theme');
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

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(Start);
