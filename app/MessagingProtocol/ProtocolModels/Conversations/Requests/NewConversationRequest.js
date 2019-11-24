import Packet from "../../../Packet";
import db from '../../../../utils/database/db'
const Conversation = db.Conversation;
class NewConversationRequest {
F
  /**
   *
   *
   */
  constructor(incomingPacket, walletInstance) {
    this.incomingPacket = incomingPacket;
    this.walletInstance = walletInstance;
  }

  async processData() {
    console.log(this.incomingPacket)
    this.myKey = await this.walletInstance.getRoutingPubKey()
    try {

      //package up into userPeer.js model
      return this.returnData()

    }catch (e) {
      console.log(e)
    }
  }

  returnData()
  {
    return new Packet(
      this.incomingPacket._from,
      this.myKey,
      'newConversationResponse',
      null
    )
  }
}

export default NewConversationRequest;
