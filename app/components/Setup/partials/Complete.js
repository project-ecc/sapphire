import React, { Component } from 'react';
import hash from './../../../router/hash';
import { Button } from 'reactstrap';
import {connect} from "react-redux";
import * as actions from "../../../actions";

class Complete extends Component {
  constructor(props) {
    super(props);

    this.completeSetup = this.completeSetup.bind(this);
  }

  completeSetup() {
    hash.push('/coin');
  }

  renderNewUser(){
    return(
      <div>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300"}}>{ this.props.lang.setupDone }</p>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300"}}>{ this.props.lang.setupDone1 } <br></br>{ this.props.lang.setupDone2 }</p>
        <p style={{marginTop: "50px", fontSize: "21px", fontWeight:"300"}}>{ this.props.lang.setupDone3 } <span className="ecc">ECC</span>!</p>
      </div>
    )
  }

  renderExistingUser(){
    return(
      <div>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300", marginTop:"55px"}}>{ this.props.lang.setupDone }</p>
        <p style={{marginTop: "50px", fontSize: "21px", fontWeight:"300"}}>{ this.props.lang.setupDone3 } <span className="ecc">ECC</span>!</p>
      </div>
    )
  }

  render() {
    const toReturn = this.props.paymentChainSync < 95 ? this.renderNewUser() : this.renderExistingUser();

    return (
      <div>
        {toReturn}
        <Button onClick={this.completeSetup}>Go to Dashboard</Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    paymentChainSync: state.chains.paymentChainSync,
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(Complete);
