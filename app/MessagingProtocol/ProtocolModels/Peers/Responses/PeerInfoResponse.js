import connect from "react-redux/es/connect/connect";
import * as actions from "../../../../actions";
import db from '../../../../utils/database/db'
const Peer = db.Peer;
class PeerInfoResponse {

  constructor(incomingPacket, walletInstance) {
    this.incomingPacket = incomingPacket;
    this.walletInstance = walletInstance;
  }

  async processData(){
    try {
      console.log(this.incomingPacket)
      if(JSON.parse(this.incomingPacket.content)){
        let peerInfoPacket = JSON.parse(this.incomingPacket.content)
        let peer = await Peer
          .findByPk(peerInfoPacket.peerId)
          .then((obj) => {
            // update
            if(obj)
              return obj.update(this.incomingPacket);
            // insert
            return Peer.create(this.incomingPacket);
          })
        return this.returnData()
      }

    } catch (e) {
      console.log(e)
    }

    //process new peer info and put into data base.

  }

  returnData (){
    return true
  }
}
export default PeerInfoResponse;
// const mapStateToProps = state => {
//   return {
//     lang: state.startup.lang,
//     wallet: state.application.wallet
//   };
// };



// export default connect(mapStateToProps, actions)(PeerInfoResponse);
