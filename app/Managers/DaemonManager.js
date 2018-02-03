const electron = require('electron');
const fs = require('fs');
const { app } = require('electron');
const request = require('request-promise-native');
const homedir = require('os').homedir();
const event = require('../utils/eventhandler');
const os = require('os');
var https = require('https');
var psList = require('ps-list');
import Wallet from '../utils/wallet';

/*
*	Handles daemon updates and the daemon'state
*/
class DaemonManager {

	constructor(){
		this.path = `${homedir}/.eccoin-wallet`;
		this.versionPath = `${homedir}/.eccoin-wallet/wallet-version.txt`;
		this.installedVersion = -1;
		this.currentVersion = -1;
		this.walletDat = false;
		this.downloading = false;
		this.os = require("os");
		this.arch = os.arch();
		this.os = process.platform;
		this.arch = process.arch;
		this.running = false;
		this.initialSetup();
		this.wallet = new Wallet();
	}

	updateOrCreateConfig(){

		const directory = this.os === "win32" ? `${homedir}/appdata/roaming/eccoin` : `${homedir}/.eccoin`;
		const filePath = this.os === "win32" ? `${homedir}/appdata/roaming/eccoin/eccoin.conf` : `${homedir}/.eccoin/eccoin.conf`;
   		if(fs.existsSync(filePath)){	
			fs.readFile(filePath, 'utf8', (err, data) => {
	          if (err) {
	             console.log("readFile error: ", err);
	             return;
	          }
	          if (/staking=[0-9]/g.test(data)) {
	            if (/staking=1/g.test(data)) {
	              return
	            } else {
	              	const result = data.replace(/staking=[0-9]/g, 'staking=1');

		            fs.writeFileSync(filePath, result, 'utf8', (err) => {
		              if (err) {
		                console.log("writeFileSync error: ", err); 
		                return;
		              }
		              else{
		              	console.log("done updating config")
		              	return;
	          		  }
		            });
	            }
	          } else {
	            fs.appendFileSync(filePath, os.EOL + 'staking=1', 'utf8', (err) => {
	              if (err) {
	                console.log("appendFile error: ", err);
	                return;
	              }
	              return;
	            });
	          }
	        });
	      }
		else if(fs.existsSync(directory)){
	      	console.log("doesn exist, gonna create it")
	      	const toWrite = "maxconnections=100" + os.EOL + "rpcuser=yourusername" + os.EOL + "rpcpassword=yourpassword" + os.EOL + "addnode=www.cryptounited.io" + os.EOL + "rpcport=19119" + os.EOL + "rpcconnect=127.0.0.1" + os.EOL + "staking=1" + os.EOL + "zapwallettxes=0";

            fs.writeFile(filePath, toWrite, 'utf8', (err) => {
              if (err) {
                return console.log("writeFile error: ", err);
              }
              return;
            });
	      }
	      else{
	      	fs.mkdirSync(directory);
	      	this.updateOrCreateConfig();
	      }
	}

    async initialSetup(){
		event.on('start', () => {
			this.startDaemon(function(started){
				if(started){
					event.emit("daemonStarted");
				}
				else event.emit("daemonFailed");
			});
		});

		event.on('stop', () => {
			this.stopDaemon(function(err){
				if(err) console.log("error stopping daemon: ", err)
				console.log("stopped daemon")
			})
		})
		await this.updateOrCreateConfig();
		console.log("going to check daemon version")
	    this.installedVersion = await this.checkIfDaemonExists();
	    this.walletDat = await this.checkIfWalletExists();
     	do{
     		console.log("getting latest version")
     		await this.getLatestVersion();

     	}while(this.currentVersion != -1);
	     console.log("got latest version")
	    if(this.installedVersion == -1){
	    	do{
	    		await this.downloadDaemon();
	    	}while(this.installedVersion == -1);
	    	console.log("telling electron about wallet.dat")
	    	event.emit('wallet', this.walletDat);
	    }
	    else
			event.emit('wallet', this.walletDat);

		//if there is a wallet then start the daemon
		if(this.walletDat)
			this.startDaemonChecker();
	}

	startDaemonChecker(){
		this.checkIfDaemonIsRunning();
		this.intervalID = setInterval(this.checkIfDaemonIsRunning.bind(this), 60000);
	}

