import connect from "react-redux/es/connect/connect";
import * as actions from "../../../../actions";
import db from '../../../../utils/database/db'
import Packet from "../../../Packet";
import UserPeer from "../Models/UserPeer";
const Peer = db.Peer;
class PeerInfoResponse {

  constructor(incomingPacket, walletInstance, activeAccount) {
    this.incomingPacket = incomingPacket;
    this.walletInstance = walletInstance;
  }

  async processData(){
    this.myKey = await this.walletInstance.getRoutingPubKey()
    try {
      if(JSON.parse(this.incomingPacket.content)){
        let peerInfoPacket = Object.assign(new UserPeer, JSON.parse(this.incomingPacket.content))
        let peer = await Peer
          .findByPk(peerInfoPacket.id)
          .then((obj) => {
            // update
            if(obj)
              return obj.update({
                display_image: peerInfoPacket.display_image,
                display_name: peerInfoPacket.display_name,
                public_payment_address: peerInfoPacket.public_payment_address,
                private_payment_address: peerInfoPacket.private_payment_address,
                last_seen: moment().unix()
              });
            // insert
            return Peer.create({
              id: peerInfoPacket.id,
              display_image: peerInfoPacket.display_image,
              display_name: peerInfoPacket.display_name,
              public_payment_address: peerInfoPacket.public_payment_address,
              private_payment_address: peerInfoPacket.private_payment_address,
              last_seen: moment().unix()
            });
          })
        return this.returnData()
      } else {
        console.log('cannot parse json peer packet')
      }

    } catch (e) {
      console.log(e)
    }

    //process new peer info and put into data base.

  }

  returnData (){
    return new Packet(
      this.incomingPacket._from,
      this.myKey,
      'peerInfoResponseProcessed',
      null
    )
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
