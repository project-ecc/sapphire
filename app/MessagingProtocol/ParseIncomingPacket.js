import PeerInfoRequest from "./ProtocolModels/Peers/Requests/PeerInfoRequest";
import PeerInfoResponse from "./ProtocolModels/Peers/Responses/PeerInfoResponse";

/**
 *
 * @param {Packet} packet
 * @param walletInstance
 * @param rpcProvider
 * @returns {*}
 */
export function parseIncomingPacket (packet, walletInstance){
  console.log(packet.type)
  try {
    switch (packet.type) {
      case "peerInfoRequest":
        return new PeerInfoRequest(packet, walletInstance).processData();
      case "peerInfoRequestProcessed":
        break;
      case "peerInfoResponse":
        return new PeerInfoResponse(packet, walletInstance).processData();
      case "peerInfoResponseProcessed":
        break;
      default:
        console.log('somehow in here')
        break;
    }
  } catch (e) {
    console.log(e)
  }

}
