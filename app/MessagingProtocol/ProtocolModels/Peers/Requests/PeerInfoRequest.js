import UserPeer from './../Models/UserPeer'
import Packet from "../../../Packet";
import DatabaseMessage from "../../../DatabaseMessage";
const uuidv4 = require('uuid/v4')
class PeerInfoRequest {

  /**
   *
   *
   */
  constructor(walletInstance, incomingPacket, rpcProvider) {
    // super(walletInstance, incomingPacket);
    this.walletInstance = walletInstance;
    this.incomingPacket = incomingPacket;
    this.rpcProvider = rpcProvider;
  }

  async processData() {
    this.myKey = await this.walletInstance.getRoutingPubKey()
    // get peer data from database. (my account)
    try {
      let message = new DatabaseMessage('get', 'Peer', null)
      this.rpcProvider
        .rpc('processDataBaseMessage', {packet: message}
        )
        .then(async (response) => {
          console.log(response)
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
        });

    }catch (e) {
      console.log(e)
    }
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
