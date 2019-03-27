import Wallet from '../utils/wallet';
import { getPlatformWalletUri, grabWalletDir, grabEccoinDir, getDaemonDownloadUrl, getPlatformFileName } from '../utils/platform.service';
import Tools from '../utils/tools';
import { downloadFile } from '../utils/downloader';

const electron = require('electron');
const fs = require('fs');
const { app } = require('electron');
const request = require('request-promise-native');
const homedir = require('os').homedir();
const event = require('../utils/eventhandler');
const os = require('os');
const arch = require('arch');
const extract = require('extract-zip');
const https = require('https');
const checksum = require('checksum');

const REQUIRED_DAEMON_VERSION = 2511;
const find = require('find-process');


/*
*	Handles daemon updates and the daemon'state
*/
class OLDDaemonManager {

  constructor() {
    this.path = `${grabWalletDir()}`;
    this.versionPath = `${grabWalletDir()}wallet-version.txt`;
    this.installedVersion = -1;
    this.currentVersion = -1;
    this.walletDat = false;
    this.downloading = false;
    this.arch = arch();
    this.os = process.platform;
    this.arch = process.arch;
    this.running = false;
    this.initialSetup();
    this.toldUserAboutUpdate = false;
    this.shouldRestart = undefined;

    // use this to manually throw an update message
    // this.toldUserAboutUpdate = true;
    // event.emit('daemonUpdate');
    console.log('created daemon manager');
  }

  async initialSetup() {
    // event.on('start', () => {
    //   this.startDaemon((started) => {
    //     if (started) {
    //       event.emit('daemonStarted');
    //     } else event.emit('daemonFailed');
    //   });
    // });

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

    let daemonCredentials = await Tools.readRpcCredentials();
  	this.installedVersion = await this.checkIfDaemonExists();
    if (daemonCredentials) {
    	// this.wallet = new Wallet(daemonCredentials.username, daemonCredentials.password);
    	// await this.stopDaemon();
    }
    if (!daemonCredentials || daemonCredentials.username == 'yourusername' || daemonCredentials.password == 'yourpassword') {
      daemonCredentials = {
        username: Tools.generateId(5),
        password: Tools.generateId(5)
      };
      const result = await Tools.updateOrCreateConfig(daemonCredentials.username, daemonCredentials.password);
      // this.wallet = new Wallet(daemonCredentials.username, daemonCredentials.password);
    }

    console.log('going to check daemon version');
    console.log(this.installedVersion);
    let version = this.installedVersion == -1 ? this.installedVersion : parseInt(this.installedVersion.replace(/\D/g, ''));
    console.log('VERSION INT: ', version);
		// on startup daemon should not be running unless it was to update the application
    	// if(this.installedVersion != -1 ){
	    //	await this.stopDaemon();
	    // }
	    this.walletDat = await this.checkIfWalletExists();
     	do {
     		console.log('getting latest version');
     		await this.getLatestVersion();
     	} while (this.currentVersion !== -1);
     	console.log(this.currentVersion);
	     console.log('got latest version');
	    if (this.installedVersion == -1 || version < REQUIRED_DAEMON_VERSION) {
	    	do {
	    	  try {
        await this.downloadDaemon();
        version = parseInt(this.installedVersion.replace(/\D/g, ''));
      } catch (e) {
        event.emit('download-error', { message: e.message });
      }
	    	} while (this.installedVersion == -1 || version < REQUIRED_DAEMON_VERSION);
	    	console.log('telling electron about wallet.dat');
	    	event.emit('wallet', this.walletDat, daemonCredentials);
	    } else { event.emit('wallet', this.walletDat, daemonCredentials); }

		// if there is a wallet then start the daemon
    if (this.walletDat) { this.startDaemonChecker(); }
  }

  startDaemonChecker() {
    this.checkIfDaemonIsRunning();
    this.intervalID = setInterval(this.checkIfDaemonIsRunning.bind(this), 30000);
    this.intervalIDCheckUpdates = setInterval(this.getLatestVersion.bind(this), 6000000);
  }

