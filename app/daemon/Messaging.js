import React, {Component} from 'react';
import {connect} from "react-redux";
import * as actions from "../actions";
// import MessagingWorker from "../Workers/Messaging.worker";
import {RpcProvider} from "worker-rpc";
const zmq = require('zeromq');
const socket = zmq.socket('sub');
import event from '../utils/eventhandler';
import Packet from "../MessagingProtocol/Packet";
import Peer from '../utils/database/model/Peer.model'
import MyAccount from '../utils/database/model/MyAccount.model'
import * as tools from "../utils/tools";
import DatabaseMessage from "../MessagingProtocol/DatabaseMessage";
import {parseIncomingPacket} from "../MessagingProtocol/ParseIncomingPacket";

class Messaging extends Component {

  constructor(props){
    super(props)
    this.state = {
      peerIntervalTimer: null,
      packetIntervalTimer: null,
      lastReceivedPacket: null
    };
    this.registerMessageProcessor = this.registerMessageProcessor.bind(this);
    this.sendMessageResponse = this.sendMessageResponse.bind(this);
    this.sendMessageRequest = this.sendMessageRequest.bind(this);
    this.processIncomingPacket = this.processIncomingPacket.bind(this);
    this.getPeerInfo = this.getPeerInfo.bind(this);
    this.processDataBaseMessage = this.processDataBaseMessage.bind(this);

  }

  async componentWillMount() {
    // await this.registerMessageProcessor();
    await this.registerMessageReceiver();
    await this.startCheckingForPeerInfo();
  }

  async registerMessageReceiver(){
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
      await this.processIncomingPacket(packet)
    });

    //message from sapphire to packup and send
    event.on('sendPacket', this.sendMessageRequest);

    //sapphire requesting to update peer Data
    event.on('updatePeerInfo', this.getPeerInfo)

  }

  async pollMessageReceiver() {
    let lastPacket = await this.props.wallet.readLastPacket({protocolId: 1, protocolVersion: 1});
    // console.log(lastPacket)
    try {
      let encodedPacket = this.convert_object(lastPacket)
      // console.log(encodedPacket)
      let decodedPacket = Object.assign(new Packet, JSON.parse(encodedPacket))
      if(this.state.lastReceivedPacket == null || this.state.lastReceivedPacket._id !== decodedPacket._id){
        this.setState({
          lastReceivedPacket: decodedPacket
        })
        console.log(decodedPacket)
        await this.processIncomingPacket(decodedPacket)
      } else {
        console.log(this.state.lastReceivedPacket)
        console.log('message already processed!')
      }

    } catch (e) {
      // console.log(e)
    }
  }

  async registerMessageProcessor() {
    // const worker = new MessagingWorker();
    // this.rpcProvider = new RpcProvider(
    //   (message, transfer) => worker.postMessage(message, transfer)
    // );
    //
    // worker.onmessage = e => this.rpcProvider.dispatch(e.data);
    //
    // let creds = await tools.readRpcCredentials();
    //
    // this.rpcProvider
    //   .rpc('initWorkerWalletConnection', {username: creds.username, password: creds.password}
    //   )
    //   .then(async (response) => {
    //     console.log(response)
    //   });
    //
    // this.rpcProvider.registerRpcHandler('processDataBaseMessage',  this.processDataBaseMessage);
  }


  async processIncomingPacket (message) {
    console.log(message)
    let response = await parseIncomingPacket(message, this.props.wallet)
    console.log(response)
    if(response != null){
      await this.sendMessageResponse(response);
    }
  }

  /**
   *
   * @returns {Promise<void>}
   * @param {Message} packet
   */

  async sendMessageResponse(packet) {
    await this.sendPacket(packet)
  }

  /**
   * process data base message from worker
   * @param packet
   * @returns {Promise<void>}
   */
  async processDataBaseMessage(packet) {
    let myRoutingId = this.props.wallet.getRoutingPubKey()
    switch (packet.model){
      case 'peer':
        switch(packet.action) {
          case 'create':
            break;
          case 'update':
            break;
          case 'delete':
            break;
          case 'get':
            return MyAccount.findById(myRoutingId);
        }
        break;
      case 'message':
        switch(packet.action) {
          case 'create':
            break;
          case 'update':
            break;
          case 'delete':
            break;
          case 'get':
            break;
        }
        break;
      case 'conversation':
        switch(packet.action) {
          case 'create':
            break;
          case 'update':
            break;
          case 'delete':
            break;
          case 'get':
            break;
        }
        break;
    }
  }

  async sendPacket(packet) {
    let encodedPacket = JSON.stringify(packet)
    let data = await this.props.wallet.sendPacket(
      {
        key: packet._to,
        protocolId: packet._protocolId,
        protocolVersion: packet._protocolVersion,
        message: encodedPacket
      })
    console.log(data)
    if (data === true) {
      return true;
    } else {
      console.log(data)
      //something went wrong
      // TODO workout what i should do here?
    }
  }

  unpack(hex) {
    return new Buffer( hex, 'hex' ).toString();
  };

  convert_object(data) {
    if (typeof data === 'string') {
      return this.unpack(data);
    } else if (Array.isArray( data )) {
      return data.map(this.convert_object);
    } else if (typeof data === 'object') {
      let parsed = {};

      Object.keys( data ).forEach( ( key, index, keys ) => {
        parsed[ this.unpack(key) ] = this.convert_object( data[key]);
      });

      return parsed;
    } else {
      throw ("Oops! we don't support type: " + (typeof data));
    }
  };

  async sendMessageRequest(e, args) {
    let packet = args.packet;
    await this.sendPacket(packet);
  }

  startCheckingForPeerInfo(){
    this.setState({
      peerIntervalTimer: setInterval(this.getPeerInfo.bind(this), 50000),
      packetIntervalTimer: setInterval(this.pollMessageReceiver.bind(this), 5000)
    });
  }

  async getPeerInfo(){
    //grab all peers from routing table
    let aodvResponse = await this.props.wallet.getAodvTable();
    let myId = await this.props.wallet.getRoutingPubKey();
    let peers = aodvResponse.mapkeyid;
    console.log(peers)
    for (const [key, value] of Object.entries(peers)) {
      console.log(key, value);
      //create packet to send for data request and send packet
      let packet = new Packet(key, myId, 'peerInfoRequest', null)
      await this.sendPacket(packet);
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
