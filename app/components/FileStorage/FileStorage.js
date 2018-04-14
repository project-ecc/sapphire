import React, { Component } from 'react';
var open = require("open");
const Tools = require('../../utils/tools')

class FileStorage extends Component {
  constructor(props) {
    super(props);
  }

  handleOnClick(url){
    open(url);
  }

  render() {
    let fileStorageIcon = Tools.getIconForTheme("fileStorageBig", false);
    return (
      <div className="fileStorage">
        <img className="fileStorage__image
        " src={fileStorageIcon} />
        <p className="fileStorage__title">File Storage Service</p>
        <p className="fileStorage__coming-soon">Coming soon</p>
        <p className="fileStorage__read-about-it">Read about it in our <span onClick={this.handleOnClick.bind(this, "https://ecc.network/services/file_storage")}>website</span></p>
        <p className="fileStorage__preview">*A preview of this service will be made available soon*</p> 
      </div>
    );
  }
}

export default FileStorage;
