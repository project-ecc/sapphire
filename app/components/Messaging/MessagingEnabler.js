import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import { ipcRenderer } from 'electron';
import renderHTML from 'react-render-html';

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

    Tools.sendMessage(this, this.props.lang.sapphireMessage2, 1, "Sapphire", 2000);
    Tools.sendMessage(this, this.props.lang.sapphireMessage3, 1, "Sapphire", 4000);
    Tools.sendMessage(this, this.props.lang.sapphireMessage4, 1, "Sapphire", 6000);
    Tools.sendMessage(this, this.props.lang.sapphireMessage5, 2, "Griffith", 11000);
    Tools.sendMessage(this, this.props.lang.sapphireMessage6, 2, "Griffith", 13000);
    Tools.sendMessage(this, "<i className=\"twa twa-2665\"></i>", 2, "Griffith", 14500, true)
  }


  render() {
    const messagingIcon = Tools.getIconForTheme("messagingIconPopup", false);
    const confirmButton = Tools.getIconForTheme("messagingIconPopupConfirm", false);
    return (
      <div id="warningMessaging" className={this.props.enabled ? "disableWarningMessaging" : ""}>
        <div id="popup">
          <img id="messageIconPopup" src={messagingIcon}/>
          <p id="warningMessagingTitle">{this.props.lang.secureMessaging}</p>
          <p id="warningMessagingSubtitle">{renderHTML(this.props.lang.servicePreview)}</p>
          <p className="messagingWarningDesc">{this.props.lang.sapphireMessage7}</p> 
          <p className="messagingWarningDesc kind">{this.props.lang.sapphireMessage8}</p>
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