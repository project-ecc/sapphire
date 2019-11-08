import {RpcProvider} from 'worker-rpc';
import Packet from "../MessagingProtocol/Packet";
import {parseIncomingPacket} from "../MessagingProtocol/ParseIncomingPacket";
import Wallet from "../utils/wallet";
const rpcProvider = new RpcProvider(
  (message, transfer) => postMessage(message, transfer)
);

let wallet = null;

onmessage = e => rpcProvider.dispatch(e.data);

rpcProvider.registerRpcHandler('processPacket',  processPacket);
rpcProvider.registerRpcHandler('initWorkerWalletConnection',  initWorkerWalletConnection);

/**
 *
 * @param {Packet} args.message
 * @param {Wallet} args.walletInstance
 * @returns {Promise<void>}
 */
async function processPacket(args) {
  return parseIncomingPacket(args.packet, wallet, rpcProvider);
}

async function sendPacket () {

}

async function initWorkerWalletConnection (args) {
  try {
    wallet = new Wallet(args.username, args.password)
  }catch (e) {
    console.log(e)
    return false
  }
  return true
}
