import React, { Component } from 'react';
import {TweenMax} from "gsap";

class TransitionComponent extends React.Component {
 constructor() {
    super();
  }
  
 componentWillAppear (callback) {
  console.log("componentWillAppear", this.props.animationType)
  console.log("componentWillAppear TRANSITION")
    if(this.props.animationType == "loader"){
      this.props.animateIn(this.refs.animate, this.props.updatingApplication, this.props.animateLogo, callback);
    }
    else if(this.props.animationType == "setupStep"){
      this.props.animateIn(this.refs.animate, callback);
    }
    else if(this.props.animationType == "initialSetup"){
      this.props.animateIn(this.refs.animate, callback);
    }
    else callback();
  }
  
  componentWillEnter(callback){
    console.log("componentWillEnter", this.props.animationType)
    console.log("componentWillEnter TRANSITION")
    if(this.props.animationType == "popup"){
      this.props.animateIn(this.refs.animate, callback, "22%");
    }
    else if(this.props.animationType == "genericPanel"){
      this.props.animateIn(this.refs.animate, this.resetWillChange.bind(this), callback, 0.5);
    }
    else if(this.props.animationType == "settings"){
      this.props.animateIn(this.refs.animate, this.resetWillChange.bind(this),  callback, 2.5);
    }
    else if(this.props.animationType == "loader"){
      this.props.animateIn(this.refs.animate, this.props.updatingApplication, this.props.animateLogo, callback);
    }
    else if(this.props.animationType == "setupStep"){
      this.props.animateIn(this.refs.animate, callback);
    }
    else callback();
  }

  resetWillChange(callback){
    const el = this.refs.animate;
    TweenMax.set(el, {willChange: 'auto'});
    callback();
  }

  componentWillUnmount(){
    console.log("componentWillUnmount TRANSITION")
  }

  componentWillLeave (callback) {
    console.log("componentWillLeave TRANSITION")
    if(this.props.animationType == "popup")
      this.props.animateOut(this.refs.animate, callback)
    else if(this.props.animationType == "genericPanel"){
      this.props.animateOut(this.refs.animate, this.resetWillChange.bind(this), callback, 1);
    }    
    else if(this.props.animationType == "settings"){
      this.props.animateOut(this.refs.animate, this.resetWillChange.bind(this), callback, 2.5);
    }
    else if(this.props.animationType == "loader" || this.props.animationType == "initialSetup"){
      callback()
    }
    else if(this.props.animationType == "firstSetupStep" || this.props.animationType == "setupStep"){
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
};



export default TransitionComponent;