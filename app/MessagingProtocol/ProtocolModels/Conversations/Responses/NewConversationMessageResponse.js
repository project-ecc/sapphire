import db from '../../../../utils/database/db'
const Peer = db.Peer;
class NewConversationMessageResponse {

  constructor(incomingPacket, walletInstance, activeAccount) {
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
export default NewConversationMessageResponse;



// export default connect(mapStateToProps, actions)(PeerInfoResponse);
