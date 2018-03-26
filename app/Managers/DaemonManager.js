const electron = require('electron');
const fs = require('fs');
const { app } = require('electron');
const request = require('request-promise-native');
const homedir = require('os').homedir();
const event = require('../utils/eventhandler');
const os = require('os');
const extract = require('extract-zip');
const https = require('https');
const psList = require('ps-list');
const checksum = require('checksum');

import Wallet from '../utils/wallet';
import { getPlatformWalletUri, grabWalletDir, grabEccoinDir, getDaemonDownloadUrl, getPlatformFileName } from '../utils/platform.service';
import Tools from '../utils/tools';

/*
*	Handles daemon updates and the daemon'state
*/
class DaemonManager {

  constructor() {
    this.path = `${grabWalletDir()}`;
    this.versionPath = `${grabWalletDir()}wallet-version.txt`;
    this.installedVersion = -1;
    this.currentVersion = -1;
    this.walletDat = false;
    this.downloading = false;
    this.arch = os.arch();
    this.os = process.platform;
    this.arch = process.arch;
    this.running = false;
    this.initialSetup();
    this.wallet = new Wallet();
    this.toldUserAboutUpdate = false;
    this.shouldRestart = undefined;
  }

  async initialSetup() {
    event.on('start', () => {
      this.startDaemon((started) => {
        if (started) {
          event.emit('daemonStarted');
        }				else event.emit('daemonFailed');
      });
    });

    event.on('stop', () => {
      this.stopDaemon((err) => {
        if (err) console.log('error stopping daemon: ', err);
        console.log('stopped daemon');
      });
    });
    event.on('updateDaemon', (shouldRestart) => {
      this.shouldRestart = shouldRestart;
      this.updateDaemon();
    });
		/* var daemonCredentials = await Tools.readRpcCredentials();
    	//exists -> try to stop it
    	this.installedVersion = await this.checkIfDaemonExists();
	    if(this.installedVersion != -1 && daemonCredentials){
	    	this.wallet = new Wallet(daemonCredentials.username, daemonCredentials.password)
	    	await this.stopDaemon();
	    }
		if(!daemonCredentials || daemonCredentials.username == "yourusername" || daemonCredentials.password == "yourpassword"){
			daemonCredentials = {
				username: Tools.generateId(5),
				password: Tools.generateId(5)
			}
			var result = await Tools.updateOrCreateConfig(daemonCredentials.username, daemonCredentials.password)
			this.wallet = new Wallet(daemonCredentials.username, daemonCredentials.password)
		} */

    console.log('going to check daemon version');
    this.installedVersion = await this.checkIfDaemonExists();
		// on startup daemon should not be running unless it was to update the application
    	// if(this.installedVersion != -1 ){
	    //	await this.stopDaemon();
	    // }
	    this.walletDat = await this.checkIfWalletExists();
     	do {
     		console.log('getting latest version');
     		await this.getLatestVersion();
     	} while (this.currentVersion != -1);
	     console.log('got latest version');
	    if (this.installedVersion == -1) {
	    	do {
	    		await this.downloadDaemon();
	    	} while (this.installedVersion == -1);
	    	console.log('telling electron about wallet.dat');
	    	event.emit('wallet', this.walletDat);
	    } else			{ event.emit('wallet', this.walletDat); }

		// if there is a wallet then start the daemon
    if (this.walletDat) { this.startDaemonChecker(); }
  }

  startDaemonChecker() {
    this.checkIfDaemonIsRunning();
    this.intervalID = setInterval(this.checkIfDaemonIsRunning.bind(this), 60000);
    this.intervalIDCheckUpdates = setInterval(this.getLatestVersion.bind(this), 6000000);
  }

  checkIfDaemonIsRunning() {
    if (this.installedVersion != -1 && !this.downloading) {
      const self = this;
      psList().then(data => {
			    for (let i = 0; i < data.length; i++) {
				    if (data[i].name.toLowerCase().indexOf('eccoind') > -1) {
				     self.running = true;
				     console.log('Daemon running');
				     return;
				 }
    }
        self.running = false;
        console.log('daemon not running');
        if (!self.downloading) { self.startDaemon(); }
      });
    }
  }

 	startDaemon(cb) {
   console.log('starting daemon...');
	    this.wallet.walletstart((result) => {
	      if (result) {
	      	cb(result);
	      }
	    });
 }

