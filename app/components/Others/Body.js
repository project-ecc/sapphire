import React, { Component } from 'react';

class Body extends Component {
  render() {
    return (
      <div className="body">
        <div class="container-fluid">
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default Body;
