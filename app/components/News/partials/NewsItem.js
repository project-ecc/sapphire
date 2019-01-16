import React, { Component } from 'react';
import { ChevronRightIcon } from 'mdi-react';
import { Button, Card, CardTitle, CardText } from 'reactstrap';
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
      <div className="newsPost standout" onClick={this.handleOnClick.bind(this, this.props.url)}>
        <CardTitle className="newsItemTitle">{this.props.title}</CardTitle>
        <CardText className="newsItemBody">{this.props.body}</CardText>
        <div className="d-flex justify-content-between">
          <p className="newsItemTime">{this.props.time}</p>
          <Button size="sm" color="link">
            <ChevronRightIcon size={20} />
          </Button>
        </div>
      </div>
    );
  }
}

export default NewsItem;
