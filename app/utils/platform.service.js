import sapphireConfig from '../../gui-data.json';

const homedir = require('os').homedir();
let arch = require('arch');

let serverUrl = process.env.UPDATE_SERVER_URL;
let humanURL = process.env.HUMAN_READABLE_UPDATE_URL;


export function getPlatformName(){
  if (process.platform === 'linux') {

    return arch() === 'x86' ? 'linux32' : 'linux64';

  } else if (process.platform === 'darwin') {

    return 'osx64';

  } else if (process.platform.indexOf('win') > -1) {

    return arch() === 'x86' ? 'win32' : 'win64';
  }
}
export function getPlatformFileName() {

  if (process.platform === 'linux') {

    return arch() === 'x86' ? 'eccoind-linux32' : 'eccoind-linux64';

  } else if (process.platform === 'darwin') {

    return 'eccoind';

  } else if (process.platform.indexOf('win') > -1) {

    return arch() === 'x86' ? 'eccoind-win32.exe' : 'eccoind-win64.exe';
  }
}

export function getDaemonDownloadUrl() {

  let url = serverUrl + '/v1/products/eccoind/';

  if (process.platform === 'linux') {
    url += arch() === 'x86' ? 'linux32' : 'linux64';

  } else if (process.platform === 'darwin') {
    url += 'mac';

  } else if (process.platform.indexOf('win') > -1) {
    url += arch() === 'x86' ? 'win32' : 'win64';
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
  let folderName = '';
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    folderName = 'Electron'
  } else {
    folderName = 'Sapphire'
  }
  if (process.platform === 'linux') {
    // linux directory
    return `${homedir}/.config/${folderName}/`;
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
    return `${grabWalletDir()}${getPlatformFileName()}`;
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

/**
 * This function forwards the daemon zip download url given the inputted parameters.
 * @param product
 * @param version
 * @param platform
 * @returns {string}
 */

export function formatDownloadURL(product, version, platform) {
  if (platform === 'win32' || platform === 'win64'){
    return humanURL + `/download/${product}${version}/${product}-${version}-${platform}.zip`;
  }
  return humanURL + `/download/${product}${version}/${product}-${version}-${platform}.tar.gz`;
}


/**
 * Extracts the platform zip checksum from the body of text on the github release page.
 * @param platform
 * @param text
 * @returns {string}
 */

export function extractChecksum (platform, text) {
  // kinda shitty...node doesn't have dotall (s flag) as of this code...whitespace/not whitespace is a hack...
  const checksumMatches = text.match(new RegExp(`[\\s\\S]*checksum-${platform}: (\\w+)[\\s\\S]*`));

  return (checksumMatches && checksumMatches.length > 1) ? checksumMatches[1] : '';
}

