/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */

import MenuBuilder from './menu';
import {getDebugUri, grabEccoinDir} from './utils/platform.service';
import {traduction} from './lang/lang';


const { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain, remote } = require('electron');
const dialog = require('electron').dialog;
const settings = require('electron-settings');
const event = require('./utils/eventhandler');
const opn = require('opn');

const Tail = require('tail').Tail;
const fs = require('fs');
const AutoLaunch = require('auto-launch');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const path = require('path');


import {
  addAddress,
  addTransaction,
  getAllMyAddresses,
  getAllRewardTransactions,
  getLatestTransaction, getUnconfirmedTransactions,
  updateTransactionsConfirmations
} from './Managers/SQLManager';
const autoECCLauncher = new AutoLaunch({
  name: 'Sapphire'
});
let walletPath;
let tray = null;
let ds = null;
let mainWindow = null;
let daemonUpdate = false;
let fullScreen = false;

// check if daemon debug file exists


try {
  fs.mkdirSync(grabEccoinDir());
} catch (e) {
  console.log(e);
}

try {
  fs.writeFileSync(getDebugUri(), '\n');
} catch (e) {
  console.log(e);
}
const tail = new Tail(getDebugUri(), { useWatchFile: true });

function sendStatusToWindow(text) {
  mainWindow.webContents.send('message', text);
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('ready', async () => {
    ds = settings.get('settings.display');

    log.transports.file.level = 'debug';
    autoUpdater.logger = log;
    try {
      await autoUpdater.checkForUpdatesAndNotify();
    } catch (e) {
      console.log(e);
    }

    const selectedTheme = settings.get('settings.display.theme');

    const getBackgroundColor = () => {
      if (!selectedTheme || selectedTheme === 'theme-darkEcc') { return '#1c1c23'; } else if (selectedTheme && selectedTheme === 'theme-defaultEcc') { return '#181e35'; }
    };

    app.setAppUserModelId('com.github.project-ecc.sapphire');

    mainWindow = new BrowserWindow({
      show: true,
      width: 1367,
      height: 768,
      minWidth: 1024,
      minHeight: 600,
      title: 'Sapphire',
      backgroundColor: getBackgroundColor(),
      icon: getAppIcon(),
      frame: false,
      webPreferences: {
        backgroundThrottling: false,
        experimentalFeatures: true,
        nodeIntegration: true,
        nodeIntegrationInWorker: true
      }
    });

    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    });

    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      mainWindow.webContents.openDevTools();
    }

    // mainWindow.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
    await mainWindow.loadURL(`file://${__dirname}/app.html`);

    mainWindow.on('show', (event) => {
      mainWindow.setSkipTaskbar(false);
    });

    mainWindow.on('focus', (event) => {
      sendMessage('focused');
    });

    mainWindow.on('blur', (event) => {
      sendMessage('unfocused');
    });

    mainWindow.on('leave-full-screen', (event) => {
      if (process.platform === 'darwin') {
        sendMessage('full-screen');
        fullScreen = false;
      }
    });

    mainWindow.on('enter-full-screen', (event) => {
      if (process.platform === 'darwin') {
        sendMessage('full-screen');
        fullScreen = true;
      }
    });

    mainWindow.webContents.on('before-input-event', async (event, input) => {
      if ((input.key.toLowerCase() === 'q' || input.key.toLowerCase() === 'w') && input.control) {
        event.preventDefault();
        app.quit();
      }
    });

    mainWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      opn(url);
    });

    // mainWindow.on('close', async (e) => {
    //   e.preventDefault();
    //   await closeApplication();
    // });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    if (ds === undefined || ds.tray_icon === undefined || !ds.tray_icon) {
      setupTrayIcon();
    }

    if (ds !== undefined && ds.start_at_login !== undefined && ds.start_at_login) {
      autoECCLauncher.enable();
    } else {
      autoECCLauncher.disable();
    }

    setupEventHandlers();

    app.setAppUserModelId(process.execPath)

    // define a new console
    // override the old console to use it in the logger too
    mainWindow.console = ((oldCons => ({
      log: ((text) => {
        oldCons.log(text);
        log.debug(text);
      }),
      info: ((text) => {
        oldCons.info(text);
        log.info(text);
        // Your code
      }),
      warn: ((text) => {
        oldCons.warn(text);
        log.warn(text);
        // Your code
      }),
      error: ((text) => {
        oldCons.error(text);
        log.error(text);
        // Your code
      })
    }))(mainWindow.console));
  });
}

