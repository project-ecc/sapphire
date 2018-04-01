import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import MessagingInput from './MessagingInput';
import MessagingOptions from './MessagingOptions';

class MessagingTopBar extends Component {
  constructor(props) {
    super(props);
  }

  handleDoNothing(){
    console.log("send message saying it does nothing but looks neat...lol")
  }

  handleGoBack(){
    TweenMax.fromTo($('#contacts'), 0.1, { autoAlpha:0, css: {left: "-100%"}}, { autoAlpha:1, css: {left: "0%"}, ease: Linear.easeIn});
    TweenMax.fromTo($('#messagingChat'), 0.1,{ autoAlpha:1, css: {left: "0%"}}, { autoAlpha:0, css: {left: "100%"}, ease: Linear.easeIn});
    TweenMax.fromTo($('#chatListIcon'), 0.2,{ autoAlpha:0, x:-50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone});
    TweenMax.fromTo($('#goBackMessageIcon'), 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x:50, delay: 0.1, ease: Linear.easeNone});
    TweenMax.fromTo($('#chatContactIcon'), 0.2,{ autoAlpha:0, x:-50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone});
    TweenMax.fromTo($('#optionsButtonSmallView'), 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x: 50, delay: 0.1, ease: Linear.easeNone});
    $('#topBarMessage').text("Chats");
    this.props.setShowingChatListOnly(true);
  }

  render() {
    const userIcon = Tools.getIconForTheme('chatContact', false);
    const listIcon = Tools.getIconForTheme('chatList', false);
    const goBackIcon = Tools.getIconForTheme('goBackChat', false);
    return (
      <div id="messagingTopBar">
        <p id="topBarMessage">Chats</p>
        <img id="chatContactIcon" src={userIcon}></img>
        <img id="chatListIcon" onClick={this.handleDoNothing.bind(this)} src={listIcon}></img>
        <img id="goBackMessageIcon" onClick={this.handleGoBack.bind(this)} src={goBackIcon}></img>
        <MessagingOptions id="messagingOptionsSmall"/>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions)(MessagingTopBar);