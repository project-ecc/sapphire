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

class Messaging extends Component {
  constructor(props) {
    super(props);
    this.updateUI = this.updateUI.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
  }

  componentDidMount() {
    ipcRenderer.send('messagingView', true);
    $( window ).on('resize', () => {
      this.updateUI();
    });
    this.updateUI();
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
    }
  }

  updateUI(){
    if($(window).width() <= 460){
      if(this.props.showingFunctionIcons){
        Tools.hideFunctionIcons();
        this.props.setShowingFunctionIcons(false);
        setTimeout(() => {
          TweenMax.fromTo($('#contacts'), 0.2, { autoAlpha:1, css: {left: "0%"}}, { autoAlpha:0, css: {left: "-100%"}, ease: Linear.easeNone});
          TweenMax.fromTo($('#messagingChat'), 0.2,{ autoAlpha:0, css: {left: "100%"}}, { autoAlpha:1, css: {left: "0%"}, ease: Linear.easeNone});
        }, 1000);
      }
    }
    else if($(window).width() >= 540 && !this.props.showingFunctionIcons){
      Tools.showFunctionIcons();
      this.props.setShowingFunctionIcons(true);
      TweenMax.set($('#contacts'), { autoAlpha:1, css: {left: ""}});
      TweenMax.set($('#messagingChat'), { autoAlpha:1, css: {left: ""}});
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

  onItemClick(event) {
    let type = event.currentTarget.dataset.id;
  }


  render() {
    
    return (
      <div id="messagingContainer">
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
    showingFunctionIcons: state.application.showingFunctionIcons
  };
};

export default connect(mapStateToProps, actions)(Messaging);