async function closeApplication() {
  console.log('closeApplication()');
  if (ds !== undefined && ds.minimise_on_close !== undefined && ds.minimise_on_close) {
    if (!ds.minimise_to_tray) {
      mainWindow.minimize();
    } else {
      mainWindow.hide();
    }
  } else {
    // console.log('Herererere', mainWindow);
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }

    //TODO UNCOMMENT THIUS
    sendMessage('stop', { restart: false, closeApplication: true });
    console.log('shutting down daemon');
  }
}

// app.on('before-quit', async (e) => {
//   e.preventDefault();
//   await closeApplication();
// });

function setupTrayIcon() {
  let trayImage = getAppIcon();
  tray = new Tray(nativeImage.createFromPath(trayImage));
  tray.setToolTip('Sapphire');

  var contextMenu = Menu.buildFromTemplate([
      { label: 'Open Sapphire', click:  function(){
            ipcMain.emit('show');
      } },
      { label: 'Minimize Sapphire', click:  function(){
          ipcMain.emit('minimize');
      } },
      { label: 'Quit Sapphire', click:  function(){
          ipcMain.emit('closeApplication');
      } }
  ]);

  tray.setContextMenu(contextMenu)

}

export function getAppIcon(){
  let trayImage;
  const imageFolder = path.join(__dirname, '..', 'resources');
  //console.log("Loading tray icons");
  //console.log(imageFolder);
  // Determine appropriate icon for platform
  if (process.platform === 'darwin' || process.platform === 'linux') {
    trayImage = `${imageFolder}/icon.png`;
  } else {
    trayImage = `${imageFolder}/icon.ico`;
  }
  return trayImage;
}

