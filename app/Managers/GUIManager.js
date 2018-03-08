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
import Client from 'bitcoin-core';
import {version} from './../../package.json';
var cp = require('child_process');
var checksum = require('checksum');

class GUIManager{

	constructor(){
		this.path = `${homedir}/.eccoin-wallet`;
		this.os = require("os");
		this.arch = os.arch();
		this.os = process.platform;
		this.arch = process.arch;
		this.installedVersion = version;
		this.currentVersion = -1;
		this.getLatestVersion();
		this.upgrading = false;
		this.toldUserAboutUpdate = false;
		console.log("wallet version: ", this.installedVersion)
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
	      	console.log(error);
	      	
	      });
	      setTimeout(this.getLatestVersion.bind(this), 60000);
	}


	downloadGUI(){
		console.log("going to download GUI")
		this.upgrading = true;
		var self = this;
		var file = fs.createWriteStream(this.path + "/Sapphire" + this.getExecutableExtension());
		var request = https.get(this.getDownloadUrl(), function(response) {
			response.pipe(file);
			file.on('finish', function() {
				self.downloading = false;
				console.log("Done downloading gui")
				file.close(null);
				fs.unlink(dest);
				let sumFromServer = "";
				checksum.file(this.path + "/Eccoind.exe", function (err, sum) {
					if(sumFromServer === sum){
						self.installedVersion = self.currentVersion;
						try{
							var child = cp.fork("./app/Managers/UpdateGUI", {detached:true});
							app.quit();
						}catch(e){
							console.log(e);
						}
					}
					else{
						self.downloadGUI();
					}
				});

				
			});
			}).on('error', function(err) { 
				self.downloading = false;
				fs.unlink(dest);
				self.downloadGUI();
		});
	}

	getDownloadUrl(){
		var os = this.os;
		var arch = this.arch;

		if(os === "win32" && arch === "x64")
			return "https://b6e403fd.ngrok.io/Sapphire.exe";
		else if(os === "win32" && arch === "x32")
			return "https://ecc.network/downloads/Lynx-Installer-0.1.5-win32.exe";
		else if(os === "darwin" && arch === "x64")
			return "https://ecc.network/downloads/Lynx-Installer-0.1.5-lin64.AppImage";
		else if(os === "win32" && arch === "x32")
			return "https://ecc.network/downloads/Lynx-Installer-0.1.5-lin32.AppImage";
	}

	getExecutableExtension(){
		if(this.os === "win32") return ".exe";
		else if(this.os === "linux") return ".AppImage";
		else return ".dmg";
	}

}

module.exports = GUIManager;