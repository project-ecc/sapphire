import React, {Component} from 'react';
import {connect} from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../../actions';
import MiniLoaderAnimation from './MiniLoaderAnimation';

class ClosingApplication extends Component {
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

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(ClosingApplication);
