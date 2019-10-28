import {RpcProvider} from 'worker-rpc';

const rpcProvider = new RpcProvider(
  (message, transfer) => postMessage(message, transfer)
);

onmessage = e => rpcProvider.dispatch(e.data);

rpcProvider.registerRpcHandler('processMessage',  processMessage);

async function processMessage() {

}
