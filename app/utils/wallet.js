import Client from 'eccoin-js';
import Shell from 'node-powershell';
import {getPlatformWalletUri} from './platform.service';
import {runExec, runExecFile} from './../globals/runExec';

let client;

export default class Wallet {
  constructor(username = 'yourusername', password = 'yourpassword') {
    client = new Client({
      host: '127.0.0.1',
      // network: 'testnet',
      // port: 30001,
      port: 19119,
      username,
      password
    });
  }

  help() {
    return new Promise((resolve, reject) => {
      client.help().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  clearBanned() {
    return new Promise((resolve, reject) => {
      client.clearBanned().then((response) => {
        return resolve(response);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  listReceivedByAddress() {
    return new Promise((resolve, reject) => {
      client.listReceivedByAddress().then((response) => {
        return resolve(response);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  listAddressGroupings() {
    return new Promise((resolve, reject) => {
      client.listAddressGroupings().then((response) => {
        return resolve(response);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getAllInfo() {
    return new Promise((resolve, reject) => {
      const batch = [];
      batch.push({ method: 'getInfo' });
      batch.push({ method: 'listtransactions', parameters: ['*', 100, 0] });
      batch.push({ method: 'listreceivedbyaddress', parameters: [0, true] });
      batch.push({ method: 'listaddressgroupings' });
      batch.push({ method: 'getwalletinfo' });

      client.command(batch).then((responses) => {
        try {
          if (responses[0].name === 'RpcError') { return resolve(undefined); }
        } catch (e) {}
        return resolve(responses);
      }).catch((err) => {
        return resolve(undefined);
      });
    });
  }

  listAccounts() {
    return new Promise((resolve, reject) => {
      client.listAccounts().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getRawTransaction(id) {
    return new Promise((resolve, reject) => {
      client.getRawTransaction(id, 1).then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getAddressesByAccount(account) {
    return new Promise((resolve, reject) => {
      client.getAddressesByAccount(account).then((addresses) => {
        return resolve(addresses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getAllAddresses() {
    return new Promise((resolve, reject) => {
      client.listAddressGroupings().then((addresses) => {
        return resolve(addresses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getReceivedByAddress(address) {
    return new Promise((resolve, reject) => {
      client.getReceivedByAddress(address).then((amount) => {
        return resolve(amount);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  dumpPrivKey(address) {
    return new Promise((resolve, reject) => {
      client.dumpPrivKey(address).then((privKey) => {
        return resolve(privKey);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  command(batch) {
    return new Promise((resolve, reject) => {
      client.command(batch).then((responses) => {
        return resolve(responses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getInfo() {
    return new Promise((resolve, reject) => {
      client.getInfo().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getWalletInfo() {
    return new Promise((resolve, reject) =>{
      client.getWalletInfo().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    })
  }

  getMiningInfo() {
    return new Promise((resolve, reject) =>{
      client.getMiningInfo().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    })
  }


  getTransactions(count, skip) {
    return new Promise((resolve, reject) => {

      client.listTransactions(count, skip).then((transactions) => {
        return resolve(transactions);
      }).catch((err) => {
        return reject(null);
      });
    });
  }

  listAllAccounts() {
    return new Promise((resolve, reject) => {
      client.listReceivedByAddress(0, true).then((addresses) => {
        return resolve(addresses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getANSRecord(address) {
    return new Promise((resolve, reject) => {
      client.command([{ method: 'getansrecord', parameters: [address, 'PTR'] }]).then(record => {
        return resolve(record[0][0]);
      }).catch(err => {
        return reject(err);
      });
    });
  }

  setGenerate() {
    return client.setGeneratepos();
  }

  async createNewAddress(nameOpt) {
    const name = nameOpt || null;
    let newAddress;
    if (name === null) {
      newAddress = await client.getNewAddress();
    } else {
      newAddress = await client.getNewAddress(name);
    }
    return newAddress;
  }

  async listAddresses() {
    return new Promise((resolve, reject) => {
      client.listAddresses().then(data => {
        return resolve(data);
      }).catch(err => {
        return reject(err);
      });
    });
  }

  async importPrivateKey(key) {
    return await client.ImportPrivKey(key);
  }

  async sendMoney(sendAddress, amount) {
    const amountNum = parseFloat(amount);
    const sendAddressStr = `${sendAddress}`;
    await client.sendToAddress(sendAddressStr, amountNum);
  }

  async setTxFee(amount) {
    const amountNum = parseFloat(amount);
    await client.setTxFee(amountNum);
  }

  async validate(address) {
    const result = await client.validateAddress(address);
    return result;
  }

  async getTransaction(txid) {
      const data = await client.getTransaction(txid);
      return data;
  }

  async getblockcount() {
    const result = await client.getBlockCount();
    return result;
  }

  async getBlockChainInfo() {
    const result = await client.getBlockchainInfo();
    return result;
  }

  async getblockhash(hash) {
    const result = await client.getBlockHash(hash);
    return result;
  }

  async getpeerinfo() {
    const result = await client.getPeerInfo();
    return result;
  }

  async encryptWallet(passphrase) {
    try {
      const result = await client.encryptWallet(passphrase);
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletlock() {
    try {
      const result = await client.walletLock();
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletpassphrase(passphrase, time) {
    try {
      const ntime = parseInt(time);
      const result = await client.walletPassphrase(passphrase, ntime);
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletChangePassphrase(oldPassphrase, newPassphrase) {
    try {
      const result = await client.walletPassphraseChange(oldPassphrase, newPassphrase);
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletstop() {
    try {
      return await client.stop();
    } catch (err) {
      return err;
    }
  }

  async reconsiderBlock(hash){
    try {
      return await client.reconsiderBlock(hash);
    } catch (err) {
      return err;
    }
  }

  async invalidateBlock(hash){
    try {
      return await client.invalidateBlock(hash);
    } catch (err) {
      return err;
    }
  }
  async getBestBlockHash(){
    try {
      return await client.getBestBlockHash();
    } catch (err) {
      return err;
    }
  }

  async sendPacket(params){
    try {
      return await client.sendpacket(params.key, params.protocolId, params.protocolVersion, params.message);
    } catch (err) {
      return err;
    }
  }

  async readLastPacket(params){
    try {
      return await client.readlastpacket(params.protocolId, params.protocolVersion);
    } catch (err) {
      return err;
    }
  }

  async getRoutingPubKey(){
    try {
      return await client.getroutingpubkey();
    } catch (err) {
      return err;
    }
  }

  async runWalletWithOptions(path, options){
    // options = options.join(" ");
    return new Promise(async (resolve, reject) => {
      if (process.platform === 'linux' || process.platform === 'darwin') {
        await runExec(`chmod +x "${path}"`, 1000)
          .then(() => {
            runExecFile(path, options).then((data)=>{
              return resolve(data);
            }).catch((err)=>{
              reject(err);
            })
          })
          .catch((err) => {
            reject(err);
          });
      } else if (process.platform.indexOf('win') > -1) {
        let command = ''

        if(options.join(' ').indexOf('version') > -1){
          command = `${path} -version`;
          console.log(command)
        } else {
          command = `& start-process "${path}" -ArgumentList "${options.join(' ')}" -verb runAs -WindowStyle Hidden`;
          console.log(command)
        }

        const ps = new Shell({
          executionPolicy: 'Bypass',
          noProfile: true
        });
        ps.addCommand(command);
        ps.invoke()
          .then(data => {
            console.log(data)
            return resolve(data);
          })
          .catch(err => {
            console.log(err);
            ps.dispose();
            return reject(err);
          });
      }
    });
  }

  walletstart(rescan = false) {
    console.log('in wallet start');
    return new Promise(async (resolve, reject) => {
      let options = [];
      options.push('-daemon');
      if(rescan == true){
        options.push('-reindex');
      }
      let path = getPlatformWalletUri();
      this.runWalletWithOptions(path, options).then(()=>{
        resolve(true);
      }).catch((err)=>{
        reject(err)
      })
    });
  }

  getWalletVersion(){
    return new Promise(async (resolve, reject) => {
      let path = getPlatformWalletUri();
      this.runWalletWithOptions(path, ['-version']).then((data)=>{
        // Eccoind version v0.2.5.15-06804e7
        let firstLine = data.split(/\r?\n/)[0];
        let splitOnSpace = firstLine.split(" ")[2];
        let cleaned = splitOnSpace.split("-")[0];
        // this will return vxx.xx.xx.xx IE v0.2.5.15
        resolve(cleaned);
      }).catch((err)=>{
        reject(err)
      })
    });
  }
}
