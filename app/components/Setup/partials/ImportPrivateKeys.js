import React, {Component} from 'react';
import {Button} from 'reactstrap';
import {connect} from 'react-redux';
import ImportPrivateKeysPartial from '../../Settings/partials/ImportPrivateKeysPartial';
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
        <ImportPrivateKeysPartial>
          <Button onClick={this.nextStep} color="link">
            Later
          </Button>
        </ImportPrivateKeysPartial>
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
