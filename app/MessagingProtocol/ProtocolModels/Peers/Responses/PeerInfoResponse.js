import AbstractResponse from "../../AbstractResponse";

class PeerInfoResponse extends AbstractResponse {

  constructor(walletInstance, incomingPacket) {
    super();
    this.walletInstance = walletInstance;
    this.incomingPacket = incomingPacket;
  }

  processData(){

    console.log(this.incomingPacket)
    //process new peer info and put into data base.

  }

  returnData (){

  }
}
export default PeerInfoResponse;
