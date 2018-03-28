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
  }

  componentDidMount(){
    this.setSendButtonStyling(this.props.messagingInputValue)
  }

  setSendButtonStyling(message){
    if(message.length == 0){
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
            <svg id="arrowMessaging" width="70" height="70" viewBox="-25 -25 400 400">
              <polyline fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" points="
      0.375,0.375 45.63,38.087 0.375,75.8 "/>
            </svg>
            <svg id="circleMessaging" width="40" height="40" viewBox="-25 -25 400 400">
              <circle cx="175" cy="175" r="180" strokeWidth="12px" fill="none">
              </circle>
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
    messagingInputValue: state.messaging.inputValue
  };
};

export default connect(mapStateToProps, actions)(MessagingInput);