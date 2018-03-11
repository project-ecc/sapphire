const electron = require('electron');
const fs = require('fs');
const { app } = require('electron');
const request = require('request-promise-native');
const homedir = require('os').homedir();
const event = require('../utils/eventhandler');
const os = require('os');
var https = require('https');
var psList = require('ps-list');
var checksum = require('checksum');
import Wallet from '../utils/wallet';
import Tools from '../utils/tools';

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
		this.arch = os.arch();
		this.os = process.platform;
		this.arch = process.arch;
		this.running = false;
		this.initialSetup();
		this.wallet = new Wallet();
		this.toldUserAboutUpdate = false;
		this.shouldRestart = undefined;
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
		event.on('updateDaemon', (shouldRestart) => {
			this.shouldRestart = shouldRestart;
			this.updateDaemon();
		});
		/*var daemonCredentials = await Tools.readRpcCredentials();
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
		}*/
		
		console.log("going to check daemon version")
		this.installedVersion = await this.checkIfDaemonExists();
		//on startup daemon should not be running unless it was to update the application
    	//if(this.installedVersion != -1 ){
	    //	await this.stopDaemon();
	    //}
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
		this.intervalIDCheckUpdates = setInterval(this.getLatestVersion.bind(this), 6000000);
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

	async stopDaemon(){
		var self = this;
		return new Promise(function(resolve, reject){
			self.wallet.walletstop()
		      .then((data) => {
		      	if(data && data == "ECC server stopping"){
		      		console.log("stopping daemon");
		      		resolve(true);
		      	}
		      	else if(data && data.code === 'ECONNREFUSED'){
		      		resolve(true);
		      	}
		      	else{
		      		resolve(false);
		      	}
		      })
		      .catch(err => {
		        console.log("failed to stop daemon:", err);
		        resolve(false);
		      });
	  	});
	}

	checkForUpdates(){
		if(this.installedVersion != -1 && this.installedVersion != this.currentVersion && !this.toldUserAboutUpdate){
			console.log("installed: ", this.installedVersion);
			console.log("current: ", this.currentVersion);
			this.toldUserAboutUpdate = true;
			event.emit('daemonUpdate');
		}
	}

	async updateDaemon(){
		console.log("daemon manager got update call")
		var r = await this.stopDaemon();
		if(r){
			var self = this;
			setTimeout( async ()=> {
				var downloaded = false;
				do{
					downloaded = await self.downloadDaemon();	
				}while(!downloaded)
				event.emit("updatedDaemon"); 
				if(self.shouldRestart)
					self.startDaemon();
				this.toldUserAboutUpdate = false;
			}, 7000)
		}
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
			return data.split(' ')[1];
		}
		else if(!fs.existsSync(this.path) && fs.mkdirSync(this.path)){
			console.log("daemon does not exist")
			return -1;
		}
		else return -1;
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
		const opts = { url: 'http://1b519385.ngrok.io/daemoninfo'};
		var self = this;
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
					console.log("Done downloading")
					file.close(null);
					let sumFromServer = "";//TODO
					checksum.file(this.path + "/Eccoind.exe", function (err, sum) {
						console.log(sum)
					   if(sumFromServer === sum){
						self.installedVersion = self.currentVersion;
						self.saveVersion(self.installedVersion);
					   	resolve(true);
					   }
					   else{
					   	resolve(false);
					   }
					})
				});
				}).on('error', function(err) { 
					self.downloading = false;
					fs.unlink(dest);
					resolve(false); 
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