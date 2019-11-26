import Packet from "../../../Packet";
import db from '../../../../utils/database/db'
const Conversation = db.Conversation;
const Message = db.Message;
class NewConversationMessageRequest {
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
        this.message = Object.assign(new Message, JSON.parse(this.incomingPacket.content))

        let conversation = await Conversation.findOne(
          {
            where: {
              id: this.message.conversation_id
            }
          })

        if(conversation == null) {
          return null;
        }
        this.message.is_sent = true;
        conversation.addMessage(this.message)
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
      'newConversationMessageResponse',
      JSON.stringify(this.message)
    )
  }
}

export default NewConversationMessageRequest;
