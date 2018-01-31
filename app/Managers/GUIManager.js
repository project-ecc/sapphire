const electron = require('electron');
const fs = require('fs');
const { ipcRenderer } = require('electron');
const { app } = require('electron');
const request = require('request-promise-native');
const homedir = require('os').homedir();
var https = require('https');
const os = require('os');
const psList = require('ps-list');
const { exec } = require('child_process');
import Client from 'bitcoin-core';
import {version} from './../../package.json';
var cp = require('child_process');


class GUIManager{

	constructor(){
		this.path = `${homedir}/.eccoin-daemon`;
		this.os = require("os");
		this.arch = os.arch();
		this.os = process.platform;
		this.arch = process.arch;
		this.installedVersion = version;
		this.currentVersion = -1;
		this.getLatestVersion();
		this.upgrading = false;
		this.toldReactAboutUpdate = false;
	}

	getLatestVersion(){
		const opts = { url: 'http://58e3e77f.ngrok.io/walletinfo'};
		request(opts)
	      .then((response) => {
				const parsed = JSON.parse(response);
                const githubVersion = parsed.name.split(' ')[1];
                this.currentVersion = githubVersion;
                console.log(this.currentVersion);
                if(this.currentVersion != this.installedVersion && !this.upgrading){
                	//tell REACT
                	//this.downloadGUI();
                }
                
	      })
	      .catch(error => {
	      	console.log(error);
	      	
	      });
	      setTimeout(this.getLatestVersion, 60000);
	}


	downloadGUI(){
		console.log("going to download GUI")
		this.upgrading = true;
		var self = this;
		var file = fs.createWriteStream(this.path + "/wallet" + this.getExecutableExtension());
		var request = https.get(this.getDownloadUrl(), function(response) {
			response.pipe(file);
			file.on('finish', function() {
				self.installedVersion = self.currentVersion;
				console.log("Done downloading")
				file.close(null);

				try{
					var child = cp.fork("./app/Managers/UpdateGUI", {detached:true});
					app.quit();
				}catch(e){
					console.log(e);
				}
				
			});
			}).on('error', function(err) { 
				self.downloading = false;
				fs.unlink(dest);
		});
	}

	getDownloadUrl(){
		var os = this.os;
		var arch = this.arch;

		if(os === "win32" && arch === "x64")
			return "https://ecc.network/downloads/Lynx-Installer-0.1.5-win64.exe";
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