  async stopDaemon() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.wallet.walletstop()
		      .then((data) => {
		      	if (data && data == 'ECC server stopping') {
		      		console.log('stopping daemon');
		      		resolve(true);
		      	}		      	else if (data && data.code === 'ECONNREFUSED') {
		      		resolve(true);
		      	}		      	else {
		      		resolve(false);
		      	}
		      })
		      .catch(err => {
		        console.log('failed to stop daemon:', err);
		        resolve(false);
		      });
	  	});
  }

  checkForUpdates() {
    if (this.installedVersion != -1 && this.installedVersion != this.currentVersion && !this.toldUserAboutUpdate) {
      console.log('installed: ', this.installedVersion);
      console.log('current: ', this.currentVersion);
      this.toldUserAboutUpdate = true;
      event.emit('daemonUpdate');
    }
  }

  async updateDaemon() {
    console.log('daemon manager got update call');
    const r = await this.stopDaemon();
    if (r) {
      const self = this;
      setTimeout(async () => {
        let downloaded = false;
        do {
          downloaded = await self.downloadDaemon();
        } while (!downloaded);
        event.emit('updatedDaemon');
        if (self.shouldRestart) { self.startDaemon(); }
        this.toldUserAboutUpdate = false;
      }, 7000);
    }
  }


  async checkIfDaemonExists() {
    if (fs.existsSync(getPlatformWalletUri())) {
		    try {
	    		var data = fs.readFileSync(this.versionPath, 'utf8');
    } catch (e) {
      console.log('daemon.txt does not exist');
      return -1;
    }
      console.log('daemon exists, version: ', data);
      return data.split(' ')[1];
    }		else if (!fs.existsSync(this.path) && fs.mkdirSync(this.path)) {
      console.log('daemon does not exist');
      return -1;
    }
    return -1;
  }

  async checkIfWalletExists() {
    	if (!fs.existsSync(grabEccoinDir())) {
    		fs.mkdirSync(grabEccoinDir());
    		return false;
    	}
    if (fs.existsSync(`${grabEccoinDir()}wallet.dat`)) {
      console.log('wallet exists');
      return true;
    }

    console.log('wallet does not exist');
    return false;
  }

  async getLatestVersion() {
    const opts = {
		  url: 'https://api.github.com/repos/Greg-Griffith/eccoin/releases/latest',
      headers: {
        'User-Agent': 'request'
      }
    };
    const self = this;
    request(opts)
	      .then((response) => {
        const parsed = JSON.parse(response);
        const githubVersion = parsed.name.split(' ')[1];
        self.currentVersion = githubVersion;
        self.checkForUpdates();
	      })
	      .catch(error => {
	      	console.log(error);
	      });
  }
  async downloadDaemon() {
    const walletDirectory = grabWalletDir();
	  const daemonDownloadURL = getDaemonDownloadUrl();
	  const platformFileName = getPlatformFileName();

    this.downloading = true;
    const self = this;

    return new Promise((resolve, reject) => {
      console.log('downloading daemon');

      // download latest daemon info from server
      const opts = {
        url: daemonDownloadURL
      };

      request(opts).then((data) => {
        const parsed = JSON.parse(data);
        const latestDaemon = parsed.versions[0];
        const zipChecksum = latestDaemon.checksum;
        const downloadUrl = latestDaemon.download_url;
        console.log(downloadUrl);

        // Download daemon.zip

        const downloadRequestOpts = {
          url: downloadUrl,
          encoding: null,
        };

        request.get(downloadRequestOpts).then((res) => {
          fs.writeFileSync(`${walletDirectory}Eccoind.zip`, res);
          console.log(`${walletDirectory}Eccoind.zip`);

          checksum.file(`${walletDirectory}Eccoind.zip`, (error, sum) => {

            console.log(`checksum from file ${sum}`);
            console.log(`checksum from server ${zipChecksum}`);
            console.log('Done downloading verifying');

            if (zipChecksum === sum) {

              // unzip file.
              extract(`${walletDirectory}Eccoind.zip`, { dir: `${walletDirectory}` }, (err) => {
                if (err) {
                  console.log(err);
                } else {

                  if (fs.existsSync(`${walletDirectory}Eccoind.zip`)) {
                    fs.unlink(`${walletDirectory}Eccoind.zip`, (error) => {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log('File successfully deleted');
                        self.installedVersion = self.currentVersion;
                        self.saveVersion(self.installedVersion);
                        self.downloading = false;
                        resolve(true);
                      }
                    });
                  } else {
                    resolve(false)
                    alert("This file doesn't exist, cannot delete");
                  }
                  console.log('unzip successfully.');
                }
              });
            } else {
              resolve(false);
            }
          });
        }).catch((err) => {
          console.log(err);
          self.downloading = false;
          fs.unlink(`${walletDirectory}Eccoind.zip`);
          resolve(false);
          console.log(`Error extracting  zip ${err}`);
        });
      }).catch(error => {
        console.log(error);
        resolve(false);
      });
    });
  }

  saveVersion(version) {
    console.log(this.versionPath);
    console.log(`version${version}`);
    const writter = fs.createWriteStream(this.versionPath);
    writter.write(version.toString());
  }

}

module.exports = DaemonManager;
