import React, {Component} from 'react';

class EllipsisLoader extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    var tl = new TimelineMax({repeat:-1,repeatDelay:1});
    tl.staggerTo(".EllipsisLoader__toAnimate", 0.5, {opacity:0, yoyo:true,repeat:-1}, 0.1);
  }

  render() {
      return (
        <div className="EllipsisLoader">
          <span className="EllipsisLoader__toAnimate">.</span><span className="EllipsisLoader__toAnimate">.</span><span className="EllipsisLoader__toAnimate">.</span>
        </div>
      );
  }
}

export default EllipsisLoader;
