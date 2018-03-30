import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import MessagingSearch from './MessagingSearch';
import MessagingTopBar from './MessagingTopBar';

class MessagingContacts extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    
    return (
      <div id="contacts">
        <MessagingTopBar />
        <MessagingSearch />
          <div id="contactsList">
          {this.props.chatsPreview.map((t, index) => {
            return(
            <div className={t.active ? "chatPreview chatPreviewActive" : "chatPreview"} key={t.id}>
              <div className={t.seen ? "borderChatPreview" : "borderChatPreview borderChatPreviewNotRead"}></div>
              <p className="chatAddress">{t.address}<span className="chatDate">{t.date}</span></p>
              <p className="chatPreviewMessage">{t.lastMessage}</p>
            </div>
            )
            })
          }
          </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    chatsPreview: state.messaging.chatsPreview
  };
};

export default connect(mapStateToProps, actions)(MessagingContacts);