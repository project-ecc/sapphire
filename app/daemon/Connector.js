import React, {Component} from 'react';
import {connect} from 'react-redux';
const { app } = require('electron');

import {
  extractChecksum,
  formatDownloadURL,
  getDaemonDownloadUrl, getPlatformFileName, getPlatformName, getPlatformWalletUri, grabEccoinDir,
  grabWalletDir
} from '../utils/platform.service';
import * as actions from '../actions/index';

import ConnectorNews from './News';
import ConnectorCoin from './Coin';
import ConnectorMarket from './Market';
import Tools from '../utils/tools';
import {downloadFile, moveFile} from '../utils/downloader';
import {ipcRenderer} from "electron";
import Toast from "../globals/Toast/Toast";
const db = require('../utils/database/db');
const find = require('find-process');
const request = require('request-promise-native');
const fs = require('fs');
const event = require('../utils/eventhandler');
const settings = require('electron-settings');
//const zmq = require('zeromq');
//const socket = zmq.socket('sub');

class Connector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interval: 5000,
      downloadingDaemon: false,
      shouldRestart: false,
      walletDat: false,
      toldUserAboutUpdate: false,
      daemonCheckerTimer: null,
      daemonUpdateTimer: null,
    };

    this.bindListeners();
  }

  async componentWillMount(){
    await db.sequelize.sync();
  }

  componentWillUnmount() {
    clearInterval(this.state.daemonCheckerTimer);
    clearInterval(this.state.daemonUpdateTimer);

    event.removeListener('start');
    event.removeListener('stop');
    event.removeListener('updateDaemon');
    event.removeListener('initial_setup');
    event.removeListener('checkForDaemonUpdates');
  }

  bindListeners() {

    // Start Daemon
    event.on('start', async (args) => {
      console.log('starting daemon')
      await this.startDaemon(args);
    });

    ipcRenderer.on('stop', async (e, args) => {
      console.log('in stop function')
      let shouldQuit = false
      if(args.closeApplication != null && args.closeApplication === true){
        console.log('in here')
        this.props.setLoading({
          isLoading: true,
          loadingMessage: 'Stopping Daemon and closing sapphire'
        });
        shouldQuit = true
      }
      await this.stopDaemon(shouldQuit).then((data) => {
        console.log('stopped daemon');
        event.emit('daemonStopped', args)
        if(args.restart !== null && args.restart === true){
          event.emit('start')
        }
      }).catch((err) => {
        console.log(err)
      });
    });

    // Stop Daemon
    event.on('stop', async (args) => {
      await this.stopDaemon().then((data) => {
        console.log('stopped daemon');
        event.emit('daemonStopped', args)
        if(args.restart === true){
          event.emit('start')
        }
        if(args.closeApplication === true){
          event.emit('closeApplication', args);
        }
      }).catch((err) => {
        console.log(err)
      });
    });

    // Check for daemon update
    event.on('checkForDaemonUpdates', async () =>{
      await this.getLatestVersion().then((data) => {
        return data;
      }).catch((err) => {
        console.log(err)
      });
    });

    //Update Daemon
    event.on('updateDaemon', async (restart) => {
      this.setState({
        shouldRestart: restart
      });
      await this.updateDaemon();
    });

    event.on('initial_setup', async (checkForUpdates) => {
      await this.initialSetup(checkForUpdates);
    });

    this.listenForDownloadEvents();

    // subber.js


    //socket.connect('tcp://127.0.0.1:30000');
    //socket.subscribe('hashblock');
    //socket.subscribe('hashtx');
    //socket.subscribe('rawblock');
    //socket.subscribe('rawtx');
    console.log('Subscriber connected to port 30000');

    //socket.on('message', function(topic, message) {
     // console.log('received a message related to:', topic.toString(), 'containing message:', message.toString('hex'));
   // });

    // Register to monitoring events
    //socket.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep);});
    //socket.on('connect_delay', function(fd, ep) {console.log('connect_delay, endpoint:', ep);});
    //socket.on('connect_retry', function(fd, ep) {console.log('connect_retry, endpoint:', ep);});
   // socket.on('listen', function(fd, ep) {console.log('listen, endpoint:', ep);});
   // socket.on('bind_error', function(fd, ep) {console.log('bind_error, endpoint:', ep);});
   /// socket.on('accept', function(fd, ep) {console.log('accept, endpoint:', ep);});
    //socket.on('accept_error', function(fd, ep) {console.log('accept_error, endpoint:', ep);});
    //socket.on('close', function(fd, ep) {console.log('close, endpoint:', ep);});
    //socket.on('close_error', function(fd, ep) {console.log('close_error, endpoint:', ep);});
    //socket.on('disconnect', function(fd, ep) {console.log('disconnect, endpoint:', ep);});

  }

  listenForDownloadEvents() {
    // downloader events.
    event.on('downloading-file', (arg) => {
      // console.log("downloading-file", e, arg);
      const walletPercent = arg.percent * 100;
      this.props.setFileDownloadStatus({
        downloadMessage: 'Downloading the required files',
        downloadPercentage: walletPercent.toFixed(2),
        downloadRemainingTime: arg.time.remaining
      });
      // console.log(payload)
    });

    event.on('downloaded-file', () => {
      this.props.setFileDownloadStatus({
        downloadMessage: 'Downloading the required files',
        downloadPercentage: 100,
        downloadRemainingTime: 0.0
      });
    });

    event.on('verifying-file', (args) => {
      console.log(args)
      this.props.setFileDownloadStatus({
        downloadMessage: `Validating file ${args.fileChecksum} against ${args.serverChecksum}`,
        downloadPercentage: undefined,
        downloadRemainingTime: 0.0
      });
    });

    event.on('unzipping-file', () => {
      this.props.setFileDownloadStatus({
        downloadMessage: 'Unzipping',
        downloadPercentage: undefined,
        downloadRemainingTime: 0.0
      });
    });
    event.on('file-download-complete', () => {
      this.props.setFileDownloadStatus({
        downloadMessage: '',
        downloadPercentage: undefined,
        downloadRemainingTime: 0.0
      });
    });
    event.on('download-error', (arg) => {
      this.props.setFileDownloadStatus({
        downloadMessage: '',
        downloadPercentage: undefined,
        downloadRemainingTime: 0.0
      });
      console.log(arg)
      console.log(`Download failure: ${arg.message}`);
      this.props.settellUserUpdateFailed({
        updateFailed: true,
        downloadMessage: arg.message + '\n Sapphire Cannot run with version ' + this.state.installedVersion + " Please manually update"
      });
    });
  }

  async initialSetup() {
    let canGetVersion = true;
    const iVersion = await this.checkIfDaemonExists();
    const walletFile = await this.checkIfWalletExists();
    console.log(iVersion)
    this.props.setLocalDaemonVersion(iVersion);
    this.setState({
      walletDat: walletFile
    });


    await this.getLatestVersion().catch((err)=> {
      console.log(err.message);
      canGetVersion = false
    });


    console.log("server version: ", this.props.serverDaemonVersion);
    const serverVersion = parseInt(this.props.serverDaemonVersion.replace(/\D/g, ''));
    console.log("server version: ", serverVersion);
    const version = this.props.installedDaemonVersion === -1 ? this.props.installedDaemonVersion : parseInt(this.props.installedDaemonVersion.replace(/\D/g, ''));
    console.log('LOCAL VERSION INT: ', version);


    if (version < this.props.requiredDaemonVersion && canGetVersion === true && (serverVersion > version)) {
      await this.downloadDaemon().then((data) => {
        console.log('downloaded')
        this.setState({
          downloadingDaemon: false
        });
        this.props.setUpdatingApplication(false);
        this.startDaemonChecker();
        event.emit('startConnectorChildren');
      }).catch((err) => {
        console.log(err)
        console.log('download daemon failed')
        event.emit('download-error', { message: err.message });

      });
    } else if(version < this.props.requiredDaemonVersion) {
      this.props.settellUserUpdateFailed({
        updateFailed: true,
        downloadMessage: ''
      });
      this.props.setUpdateFailedMessage("Sapphire is unable to start with this daemon version please download the daemon and update manually!");
    } else {
     event.emit('start');
     event.emit('startConnectorChildren');
     this.startDaemonChecker();
    }
  }

  startDaemonChecker() {
    this.checkIfDaemonIsRunning();
    this.setState({
      daemonCheckerTimer: setInterval(this.checkIfDaemonIsRunning.bind(this), 50000),
      daemonUpdateTimer: setInterval(this.getLatestVersion.bind(this), 6000000)
    });
  }


  checkIfDaemonIsRunning() {
    if (this.state.installedVersion !== -1 && !this.state.downloadingDaemon) {
      const self = this;
      console.log('Checking if daemon is running...');
      find('name', 'eccoind').then(async (list) => {
        if (list && list.length > 0) {
          console.log('Daemon running');
          try {
            await this.props.wallet.getInfo();
            this.props.setDaemonRunning(true);
            return true;
          } catch (e) {
            this.props.setDaemonRunning(false);
            return false;
          }
        } else if (list && list.length == 0) {
          console.log('daemon not running');
          this.props.setDaemonRunning(false);
          return false;
        }
      });
    } else {
      console.log('in here')
    }
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


  async checkIfDaemonExists() {
    if (fs.existsSync(getPlatformWalletUri())) {
      try {
        const version = await this.props.wallet.getWalletVersion();
        return version;
      } catch (e) {
        console.log('daemon does not exist', e);
        return -1;
      }
    }
    return -1;
  }

  async updateDaemon() {
    return new Promise(async (resolve, reject) => {
      console.log('daemon manager got update call');
      this.setState({
        downloading: true
      });
      const r = await this.stopDaemon();
      if (r === true) {
        setTimeout(async () => {
          let downloaded = false;
          try {
            downloaded = await this.downloadDaemon();
          } catch (e) {
            event.emit('download-error', { message: e.message });
            this.setState({
              downloading: false
            });
            return;
          }
          this.setState({
            downloading: false
          });

          if (downloaded !== false) {
            event.emit('updatedDaemon');
            if (!this.state.shouldRestart) { event.emit('start'); }
            this.setState({
              toldUserAboutUpdate: false
            });
            resolve(true)
          }
          reject(downloaded);
        }, 7000);
      }
    });
  }


  async getLatestVersion() {
    return new Promise(async (resolve, reject) => {
      console.log('checking for latest daemon version');
      const self = this;

      const opts = {
        url: process.env.UPDATE_SERVER_URL,
        headers: {
          'User-Agent': 'request'
        },
      };

      await request(opts).then(async (data) => {
        if (data) {
          const parsed = JSON.parse(data);
          this.props.setServerDaemonVersion(parsed[0].name.split(' ')[1]);
          console.log(this.props.serverDaemonVersion);
          if (this.props.serverDaemonVersion === -1) {
            event.emit('download-error', { message: 'Error Checking for latest version' });
            reject({ message: 'Error Checking for latest version' });
          } else {
            self.checkForUpdates();
            resolve(true);
          }
        }
      }).catch(error => {
        console.log(error.message);
        reject({ message: error.message });
      });
    });

  }


  checkForUpdates() {
    // check that version value has been set and
    // the user has not yet been told about an update
    if (this.props.installedDaemonVersion !== -1 && !this.state.toldUserAboutUpdate) {
      if (Tools.compareVersion(this.props.installedDaemonVersion, this.props.serverDaemonVersion) === -1 && this.props.serverDaemonVersion.replace(/\D/g, '') > this.props.requiredDaemonVersion) {
        this.setState({
          toldUserAboutUpdate: true
        });
        this.props.setUpdateAvailable({daemonUpdate: true});
        console.log('in here')
      } else {
        event.emit('noUpdateAvailable');
        console.log('in here for some reason')
      }
    }
  }

  async downloadDaemon() {
    const walletDirectory = grabWalletDir();
    const daemonDownloadURL = process.env.UPDATE_SERVER_URL;
    console.log(daemonDownloadURL);

    this.setState({
      downloadingDaemon: true
    });

    return new Promise((resolve, reject) => {
      console.log('downloading latest daemon');

      // download latest daemon info from server
      const opts = {
        url: daemonDownloadURL,
        headers: {
          'User-Agent': 'request'
        }
      };
      console.log(opts);

      request(opts).then(async (data) => {
        console.log(data);
        const parsed = JSON.parse(data);
        const latestDaemon = parsed[0].name.split(' ')[1];
        const zipChecksum = extractChecksum(getPlatformName(), parsed[0].body);
        const downloadUrl = formatDownloadURL('eccoin', latestDaemon, getPlatformName());

        let downloadFileName = 'Eccoind.tar.gz';
        if (getPlatformName() === 'win32' || getPlatformName() === 'win64'){
          downloadFileName = 'Eccoind.zip';
        }

        console.log(getPlatformName())
        const downloaded = await downloadFile(downloadUrl, walletDirectory, downloadFileName, zipChecksum, true);

        if (downloaded === true) {
          const platFileName = getPlatformFileName();
          let fileLocation = '/bin/eccoind';
          if(getPlatformName() === 'win32' || getPlatformName() === 'win64'){
            fileLocation = '\\bin\\eccoind.exe';
          }
          const oldLocation = `${walletDirectory}eccoin-${latestDaemon}${fileLocation}`;
          const newLocation = walletDirectory + platFileName;
          console.log(oldLocation);
          console.log(newLocation);
          const moved = await moveFile(oldLocation, newLocation);

          if (moved === true){
            this.setState({
              installedVersion: await this.checkIfDaemonExists(),
              downloading: false
            });
            resolve(true);
          }
          reject({message: 'Cannot move daemon file'});
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

  /**
   * Start the daemon instance
   * @param args
   */
  startDaemon(args) {
    console.log('starting daemon...');
    this.props.wallet.walletstart(args).then((result) => {
      if (result) {
        Toast({
          title: this.props.lang.success,
          message: this.props.lang.daemonStarted
        });
        event.emit('daemonStarted');
        this.props.setDaemonRunning(true);
      } else {
        this.props.setDaemonRunning(false);
        event.emit('daemonFailed');
      }
    }).catch(err => {
      Toast({
        title: this.props.lang.error,
        message: err.message,
        color: 'red'
      });
      console.log('Error starting daemon');
      console.log(err);
      event.emit('loading-error', { message: err.message });
    });
  }

  /**
   * Stop the daemon
   * @returns {*}
   */

  async stopDaemon(quit = false) {
    return new Promise(async (resolve, reject) => {
      await this.props.wallet.walletstop()
        .then((data) => {
          console.log(data);
          if (data && (data === 'Eccoind server stopping' || data.code === 'ECONNREFUSED')) {
            console.log('stopping daemon');

            let timeoutID = setInterval( () => {

              if (this.props.daemonRunning === false) {
                clearInterval(timeoutID);

                Toast({
                  title: this.props.lang.success,
                  message: this.props.lang.daemonStopped
                });
                if(quit === true){
                  setTimeout(()=>{
                    ipcRenderer.send('quit');
                  },3000)
                }
                resolve(true);
              } else {
                this.checkIfDaemonIsRunning()
              }
            }, 1000)
          } else {
            Toast({
              title: this.props.lang.error,
              message: data,
              color: 'red'
            });
            reject(data);
          }
        })
        .catch(err => {
          console.log('failed to stop daemon:', err);
          resolve(err);
        });
    });
  }

  render() {
    return (
      <div>
        <ConnectorCoin />
        <ConnectorNews />
        <ConnectorMarket />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    daemonError: state.application.daemonError,
    daemonErrorPopup: state.application.daemonErrorPopup,
    serverDaemonVersion: state.application.serverDaemonVersion,
    installedDaemonVersion: state.application.installedDaemonVersion,
    requiredDaemonVersion: state.application.requiredDaemonVersion,
    log: state.application.log,
    daemonRunning: state.application.daemonRunning
  };
};

export default connect(mapStateToProps, actions)(Connector);
