import db from '../../../../utils/database/db'
const Conversation = db.Conversation;
const Message = db.Message;
class NewConversationMessageResponse {

  constructor(incomingPacket, walletInstance, activeAccount) {
    this.incomingPacket = incomingPacket;
    this.walletInstance = walletInstance;
  }

  async processData(){
    try {
      if(JSON.parse(this.incomingPacket.content)){
        this.message = Object.assign(new Message, JSON.parse(this.incomingPacket.content))

        let message = await Message.findByPk(this.message.id)

        if(message == null) {
          return null;
        }
        this.message.is_sent = true;
        await this.message.save()

      } else {
        console.log('cannot parse json peer packet')
      }

    }catch (e) {
      console.log(e)
    }
  }
}
export default NewConversationMessageResponse;



// export default connect(mapStateToProps, actions)(PeerInfoResponse);
