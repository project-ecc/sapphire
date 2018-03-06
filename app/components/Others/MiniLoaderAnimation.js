import React, { Component } from 'react';
import {TweenMax} from "gsap";

class MiniLoaderAnimation extends React.Component {
 constructor() {
    super();
  }

  componentDidMount(){
    this.animateDots();
  }

  animateDots(){
    var tl = new TimelineMax({repeat:-1,repeatDelay:1});
    tl.staggerTo(".toAnimate", 0.5, {opacity:0, yoyo:true,repeat:-1}, 0.1);
  }

  render() { 
     return (
        <div id="miniAnimation">
          <span className="toAnimate">.</span><span className="toAnimate">.</span><span className="toAnimate">.</span>
        </div>
      );
    } 
};



export default MiniLoaderAnimation;