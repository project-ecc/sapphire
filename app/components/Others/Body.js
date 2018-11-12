import React, { Component } from 'react';

class Body extends Component {
  render() {
    return (
      <div className="body">
        <div className="container-fluid">
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default Body;
