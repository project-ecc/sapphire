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
  }

  async componentDidMount(){
    const eventID = this.props.match.params.id
    let conversation = await Conversation.findByPk(eventID)
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

  async sendHandler(message) {
    let myKey = await this.props.wallet.getRoutingPubKey();
    try {
      const messageObject = {
        content: message,
        conversation_id: this.state.conversation.id,
        owner_id: myKey,
        date: moment.now(),
      };

      let message = await Message.create(messageObject)

      let packet = new Packet(key, myId, 'newMessageRequest', JSON.stringify(message))

      event.emit('sendPacket', packet)

      // Emit the message to the server
      // this.socket.emit('client:message', messageObject);

      this.addMessage(message);
    } catch (e) {
      console.log(e)
      console.log('cant send message')
    }

  }

  async editHandler() {

  }

  addMessage(message) {
    // Append the message to the component state
    const messages = this.state.messages;
    messages.push(message);
    this.setState({ messages });
  }

  render() {
    let conversation = this.state.conversation
    let messages = this.state.messages
    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            { conversation != null ? conversation.name : null}
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
                <p><span className="desc3 small-text selectableText">{moment(friend.timeStamp).format('dddd, MMMM Do YYYY')}</span></p>
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
    wallet: state.application.wallet
  };
};

MessagingHome.defaultProps = {
  username: 'Anonymous'
};

export default connect(mapStateToProps, actions)(MessagingHome);
