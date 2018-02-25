import React, { Component } from 'react';
var open = require("open");

class NewsItem extends Component {
  constructor(props) {
    super(props);
  }

  handleOnClick(url){
    open(url);
  }

  render() {
    let mediumIcon = require('../../../resources/images/medium.png');
    let playIcon = require('../../../resources/images/play-button.png');
    return (
      <div className="newsPost">
        <p className="newsItemTitle">{this.props.title}</p>
        <p className="newsItemBody">{this.props.body}</p>
        <p className="newsItemTime">{this.props.time}</p>
        <img onClick={this.handleOnClick.bind(this, this.props.url)} className="mediumIcon" src={mediumIcon}/>
        {/*this.props.hasVideo ? <img className="playIcon" src={playIcon}/> : null*/}
      </div>
    );
  }
}

export default NewsItem;
