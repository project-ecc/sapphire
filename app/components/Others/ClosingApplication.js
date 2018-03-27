import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import $ from 'jquery';
import MiniLoaderAnimation from './MiniLoaderAnimation';

class ClosingApplication extends React.Component {
 constructor() {
    super();
  }

  render() { 
     return (
        <div>
          <p>{ this.props.lang.closingSapphireWait }</p>
          <MiniLoaderAnimation />
        </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(ClosingApplication);