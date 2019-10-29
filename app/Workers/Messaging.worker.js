import {RpcProvider} from 'worker-rpc';
import Packet from "../MessagingProtocol/Packet";
import {parseIncomingPacket} from "../MessagingProtocol/ParseIncomingPacket";

const rpcProvider = new RpcProvider(
  (message, transfer) => postMessage(message, transfer)
);

onmessage = e => rpcProvider.dispatch(e.data);

rpcProvider.registerRpcHandler('processPacket',  processPacket);

/**
 *
 * @param {Packet} packet
 * @returns {Promise<void>}
 */
async function processPacket(packet) {
  let decodedPacket = Object.assign(new Packet, packet.toString('hex'))
  return parseIncomingPacket(decodedPacket)
}

async function sendPacket () {

}
