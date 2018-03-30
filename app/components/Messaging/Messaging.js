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
      }
    }
    else if($(window).width() >= 460 && !this.props.showingFunctionIcons){
      Tools.showFunctionIcons();
      this.props.setShowingFunctionIcons(true);
    }
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