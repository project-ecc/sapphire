import React from 'react';

import Message from './Message';
import connect from "react-redux/es/connect/connect";
import * as actions from "../../../actions";

class Messages extends React.Component {
  componentDidUpdate() {
    // There is a new message in the state, scroll to bottom of list
    const objDiv = document.getElementById('messageList');
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  render() {
    // Loop through all the messages in the state and create a Packet component
    const messages = this.props.messages.map((message, i) => {
      console.log(message)
      return (
        <Message
          key={i}
          username={message.owner.display_name}
          message={message.content}
          fromMe={message.owner.id === (this.props.activeAccount != null ? this.props.activeAccount.id : false)} />
      );
    });

    return (
      <div className='messages' id='messageList'>
        { messages }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    activeAccount: state.messaging.activeAccount
  };
};

Messages.defaultProps = {
  messages: []
};

export default connect(mapStateToProps, actions)(Messages);
