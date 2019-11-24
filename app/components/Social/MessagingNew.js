import React, {Component} from 'react';
import {connect} from 'react-redux';

import Body from './../Others/Body';
import Header from './../Others/Header';
import * as actions from '../../actions';
import Messages from "./partials/Messages";
import ChatInput from "./partials/ChatInput";
import Footer from "../Others/Footer";
import SearchForFriend from "../Others/SearchForFriend";


class MessagingNew extends Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      viewingContact:         {
        name: "Dylan",
        id: "1",
        routingId: "jankjnwdokmawd"
      },
      users : [
        {
          name: "Dylan",
          id: "1",
          routingId: "jankjnwdokmawd"
        },
        {
          name: "Nick",
          id: "2",
          routingId: "omaiknwuniwiund"
        }
      ],
      messages: [
        {

        }
      ]
    };
    this.sendHandler = this.sendHandler.bind(this);
    this.openContact = this.openContact.bind(this);
  }

  openContact(contact) {
    this.setState({
      viewingContact: contact
    });
  }

  sendHandler(message) {
    const messageObject = {
      username: "Dylan",
      message
    };

    // Emit the message to the server
    // this.socket.emit('client:message', messageObject);

    messageObject.fromMe = true;
    this.addMessage(messageObject);
  }

  addMessage(message) {
    // Append the message to the component state
    const messages = this.state.messages;
    messages.push(message);
    this.setState({ messages });
  }

  selectedPeer(peer){
    console.log('here')
  }


  render() {

    const friend = this.state.viewingContact;

    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            <SearchForFriend selectedPeer={this.selectedPeer}/>
          </Header>
          <Body noPadding className="scrollable messaging-body">
          <Messages messages={this.state.messages} />

          </Body>
          <Footer>
            <ChatInput onSend={this.sendHandler} />
          </Footer>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(MessagingNew);
