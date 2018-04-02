import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')

class MessagingOptions extends Component {
  constructor(props) {
    super(props);
  }

  handleButtonOnClick(type){
    switch(type){
      case "search": 
        if(this.props.clickedSearchButton) return;
        Tools.sendMessage(this, "This Search option will allow you to search for messages within the chat", 1, "Sapphire");
        break;
      case "bin": 
        if(this.props.clickedBinButton) return;
        Tools.sendMessage(this, "The Delete option will remove the chat.", 1, "Sapphire");
        Tools.sendMessage(this, "Can't believe you tried to remove me.", 1, "Sapphire", 2000);
        Tools.sendMessage(this, "Also don't say you weren't aware of what it did, it looks like a trashcan...", 1, "Sapphire", 4000);
        Tools.sendMessage(this, "I'm offended.", 1, "Sapphire", 6000);
         break;
      case "sendEcc": 
        if(this.props.clickedSendEccButton) return;
        Tools.sendMessage(this, "This option will allow you to send ECC to the person you are talking to.", 1, "Sapphire");
        Tools.sendMessage(this, "Without leaving the messaging service!", 1, "Sapphire", 2000);
        break;
      case "file": 
        if(this.props.clickedFileButton) return;
        Tools.sendMessage(this, "The File option will allow you to send a file to someone.", 1, "Sapphire");
        break;
      case "notifications":
        if(this.props.clickedNotificationsButton) return;
        Tools.sendMessage(this, "The Notifications options will allow you to enable or disable the notifications of a given chat.", 1, "Sapphire"); 
        break;
    }
    this.props.setUserClickedButton(type);
  }

  render() {
    const searchImage = Tools.getIconForTheme("search2", false);
    const removeChatImage = Tools.getIconForTheme("removeChat", false);
    const disableNotificationImage = Tools.getIconForTheme("disableNotifications", false);
    const fileImage = Tools.getIconForTheme("sendFile", false);
    const sendEccImage = Tools.getIconForTheme("sendEcc", false);

    return (
      <div className="container" id={this.props.id}>
        <div className="row">
          <div className="col"></div>
            <div onClick={this.handleButtonOnClick.bind(this, "sendEcc")} className="col text-center"><img className="messagingOption" src={sendEccImage}/></div>
            <div onClick={this.handleButtonOnClick.bind(this, "file")} className="col text-center"><img className="messagingOption" src={fileImage}/></div>
            <div onClick={this.handleButtonOnClick.bind(this, "notifications")} className="col text-center"><img className="messagingOption" src={disableNotificationImage}/></div>
            <div onClick={this.handleButtonOnClick.bind(this, "bin")} className="col text-center"><img className="messagingOption" src={removeChatImage}/></div>
            <div onClick={this.handleButtonOnClick.bind(this, "search")} className="col text-center"><img className="messagingOption" src={searchImage}/></div>
          <div className="col"></div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    clickedSearchButton: state.messaging.clickedSearchButton,
    clickedBinButton: state.messaging.clickedBinButton,
    clickedSendEccButton: state.messaging.clickedSendEccButton,
    clickedFileButton: state.messaging.clickedFileButton,
    clickedNotificationsButton: state.messaging.clickedNotificationsButton
  };
};

export default connect(mapStateToProps, actions)(MessagingOptions);