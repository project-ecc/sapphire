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
 * @param {Wallet} walletInstance
 * @returns {Promise<void>}
 */
async function processPacket(packet, walletInstance) {
  return parseIncomingPacket(packet, walletInstance)
}

async function sendPacket () {

}
