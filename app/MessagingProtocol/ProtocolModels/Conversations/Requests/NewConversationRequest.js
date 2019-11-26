import Packet from "../../../Packet";
import db from '../../../../utils/database/db'
import moment from "moment";
import UserPeer from "../../Peers/Models/UserPeer";
const Conversation = db.Conversation;
class NewConversationRequest {
  /**
   *
   *
   */
  constructor(incomingPacket, walletInstance, activeAccount) {
    this.incomingPacket = incomingPacket;
    this.walletInstance = walletInstance;
  }

  async processData() {
    this.myKey = await this.walletInstance.getRoutingPubKey()
    try {
      if(JSON.parse(this.incomingPacket.content)){
        this.conversation = Object.assign(new Conversation, JSON.parse(this.incomingPacket.content))
        console.log(this.conversation)


        let conversation = await Conversation.create({
          id: this.conversation.id,
          conversation_type: this.conversation.conversation_type,
          owner_id: this.conversation.owner_id,
          conversation_name: this.conversation.conversation_name,
          conversation_image: this.conversation.image,
          created_at: this.conversation.created_at,
          participants_count: this.conversation.participants_count
        })


        const conversationPeers = this.conversation.conversationPeers
        for (const key in conversationPeers) {
          conversation.addConversationPeers(conversationPeers[key], { through: { role: conversationPeers[key].conversation_users.role }});
        }

        const conversationMessages = this.conversation.messages
        for (const key in conversationMessages) {
          conversation.addMessage(conversationPeers[key]);
        }
        await conversation.save()

        return this.returnData()
      } else {
        console.log('cannot parse json peer packet')
      }

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
      JSON.stringify(this.conversation)
    )
  }
}

export default NewConversationRequest;
