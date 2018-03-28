import daemonConfig from '../../daemon-data.json';
import sapphireConfig from '../../gui-data.json';
const homedir = require('os').homedir();
const os = require('os');

let serverUrl =
  process.env.NODE_ENV === 'production' ? daemonConfig.live_server_address : daemonConfig.dev_server_address;

export function getPlatformFileName() {
  if (process.platform === 'linux') {

    return os.arch() === 'x32' ? 'eccoind-linux32' : 'eccoind-linux64';

  } else if (process.platform === 'darwin') {

    return 'Eccoind.app';

  } else if (process.platform.indexOf('win') > -1) {

    return os.arch() === 'x32' ? 'eccoind-win32.exe' : 'eccoind-win64.exe';
  }
}

export function getExecutableExtension(){
  if(this.os === 'win32') return '.exe';
  else if(this.os === 'linux') return '';
  else return '.app';

}

export function getDaemonDownloadUrl() {

  serverUrl += daemonConfig.daemon_url;

  if (process.platform === 'linux') {

    return serverUrl += os.arch() === 'x32' ? daemonConfig.linux32 : daemonConfig.linux64;

  } else if (process.platform === 'darwin') {

    serverUrl += daemonConfig.osx;
    return serverUrl;

  } else if (process.platform.indexOf('win') > -1) {

    return serverUrl += os.arch() === 'x32' ? daemonConfig.win32 : daemonConfig.win64;
  }
}

export function getSapphireDownloadUrl() {
  serverUrl += sapphireConfig.daemon_url;

  if (process.platform === 'linux') {

    return serverUrl += os.arch() === 'x32' ? sapphireConfig.linux32 : sapphireConfig.linux64;

  } else if (process.platform === 'darwin') {

    serverUrl += sapphireConfig.osx;
    return serverUrl;

  } else if (process.platform.indexOf('win') > -1) {

    return serverUrl += os.arch() === 'x32' ? sapphireConfig.win32 : sapphireConfig.win64;
  }
}

export function grabWalletDir() {
  if (process.platform === 'linux') {
    // linux directory
    return `${homedir}/.eccoin-wallet/`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${homedir}/Library/Application Support/.eccoin-wallet/`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${homedir}\\.eccoin-wallet\\`;
  }
}

export function grabEccoinDir() {
  if (process.platform === 'linux') {
    // linux directory
    return `${homedir}/.eccoin/`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${homedir}/Library/Application Support/eccoin/`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${homedir}\\Appdata\\roaming\\eccoin\\`;
  }
}

export function getPlatformWalletUri() {
  if (process.platform === 'linux') {
    // linux directory
    return `${grabWalletDir()}${getPlatformFileName()}`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${grabWalletDir()}${getPlatformFileName()}/Contents/MacOS/eccoind`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${grabWalletDir()}${getPlatformFileName()}`;
  }
}

export function getConfUri() {
  return `${grabEccoinDir()}eccoin.conf`;
}

export function getDebugUri() {
  return `${grabEccoinDir()}debug.log`;
}

