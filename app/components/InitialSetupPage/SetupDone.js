import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';

class SetupDone extends React.Component {
 constructor() {
    super();
  }
  
  componentWillEnter (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.3, {x: 600, opacity: 0}, {x: 0, opacity:1,ease: Linear.easeNone, onComplete: callback});
  }

  renderNewUser(){
    return(
      <div>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300"}}>Setup done!</p>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300"}}>Your wallet is now going to sync to the blockchain. <br></br>This process takes some time, please be patient.</p>
        <p style={{marginTop: "50px", fontSize: "21px", fontWeight:"300"}}>Thank you for chosing <span className="ecc">ECC</span>!</p>
      </div>
    )
  }

  renderExistingUser(){
    return(
      <div>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300", marginTop:"55px"}}>Setup done!</p>
        <p style={{marginTop: "50px", fontSize: "21px", fontWeight:"300"}}>Thank you for chosing <span className="ecc">ECC</span>!</p>
      </div>
    )
  }

  render() { 
    const toReturn = this.props.paymentChainSync < 95 ? this.renderNewUser() : this.renderExistingUser();
     return (
      <div ref="second" style={{height: "330px"}}>
        {toReturn}
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    paymentChainSync: state.chains.paymentChainSync
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(SetupDone));