import $ from 'jquery';
import React, { Component } from 'react';
import jstz from 'jstz';
import renderHTML from 'react-render-html';
import { connect } from 'react-redux';

import { traduction } from '../../lang/lang';
import * as actions from '../../actions';
import MessagingInput from './MessagingInput';
import MessagingOptions from './MessagingOptions';

var moment = require('moment');
const homedir = require('os').homedir();
const Tools = require('../../utils/tools')

class MessagingChat extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(){
    $('#messagingChatContainer').scrollTop($('#messagingChatContainer')[0].scrollHeight - $('#messagingChatContainer')[0].clientHeight);
  }

  handleOptionsClicked(){
    if($('#messagingOptions').css("visibility") == "hidden"){
      Tools.animateMessagingFunctionIconsIn();
    }
    else{
      Tools.animateMessagingFunctionIconsOut();
    }
    $("#messagingInputTextArea").focus();
  }

  handleOptionsSmallClicked(){
    if($('#messagingOptionsSmall').css("visibility") == "hidden"){
      Tools.animateMessagingSmallFunctionIconsIn();
    }
    else{
      Tools.animateMessagingSmallFunctionIconsOut();
    }
    $("#messagingInputTextArea").focus();
  }

  handleOptionsMouseEnter(){
    if(!this.props.userHoveredOptionsIcon){
      this.props.setUserHoveredOptionsButton(true);
      this.props.addNewMessage({id: 1, message: {body: this.props.lang.sapphireMessage1, mine: false, date: new Date()}, activeContactName: "Sapphire"});
    }
  }

  renderChat(){
    if(this.props.messages.length == 0) return null;

  }

  render() {
    let ownLastMessage = undefined;
    return (
      <div id="messagingChat">
        <MessagingOptions id="messagingOptions"/>
        <div onClick={this.handleOptionsClicked.bind(this)} onMouseEnter={this.handleOptionsMouseEnter.bind(this)} className={this.props.userHasCheckedGriffithChat ? "" : "hideElement"} id="optionsButton">
          <div className="circleOptionsButton"></div>
          <div className="circleOptionsButton"></div>
          <div className="circleOptionsButton"></div>
        </div>
        <div onClick={this.handleOptionsSmallClicked.bind(this)} id="optionsButtonSmallView">
          <div className="circleOptionsButton"></div>
          <div className="circleOptionsButton"></div>
          <div className="circleOptionsButton"></div>
        </div>
        <div id="messagingChatContainer">
          {Object.keys(this.props.messages).length > 0 && this.props.messages[this.props.selectedId].map((text, index) => {
            let messageClass = text.mine ? "ownMessage chatMessage" : "notOwnMessage chatMessage";
            let divClass = text.mine ? "chatMessageParent chatMessageParentOwn" : "chatMessageParent";
            if(index == 0) divClass += " firstChatMessage";
            if(ownLastMessage == undefined){
                ownLastMessage = text.mine;
            }
            else if( (ownLastMessage && !text.mine) || (!ownLastMessage && text.mine)){
              messageClass += " fixSpacingBubble";
              ownLastMessage = text.mine;
            }

            if(text.emoji){
              return(
                <div className={divClass} key={index}>
                  <p className={messageClass}>{renderHTML('<i className=\"twa twa-2665\"></i>')}<span>{moment(text.date).format('HH:mm')}</span></p>
                </div>
              )
            }
            else{
              return(
                <div className={divClass} key={index}>
                  <p className={messageClass}>{text.body}<span>{moment(text.date).format('HH:mm')}</span></p>
                </div>
              )
            }
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
    messages: state.messaging.messages,
    selectedId: state.messaging.selectedId,
    userHasCheckedGriffithChat: state.messaging.userHasCheckedGriffithChat,
    userHoveredOptionsIcon: state.messaging.userHoveredOptionsIcon
  };
};

export default connect(mapStateToProps, actions)(MessagingChat);
