import PeerInfoRequest from "./ProtocolModels/Peers/Requests/PeerInfoRequest";
import PeerInfoResponse from "./ProtocolModels/Peers/Responses/PeerInfoResponse";
import NewConversationRequest from "./ProtocolModels/Conversations/Requests/NewConversationRequest";
import NewConversationResponse from "./ProtocolModels/Conversations/Responses/NewConversationResponse";
import NewConversationMessageResponse from "./ProtocolModels/Conversations/Responses/NewConversationMessageResponse";
import NewConversationMessageRequest from "./ProtocolModels/Conversations/Requests/NewConversationMessageRequest";


/**
 *
 * @param {Packet} packet
 * @param walletInstance
 * @param activeAccount
 * @returns {*}
 */
export function parseIncomingPacket (packet, walletInstance, activeAccount){
  try {
    switch (packet.type) {
      case "peerInfoRequest":
        return new PeerInfoRequest(packet, walletInstance, activeAccount).processData();
      case "peerInfoRequestProcessed":
        break;
      case "peerInfoResponse":
        return new PeerInfoResponse(packet, walletInstance, activeAccount).processData();
      case "peerInfoResponseProcessed":
        break;
      case "newConversationRequest":
        return new NewConversationRequest(packet, walletInstance, activeAccount).processData();
      case "newConversationResponse":
        return new NewConversationResponse(packet, walletInstance, activeAccount).processData();
      case "newConversationMessageRequest":
        return new NewConversationMessageRequest(packet, walletInstance, activeAccount).processData();
      case "newConversationMessageResponse":
        return new NewConversationMessageResponse(packet, walletInstance, activeAccount).processData();
      default:
        console.log('somehow in here')
        break;
    }
  } catch (e) {
    console.log(e)
  }

}
