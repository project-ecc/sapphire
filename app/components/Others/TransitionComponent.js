import React, { Component } from 'react';
import {TweenMax} from "gsap";

class TransitionComponent extends React.Component {
 constructor() {
    super();
  }

 componentWillAppear (callback) {
    if(this.props.animationType === "loader"){
      this.props.animateIn(this.refs.animate, this.props.updatingApplication, this.props.animateLogo, callback);
    }
    else if(this.props.animationType === "setupStep"){
      this.props.animateIn(this.refs.animate, callback);
    }
    else if(this.props.animationType === "initialSetup"){
      this.props.animateIn(this.refs.animate, callback);
    }
    else if(this.props.animationType === "settings"){
      this.props.animateIn(this.refs.animate, this.props.resetWillChange.bind(this),  callback, 1.5);
      this.props.setGenericAnimationToTrue();
    }
    else if(this.props.animationType === "genericPanel"){
      this.props.animateIn(this.refs.animate, this.props.resetWillChange.bind(this), callback, 0.5);
      this.props.setGenericAnimationToTrue();
    }
    else if(this.props.animationType === "test"){
      console.log("here")
      this.props.animateIn(this.refs.animate, callback);
    }
    else callback();
  }

  componentWillEnter(callback){
    if(this.props.animationType === "popup"){
      this.props.animateIn(this.refs.animate, callback, "22%");
    }
    else if(this.props.animationType === "loader"){
      this.props.animateIn(this.refs.animate, this.props.updatingApplication, this.props.animateLogo, callback);
    }
    else if(this.props.animationType === "setupStep"){
      this.props.animateIn(this.refs.animate, callback);
    }
    else if(this.props.animationType === "test"){
      console.log("here2")
      this.props.animateIn(this.refs.animate, callback);
    }
    else callback();
  }

  componentWillLeave (callback) {
    if(this.props.animationType === "popup")
      this.props.animateOut(this.refs.animate, callback);
    else if(this.props.animationType === "genericPanel"){
      this.props.animateOut(this.refs.animate, this.props.resetWillChange.bind(this), callback, 1);
    }
    else if(this.props.animationType === "settings"){
      this.props.animateOut(this.refs.animate, this.props.resetWillChange.bind(this), callback, 1.5);
    }
    else if(this.props.animationType === "loader" || this.props.animationType === "initialSetup"){
      callback()
    }
    else if(this.props.animationType === "firstSetupStep" || this.props.animationType === "setupStep"){
      this.props.animateOut(this.refs.animate, callback)
    }
    else callback();
  }

  render() {
     return (
      <div ref="animate" className={this.props.class ? this.props.class : ""}  id={this.props.id}>
        {this.props.children}
      </div>
      );
    }

}

export default TransitionComponent;
