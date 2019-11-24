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
  switch (packet.type) {
    case "peerInfoRequest":
      return new PeerInfoRequest(walletInstance, packet).processData();
    case "peerInfoRequestProcessed":
      break;
    case "peerInfoResponse":
      return new PeerInfoResponse(walletInstance, packet).processData();
    case "peerInfoResponseProcessed":
      break;
    default:
      console.log('somehow in here')
      break;
  }
}
