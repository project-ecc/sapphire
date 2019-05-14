import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
  getDaemonDownloadUrl, getPlatformFileName, getPlatformName, getPlatformWalletUri, grabEccoinDir,
  grabWalletDir
} from '../utils/platform.service';
import * as actions from '../actions/index';

import ConnectorNews from './News';
import ConnectorCoin from './Coin';
import ConnectorMarket from './Market';
import Tools from '../utils/tools';
import {downloadFile} from '../utils/downloader';

const find = require('find-process');
const request = require('request-promise-native');
const fs = require('fs');
const event = require('../utils/eventhandler');
const settings = require('electron-settings');
const zmq = require('zeromq');
const socket = zmq.socket('sub');

const REQUIRED_DAEMON_VERSION = 2515;

class Connector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interval: 5000,
      downloadingDaemon: false,
      shouldRestart: false,
      installedVersion: -1,
      currentVersion: -1,
      walletDat: false,
      toldUserAboutUpdate: false,
      daemonCheckerTimer: null,
      daemonUpdateTimer: null
    };

    this.bindListeners();
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

    // Stop Daemon
    event.on('stop', async (restart) => {
      await this.stopDaemon((err) => {
        if (err) console.log('error stopping daemon: ', err);
        console.log('stopped daemon');
        if(restart){
          event.emit('start')
        }
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

    event.on('initial_setup', async () => {
      await this.initialSetup();
    });

    this.listenForDownloadEvents();

    // subber.js


    socket.connect('tcp://127.0.0.1:30000');
    socket.subscribe('hashblock');
    socket.subscribe('hashtx');
    console.log('Subscriber connected to port 30000');

    socket.on('message', function(topic, message) {
      console.log('received a message related to:', topic, 'containing message:', message);
    });

    // Register to monitoring events
    socket.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep);});
    socket.on('connect_delay', function(fd, ep) {console.log('connect_delay, endpoint:', ep);});
    socket.on('connect_retry', function(fd, ep) {console.log('connect_retry, endpoint:', ep);});
    socket.on('listen', function(fd, ep) {console.log('listen, endpoint:', ep);});
    socket.on('bind_error', function(fd, ep) {console.log('bind_error, endpoint:', ep);});
    socket.on('accept', function(fd, ep) {console.log('accept, endpoint:', ep);});
    socket.on('accept_error', function(fd, ep) {console.log('accept_error, endpoint:', ep);});
    socket.on('close', function(fd, ep) {console.log('close, endpoint:', ep);});
    socket.on('close_error', function(fd, ep) {console.log('close_error, endpoint:', ep);});
    socket.on('disconnect', function(fd, ep) {console.log('disconnect, endpoint:', ep);});

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
    this.setState({
      installedVersion: iVersion,
      walletDat: walletFile
    });


    await this.getLatestVersion().catch((err)=> {
      console.log(err.message);
      canGetVersion = false
    });


    console.log("server version: ", this.state.currentVersion);
    const version = this.state.installedVersion === -1 ? this.state.installedVersion : parseInt(this.state.installedVersion.replace(/\D/g, ''));
    console.log('LOCAL VERSION INT: ', version);
    if ((this.state.installedVersion === -1 || version < REQUIRED_DAEMON_VERSION) && canGetVersion === true) {
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
    } else if(version < REQUIRED_DAEMON_VERSION) {
      this.props.settellUserUpdateFailed({
        updateFailed: true,
        downloadMessage: ''
      });
      this.props.setUpdateFailedMessage("Sapphire is unable to auto update please download the daemon and update manually!");
    } else {
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
          } catch (e) {
            this.props.setDaemonRunning(false);
          }
        } else if (list && list.length == 0) {
          console.log('daemon not running');
          this.props.setDaemonRunning(false);
          console.log(!self.state.downloadingDaemon)
          console.log(self.props.daemonErrorPopup)
          if (!self.state.downloadingDaemon && self.props.daemonErrorPopup !== true)
          { event.emit('start'); }
        }
      });
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
      if (r) {
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
      const daemonDownloadURL = getDaemonDownloadUrl();
      const self = this;
      // download latest daemon info from server
      const opts = {
        url: daemonDownloadURL
      };

      await request(opts).then(async (data) => {
        if (data) {
          const parsed = JSON.parse(data);
          this.setState({
            currentVersion: parsed.versions[0].name
          });
          console.log(this.state.currentVersion);
          if (this.state.currentVersion === -1) {
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
    if (this.state.installedVersion !== -1 && !this.state.toldUserAboutUpdate) {
      if (Tools.compareVersion(this.state.installedVersion, this.state.currentVersion) === -1 && this.state.currentVersion.replace(/\D/g, '') > REQUIRED_DAEMON_VERSION) {
        this.setState({
          toldUserAboutUpdate: true
        });
        event.emit('daemonUpdate');
      }
    }
  }

  async downloadDaemon() {
    const walletDirectory = grabWalletDir();
    const daemonDownloadURL = getDaemonDownloadUrl();
    console.log(daemonDownloadURL);

    this.setState({
      downloadingDaemon: true
    });
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
        const latestDaemonVersion = latestDaemon.name.substring(1);
        const zipChecksum = latestDaemon.checksum;
        const downloadUrl = latestDaemon.download_url;
        const downloadFileName = getPlatformName() === ('win32' || 'win64') ? 'Eccoind.zip' : 'Eccoind.tar.gz';
        console.log(getPlatformName())
        const downloaded = await downloadFile(downloadUrl, walletDirectory, downloadFileName, zipChecksum, true);

        if (downloaded === true) {
          const platFileName = getPlatformFileName();
          fs.rename(walletDirectory + "eccoin-"+ latestDaemonVersion +"/bin/eccoind", walletDirectory + platFileName, function (err) {
            if (err) reject(err)
            console.log('Successfully renamed - AKA moved!')
          });
          self.setState({
            installedVersion: await this.checkIfDaemonExists(),
            downloading: false
          });
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

  /**
   * Start the daemon instance
   * @param args
   */
  startDaemon(args) {
    console.log('starting daemon...');
    this.props.wallet.walletstart(args).then((result) => {
      if (result) {
        event.emit('daemonStarted');
        this.props.setDaemonRunning(true);
      } else {
        this.props.setDaemonRunning(false);
        event.emit('daemonFailed');
      }
    }).catch(err => {
      console.log('Error starting daemon');
      console.log(err);
      event.emit('loading-error', { message: err.message });
    });
  }

  /**
   * Stop the daemon
   * @returns {*}
   */

  async stopDaemon() {
    return new Promise((resolve, reject) => {
      this.props.wallet.walletstop()
        .then((data) => {
          console.log(data);
          if (data && data === 'ECC server stopping') {
            console.log('stopping daemon');
            this.props.setDaemonRunning(false);
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
  };
};

export default connect(mapStateToProps, actions)(Connector);
