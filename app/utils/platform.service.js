import urls from '../../daemon-data.json';
const homedir = require('os').homedir();
const os = require('os');

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
export function getDaemonUrl() {
  if (process.platform === 'linux') {

    return os.arch() === 'x32' ? urls.linux32: urls.linux64;

  } else if (process.platform === 'darwin') {

    return urls.osx;

  } else if (process.platform.indexOf('win') > -1) {

    return os.arch() === 'x32' ? urls.win32: urls.win64;
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

