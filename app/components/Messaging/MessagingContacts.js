import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import MessagingSearch from './MessagingSearch';

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
    this.props.setMessageId(id, address);
    if(!this.props.mobileView){
      this.focusInput()
    }
    else{
      //$('.notOwnMessage').css('z-index', 5);
      TweenMax.fromTo('#contacts', 0.1, { autoAlpha:1, css: {left: "0%"}}, { autoAlpha:0, css: {left: "-100%"}, delay: 0.03, ease: Linear.easeNone});
      TweenMax.fromTo('#messagingChat', 0.1,{ autoAlpha:0, css: {left: "100%"}}, { autoAlpha:1, css: {left: "0%"}, ease: Linear.easeNone});
      TweenMax.fromTo('#chatListIcon', 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x:-50, delay: 0.1, ease: Linear.easeNone});
      TweenMax.fromTo('#goBackMessageIcon', 0.2,{ autoAlpha:0, x:50}, { autoAlpha:1, x:0, delay: 0.1, ease: Linear.easeNone}); 
      TweenMax.fromTo('#chatContactIcon', 0.2,{ autoAlpha:1, x:0}, { autoAlpha:0, x:-50, delay: 0.1, ease: Linear.easeNone});
      TweenMax.fromTo('#optionsButtonSmallView', 0.2,{ autoAlpha:1, x:50}, { autoAlpha:1, x: 0, delay: 0.1, ease: Linear.easeNone});
      this.props.setShowingChatListOnly(false);
      //TweenMax.staggerFromTo($('.notOwnMessage'), 0.5,{ x: 550}, { x: 0, ease: Linear.easeOut});
      setTimeout(() => {
        this.focusInput()
        //$('.notOwnMessage').css('z-index', 1);
      }, 250);
      $('#topBarMessage').text(address);
    }
  }

  render() {
    return (
      <div id="contacts">
        <MessagingSearch />
          <div id="contactsList">
          {this.props.chatsPreview.map((t, index) => {
              return(
              <div onClick={this.handleChatClicked.bind(this, t.id, t.address)} className={t.id == this.props.selectedId && !this.props.mobileView ? "chatPreview chatPreviewActive" : "chatPreview"} key={t.id}>
                <div className={t.seen ? "borderChatPreview" : "borderChatPreview borderChatPreviewNotRead"}></div>
                <p className="chatAddress">{t.address}<span className="chatDate">{t.date}</span></p>
                <p className="chatPreviewMessage">{t.lastMessage}</p>
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
    mobileView: state.messaging.mobileView,
    selectedId: state.messaging.selectedId,
    activeContactName: state.messaging.activeContactName
  };
};

export default connect(mapStateToProps, actions)(MessagingContacts);