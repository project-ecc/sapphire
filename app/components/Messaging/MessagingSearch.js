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
    this.handleFocusIn = this.handleFocusIn.bind(this);
  }

  componentDidMount(){
    $('#searchInput').on("focusin", this.handleFocusIn);
  }

  handleFocusIn(){
    if(this.props.clickedSearchInputButton) return;
      this.props.setUserClickedButton("searchInput");
      Tools.sendMessage(this, "This Search option will allow you to search for messages and contacts.", 1, "Sapphire");
  }

  componentWillUnmount() {
    $('#searchInput').off('focusin');
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
    lang: state.startup.lang,
    clickedSearchInputButton: state.messaging.clickedSearchInputButton
  };
};

export default connect(mapStateToProps, actions)(MessagingSearch);