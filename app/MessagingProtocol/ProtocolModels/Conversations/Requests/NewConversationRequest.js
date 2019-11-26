import Packet from "../../../Packet";
import db from '../../../../utils/database/db'
import moment from "moment";
import UserPeer from "../../Peers/Models/UserPeer";
const Conversation = db.Conversation;
const Peer =  db.Peer;
const Message = db.Message
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
        console.log(conversationPeers)
        for (const key in conversationPeers) {

          let peer = await Peer
            .findByPk(conversationPeers[key].id)
            .then(async (obj) => {
              // update
              if (obj)
                return obj
              // insert
              return await Peer.create({
                id: conversationPeers[key].id,
                display_image: conversationPeers[key].display_image,
                display_name: conversationPeers[key].display_name,
                public_payment_address: conversationPeers[key].public_payment_address,
                private_payment_address: conversationPeers[key].private_payment_address,
                last_seen: 0
              });
            });

          conversation.addConversationPeers(peer, { through: { role: conversationPeers[key].conversation_users.role }});
        }

        const conversationMessages = this.conversation.messages
        console.log(conversationMessages)
        for (const key in conversationMessages) {
          let message = await Message.create({
            id: conversationMessages[key].id,
            content: conversationMessages[key].content,
            owner_id: conversationMessages[key].owner_id,
            date: conversationMessages[key].date,
          })
          conversation.addMessage(message);
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
