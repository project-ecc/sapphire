const request = require('request-promise-native');
const event = require('../utils/eventhandler');
const os = require('os');
let arch = require('arch');
import {getSapphireDownloadUrl, grabWalletDir} from "../utils/platform.service";
import {version} from './../../package.json';
import Tools from '../utils/tools';
import {downloadFile} from "../utils/downloader";
import shell from 'node-powershell';
let cp = require('child_process');
const homedir = require('os').homedir();
const { exec } = require('child_process');

class GUIManager {

  constructor() {
    this.path = grabWalletDir();
    this.os = require("os");
    this.arch = arch();
    this.os = process.platform;
    this.arch = process.arch;
    this.installedVersion = version;
    this.currentVersion = -1;
    this.getLatestVersion();
    this.upgrading = false;
    this.toldUserAboutUpdate = false;
    console.log("wallet version: ", this.installedVersion);
    event.on('updateGui', async () => {
      try {
        await this.downloadGUI();
      } catch (e) {
        console.log('update failed', e.message)
        event.emit('download-error', {message: e.message});
      }
    });
    // use this to manually throw an update message
    //this.toldUserAboutUpdate = true;
    //event.emit('guiUpdate');
  }


  checkForUpdates() {
    //check that version value has been set and
    // the user has not yet been told about an update
    if (!this.upgrading && !this.toldUserAboutUpdate) {

      if (Tools.compareVersion(this.installedVersion, this.currentVersion) === -1) {
        console.log('Installed GUI Version: ', this.installedVersion);
        console.log('Latest GUI Version : ', this.currentVersion);
        this.toldUserAboutUpdate = true;
        event.emit('guiUpdate');
      }
    }
  }

  getLatestVersion() {
    setTimeout(this.getLatestVersion.bind(this), 600000);
    console.log('checking for latest gui version');

    const guiDownloadURL = getSapphireDownloadUrl();
    // download latest daemon info from server
    const opts = {
      url: guiDownloadURL
    };

    request(opts).then((data) => {
      if(data){
        const parsed = JSON.parse(data);
        this.currentVersion = parsed.versions[0].name.substring(1);
        this.checkForUpdates();
      }
    }).catch(error => {
      console.log(error.message);
    });
  }


  downloadGUI() {

    const walletDirectory = grabWalletDir();
    const guiDownloadURL = getSapphireDownloadUrl();

    console.log("going to download GUI");
    this.upgrading = true;
    const self = this;

    return new Promise((resolve, reject) => {
      // download latest daemon info from server
      const opts = {
        url: guiDownloadURL
      };

      request(opts).then(async (data) => {
        const parsed = JSON.parse(data);
        const latestGui = parsed.versions[0];
        const zipChecksum = latestGui.checksum;
        const downloadUrl = latestGui.download_url;
        const downloaded = await downloadFile(downloadUrl, walletDirectory, 'Sapphire.zip', zipChecksum, true)
          .catch(error => reject(error));

        if (downloaded) {
          console.log("Done downloading gui");
          try {
            self.downloading = false;
            console.log("current version: ", self.currentVersion)
            installGUI(self.currentVersion);
          } catch (e) {
            console.log(e);
          }
        } else {
          reject(downloaded);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

}

module.exports = GUIManager;

async function installGUI(guiVersion){
  console.log(guiVersion)
  console.log("installing GUI...");

  if (process.platform === 'linux') {
    const walletDir = `${homedir}/.eccoin-wallet/`;

    const fileName = 'sapphire';
    const architecture = arch() === 'x86' ? 'linux32' : 'linux64';
    let fullPath = walletDir + fileName + '-v' + guiVersion + '-' + architecture;


    // This must be added to escape the space.
    fullPath = `"${fullPath}"`;

    try{
      await Tools.createInstallScript(["sleep 2", `open ${fullPath}`], walletDir+"script.sh")
    }catch(err){
      event.emit('download-error', err);
      console.log(err);
    }

    let shPath = walletDir+ "script.sh"

    runExec(`chmod +x "${shPath}" && sh "${shPath}"`, 1000).then(() => {
      event.emit('close');
    })
    .catch(() => {
      event.emit('close');
    });
  }
  else if(process.platform === 'darwin'){

    const walletDir =`${homedir}/Library/Application Support/.eccoin-wallet/`;
    const fileName = 'sapphire';
    let fullPath = walletDir + fileName + '-v' + guiVersion + '-mac.dmg';

    // This must be added to escape the space.
    fullPath = `"${fullPath}"`;

    try{
      await Tools.createInstallScript(["sleep 2", `open ${fullPath}`], walletDir+"script.sh")
    }catch(err){
      event.emit('download-error', err);
      console.log(err);
    }

    let shPath = walletDir+ "script.sh"

    runExec(`chmod +x "${shPath}" && sh "${shPath}"`, 1000).then(() => {
      event.emit('close');
    })
    .catch(() => {
      event.emit('close');
    });
  }
  else if (process.platform.indexOf('win') > -1) {

    const walletDir = `${homedir}\\.eccoin-wallet\\`;

    const fileName = 'sapphire';
    const architecture = arch() === 'x86' ? 'win32' : 'win64';
    const execName = fileName + '-v' + guiVersion + '-' + architecture + '.exe';

    try{
      await Tools.createInstallScript(["timeout /t 1", `start /d "${walletDir}" ${execName}`], walletDir+"script.bat")
    }catch(err){
      event.emit('download-error', err);
      console.log(err);
    }

    let path = `& "${walletDir}script.bat"`;

    //create powershell
    const ps = new shell({ //eslint-disable-line
      executionPolicy: 'Bypass',
      noProfile: true
    });

    //add command to start script
    ps.addCommand(path);

    //close on error and success
    ps.invoke().then(() => {
      event.emit('close');
    })
    .catch(err => {
      console.log(err);
      ps.dispose();
      event.emit('download-error', err);
    });
  }
}

function runExec(cmd, timeout) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        console.log(stdout)
        resolve('program exited without an error');
      }
      event.emit('close');
    });

  });
}
