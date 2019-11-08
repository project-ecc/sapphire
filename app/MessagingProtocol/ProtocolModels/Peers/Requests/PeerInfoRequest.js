import UserPeer from './../Models/UserPeer'
import Packet from "../../../Packet";
const uuidv4 = require('uuid/v4')
class PeerInfoRequest {

  /**
   *
   *
   */
  constructor(walletInstance, incomingPacket) {
    // super(walletInstance, incomingPacket);
    this.walletInstance = walletInstance;
    this.incomingPacket = incomingPacket;
  }

  async processData() {
    this.myKey = await this.walletInstance.getRoutingPubKey()
    // get peer data from database. (my account)
    try {
      this.peer = new UserPeer(
        uuidv4(),
        this.myKey,
        "Dolaned",
        '',
        '',
        '',
        ''
      );
    }catch (e) {
      console.log(e)
    }

    //package up into userPeer.js model
    return this.returnData()
  }

  returnData()
  {
    return new Packet(
      this.incomingPacket._from,
      this.myKey,
      'peerInfoResponse',
      JSON.stringify(this.peer)
    )
  }
}

export default PeerInfoRequest;
