import daemonConfig from '../../daemon-data.json';
import sapphireConfig from '../../gui-data.json';
const homedir = require('os').homedir();
let arch = require('arch');

let serverUrl = process.env.NODE_ENV === 'production' ? daemonConfig.live_server_address : daemonConfig.dev_server_address;

export function getPlatformFileName() {
  if (process.platform === 'linux') {

    return arch() === 'x86' ? 'eccoind-linux32' : 'eccoind-linux64';

  } else if (process.platform === 'darwin') {

    return 'Eccoind.app';

  } else if (process.platform.indexOf('win') > -1) {

    return arch() === 'x86' ? 'eccoind-win32.exe' : 'eccoind-win64.exe';
  }
}

export function getDaemonDownloadUrl() {

  let url = serverUrl + daemonConfig.daemon_url;

  if (process.platform === 'linux') {
    url += arch() === 'x86' ? daemonConfig.linux32 : daemonConfig.linux64;

  } else if (process.platform === 'darwin') {
    url += daemonConfig.osx;

  } else if (process.platform.indexOf('win') > -1) {
    url += arch() === 'x86' ? daemonConfig.win32 : daemonConfig.win64;
  }

  return url + "/versions.json";
}

export function getSapphireDownloadUrl() {

  let url = serverUrl + sapphireConfig.sapphire_url;

  if (process.platform === 'linux') {
    url += arch() === 'x86' ? sapphireConfig.linux32 : sapphireConfig.linux64;

  } else if (process.platform === 'darwin') {
    url += sapphireConfig.osx;

  } else if (process.platform.indexOf('win') > -1) {

    url += arch() === 'x86' ? sapphireConfig.win32 : sapphireConfig.win64;
  }

  return url + "/versions.json";
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

export function getSapphireDirectory() {
  let folderName = ''
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    folderName = 'Electron'
  } else {
    folderName = 'Sapphire'
  }
  if (process.platform === 'linux') {
    // linux directory
    return `${homedir}/${folderName}/`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${homedir}/Library/Application Support/${folderName}/`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${homedir}\\Appdata\\roaming\\${folderName}\\`;
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

