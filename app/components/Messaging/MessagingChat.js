import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import MessagingInput from './MessagingInput';
import MessagingOptions from './MessagingOptions';
var moment = require('moment');
import jstz from 'jstz';
import renderHTML from 'react-render-html';

class MessagingChat extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(){
    $('#messagingChatContainer').scrollTop($('#messagingChatContainer')[0].scrollHeight - $('#messagingChatContainer')[0].clientHeight);
  }

  handleOptionsClicked(){
    if($('#messagingOptions').css("visibility") == "hidden"){
      TweenMax.set('#messagingOptions', {autoAlpha: 1});
      TweenMax.staggerFromTo('.messagingOption', 0.1, {y: -60, autoAlpha: 0}, {y: 0, autoAlpha: 1}, -0.05);
    }
    else{
      TweenMax.staggerFromTo('.messagingOption', 0.1, {y: 0, autoAlpha: 1}, {y: -60, autoAlpha: 0}, 0.05);
      setTimeout(() => {
        TweenMax.set('#messagingOptions', {autoAlpha: 0})
      }, 400)
    }
  }

  handleOptionsSmallClicked(){
    if($('#messagingOptionsSmall').css("visibility") == "hidden"){
      $('#messagingTopBar').css('height',"82px");
      TweenMax.set('#messagingOptionsSmall', {autoAlpha: 1});
      TweenMax.staggerFromTo('.messagingOption', 0.1, {y: -60, autoAlpha: 0}, {y: 0, autoAlpha: 1}, -0.05);
    }
    else{
      TweenMax.staggerFromTo('.messagingOption', 0.1, {y: 0, autoAlpha: 1}, {y: -60, autoAlpha: 0}, 0.05);
      setTimeout(() => {
        TweenMax.set('#messagingOptionsSmall', {autoAlpha: 0})
        $('#messagingTopBar').css("height","");
      }, 400)
    }
  }

  handleOptionsMouseEnter(){
    if(!this.props.userHoveredOptionsIcon){
      this.props.setUserHoveredOptionsButton(true);
      this.props.addNewMessage({id: 1, message: {body: "Go ahead and click that Options icon button.", mine: false, date: new Date()}, activeContactName: "Sapphire"});
    }
    TweenMax.staggerTo('.circleOptionsButton', 0.02, {backgroundColor: "#c39c59"}, -0.02);
  }

  handleOptionsMouseLeave(){
    TweenMax.staggerTo('.circleOptionsButton', 0.02, {backgroundColor: "#313541"}, 0.02);
  }

  renderChat(){
    if(this.props.messages.length == 0) return null;

  }

  render() {
    let ownLastMessage = undefined;
    return (
      <div id="messagingChat">
        <MessagingOptions id="messagingOptions"/>
        <div onClick={this.handleOptionsClicked.bind(this)} onMouseEnter={this.handleOptionsMouseEnter.bind(this)} onMouseLeave={this.handleOptionsMouseLeave.bind(this)} className={this.props.userHasCheckedGriffithChat ? "" : "hideElement"} id="optionsButton">
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