import React, {Component} from 'react';
import {ArrowRightIcon} from 'mdi-react';
import {Button} from 'reactstrap';
import {connect} from 'react-redux';

import ThemeSelector from '../../Others/ThemeSelector';
import * as actions from '../../../actions';

class Theme extends Component {
  constructor(props) {
    super(props);
    
    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('importwallet');
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
        <ThemeSelector />
        <Button onClick={this.nextStep} color="primary" className="mt-5">
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