	checkIfDaemonIsRunning(){
		if(this.installedVersion != -1 && !this.downloading){
			var self = this;
			psList().then(data => {
			    for (var i = 0; i < data.length; i++) { 
				    if(data[i].name.indexOf('Eccoind') > -1){
				     self.running = true;
				     console.log("Daemon running")
				     return;
				 }
				}
				self.running = false;
				console.log("daemon not running");
				if(!self.downloading)
					self.startDaemon();
			});
		}
	}

 	startDaemon(cb){
		console.log("starting daemon...");
	    this.wallet.walletstart((result) => {
	      if (result) {
	      	cb(result);
	      } 
	    });
	}

	async stopDaemon(callback){
		this.wallet.walletstop()
	      .then(() => {
	        console.log("stopped daemon")
	      })
	      .catch(err => {
	        console.log("failed to stop daemon:", err);
	      });
	}

	checkForUpdates(){
		if(this.installedVersion != this.currentVersion && !this.downloading){
			console.log("installed: ", this.installedVersion);
			console.log("current: ", this.currentVersion);
			//TODO on auto updates otherwise send notification that there is a new version
			this.downloadDaemon();
		}
		setTimeout(() => {
			this.getLatestVersion();
		}, 10000);
	}


    async checkIfDaemonExists() { 
		if (fs.existsSync(this.path + "/Eccoind.exe")) {
		    try{
	    		var data = fs.readFileSync(this.versionPath, "utf8");
			}catch(e){
				console.log("daemon.txt does not exist");
				return -1;
			}
			console.log("daemon exists, version: ", data)
			return data;
		}
		else{
			console.log("daemon does not exist")
			return -1;
		}
	};

    async checkIfWalletExists() { 
    	if(!fs.existsSync(homedir + "/AppData/Roaming/eccoin")){
    		fs.mkdirSync(homedir + "/AppData/Roaming/eccoin");
    		return false;
    	}
		if (fs.existsSync(homedir + "/AppData/Roaming/eccoin/wallet.dat")) {
			console.log("wallet exists")
			return true;
		}
		else{
			console.log("wallet does not exist")
			return false;
		}
	};

	async getLatestVersion(){
		const opts = { url: 'http://f2bd5944.ngrok.io/daemoninfo'};
		request(opts)
	      .then((response) => {
				const parsed = JSON.parse(response);
                const githubVersion = parsed.name.split(' ')[1];
                this.currentVersion = githubVersion;
	      })
	      .catch(error => {
	      	console.log(error);
	      });

	}

	async downloadDaemon(){
		this.downloading = true;
		var self = this;
		return new Promise(function(resolve, reject){
			console.log("going to download")
			var file = fs.createWriteStream(self.path + "/Eccoind" + self.getExecutableExtension());
			var request = https.get(self.getDownloadUrl(), function(response) {
				response.pipe(file);
				file.on('finish', function() {
					self.downloading = false;
					self.installedVersion = self.currentVersion;
					self.saveVersion(self.installedVersion);
					console.log("Done downloading")
					file.close(null);
					resolve(true);
				});
				}).on('error', function(err) { 
					self.downloading = false;
					fs.unlink(dest);
					reject(false); 
			});
		});
	}

	saveVersion(version){
		console.log(this.versionPath)
		console.log(version)
		var writter = fs.createWriteStream(this.versionPath);
		writter.write(version.toString());
	}

	getDownloadUrl(){
		var os = this.os;
		var arch = this.arch;

		if(os === "win32" && arch === "x64")
			return "https://www.ecc.network/downloads/updates/eccoind-win64.exe";
		else if(os === "win32" && arch === "x32")
			return "https://www.ecc.network/downloads/updates/eccoind-win32.exe";
		else if(os === "darwin" && arch === "x64")
			return "https://www.ecc.network/downloads/updates/eccoind-linux64";
		else if(os === "win32" && arch === "x32")
			return "https://www.ecc.network/downloads/updates/eccoind-linux32";
	}

	getExecutableExtension(){
		if(this.os === "win32") return ".exe";
		else if(this.os === "linux") return "";
		else return ".dmg";
	}

}

module.exports = DaemonManager;