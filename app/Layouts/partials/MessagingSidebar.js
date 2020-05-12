import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
const moment = require('moment');
import {CreateIcon, UserIcon} from 'mdi-react';

import * as actions from '../../actions/index';

const Tools = require('../../utils/tools');
import db from '../../utils/database/db'
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar/Avatar";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Typography from "@material-ui/core/Typography/Typography";
import Divider from "@material-ui/core/Divider/Divider";
import List from "@material-ui/core/List/List";
const Conversation = db.Conversation;
const Peer = db.Peer;
const ConversationUser = db.ConversationUser;

class MessagingSidebar extends Component {
  constructor(props) {
    super(props);

    this.isConversationSelected = this.isConversationSelected.bind(this)
    this.getConversation = this.getConversation.bind(this)

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

  getConversation(conversation, key, selected) {
    let displayName = null
    let displayImage = null
    if(this.props.activeAccount == null){
      return null
    }
    if(conversation.conversation_type === 'PRIVATE' && conversation.participants_count === 2) {
      const conversationPeers = conversation.conversationPeers
      for (const key in conversationPeers) {
        if(conversationPeers[key].id !== this.props.activeAccount.id){
          displayName = conversationPeers[key].display_name
          displayImage = conversationPeers[key].display_image
        }
      }
    }

    return (
      <div>
        <ListItem selected={selected}>
          <ListItemAvatar>
            <Avatar alt="Peer display image" src={displayImage != null ? displayImage : "https://statrader.com/wp-content/uploads/2018/06/ecc-logo.jpg"} />
          </ListItemAvatar>
          <ListItemText
            primary={displayName}
          />
        </ListItem>
        <Divider variant="inset" component="li" />
      </div>
    )
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

              <List>
                <ListItem>
                  <a className="subheading">{ this.props.lang.directMessages }</a>
                </ListItem>
                { conversations.length > 0 ?
                  conversations.map((object, key) => {
                    return (
                      <NavLink  key={key} to={{
                        pathname: "/friends/" + object.id}} exact activeClassName="active">
                        {this.getConversation(object, key, this.isConversationSelected())}
                      </NavLink>
                    );
                })
                : (
                    <ListItem>
                      <a className="subheading">{ this.props.lang.noFriendsAvailable }</a>
                    </ListItem>
                )}
                <ListItem>
                  <a className="subheading">{ this.props.lang.groupMessaging }</a>
                </ListItem>
              </List>
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
