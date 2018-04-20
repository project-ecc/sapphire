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
import {downloadFile} from '../utils/downloader';

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
        }
        else event.emit('daemonFailed');
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
     	} while (this.currentVersion !== -1);
     	console.log(this.currentVersion)
	     console.log('got latest version');
	    if (this.installedVersion == -1) {
	    	do {
	    	  try {
            await this.downloadDaemon();
          } catch (e){
	    	    event.emit('updateFailed', e.message)
          }

	    	} while (this.installedVersion == -1);
	    	console.log('telling electron about wallet.dat');
	    	event.emit('wallet', this.walletDat);
	    } else{ event.emit('wallet', this.walletDat); }

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
          try {
            downloaded = await self.downloadDaemon();
          } catch (e) {
            event.emit('updateFailed', e.message)
          }
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
	    		const data = fs.readFileSync(this.versionPath, 'utf8');
          console.log('daemon exists, version: ', data);
	    		return data;
        } catch (e) {
          console.log('daemon.txt does not exist');
          return -1;
        }

    }	else if (!fs.existsSync(this.path) && fs.mkdirSync(this.path)) {
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
    setTimeout(this.getLatestVersion.bind(this), 60000);

    console.log('checking for latest daemon version');

    const daemonDownloadURL = getDaemonDownloadUrl();
    const self = this;
    // download latest daemon info from server
    const opts = {
      url: daemonDownloadURL
    };

    request(opts).then((data) => {
      const parsed = JSON.parse(data);
      if(parsed.success === true){
        this.currentVersion = parsed.versions[0].name.substring(1);
        console.log(this.currentVersion);
        self.checkForUpdates();
      }
    }).catch(error => {
      console.log(error.message);
    });

  }

  async downloadDaemon() {
    const walletDirectory = grabWalletDir();
	  const daemonDownloadURL = getDaemonDownloadUrl();
	  console.log(daemonDownloadURL)

    this.downloading = true;
    const self = this;

    return new Promise((resolve, reject) => {
      console.log('downloading latest daemon');

      // download latest daemon info from server
      const opts = {
        url: daemonDownloadURL
      };
      console.log(opts);

      request(opts).then(async (data) => {
        console.log(data)
        const parsed = JSON.parse(data);
        const latestDaemon = parsed.versions[0];
        const latestVersion = latestDaemon.name.substring(1);
        const zipChecksum = latestDaemon.checksum;
        const downloadUrl = latestDaemon.download_url;

        const downloaded = await downloadFile(downloadUrl, walletDirectory, 'Eccoind.zip', zipChecksum, true);

        if (downloaded) {
          self.installedVersion = latestVersion;
          self.saveVersion(self.installedVersion);
          self.downloading = false;
          resolve(true);
        } else {
          console.log(downloaded)
          reject(downloaded);
        }

      }).catch(error => {
        console.log("Error " + error);
        reject(error);
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
