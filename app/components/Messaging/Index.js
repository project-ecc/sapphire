import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';

import MessagingContacts from './partials/MessagingContacts';
import MessagingChat from './partials/MessagingChat';
import { traduction } from '../../lang/lang';
import * as actions from '../../actions';
import MessagingTopBar from './partials/MessagingTopBar';
import MessagingEnabler from './partials/MessagingEnabler';

const homedir = require('os').homedir();
const Tools = require('../../utils/tools');

class Index extends Component {
  constructor(props) {
    super(props);
    this.updateUI = this.updateUI.bind(this);
  }

  componentDidMount() {
    if(this.props.enabled){
      ipcRenderer.send('messagingView', true);
    }
    $( window ).on('resize', () => {
      this.updateUI();
    });
    this.updateUI();
    this.props.setInMessaging(true);
  }

  componentWillUnmount() {
    ipcRenderer.send('messagingView', false);
    $( window ).off('resize');
    /*if(this.props.showingTitleTopBar){
      TweenMax.fromTo($('#topBarCustomTitle'), 0.2, {autoAlpha: 1, y: 0}, { autoAlpha:0, y:20, ease: Linear.easeNone});
      this.props.setShowingMessageTopBar(false);
    }*/
    this.props.setInMessaging(false);
  }

  updateUI(){
    if($(window).width() >= 580){
      if($('#messagingOptionsSmall').css("visibility") !== "hidden"){
        Tools.animateMessagingSmallFunctionIconsOut();
      }
      if(!this.props.showingChatList){
        TweenMax.fromTo('#chatListIcon', 0.2,{ autoAlpha:0, x:-50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone});
        TweenMax.fromTo('#goBackMessageIcon', 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x:50, delay: 0.1, ease: Linear.easeNone});
        TweenMax.fromTo('#chatContactIcon', 0.2,{ autoAlpha:0, x:-50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone});
        TweenMax.fromTo('#optionsButtonSmallView', 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x: 50, delay: 0.1, ease: Linear.easeNone});
      }
      TweenMax.set('#contacts', { autoAlpha:1, css: {left: ""}});
      TweenMax.set('#messagingChat', { autoAlpha:1, css: {left: ""}});
      $('#topBarMessage').text(this.props.lang.chats);
      this.props.setShowingChatListOnly(false);
    }
    $('#messagingChatContainer').scrollTop($('#messagingChatContainer')[0].scrollHeight - $('#messagingChatContainer')[0].clientHeight);
    /*if($( window ).width() <= 1023){
      if(!this.props.showingTitleTopBar){
        this.props.setShowingMessageTopBar(true);
        TweenMax.fromTo($('#topBarCustomTitle'), 0.2, {autoAlpha: 0, y: 20}, { autoAlpha:1, y:0, ease: Linear.easeNone});
      }
    }
    else{
      if(this.props.showingTitleTopBar){
        this.props.setShowingMessageTopBar(false);
        TweenMax.fromTo($('#topBarCustomTitle'), 0.2, {autoAlpha: 1, y: 0}, { autoAlpha:0, y:20, ease: Linear.easeNone});
      }
    }*/
  }

  render() {

    return (
        <div id="messagingContainer" className={this.props.warning ? "makeFullScreen" : ""}>
          <MessagingEnabler />
            <div id="messagingTable">
              <div id="tableHeader" className="tableHeaderNormal tableHeaderAnimated">
                <p className="tableHeaderTitle tableHeaderTitleSmall">{this.props.lang.messaging}</p>
              </div>
              <MessagingTopBar />
              <MessagingContacts/>
              <MessagingChat/>
            </div>
        </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    showingTitleTopBar: state.messaging.showingTitleTopBar,
    showingChatList: state.messaging.showingChatList,
    warning: state.messaging.warning,
    enabled: state.messaging.enabled,
    sentMessageAboutFullMessagingMode: state.messaging.sentMessageAboutFullMessagingMode
  };
};

export default connect(mapStateToProps, actions)(Index);
