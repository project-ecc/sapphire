import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';
import {CloseCircleOutlineIcon, PlusIcon} from 'mdi-react';
import moment from 'moment';

import Body from './../Others/Body';
import Header from './../Others/Header';
import RightSidebar from './../Others/RightSidebar';
import * as actions from '../../actions';
import Messages from './partials/Messages';
import ChatInput from './partials/ChatInput';
import Footer from "../Others/Footer";

import db from '../../utils/database/db'
const Conversation = db.Conversation;
const Message = db.Message
const uuidv4 = require('uuid/v4')
const Peer = db.Peer;
import Packet from "../../MessagingProtocol/Packet";

const event = require('./../../utils/eventhandler');

class MessagingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conversation: null,
      messages: [],
      sideBarOpen: false
    };
    this.sendHandler = this.sendHandler.bind(this);
    this.getConversationName = this.getConversationName.bind(this);
  }

  async componentDidMount(){
    const eventID = this.props.match.params.id
    let conversation = await Conversation.findByPk(eventID, {
      include:
        [{
          model: Message,
          include: ['owner']
        },
        {
          model: Peer,
            as: 'conversationPeers'
        }]
    })
    console.log(conversation)
    if(conversation != null) {
      this.setState({
        conversation: conversation,
        messages: conversation.messages
      })
    } else {
      // navigate to new messages view
    }
  }

  async sendHandler(messageData) {

    try {

      const messageObject = {
        id: uuidv4(),
        content: messageData,
        owner_id: this.props.activeAccount.id,
        date: moment.now(),
      };

      let message = await Message.create(messageObject)
      let conversation =
      this.state.conversation.addMessage(message)
      await this.state.conversation.save()
      this.setState({
        messages: this.state.conversation.messages
      })
      const conversationPeers = this.state.conversation.conversationPeers
      console.log(conversationPeers)
      for (const key in conversationPeers) {
        if(conversationPeers[key].id !== this.props.activeAccount.id){
          let packet = new Packet(conversationPeers[key].id, this.props.activeAccount.id, 'newConversationMessageRequest', JSON.stringify(message))
          event.emit('sendPacket', packet)
        }
      }
    } catch (e) {
      console.log(e)
      console.log('cant send message')
    }

  }

  getConversationName() {
    const conversation = this.state.conversation
    if(conversation.conversation_type === 'PRIVATE' && conversation.participants_count === 2) {
      const conversationPeers = conversation.conversationPeers
      for (const key in conversationPeers) {
        if(conversationPeers[key].id !== this.props.activeAccount.id){
          return conversationPeers[key].display_name
        }
      }
    }
  }

  render() {
    let conversation = this.state.conversation
    let messages = this.state.messages
    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            <div className='row col-12'>
              <div className='col-12 col-md-10'>
                { conversation != null ? this.getConversationName() : null}
              </div>
              <div className='col-12 col-md-2'>
                <Button color="link" onClick={() => this.setState({sideBarOpen: true})}>
                  Open Sidebar
                </Button>
              </div>
            </div>

          </Header>
          <Body noPadding className="scrollable messaging-body">
            <Messages messages={messages} />

          </Body>
          <Footer>
            <ChatInput onSend={this.sendHandler} />
          </Footer>
        </div>

        <RightSidebar id="contactRightSidebar" className={this.state.sideBarOpen === false ? 'hide' : ''}>
          <div className="d-flex">
            <Button color="link" onClick={() => this.setState({sideBarOpen: false})}>
              Close
              <CloseCircleOutlineIcon className="ml-2" />
            </Button>
          </div>
          { conversation && (
            <div className="p-3">
              { conversation.name }
              <div className="mt-4">
                <p className="transactionInfoTitle"><span className="desc2 small-header">Routing Identifier</span></p>
                <p><span className="desc3 small-text selectableText">AodysrxdVvEZ69SXe0cdQm7YAl8Yu4dHV2rcRO2J7R3y</span></p>
              </div>
              <div className="mt-4">
                <p className="transactionInfoTitle"><span className="desc2 small-header">Public Receive Address</span></p>
                <p><span className="desc3 small-text selectableText">EZtKAozRyjvFyE98XSPcVuyno8UZQTSx8Z</span>                 <Button size="sm" outline color="warning" onClick={() => { this.unlocktoggle() }} className="ml-2">
                  Send Now
                </Button></p>
              </div>
              <div className="mt-4">
                <p className="transactionInfoTitle"><span className="desc2 small-header">Friend since</span></p>
                <p><span className="desc3 small-text selectableText">{moment(conversation.created_at).format('dddd, MMMM Do YYYY')}</span></p>
              </div>
              <div className="d-flex justify-content-end mt-5">
                <Button color="danger" size="sm">
                  Delete Conversation
                </Button>
              </div>
            </div>
          )}
        </RightSidebar>
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

MessagingHome.defaultProps = {
  username: 'Anonymous'
};

export default connect(mapStateToProps, actions)(MessagingHome);
