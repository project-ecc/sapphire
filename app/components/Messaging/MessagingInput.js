import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { traduction } from '../../lang/lang';
import * as actions from '../../actions';

const Tools = require('../../utils/tools');
const homedir = require('os').homedir();

class MessagingInput extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setInputFocus = this.setInputFocus.bind(this);
    this.handleEnterPressed = this.handleEnterPressed.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount(){
    this.setSendButtonStyling(this.props.messagingInputValue);
    window.addEventListener('keypress', this.handleEnterPressed);
    if(this.props.enabled)
      this.setInputFocus();
  }

  sendMessage(){
    if(this.props.messagingInputValue.length > 0){
      this.props.addNewMessage({id: this.props.selectedId, message: {body: this.props.messagingInputValue, mine: true, date: new Date()}, activeContactName: this.props.activeContactName});
      this.props.setMessagingInputVal("");
      this.setSendButtonStyling("");
      $('#messagingChatContainer').scrollTop($('#messagingChatContainer')[0].scrollHeight - $('#messagingChatContainer')[0].clientHeight);
      $("textarea").val('');
    }
  }

  handleEnterPressed(e){
    if(e.which === 13) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  componentWillUnmount(){
    window.removeEventListener('keypress', this.handleEnterPressed);
  }

  setSendButtonStyling(message){
    if(!message || message.length === 0){
      TweenMax.set('#enterMessage', {autoAlpha: 1});
      $("#messagingInputOptions polyline").removeClass("sendButtonActive");
      $("#messagingInputOptions circle").removeClass("sendButtonActive");
      $("#circleMessaging").removeClass("addCursorPointer");
    }
    else {
      TweenMax.set('#enterMessage', {autoAlpha: 0});
      $("#messagingInputOptions polyline").addClass("sendButtonActive");
      $("#messagingInputOptions circle").addClass("sendButtonActive");
      $("#circleMessaging").addClass("addCursorPointer");
    }
  }

  setInputFocus(){
    $( "#messagingInput textarea" ).focus();
  }

  handleInputChange(event) {
    let message = event.target.value;
    if(message.length === 1 && message === "\n" ) return;
    this.setSendButtonStyling(message);
    this.props.setMessagingInputVal(message);
  }

  render() {
    return (
      <div id="messagingInput">
        <div id="messagingInputDiv">
          <textarea id="messagingInputTextArea" type="text" value={this.props.messagingInputValue} onChange={this.handleInputChange} autoFocus={this.props.enabled ? true : false}></textarea>
          <p onClick={this.setInputFocus} className="inputPlaceholder" id="enterMessage">{this.props.lang.typeYourMessage}</p>
        </div>
        <div id="messagingInputOptions">
          <div id="messagingSendButton">
            <svg id="circleMessaging" onClick={this.sendMessage} width="40" height="40" viewBox="0 0 10 10">
              <circle cx="5" cy="5" r="4.5" strokeWidth="0.4px" fill="transparent"></circle>
              <polyline className="sibling" points="4.3,3 6.3,5 4.3,7" strokeWidth="0.4px" fill="none" strokeLinecap="round" strokeLinejoin="round"></polyline>
            </svg>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    messagingInputValue: state.messaging.inputValue,
    selectedId: state.messaging.selectedId,
    activeContactName: state.messaging.activeContactName,
    enabled: state.messaging.enabled
  };
};

export default connect(mapStateToProps, actions)(MessagingInput);
