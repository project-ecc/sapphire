import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
const moment = require('moment');
import {CreateIcon, UserIcon} from 'mdi-react';

import * as actions from '../../actions/index';

const Tools = require('../../utils/tools');
import db from '../../utils/database/db'
const Conversation = db.Conversation;
const Peer = db.Peer;
const ConversationUser = db.ConversationUser;

class MessagingSidebar extends Component {
  constructor(props) {
    super(props);

    this.isConversationSelected = this.isConversationSelected.bind(this)
    this.getConversationName = this.getConversationName.bind(this)

    this.state = {
      conversations: []
    };
  }

  async componentDidMount() {
    let conversations  = await Conversation.findAll(
      {
        include:
          [
            {
              model: Peer,
              as: 'conversationPeers'
            }
          ]
      })
    if(conversations != null) {
      console.log(conversations)
      this.setState({
        conversations: conversations
      })
    }
    console.log(conversations)
  }

  isConversationSelected(match, location) {
    if (!match) {
      return false
    }

    const eventID = parseInt(match.params.id)
    this.state.conversations.map((object, key) => {
      if (object.id === eventID) {
        return true
      }
    })
  }

  getConversationName(conversation) {
    if(this.props.activeAccount == null){
      return null
    }
    if(conversation.conversation_type === 'PRIVATE' && conversation.participants_count === 2) {
      const conversationPeers = conversation.conversationPeers
      for (const key in conversationPeers) {
        if(conversationPeers[key].id !== this.props.activeAccount.id){
          return conversationPeers[key].display_name
        }
      }
    }
  }

  render() {
    const conversations = this.state.conversations;
    const usericon = require('../../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="d-flex flex-column justify-content-between" style={{ minHeight: '100%' }}>
          <div>
            <div className="userimage">
              <img id="sidebarLogo" src={usericon} />
            </div>
            <div className="menu">
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.directMessages }</a>
                </li>
                { conversations.length > 0 ?
                  conversations.map((object, key) => {
                    return (
                      <li key={key}>
                        <NavLink   to={{
                          pathname: "/friends/" + object.id}} isActive={this.isConversationSelected} exact activeClassName="active">
                          {this.getConversationName(object)}
                        </NavLink>
                      </li>
                    );
                })
                : (
                    <li>
                      <a className="subheading">{ this.props.lang.noFriendsAvailable }</a>
                    </li>
                )}
                <li>
                  <a className="subheading">{ this.props.lang.groupMessaging }</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="menu mt-0">
            <ul>
              <li>
                <NavLink to="/friends/newMessage" className="bg-dark">
                  <CreateIcon size={35} />
                  New Messsage
                </NavLink>
              </li>
              <li>
              <NavLink to="/myAccount" className="bg-dark">
                <UserIcon size={35} />
                Me
              </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    activeAccount: state.messaging.activeAccount
  };
};

export default connect(mapStateToProps, actions, null, { pure: false })(MessagingSidebar);
