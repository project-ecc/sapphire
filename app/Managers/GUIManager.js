const electron = require('electron');
const fs = require('fs');
const { ipcRenderer } = require('electron');
const { app } = require('electron');
const request = require('request-promise-native');
const homedir = require('os').homedir();
var https = require('https');
const event = require('../utils/eventhandler');
const os = require('os');
const psList = require('ps-list');
const { exec } = require('child_process');
import Client from 'eccoin-js';
import {grabWalletDir} from "../utils/platform.service";
import {version} from './../../package.json';
var cp = require('child_process');
var checksum = require('checksum');
import {downloadFile} from "../utils/downloader";


class GUIManager{

	constructor(){
		this.path = grabWalletDir();
		this.os = require("os");
		this.arch = os.arch();
		this.os = process.platform;
		this.arch = process.arch;
		this.installedVersion = version;
		this.currentVersion = -1;
		this.getLatestVersion();
		this.upgrading = false;
		this.toldUserAboutUpdate = false;
		console.log("wallet version: ", this.installedVersion);
		event.on('updateGui', () => {
			this.downloadGUI();
		});
	}

	getLatestVersion(){
		const opts = { url: 'http://1b519385.ngrok.io/walletinfo'};
		request(opts)
	      .then((response) => {
				const parsed = JSON.parse(response);
                const githubVersion = parsed.name;
                this.currentVersion = githubVersion;
                console.log(this.currentVersion);
                if(this.currentVersion != this.installedVersion && !this.upgrading && !this.toldUserAboutUpdate){
					this.toldUserAboutUpdate = true;
					event.emit('guiUpdate');
                }

	      })
	      .catch(error => {
	      	// console.log(error);

	      });
	      setTimeout(this.getLatestVersion.bind(this), 60000);
	}


	downloadGUI() {

    const walletDirectory = grabWalletDir();
    const daemonDownloadURL = getDaemonDownloadUrl();

		console.log("going to download GUI");
		this.upgrading = true;
		const self = this;

    return new Promise((resolve, reject) => {
      console.log('downloading daemon');

      // download latest daemon info from server
      const opts = {
        url: daemonDownloadURL
      };

      request(opts).then(async (data) => {
        const parsed = JSON.parse(data);
        const latestDaemon = parsed.versions[0];
        const zipChecksum = latestDaemon.checksum;
        const downloadUrl = latestDaemon.download_url;

        const downloaded = await downloadFile(downloadUrl, walletDirectory,'Sapphire.zip', zipChecksum, true);

        if (downloaded) {
          console.log("Done downloading gui");
          try{
            self.downloading = false;
            self.installedVersion = self.currentVersion;
            const child = cp.fork("./app/Managers/UpdateGUI", {detached:true});
            app.quit();
          }catch(e){
            console.log(e);
          }
        } else {
          self.downloadGUI();
          // reject(downloaded);
        }
      }).catch(error => {
        console.log(error);
        reject(false);
      });
    });
	}

}

module.exports = GUIManager;