function setupEventHandlers() {
  ipcMain.on('messagingView', (e, args) => {
    if (args) {
      mainWindow.setMinimumSize(400, 600);
    }		else {
      if (mainWindow.getSize()[0] < 800) {
        mainWindow.setSize(800, mainWindow.getSize()[1]);
      }
      mainWindow.setMinimumSize(800, 600);
    }
  });

  ipcMain.on('autoStart', (e, autoStart) => {
    if (autoStart) { autoECCLauncher.enable(); } else autoECCLauncher.disable();
  });

  ipcMain.on('show', (e, args) => {
    mainWindow.show();
    mainWindow.focus();
  });

  ipcMain.on('app:ready', (e, args) => {
    console.log('ELECTRON GOT READY MESSAGE');
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
  });

  ipcMain.on('autoStart', (e, autoStart) => {
    if (autoStart) { autoECCLauncher.enable(); } else autoECCLauncher.disable();
  });

  ipcMain.on('minimize', (e, args) => {
    if (ds !== undefined && ds.minimise_to_tray !== undefined && ds.minimise_to_tray) {
      mainWindow.setSkipTaskbar(true);
      mainWindow.hide();
      return;
    }
    mainWindow.minimize();
  });

  ipcMain.on('full-screen', (e, args) => {
    if (fullScreen) { mainWindow.setFullScreen(false); } else { mainWindow.setFullScreen(true); }

    fullScreen = !fullScreen;
  });

  ipcMain.on('quit', async () => {
    app.quit();
  });

  ipcMain.on('start', (args) => {
    sendMessage('start', args);
  });

  ipcMain.on('hideTray', (e, hideTray) => {
    if (!hideTray) { setupTrayIcon(); } else { tray.destroy(); }
  });

  ipcMain.on('reloadSettings', () => {
    ds = settings.get('settings.display');
  });

  ipcMain.on('maximize', (e, args) => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  // done with initial setup tell DaemonManager to start
  ipcMain.on('refresh-complete', (e, args) => {
    sendMessage('refresh-complete');
  });

  ipcMain.on('closeApplication', async () => {
    await closeApplication();
    console.log('closing application ipc');
  });

  event.on('wallet', (exists, daemonCredentials) => {
    // exists: does wallet.dat exist
    // deamonCredentials: object of username and password
    // var initialSetup = settings.has('settings.initialSetup');
    // console.log('GOT MESSAGE', exists, daemonCredentials);

    sendMessage('daemonCredentials', {
      credentials: daemonCredentials
    });

  });

  event.on('daemonUpdate', () => {
    console.log('electron got daemon update message, sending to GUI');
    daemonUpdate = true;
    sendMessage('daemonUpdate');
  });

  event.on('updatedDaemon', () => {
    sendMessage('daemonUpdated');
    daemonUpdate = false;
  });

  event.on('daemonStarted', () => {
    sendMessage('importedWallet');
  });

  event.on('loading-error', (payload) => {
    sendMessage('loading-error', payload);
  });

  ipcMain.on('loading-error', (e, args) => {
    sendMessage('loading-error', args);
  });

  ipcMain.on('selected-currency', (e, args) => {
    sendMessage('selected-currency', args);
  });

  ipcMain.on('importWallet', (e, args) => {
    openFile();
  });

  ipcMain.on('update', (e, args) => {
    console.log('electron got update signal, sending to daemon');
    event.emit('updateDaemon', args);
  });

  // Reload Addresses
  ipcMain.on('processAddresses', async (event, arg) => {
    console.log(arg)
  });
  // Toggle Staking State
  ipcMain.on('processTransactions', async () => {

  });
}

function sendMessage(type, argument = undefined) {
  if (mainWindow != null) {
    console.log('sending message: ', type);
    mainWindow.webContents.send(type, argument);
  }
}


function openFile() {
  console.log('called open file');
  const lang = traduction();
  dialog.showOpenDialog({ title: lang.selectAFileName,
    filters: [

   { name: 'wallet', extensions: ['dat'] }

    ] }, (fileNames) => {
    if (fileNames === undefined) {
  	sendMessage('importCancelled');
  	return;
    }
    const fileName = fileNames[0];
    if (fileName.indexOf('wallet.dat') == -1)  	 {
      dialog.showMessageBox({ title: lang.wrongFileSelected,
        message: lang.pleaseSelectAFileNamed,
        type: 'error',
        buttons: ['OK'] }, () => {
        	openFile();
      });
    } else {
   	sendMessage('importStarted');
      walletPath = `${grabEccoinDir()}wallet.dat`;
      console.log(walletPath);

   	copyFile(fileName, walletPath, (err) => {
     if (err) {
       console.log('error copying wallet: ', err);
     }		else {
       sendMessage('importedWallet');
       event.emit('start');
     }
   	});
    }
  });
}

function copyFile(source, target, cb) {
  let cbCalled = false;

  const rd = fs.createReadStream(source);
  rd.on('error', (err) => {
    done(err);
  });
  const wr = fs.createWriteStream(target);
  wr.on('error', (err) => {
  	if (err.indexOf('ENOENT') > -1) {
  		done(err);
  	}
    done(err);
  });
  wr.on('close', (ex) => {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

tail.on('line', (data) => {
  const ignoreStrings = [
    'UpdateTip:',
    'sending getdata',
    'sending getheaders',
    'LoadExternalBlockFile'
  ];
  const castedArg = String(data);
  if (castedArg != null && (!ignoreStrings.some((v) => { return castedArg.indexOf(v) > -1; }))) {
    sendMessage('message-from-log', data);
  }
});


