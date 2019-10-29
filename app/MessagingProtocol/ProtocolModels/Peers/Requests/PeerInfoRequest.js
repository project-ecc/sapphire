import AbstractRequest from "../../AbstractRequest";

class PeerInfoRequest extends AbstractRequest {

  /**
   *
   *
   */
  constructor() {
    super();
  }

  processData() {
    // get peer data from database. (my account)
    this.peer = new UserPeer();
    //package up into userPeer.js model
    return this.returnData()
  }

  returnData()
  {
    //return peer model ready to be serialzed by the data packet
  }
}

export default PeerInfoRequest;
