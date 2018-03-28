import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')

class MessagingSearch extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const searchImage = Tools.getIconForTheme("search", false);
    return (
      <div id="searchBarMessaging">
        <img id="searchIcon" src={searchImage}/>
        <input id="searchInput" value="Search for contacts or messages"></input>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions)(MessagingSearch);