import React, {Component} from 'react';
import {Button} from 'reactstrap';
import {connect} from "react-redux";
import {HomeIcon} from 'mdi-react';
import hash from './../../../router/hash';
import * as actions from "../../../actions";

class Complete extends Component {
  constructor(props) {
    super(props);

    this.completeSetup = this.completeSetup.bind(this);
  }

  completeSetup() {
    this.props.setInitialSetup(false);
    hash.push('/coin');
  }

  render() {
    return (
      <div>
        <p id="welcome">
          { this.props.lang.setupDone }
        </p>
        <p className="mt-3">{ this.props.lang.setupDone1 } <br></br>{ this.props.lang.setupDone2 }</p>
        <p className="mt-4">{ this.props.lang.setupDone3 } <span className="ecc">ECC</span>!</p>
        <Button onClick={this.completeSetup} className="mt-5" color="primary">
          Go to Dashboard
          <HomeIcon className="ml-2" />
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


export default connect(mapStateToProps, actions)(Complete);
