import React, { Component } from 'react';
var open = require("open");
const Tools = require('../../utils/tools');
import * as actions from '../../actions';
import { connect } from 'react-redux';

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
        <p className="fileStorage__title">{this.props.lang.fileStorageService}</p>
        <p className="fileStorage__coming-soon">{this.props.lang.fileStorageComingSoon}</p>
        <p className="fileStorage__read-about-it">{this.props.lang.fileStorageReadAbout} <span onClick={this.handleOnClick.bind(this, "https://ecc.network/services/file_storage")}>{this.props.lang.fileStorageWebsite}</span></p>
        <p className="fileStorage__preview">{this.props.lang.fileStoragePreview}</p>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(FileStorage);
