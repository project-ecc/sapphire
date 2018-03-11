import Client from 'bitcoin-core';
import shell from 'node-powershell';
import {getPlatformWalletUri} from "./platform.service";

const { exec, spawn } = require('child_process');

var client = undefined;

export default class Wallet {

  constructor(username = "yourusername", password = "yourpassword"){
    client = new Client({
      host: '127.0.0.1',
      port: 19119,
      username: username,
      password: password
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

  getReceivedByAddress(address) {
    return new Promise((resolve, reject) => {
      client.getReceivedByAddress(address).then((amount) => {
        return resolve(amount);
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

  getTransactions(account, count, skip) {
    return new Promise((resolve, reject) => {
      let a = account;
      if (a === null) {
        a = '*';
      }
      client.listTransactions(a, count, skip).then((transactions) => {
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

  async getblockcount() {
    const result = await client.getBlockCount();
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
      const ntime = parseInt(time)
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

  walletstart(cb) {
    let path = getPlatformWalletUri();
    if (process.platform === 'linux') {
      runExec(`chmod +x "${path}" && "${path}"`, 1000).then(() => {
        return cb(true);
      })
        .catch(() => {
          cb(false);
        });
    } else if (process.platform === 'darwin') {
      console.log(path)
      runExec(`chmod +x "${path}" && "${path}"`, 1000).then(() => {
        return cb(true);
      })
        .catch((err) => {
          console.log(err)
          cb(false);
        });
    } else if (process.platform.indexOf('win') > -1) {
      path = `& "${path}"`;
      const ps = new shell({ //eslint-disable-line
        executionPolicy: 'Bypass',
        noProfile: true
      });

      ps.addCommand(path);
      ps.invoke()
        .then(() => {
          return cb(true);
        })
        .catch(err => {
          console.log(err);
          cb(false);
          ps.dispose();
        });
    }
  }
}

function runExec(cmd, timeout, cb) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve('program exited without an error');
      }
    });
    setTimeout(() => {
      resolve('program still running');
    }, timeout);
  });
}
