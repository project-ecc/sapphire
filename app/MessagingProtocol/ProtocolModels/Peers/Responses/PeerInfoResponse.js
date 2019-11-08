class PeerInfoResponse {

  constructor(walletInstance, incomingPacket, rpcProvider) {
    this.walletInstance = walletInstance;
    this.incomingPacket = incomingPacket;
    this.rpcProvider = rpcProvider;
  }

  processData(){

    console.log(this.incomingPacket)
    //process new peer info and put into data base.

  }

  returnData (){
    return true
  }
}
export default PeerInfoResponse;
