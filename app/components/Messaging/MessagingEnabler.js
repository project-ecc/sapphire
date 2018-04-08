import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import { ipcRenderer } from 'electron';

class MessagingEnabler extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
  }


  componentWillUnmount(){
  }


  handleEnableMessaging(){
    TweenMax.to('#warningMessaging #popup', 0.4, {y: -500, autoAlpha: 0, ease: Power1.easeInOut});
    TweenMax.to('#warningMessaging', 0.3, {autoAlpha: 0, ease: Linear.easeNone, delay: 0.3});
    setTimeout(() => {
      this.props.setMessagingEnabled(true);
      ipcRenderer.send('messagingView', true);
    }, 600);

    Tools.sendMessage(this, "Hey! Welcome to the preview of ECC's own Secure Messaging service.", 1, "Sapphire", 2000);
    Tools.sendMessage(this, "Part of the functionality does not work yet, but I will make sure to tell you once you try to use it.", 1, "Sapphire", 4000);
    Tools.sendMessage(this, "Please share any feedback you may have with the guys that made me. I still think I can be improved and won't take it the wrong way if you feel like I need some tweaking.", 1, "Sapphire", 6000);
    Tools.sendMessage(this, "Also, yes, emojies will be supported. Just not in this preview.", 2, "Griffith", 11000);
    Tools.sendMessage(this, "Thanks for trying the preview!", 2, "Griffith", 13000);
    Tools.sendMessage(this, "<i className=\"twa twa-2665\"></i>", 2, "Griffith", 13500, true)
  }


  render() {
    const messagingIcon = Tools.getIconForTheme("messagingIconPopup", false);
    const confirmButton = Tools.getIconForTheme("messagingIconPopupConfirm", false);
    return (
      <div id="warningMessaging" className={this.props.enabled ? "disableWarningMessaging" : ""}>
        <div id="popup">
          <img id="messageIconPopup" src={messagingIcon}/>
          <p id="warningMessagingTitle">Secure Messaging</p>
          <p id="warningMessagingSubtitle">Service <span>Preview</span></p>
          <p className="messagingWarningDesc">Play around with it and let us know what you think. Sapphire will guide you through it.</p> 
          <p className="messagingWarningDesc kind">Be kind to her.</p>
          <img onClick={this.handleEnableMessaging.bind(this)} id="messageIconPopupConfirm" src={confirmButton}/>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    enabled: state.messaging.enabled
  };
};

export default connect(mapStateToProps, actions)(MessagingEnabler);