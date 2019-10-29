import React, {Component} from 'react';
import {connect} from "react-redux";
import * as actions from "../actions";
import MessagingWorker from "../Workers/Messaging.worker";
import {RpcProvider} from "worker-rpc";
const zmq = require('zeromq');
const socket = zmq.socket('sub');
import event from '../utils/eventhandler';
import Packet from "../MessagingProtocol/Packet";

class Messaging extends Component {

  constructor(props){
    super(props)
    this.state = {
      peerIntervalTimer: null
    };
    this.registerMessageProcessor = this.registerMessageProcessor.bind(this);
    this.sendMessageResponse = this.sendMessageResponse.bind(this);
    this.sendMessageRequest = this.sendMessageRequest.bind(this);
    this.processIncomingMessage = this.processIncomingMessage.bind(this);
    this.getPeerInfo = this.getPeerInfo.bind(this);
    this.registerMessageProcessor();
    this.registerMessageReceiver();
    this.startCheckingForPeerInfo();
  }

  registerMessageReceiver(){
    socket.connect('tcp://127.0.0.1:30000');
    socket.subscribe('aodvmessage');

    //message from the daemon to process
    socket.on('message', async (topic, message) => {
     console.log('received a message related to:', topic.toString(), 'containing message:', message.toString('hex'));

     //decode the message because ZMQ messages are in hex encoding
     let zmqNotification = message.toString('hex');

     //grab the data from the last packet received
     let packet = await this.props.wallet.readLastPacket({
       protocolId: zmqNotification.protocolId,
       protocolVersion: zmqNotification.protocolVersion
     });

      // process the last packet received
      this.processIncomingMessage(packet)
    });

    //message from sapphire to packup and send
    event.on('sendPacket', this.sendMessageRequest);

    //sapphire requesting to update peer Data
    event.on('updatePeerInfo', this.getPeerInfo)

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
      .rpc('processPacket',
        message
      )
      .then(async (response) => {
        if(response != null){
          await this.sendMessageResponse(response);
        }
      });
  }

  /**
   *
   * @returns {Promise<void>}
   * @param {Message} packet
   */

  async sendMessageResponse(packet) {
    this.sendPacket()
  }

  async sendPacket(packet) {
    let data = await this.props.wallet.sendPacket(
      {
        key: packet.to,
        protocolId: packet.protocolId,
        protocolVersion: packet.protocolVersion,
        message: JSON.stringify(packet)
      })
    if (data === null) {
      return true;
    } else {
      //something went wrong
      // TODO workout what i should do here?
    }
  }

  async sendMessageRequest(e, args) {
    let packet = args.packet;
    this.sendPacket(packet);
  }

  startCheckingForPeerInfo(){
    this.setState({
      peerIntervalTimer: setInterval(this.getPeerInfo.bind(this), 50000)
    });
  }

  async getPeerInfo(){
    //grab all peers from routing table
    let peers = await this.props.wallet.getAodvTable();
    let myId = await this.props.wallet.getRoutingPubKey();
    for (let peer in peers){
      //create packet to send for data request and send packet
      let packet = new Packet(peer.id, myId, 'peerInfoRequest', null)
      this.sendPacket(packet);
    }
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
