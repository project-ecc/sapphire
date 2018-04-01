import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')

class MessagingInput extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setInputFocus = this.setInputFocus.bind(this);
    this.handleEnterPressed = this.handleEnterPressed.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount(){
    this.setSendButtonStyling(this.props.messagingInputValue)
    window.addEventListener('keypress', this.handleEnterPressed)
    this.setInputFocus();
  }

  sendMessage(){
    if(this.props.messagingInputValue.length > 0){
      this.props.addNewMessage({id: this.props.selectedId, message: {body: this.props.messagingInputValue, mine: true, date: "01:52"}, activeContactName: this.props.activeContactName});
      this.props.setMessagingInputVal("");
      this.setSendButtonStyling("");
      $('#messagingChatContainer').scrollTop($('#messagingChatContainer')[0].scrollHeight - $('#messagingChatContainer')[0].clientHeight);
      $("textarea").val('');
    }
  }

  handleEnterPressed(e){
    if(e.which == 13) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  componentWillUnmount(){
    window.removeEventListener('keypress', this.handleEnterPressed);
  }

  setSendButtonStyling(message){
    if(!message || message.length == 0){
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
    if(message.length == 1 && message == "\n" ) return;
    this.setSendButtonStyling(message);
    this.props.setMessagingInputVal(message);
  }

  render() {
    return (
      <div id="messagingInput">
        <div id="messagingInputDiv">
          <textarea type="text" value={this.props.messagingInputValue} onChange={this.handleInputChange}></textarea>
          <p onClick={this.setInputFocus} className="inputPlaceholder" id="enterMessage">Type your message</p>
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
    activeContactName: state.messaging.activeContactName
  };
};

export default connect(mapStateToProps, actions)(MessagingInput);