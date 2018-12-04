import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import { getPlatformWalletUri, grabWalletDir, grabEccoinDir, getDaemonDownloadUrl, getPlatformFileName } from '../../utils/platform.service';
import * as actions from '../../actions';

import ConnectorNews from './News';
import ConnectorCoin from './Coin';
import Tools from '../../utils/tools';

const arch = require('arch');
const find = require('find-process');
const request = require('request-promise-native');
const fs = require('fs');
const event = require('../../utils/eventhandler');
const settings = require('electron-settings');

const REQUIRED_DAEMON_VERSION = 2511;

class Connector extends Component {
  constructor(props) {
    super(props);

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
    this.toldUserAboutUpdate = false;
    this.shouldRestart = undefined;

    this.state = {
      interval: 5000
    };

    this.initialSetup();
  }

  async initialSetup() {
    // event.on('start', () => {
    //   this.startDaemon((started) => {
    //     if (started) {
    //       event.emit('daemonStarted');
    //     } else event.emit('daemonFailed');
    //   });
    // });
    event.on('start', this.startDaemon.bind(this));

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
    }
    console.log(this.walletDat, daemonCredentials)
    this.createWallet(this.walletDat, daemonCredentials);
    this.startDaemonChecker();
  }


  /**
   * Create the wallet instance
   * @param event
   * @param arg
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

    this.startDaemonChecker();
    event.emit('startConnectorChildren');
  }


  startDaemonChecker() {
    this.checkIfDaemonIsRunning();
    this.intervalID = setInterval(this.checkIfDaemonIsRunning.bind(this), 30000);
    this.intervalIDCheckUpdates = setInterval(this.getLatestVersion.bind(this), 6000000);
  }


  checkIfDaemonIsRunning() {
    if (this.installedVersion !== -1 && !this.downloading) {
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


  /**
   * Start the daemon instance
   * @param withResult
   */
  startDaemon(withResult) {
    console.log('starting daemon...');
    this.props.wallet.walletstart((result) => {
      if (withResult) {
        if (result) {
          event.emit('daemonStarted');
        } else {
          event.emit('daemonFailed');
        }
      }
    }).catch(err => {
      console.log('Error starting daemon');
      console.log(err);
      event.emit('loading-error', { message: err.message });
    });
  }

  render() {
    return (
      <div>
        <ConnectorCoin />
        <ConnectorNews />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Connector);
