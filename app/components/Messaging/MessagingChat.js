import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import MessagingInput from './MessagingInput';

class MessagingChat extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props.messages)
    let ownLastMessage = undefined;
    return (
      <div id="messagingChat">
        <div id="messagingChatContainer">
          {this.props.messages[2].map((text, index) => {
            let messageClass = text.mine ? "ownMessage chatMessage" : "notOwnMessage chatMessage";
            let divClass = text.mine ? "chatMessageParent chatMessageParentOwn" : "chatMessageParent";
            if(ownLastMessage == undefined){
                ownLastMessage = text.mine;
            }
            else if( (ownLastMessage && !text.mine) || (!ownLastMessage && text.mine)){
              messageClass += " fixSpacingBubble";
              ownLastMessage = text.mine;
            }

            return(
              <div className={divClass} key={index}>
                <p className={messageClass}>{text.body}<span>{text.date}</span></p>
              </div>
            )
          })}
        </div>
        <MessagingInput/>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    messages: state.messaging.messages
  };
};

export default connect(mapStateToProps, actions)(MessagingChat);