import React, {Component} from 'react';
import {connect} from "react-redux";
import * as actions from "../actions";
const zmq = require('zeromq');
const socket = zmq.socket('sub');
import event from '../utils/eventhandler';
import Packet from "../MessagingProtocol/Packet";
import {parseIncomingPacket} from "../MessagingProtocol/ParseIncomingPacket";
import db from '../utils/database/db'
const MyAccount = db.MyAccount;
const Peer = db.Peer;

class Messaging extends Component {

  constructor(props){
    super(props)
    this.state = {
      peerIntervalTimer: null,
      packetIntervalTimer: null,
      lastReceivedPacket: null
    };
    this.sendMessageResponse = this.sendMessageResponse.bind(this);
    this.sendMessageRequest = this.sendMessageRequest.bind(this);
    this.processIncomingPacket = this.processIncomingPacket.bind(this);
    this.getPeerInfo = this.getPeerInfo.bind(this);
    this.setActiveMessagingAccount = this.setActiveMessagingAccount.bind(this);

  }

  async componentDidMount() {
    await this.registerMessageReceiver();
    await this.startCheckingForPeerInfo();
    await this.setActiveMessagingAccount()
  }

  async setActiveMessagingAccount() {
    const myAccount = await MyAccount.findOne({
      where: {
        is_active: true
      }
    })

    if (myAccount != null){
      // set my active account
      this.props.setActiveMessagingAccount(myAccount)

      // add my peer to the peers table
      await Peer
        .findByPk(myAccount.id)
        .then((obj) => {
          // update
          if(obj)
            return obj.update({
              display_image: myAccount.display_image,
              display_name: myAccount.display_name,
              public_payment_address: myAccount.public_payment_address,
              private_payment_address: myAccount.private_payment_address
            });
          // insert
          return Peer.create({
            id: myAccount.id,
            display_image: myAccount.display_image,
            display_name: myAccount.display_name,
            public_payment_address: myAccount.public_payment_address,
            private_payment_address: myAccount.private_payment_address
          });
        })
    }
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
     let packet = await this.props.wallet.getBuffer(zmqNotification.protocolId);

      // process the last packet received
      await this.processIncomingPacket(packet)
    });

    //message from sapphire to packup and send
    event.on('sendPacket', this.sendMessageRequest);

    //sapphire requesting to update peer Data
    event.on('updatePeerInfo', this.getPeerInfo)

  }

  async pollMessageReceiver() {
    let lastPacket = await this.props.wallet.getBuffer(1);
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

        // verify signature here.
        // create message signature
        let params = {
         key: decodedPacket._from,
         sig: decodedPacket._sig,
         message: decodedPacket._message
        }
        let res = await this.props.wallet.tagVerifyMessage(params)

        if(res == true) {
          await this.processIncomingPacket(decodedPacket)
        } else {
          console.log('message signature isnt valid')
          // just ignore the message, maybe notify end user?
        }


      } else {
        console.log(this.state.lastReceivedPacket)
        console.log('message already processed!')
      }

    } catch (e) {
      // console.log(e)
    }
  }

  async processIncomingPacket (message) {
    console.log(message)
    let response = await parseIncomingPacket(message, this.props.wallet, this.props.activeAccount)
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

  async sendPacket(packet) {
    console.log(packet)
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

  async sendMessageRequest(packet) {
    await this.sendPacket(packet);
  }

  startCheckingForPeerInfo(){
    this.setState({
      peerIntervalTimer: setInterval(this.getPeerInfo.bind(this), 50000),
      packetIntervalTimer: setInterval(this.pollMessageReceiver.bind(this), 3000)
    });
  }

  async getPeerInfo(){
    //grab all peers from routing table
    let aodvResponse = await this.props.wallet.getAodvTable();
    // grab my routing tag
    let myId = await this.props.wallet.getRoutingPubKey();

    let peers = aodvResponse.mapkeyid;
    for (const [key, value] of Object.entries(peers)) {
      //create packet to send for data request and send packet
      let packet = new Packet(key, myId, 'peerInfoRequest', null, null)
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
    activeAccount: state.messaging.activeAccount
  };
};

export default connect(mapStateToProps, actions)(Messaging);
