import AbstractRequest from "../../AbstractRequest";
import Packet from "../../../Packet";
const uuidv4 = require('uuid/v4')
class PeerInfoRequest extends AbstractRequest {

  /**
   *
   *
   */
  constructor(walletInstance, incomingPacket) {
    super();
    this.walletInstance = walletInstance;
    this.incomingPacket = incomingPacket;
  }

  async processData() {
    this.myKey = await this.walletInstance.getRoutingPubKey()
    // get peer data from database. (my account)
    this.peer = new UserPeer(
      uuidv4(),
      this.myKey,
      "Dolaned",
      '',
      '',
      '',
      ''
    );

    //package up into userPeer.js model
    return this.returnData()
  }

  returnData()
  {
    return new Packet(
      this.incomingPacket.from,
      this.myKey,
      'peerInfoResponse',
      JSON.stringify(this.peer)
    )
  }
}

export default PeerInfoRequest;
