import PeerInfoRequest from "./ProtocolModels/Peers/Requests/PeerInfoRequest";
import PeerInfoResponse from "./ProtocolModels/Peers/Responses/PeerInfoResponse";

/**
 *
 * @param {Packet} packet
 * @param walletInstance
 * @param rpcProvider
 * @returns {*}
 */
export function parseIncomingPacket (packet, walletInstance, rpcProvider){
  switch (packet._type) {
    case "peerInfoRequest":
      return new PeerInfoRequest(walletInstance, packet, rpcProvider).processData();
    case "peerInfoRequestProcessed":
      break;
    case "peerInfoResponse":
      return new PeerInfoResponse(walletInstance, packet, rpcProvider).processData();
    case "peerInfoResponseProcessed":
      break;
    default:
      console.log('somehow in here')
      break;
  }
}
