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

        return this.returnData()
      } else {
        console.log('cannot parse json peer packet')
      }

    // let conversation = await Conversation.findOne(
    //   {
    //     where: {
    //       owner_id: this.props.activeAccount.id,
    //       conversation_type: 'PRIVATE'
    //     }
    //   })
    // console.log(conversation)
    // if(conversation == null) {
    //   conversation = await Conversation.create({
    //     conversation_type: 'PRIVATE',
    //     owner_id: this.props.activeAccount.id
    //   })
    // }
    //
    // //find my peer from active account
    // const myPeer = await Peer.findByPk(this.props.activeAccount.id)
    // // add peers to conversation
    // conversation.addConversationPeers(myPeer, { through: { role: 'admin' }});
    // conversation.addConversationPeers(this.state.peer, { through: { role: 'admin' }});
    // console.log(conversation)
    // conversation.participants_count = 2
    // await conversation.save()
    // // create message object
    // const messageObject = {
    //   content: messageData,
    //   owner_id: myPeer.id,
    //   date: moment.now(),
    // };
    //
    // let message = await Message.create(messageObject)
    //
    // conversation.addMessage(message)
      //package up into userPeer.js model

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
