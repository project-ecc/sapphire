import React, {Component} from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom'
import Body from './../Others/Body';
import Header from './../Others/Header';
import * as actions from '../../actions';
import Messages from "./partials/Messages";
import ChatInput from "./partials/ChatInput";
import Footer from "../Others/Footer";
import SearchForFriend from "../Others/SearchForFriend";
import moment from "moment";
import Packet from "../../MessagingProtocol/Packet";
import db from '../../utils/database/db'
const Conversation = db.Conversation;
const Message = db.Message
const event = require('../../utils/eventhandler');

class MessagingNew extends Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      peer: null
    };
    this.sendHandler = this.sendHandler.bind(this);
    this.selectedPeer = this.selectedPeer.bind(this);
    this.openContact = this.openContact.bind(this);
  }

  openContact(contact) {
    this.setState({
      viewingContact: contact
    });
  }

  async sendHandler(messageData) {
    let myKey = await this.props.wallet.getRoutingPubKey();
    try {
      console.log(this.state.peer)
      let conversation = await Conversation.findOne(
        {
          where: {
            owner_id: this.state.peer.id,
            conversation_type: 'PRIVATE'
            }
        })
      console.log(conversation)
      if(conversation == null) {
        conversation = await Conversation.create({
          name: this.state.peer.display_name,
          conversation_type: 'PRIVATE',
          owner_id: this.state.peer.id
        })
      }

      const messageObject = {
        content: messageData,
        owner_id: this.state.peer.id,
        date: moment.now(),
      };

      let message = await Message.create(messageObject)

      conversation.addMessage(message)
      let packet = new Packet(this.state.peer.id, myKey, 'newConversationRequest', JSON.stringify(conversation))

      event.emit('sendPacket', packet)
      setTimeout(() =>{
        this.props.history.push('/friends/' + conversation.id)
      }, 2000)


    } catch (e) {
      console.log(e)
      console.log('cant send message')
    }

  }


  selectedPeer(peer){
    this.setState({
      peer: peer
    })
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
