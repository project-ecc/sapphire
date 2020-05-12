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
  constructor(incomingPacket, walletInstance, activeAccount) {
    this.incomingPacket = incomingPacket;
    this.walletInstance = walletInstance;
  }

  async processData() {
    this.myKey = await this.walletInstance.getRoutingPubKey()
    console.log(this.myKey)
    // get peer data from database. (my account)
    try {

      this.peer = await MyAccountDatabase
        .findByPk(this.myKey)
        .then((obj) => {
          // update
          if (obj)
            return obj
          // insert
          return null
        });
      //package up into userPeer.js model
      if(this.peer != null){
        return this.returnData()
      }

    }catch (e) {
      console.log(e)
    }
  }

  returnData()
  {
    console.log(this.peer)
    return new Packet(
      this.incomingPacket._from,
      this.myKey,
      'peerInfoResponse',
      JSON.stringify(this.peer)
    )
  }
}
export default PeerInfoRequest;
