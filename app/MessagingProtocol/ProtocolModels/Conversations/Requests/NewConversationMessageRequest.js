import Packet from "../../../Packet";
import db from '../../../../utils/database/db'
const event = require('../../../../utils/eventhandler');
import moment from "moment";
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

        let message = await Message.create({
          id: this.message.id,
          content: this.message.content,
          owner_id: this.message.owner_id,
          date: this.message.date,
          conversation_id: this.message.conversation_id,
          is_sent:true
        })
        conversation.addMessage(message)
        await conversation.save()
        event.emit('reloadConversation')
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
