import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import { getPlatformWalletUri, grabWalletDir, grabEccoinDir, getDaemonDownloadUrl, getPlatformFileName } from '../utils/platform.service';
import * as actions from '../actions/index';

import ConnectorNews from './News';
import ConnectorCoin from './Coin';
import ConnectorMarket from './Market';
import Tools from '../utils/tools';
import { downloadFile } from '../utils/downloader';

const arch = require('arch');
const find = require('find-process');
const request = require('request-promise-native');
const fs = require('fs');
const event = require('../utils/eventhandler');
const settings = require('electron-settings');

const REQUIRED_DAEMON_VERSION = 2511;

class Connector extends Component {
  constructor(props) {
    super(props);

    this.path = `${grabWalletDir()}`;
    this.versionPath = `${grabWalletDir()}wallet-version.txt`;
    this.arch = arch();
    this.os = process.platform;
    this.arch = process.arch;

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
    this.initialSetup();
  }

  componentWillUnmount() {
    clearInterval(this.state.daemonCheckerTimer);
    clearInterval(this.state.daemonUpdateTimer);

    event.removeListener('start');
    event.removeListener('stop');
    event.removeListener('updateDaemon');
  }

  bindListeners() {
    event.on('start', async (args) => {
      await this.startDaemon(args);
    });

    event.on('stop', async () => {
      await this.stopDaemon((err) => {
        if (err) console.log('error stopping daemon: ', err);
        console.log('stopped daemon');
      });
    });

    event.on('updateDaemon', async (restart) => {
      this.setState({
        shouldRestart: restart
      });
      await this.updateDaemon();
    });
  }

  async initialSetup() {
    let daemonCredentials = await Tools.readRpcCredentials();
    const iVersion = await this.checkIfDaemonExists();
    this.setState({
      installedVersion: iVersion
    });

    if (!daemonCredentials || daemonCredentials.username === 'yourusername' || daemonCredentials.password === 'yourpassword') {
      daemonCredentials = {
        username: Tools.generateId(5),
        password: Tools.generateId(5)
      };
      await Tools.updateOrCreateConfig(daemonCredentials.username, daemonCredentials.password);
    }

    console.log('going to check daemon version');
    console.log(this.state.installedVersion);
    let version = this.state.installedVersion === -1 ? this.state.installedVersion : parseInt(this.state.installedVersion.replace(/\D/g, ''));
    console.log('VERSION INT: ', version);
    const walletFile = await this.checkIfWalletExists();
    this.setState({
      walletDat: walletFile
    });

    console.log('getting latest version');
    await this.getLatestVersion();

    console.log(this.state.currentVersion);
    console.log('got latest version');
    if (this.state.installedVersion === -1 || version < REQUIRED_DAEMON_VERSION) {
      do {
        try {
          await this.downloadDaemon();
          version = parseInt(this.state.installedVersion.replace(/\D/g, ''));
        } catch (e) {
          event.emit('download-error', { message: e.message });
        }
      } while (this.state.installedVersion === -1 || version < REQUIRED_DAEMON_VERSION);
      console.log('telling electron about wallet.dat');
    }
    console.log(this.state.walletDat, daemonCredentials);
    this.createWallet(this.state.walletDat, daemonCredentials);
    this.startDaemonChecker();
  }


  /**
   * Create the wallet instance
   * @param dataFileExists
   * @param credentials
   */
  createWallet(dataFileExists, credentials) {
    this.props.setWalletCredentials(credentials);

    // alert('credentials');
    const key = 'settings.initialSetup';
    if (settings.has(key)) {
      const val = settings.get(key);
      this.props.setStepInitialSetup(val);
    } else {
      this.props.setStepInitialSetup('start');
    }
    event.emit('startConnectorChildren');
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
          if (!self.state.downloadingDaemon && self.props.daemonErrorPopup !== true) { event.emit('start'); }
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

  async updateDaemon() {
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
        }
      }, 7000);
    }
  }


  async getLatestVersion() {
    console.log('checking for latest daemon version');
    let failCounter = 0;
    const daemonDownloadURL = getDaemonDownloadUrl();
    const self = this;
    // download latest daemon info from server
    const opts = {
      url: daemonDownloadURL
    };

    request(opts).then(async (data) => {
      if (data) {
        const parsed = JSON.parse(data);
        this.setState({
          currentVersion: parsed.versions[0].name
        });
        console.log(this.state.currentVersion);
        if (this.state.currentVersion === -1) {
          if (failCounter < 3) {
            console.log("in here");
            await self.getLatestVersion();
          } else {
            event.emit('download-error', { message: 'Error Checking for latest version' });
          }
          failCounter += 1;
        } else {
          self.checkForUpdates();
        }
      }
    }).catch(error => {
      console.log(error.message);
      failCounter += 1;
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
        const latestVersion = latestDaemon.name.substring(1);
        const zipChecksum = latestDaemon.checksum;
        const downloadUrl = latestDaemon.download_url;

        const downloaded = await downloadFile(downloadUrl, walletDirectory, 'Eccoind.zip', zipChecksum, true);

        if (downloaded) {
          await self.saveVersion(self.state.installedVersion);
          self.setState({
            installedVersion: latestVersion,
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


  async saveVersion(version) {
    console.log(this.versionPath);
    console.log(`version${version}`);
    const writer = fs.createWriteStream(this.versionPath);
    writer.write(version.toString());
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
      } else {
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
    daemonErrorPopup: state.application.daemonErrorPopup
  };
};

export default connect(mapStateToProps, actions)(Connector);
