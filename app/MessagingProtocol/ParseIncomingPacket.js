import PeerInfoRequest from "./ProtocolModels/Peers/Requests/PeerInfoRequest";
import PeerInfoResponse from "./ProtocolModels/Peers/Responses/PeerInfoResponse";

/**
 *
 * @param {Packet} packet
 * @returns {*}
 */
export function parseIncomingPacket (packet){
  switch (packet.type) {
    case "peerInfoRequest":
      return new PeerInfoRequest().processData();
      break;
    case "peerInfoResponse":
      return new PeerInfoResponse(packet.content).processData();
    default:
      break;
  }
}
