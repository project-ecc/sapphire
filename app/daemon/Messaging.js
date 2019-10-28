import React, {Component} from 'react';
import {connect} from "react-redux";
import * as actions from "../actions";
import MessagingWorker from "../Workers/Messaging.worker";
import {RpcProvider} from "worker-rpc";
const zmq = require('zeromq');
const socket = zmq.socket('sub');
import event from '../utils/eventhandler';

class Messaging extends Component {

  constructor(props){
    super(props)
    this.registerMessageProcessor = this.registerMessageProcessor.bind(this);
    this.sendMessageResponse = this.sendMessageResponse.bind(this);
    this.sendMessageRequest = this.sendMessageRequest.bind(this);
    this.processIncomingMessage = this.processIncomingMessage.bind(this);
    this.registerMessageProcessor();
    this.registerMessageReceiver();
  }

  registerMessageReceiver(){
    socket.connect('tcp://127.0.0.1:30000');
    socket.subscribe('aodvmessage');

    //message from the daemon to process
    socket.on('message', (topic, message) => {
     console.log('received a message related to:', topic.toString(), 'containing message:', message.toString('hex'));
      this.processIncomingMessage(message)
    });

    //message from sapphire to packup and send
    event.on('sendPacket', this.sendMessageRequest);

  }

  registerMessageProcessor() {
    const worker = new MessagingWorker();
    this.rpcProvider = new RpcProvider(
      (message, transfer) => worker.postMessage(message, transfer)
    );

    worker.onmessage = e => this.rpcProvider.dispatch(e.data);
  }


  processIncomingMessage (message) {
    this.rpcProvider
      .rpc('processMessage',
        message
      )
      .then(async (packet) => {
        await this.sendMessageResponse(packet);
      });
  }

  async sendMessageResponse(packet) {
    let data = await this.props.wallet.sendPacket({key: packet.routingId, protocolId: packet.protocolId, protocolVersion :packet.protocolVersion, message: JSON.stringify(packet.content)})
  }

  async sendMessageRequest(e, args) {
    let packet = args.packet;
    let data = await this.props.wallet.sendPacket({key: packet.routingId, protocolId: packet.protocolId, protocolVersion :packet.protocolVersion, message: JSON.stringify(packet.content)})
  }

  render (){
    return null;
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
  };
};

export default connect(mapStateToProps, actions)(Messaging);
