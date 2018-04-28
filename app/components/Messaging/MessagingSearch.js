import React, { Component } from 'react';
import { connect } from 'react-redux';

import { traduction } from '../../lang/lang';
import * as actions from '../../actions';

import $ from 'jquery';

const Tools = require('../../utils/tools');
const homedir = require('os').homedir();

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
      Tools.sendMessage(this, this.props.lang.sapphireMessage19, 1, "Sapphire");
  }

  componentWillUnmount() {
    $('#searchInput').off('focusin');
  }

  render() {
    const searchImage = Tools.getIconForTheme("search", false);
    return (
      <div id="searchBarMessaging">
        <img id="searchIcon" src={searchImage}/>
        <input id="searchInput" value={this.props.lang.searchForMsgOrContacts}></input>
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