  checkIfDaemonIsRunning() {
    if (this.installedVersion != -1 && !this.downloading) {
      const self = this;
      console.log('Checking if daemon is running...');
      find('name', 'eccoind').then((list) => {
        if (list && list.length > 0) {
          console.log('Daemon running');
        } else if (list && list.length == 0) {
          console.log('daemon not running');
          self.running = false;
          // if (!self.downloading) { self.startDaemon(); }
          if (!self.downloading) { event.emit('start'); }
        }
      });
    }
  }

 // 	startDaemon(cb) {
 //   console.log('starting daemon...');
	//     this.wallet.walletstart((result) => {
	//       if (result) {
	//       	cb(result);
	//       }
	//     }).catch(err => {
 //      console.log('Error starting daemon');
	//       console.log(err);
 //      event.emit('loading-error', { message: err.message });
 //    });
 // }

  async stopDaemon() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.wallet.walletstop()
		      .then((data) => {
        console.log(data);
		      	if (data && data == 'ECC server stopping') {
		      		console.log('stopping daemon');
		      		resolve(true);
		      	}	else if (data && data.code === 'ECONNREFUSED') {
		      		resolve(true);
		      	} else {
		      		resolve(false);
		      	}
		      })
		      .catch(err => {
		        console.log('failed to stop daemon:', err);
		        resolve(false);
		      });
	  	});
  }

  async updateDaemon() {
    console.log('daemon manager got update call');
    this.downloading = true;
    const r = await this.stopDaemon();
    if (r) {
      setTimeout(async () => {
        let downloaded = false;
        try {
          downloaded = await this.downloadDaemon();
        } catch (e) {
          event.emit('download-error', { message: e.message });
          this.downloading = false;
          return;
        }
        this.downloading = false;
        if (downloaded !== false) {
          event.emit('updatedDaemon');
          // if (!this.shouldRestart) { this.startDaemon(); }
          if (!this.shouldRestart) { event.emit('start'); }
          this.toldUserAboutUpdate = false;
        }
      }, 7000);
    }
  }

  async checkIfDaemonExists() {
    if (fs.existsSync(getPlatformWalletUri())) {
		    try {
	    		const data = fs.readFileSync(this.versionPath, 'utf8');
      console.log('daemon exists, version: ', data);
      if (data.indexOf('version') > -1) {
        return data.replace('version', ' ').trim();
      }

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

  checkForUpdates() {
    // check that version value has been set and
    // the user has not yet been told about an update
    if (this.installedVersion !== -1 && !this.toldUserAboutUpdate) {
      if (Tools.compareVersion(this.installedVersion, this.currentVersion) === -1 && this.currentVersion.replace(/\D/g, '') > REQUIRED_DAEMON_VERSION) {
        this.toldUserAboutUpdate = true;
        event.emit('daemonUpdate');
      }
    }
  }

  async getLatestVersion() {
    console.log('checking for latest daemon version');

    const daemonDownloadURL = getDaemonDownloadUrl();
    const self = this;
    // download latest daemon info from server
    const opts = {
      url: daemonDownloadURL
    };

    request(opts).then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        this.currentVersion = parsed.versions[0].name.substring(1);
        self.checkForUpdates();
      }
    }).catch(error => {
      console.log(error.message);
    });
  }

  async downloadDaemon() {
    const walletDirectory = grabWalletDir();
	  const daemonDownloadURL = getDaemonDownloadUrl();
	  console.log(daemonDownloadURL);

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
        console.log(data);
        const parsed = JSON.parse(data);
        const latestDaemon = parsed.versions[0];
        const latestVersion = latestDaemon.name.substring(1);
        const zipChecksum = latestDaemon.checksum;
        const downloadUrl = latestDaemon.download_url;

        const downloaded = await downloadFile(downloadUrl, walletDirectory, 'Eccoind.zip', zipChecksum, true);

        if (downloaded) {
          self.installedVersion = latestVersion;
          await self.saveVersion(self.installedVersion);
          self.downloading = false;
          resolve(true);
        } else {
          console.log(downloaded);
          reject(downloaded);
        }
      }).catch(error => {
        console.log(`Error downloadDaemon(): ${error}`);
        reject(error);
      });
    });
  }

  async saveVersion(version) {
    console.log(this.versionPath);
    console.log(`version${version}`);
    const writter = fs.createWriteStream(this.versionPath);
    writter.write(version.toString());
  }

}

module.exports = OLDDaemonManager;
