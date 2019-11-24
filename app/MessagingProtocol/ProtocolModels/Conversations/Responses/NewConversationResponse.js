import db from '../../../../utils/database/db'
const Peer = db.Peer;
class NewConversationResponse {

  constructor(incomingPacket, walletInstance) {
    this.incomingPacket = incomingPacket;
    this.walletInstance = walletInstance;
  }

  async processData(){
    this.myKey = await this.walletInstance.getRoutingPubKey()
    try {

    } catch (e) {
      console.log(e)
    }

    //process new peer info and put into data base.

  }

  returnData (){

  }
}
export default NewConversationResponse;



// export default connect(mapStateToProps, actions)(PeerInfoResponse);
