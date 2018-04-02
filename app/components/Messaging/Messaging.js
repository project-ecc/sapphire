import $ from 'jquery';
import React, { Component } from 'react';
import MessagingContacts from './MessagingContacts';
import MessagingChat from './MessagingChat';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import { ipcRenderer } from 'electron';
import MessagingTopBar from './MessagingTopBar';
import MessagingEnabler from './MessagingEnabler';

class Messaging extends Component {
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
    if(!this.props.showingFunctionIcons){
      Tools.showFunctionIcons();
      this.props.setShowingFunctionIcons(true);
      this.props.setMobileView(false);
    }
    this.props.setInMessaging(false);
  }

  updateUI(){
    if($(window).width() <= 580){
      if(this.props.showingFunctionIcons){
        Tools.hideFunctionIcons();
        this.props.setShowingFunctionIcons(false);
        this.props.setMobileView(true);
        this.props.setShowingChatListOnly(true);
        if(!this.props.sentMessageAboutFullMessagingMode){
          Tools.sendMessage(this, "Full on messaging mode!", 1, "Sapphire");
          this.props.setUserClickedButton("fullMessaging");
        }
        /*setTimeout(() => {
          TweenMax.fromTo($('#contacts'), 0.2, { autoAlpha:1, css: {left: "0%"}}, { autoAlpha:0, css: {left: "-100%"}, ease: Linear.easeNone});
          TweenMax.fromTo($('#messagingChat'), 0.2,{ autoAlpha:0, css: {left: "100%"}}, { autoAlpha:1, css: {left: "0%"}, ease: Linear.easeNone});
        }, 1000);*/
      }
    }
    else if($(window).width() >= 580 && !this.props.showingFunctionIcons){
      this.props.setMobileView(false);
      Tools.showFunctionIcons();
      this.props.setShowingFunctionIcons(true);
      if(!this.props.showingChatList){
        TweenMax.fromTo('#chatListIcon', 0.2,{ autoAlpha:0, x:-50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone});
        TweenMax.fromTo('#goBackMessageIcon', 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x:50, delay: 0.1, ease: Linear.easeNone});
        TweenMax.fromTo('#chatContactIcon', 0.2,{ autoAlpha:0, x:-50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone});
        TweenMax.fromTo('#optionsButtonSmallView', 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x: 50, delay: 0.1, ease: Linear.easeNone});
      }
      TweenMax.set('#contacts', { autoAlpha:1, css: {left: ""}});
      TweenMax.set('#messagingChat', { autoAlpha:1, css: {left: ""}});
      $('#topBarMessage').text("Chats");
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
                <p className="tableHeaderTitle tableHeaderTitleSmall">Messaging</p>
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
    showingFunctionIcons: state.application.showingFunctionIcons,
    showingChatList: state.messaging.showingChatList,
    warning: state.messaging.warning,
    enabled: state.messaging.enabled,
    sentMessageAboutFullMessagingMode: state.messaging.sentMessageAboutFullMessagingMode
  };
};

export default connect(mapStateToProps, actions)(Messaging);