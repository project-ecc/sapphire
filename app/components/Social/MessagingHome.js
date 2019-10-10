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
import SearchForFriend from "../Others/SearchForFriend";

const event = require('./../../utils/eventhandler');

class MessagingHome extends Component {
  constructor(props) {
    super(props);
    this.loadUser = this.loadUser.bind(this);
    this.openContact = this.openContact.bind(this);
    console.log(props)
    this.state = {
      viewingContact:         {
        name: "Dylan",
        id: "1",
        routingId: "AuFYObBTfSghNXvlNxzqUFeRWNqoL714i5BWWAgi0KqD"
      },
      users : [
        {
          name: "Dylan",
          id: "1",
          routingId: "AuFYObBTfSghNXvlNxzqUFeRWNqoL714i5BWWAgi0KqD"
        },
      ],
      messages: [
      ]
    };
    this.sendHandler = this.sendHandler.bind(this);

    // Connect to the server
    // this.socket = io(config.api, { query: `username=${props.username}` }).connect();

    // Listen for messages from the server
    // this.socket.on('server:message', message => {
    //   this.addMessage(message);
    // });
    this.loadUser()

    setInterval(async () =>{this.checkForMessages()}, 3000);
  }


  async loadUser(){
    let user = null;
    const eventID = this.props.match.params.id
    this.state.users.map((object, key) => {
      if (object.id == eventID) {
        this.openContact(object)
      }
    })
  }

  async checkForMessages(){
    let lastMessage = await this.props.wallet.readLastPacket({protocolId: 1,protocolVersion: 1})
    if(lastMessage != null && lastMessage.length > 0){
      console.log(lastMessage)
      let messageObj = JSON.parse(lastMessage.toString('hex'))
      this.addMessage(messageObj)
    }
    console.log(lastMessage)
  }
  openContact(contact) {
    this.setState({
      viewingContact: contact
    });
  }

  async sendHandler(message) {
    let myKey = await this.props.wallet.getRoutingPubKey();
    const messageObject = {
      pubKey: myKey,
      username: "Dylan",
      timeStamp: moment.now(),
      message
    };

    // Emit the message to the server
    // this.socket.emit('client:message', messageObject);


    console.log(messageObject)
    let data = await this.props.wallet.sendPacket({key: this.state.viewingContact.routingId ,protocolId: 1,protocolVersion :1, message: JSON.stringify(messageObject)})
    messageObject.fromMe = true;
    console.log(data)

    this.addMessage(messageObject);
  }

  addMessage(message) {
    // Append the message to the component state
    const messages = this.state.messages;
    messages.push(message);
    this.setState({ messages });
  }

  render() {

    const friend = this.state.viewingContact;
    // console.log(friend)

    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            { friend != null ? friend.name : "New Message"}
          </Header>
          <Body noPadding className="scrollable messaging-body">
            <Messages messages={this.state.messages} />

          </Body>
          <Footer>
            <ChatInput onSend={this.sendHandler} />
          </Footer>
        </div>

        <RightSidebar id="contactRightSidebar" className={friend === null ? 'hide' : ''}>
          <div className="d-flex">
            <Button color="link" onClick={() => this.openContact(null)}>
              Close
              <CloseCircleOutlineIcon className="ml-2" />
            </Button>
          </div>
          { friend && (
            <div className="p-3">
              { friend.name }
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
