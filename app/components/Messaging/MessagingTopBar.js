import React, { Component } from 'react';
import { connect } from 'react-redux';

import { traduction } from '../../lang/lang';
import * as actions from '../../actions';
import MessagingInput from './MessagingInput';
import MessagingOptions from './MessagingOptions';

import $ from 'jquery';

const Tools = require('../../utils/tools');
const homedir = require('os').homedir();

class MessagingTopBar extends Component {
  constructor(props) {
    super(props);
  }

  handleButtonOnClick(type){
    switch(type){
      case "chatList":
        if(this.props.clickedSearchButton) return;
        Tools.sendMessage(this, this.props.lang.sapphireMessage20, 1, "Sapphire");
        break;
      case "add":
        if(this.props.clickedBinButton) return;
        Tools.sendMessage(this, this.props.lang.sapphireMessage21, 1, "Sapphire");
         break;
    }
    this.props.setUserClickedButton(type);
  }

  handleGoBack(){
    TweenMax.fromTo($('#contacts'), 0.1, { autoAlpha:0, css: {left: "-100%"}}, { autoAlpha:1, css: {left: "0%"}, ease: Linear.easeIn});
    TweenMax.fromTo($('#messagingChat'), 0.1,{ autoAlpha:1, css: {left: "0%"}}, { autoAlpha:0, css: {left: "100%"}, ease: Linear.easeIn});
    TweenMax.fromTo($('#chatListIcon'), 0.2,{ autoAlpha:0, x:-50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone});
    TweenMax.fromTo($('#goBackMessageIcon'), 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x:50, delay: 0.1, ease: Linear.easeNone});
    TweenMax.fromTo($('#chatContactIcon'), 0.2,{ autoAlpha:0, x:-50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone});
    TweenMax.fromTo($('#optionsButtonSmallView'), 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x: 50, delay: 0.1, ease: Linear.easeNone});
    $('#topBarMessage').text(this.props.lang.chats);
    this.props.setShowingChatListOnly(true);
    if($('#messagingOptionsSmall').css("visibility") !== "hidden"){
      Tools.animateMessagingSmallFunctionIconsOut();
    }
  }

  render() {
    const userIcon = Tools.getIconForTheme('chatContact', false);
    const listIcon = Tools.getIconForTheme('chatList', false);
    const goBackIcon = Tools.getIconForTheme('goBackChat', false);
    return (
      <div id="messagingTopBar">
        <p id="topBarMessage">Chats</p>
        <img onClick={this.handleButtonOnClick.bind(this, "add")} id="chatContactIcon" src={userIcon}></img>
        <img onClick={this.handleButtonOnClick.bind(this, "chatList")} id="chatListIcon" src={listIcon}></img>
        <img id="goBackMessageIcon" onClick={this.handleGoBack.bind(this)} src={goBackIcon}></img>
        <MessagingOptions id="messagingOptionsSmall"/>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    clickAddContactButton: state.messaging.clickAddContactButton,
    clickChatListButton: state.messaging.clickChatListButton
  };
};

export default connect(mapStateToProps, actions)(MessagingTopBar);
