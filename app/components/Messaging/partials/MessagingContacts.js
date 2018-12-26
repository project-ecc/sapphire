import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import renderHTML from 'react-render-html';

import { traduction } from '../../../lang/lang';
import * as actions from '../../../actions/index';
import MessagingSearch from './MessagingSearch';

var moment = require('moment');
const Tools = require('../../../utils/tools');
const homedir = require('os').homedir();

moment.locale('lt');

class MessagingContacts extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.props.setMessageId(this.props.selectedId, this.props.activeContactName);
  }

  focusInput(){
    $( "#messagingInput textarea" ).focus();
  }

  handleChatClicked(id, address){
    if($('#messagingOptions').css("visibility") != "hidden" && address != this.props.activeContactName){
      Tools.animateMessagingFunctionIconsOut();
    }
    this.props.setMessageId(id, address);
    if(address == "Griffith" && !this.props.userCheckedGriffithChat){
      this.props.setUserCheckedGriffithChat(true);
    }
    this.focusInput()
  }

  render() {
    return (
      <div id="contacts">
        <MessagingSearch />
          <div id="contactsList">
          {this.props.chatsPreview.map((t, index) => {
            let date = getDate(t.date);
              return(
                <div onClick={this.handleChatClicked.bind(this, t.id, t.address)} className={t.id == this.props.selectedId ? "chatPreview chatPreviewActive" : "chatPreview"} key={t.id}>
                  <div className={t.seen ? "borderChatPreview" : "borderChatPreview borderChatPreviewNotRead"}></div>
                  <p className="chatAddress">{t.address}<span className="chatDate">{date}</span></p>
                  <p className="chatPreviewMessage">{t.emoji ? renderHTML('<i className=\"twa twa-2665\"></i>') : t.lastMessage}</p>
                </div>
              )
            })
          }
          </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    chatsPreview: state.messaging.chatsPreview,
    selectedId: state.messaging.selectedId,
    activeContactName: state.messaging.activeContactName,
    userHasCheckedGriffithChat: state.messaging.userHasCheckedGriffithChat
  };
};

export default connect(mapStateToProps, actions)(MessagingContacts);


function getDate(date) {
  console.log(date)
  const now = new Date();
  if(date.getMonth() == now.getMonth() && date.getDate() == now.getDate() && date.getYear() == now.getYear()){
    var x = moment(date).format('HH:mm')
    return x;
  }
}
