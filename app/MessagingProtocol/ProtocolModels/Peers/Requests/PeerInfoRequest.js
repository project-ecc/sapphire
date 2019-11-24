import Packet from "../../../Packet";
import connect from "react-redux/es/connect/connect";
import * as actions from "../../../../actions";
import db from '../../../../utils/database/db'
import UserPeer from "../Models/UserPeer";

const uuidv4 = require('uuid/v4')
const MyAccountDatabase = db.MyAccount;
class PeerInfoRequest {

  /**
   *
   *
   */
  constructor(walletInstance, incomingPacket) {
    // super(walletInstance, incomingPacket);
    this.incomingPacket = incomingPacket;
  }

  async processData() {
    this.myKey = await this.props.wallet.getRoutingPubKey()
    // get peer data from database. (my account)
    try {

      this.peer = await MyAccountDatabase
        .findByPk(this.myKey)
        .then((obj) => {
          // update
          if (obj)
            return new UserPeer(
              uuidv4(),
              obj.id,
              obj.display_name,
              obj.display_image,
              obj.public_payment_address,
              obj.private_payment_address
            );
          // insert
          return null
        });
      //package up into userPeer.js model
      return this.returnData()

    }catch (e) {
      console.log(e)
    }
  }

  returnData()
  {
    return new Packet(
      this.incomingPacket._from,
      this.myKey,
      'peerInfoResponse',
      JSON.stringify(this.peer)
    )
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};



export default connect(mapStateToProps, actions)(PeerInfoRequest);

// export default connect() PeerInfoRequest;
