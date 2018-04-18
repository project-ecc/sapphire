import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import ThemeSelector from '../Others/ThemeSelector';

class ThemeSelectorStep extends React.Component {
 constructor() {
    super();
  }

  render() {
    const style = {margin: "0 auto", width: "max-content", left: "0px"};
     return (
      <div>
         <p style={{fontWeight:"300"}} className="subTitle">
           { this.props.lang.selectTheme }
         </p>
         <ThemeSelector style={style}/>
      </div>
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
