import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import ThemeSelector from '../Others/ThemeSelector';

class ThemeSelectorStep extends Component {
 constructor() {
    super();
  }

  render() {
    const style = {margin: "40px auto 0px auto", width: "max-content", left: "0px"};
     return (
       <ThemeSelector style={style}/>
      );
    }

}

const mapStateToProps = state => {
  return{
    direction: state.setup.direction,
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(ThemeSelectorStep);
