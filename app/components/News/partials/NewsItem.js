import React, { Component } from 'react';
import { ChevronRightIcon } from 'mdi-react';
import { Button } from 'reactstrap';
var open = require("open");

class NewsItem extends Component {
  constructor(props) {
    super(props);
  }

  handleOnClick(url){
    open(url);
  }

  render() {
    return (
      <div className="newsPost" onClick={this.handleOnClick.bind(this, this.props.url)}>
        <p className="newsItemTitle">{this.props.title}</p>
        <p className="newsItemBody">{this.props.body}</p>
        <div className="d-flex justify-content-between">
          <p className="newsItemTime">{this.props.time}</p>
          <Button size="sm" color="link" style={{color: '#fff'}}>
            <ChevronRightIcon size={20} />
          </Button>
        </div>
      </div>
    );
  }
}

export default NewsItem;
