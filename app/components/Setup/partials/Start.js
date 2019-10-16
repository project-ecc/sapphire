import React, {Component} from 'react';
import {connect} from "react-redux";
import {ArrowRightIcon} from 'mdi-react';
import {Button} from 'reactstrap';
import * as actions from "../../../actions";

class Start extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('theme');
  }

  render() {

    return (
      <div>
        <p id="welcome">
          { this.props.lang.welcome }
        </p>
        <p>
          { this.props.lang.welcomeExplanation1 }
        </p>
        <Button onClick={this.nextStep} className="mt-5" color="primary">
          Select Theme
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


export default connect(mapStateToProps, actions)(Start);
