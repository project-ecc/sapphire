import React, {Component} from 'react';
import {TweenMax} from "gsap";

class MiniLoaderAnimation extends Component {
 constructor() {
    super();
  }

  componentDidMount(){
    this.animateDots();
  }

  animateDots(){
    let tl = new TimelineMax({repeat:-1,repeatDelay:1});
    tl.staggerTo(".toAnimate", 0.5, {opacity:0, yoyo:true,repeat:-1}, 0.1);
  }

  render() {
     return (
        <div id="miniAnimation">
          <span className="toAnimate">.</span><span className="toAnimate">.</span><span className="toAnimate">.</span>
        </div>
      );
    }

}

export default MiniLoaderAnimation;
