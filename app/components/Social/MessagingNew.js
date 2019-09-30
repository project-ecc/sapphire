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


  render() {

    const friend = this.state.viewingContact;

    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            <SearchForFriend></SearchForFriend>
          </Header>
          <Body noPadding className="scrollable messaging-body">
          <Messages messages={this.state.messages} />

          </Body>
          <Footer>
            <ChatInput onSend={this.sendHandler} />
          </Footer>
        </div>

        {/*<RightSidebar id="contactRightSidebar" className={friend === null ? 'hide' : ''}>*/}
          {/*<div className="d-flex">*/}
            {/*<Button color="link" onClick={() => this.openContact(null)}>*/}
              {/*Close*/}
              {/*<CloseCircleOutlineIcon className="ml-2" />*/}
            {/*</Button>*/}
          {/*</div>*/}
          {/*{ friend && (*/}
            {/*<div className="p-3">*/}
              {/*{ friend.name }*/}
              {/*<div className="small-text transactionInfoTitle">*/}
                {/*{friend.routingId !== null ? friend.routingId : 'Unknown Route'}*/}
              {/*</div>*/}
              {/*<div className="mt-4">*/}
                {/*<p className="transactionInfoTitle"><span className="desc2 small-header">Friend since</span></p>*/}
                {/*<p><span className="desc3 small-text selectableText">{moment(friend.timeStamp).format('dddd, MMMM Do YYYY')}</span></p>*/}
              {/*</div>*/}
              {/*<div className="d-flex justify-content-end mt-5">*/}
                {/*<Button color="danger" size="sm" onClick={this.deleteAddress.bind(this, friend)}>*/}
                  {/*Delete Contact*/}
                {/*</Button>*/}
              {/*</div>*/}
            {/*</div>*/}
          {/*)}*/}
        {/*</RightSidebar>*/}
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
