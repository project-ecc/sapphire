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

import path from 'path';
import MenuBuilder from './menu';
import DaemonManager from './Managers/DaemonManager';
import GUIManager from './Managers/GUIManager';
import {grabEccoinDir, grabWalletDir} from "./utils/platform.service";
import os from 'os';
import { traduction } from './lang/lang';
import {version} from './../package.json';
const { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain, remote } = require('electron');
const dialog = require('electron').dialog;
const settings = require('electron-settings');
const event = require('./utils/eventhandler');

var fs = require('fs');
var AutoLaunch = require('auto-launch');
let autoECCLauncher = new AutoLaunch({
	name: 'Sapphire'
});
let walletPath;
let tray = null;
let daemonManager = null;
let guiManager = null;
let maximized = false;
let ds = null;
let mainWindow = null;
let guiUpdate = false;
let daemonUpdate = false;
let fullScreen = false;

function sendStatusToWindow(text) {
  mainWindow.webContents.send('message', text);
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};

app.on('ready', async () => {

  ds = settings.get('settings.display');
  const walletDir = grabWalletDir();
  const fileName = 'sapphire';
  let fullPath = ''
  //delete downloaded update if it exists.
  if (process.platform === 'linux') {

    const architecture = os.arch() === 'x32' ? 'linux32' : 'linux64';
    fullPath = walletDir + fileName + '-v' + version + '-' + architecture;

  }
  else if(process.platform === 'darwin'){

    fullPath = walletDir + fileName + '-v' + version + '-mac.dmg';
  }
  else if (process.platform.indexOf('win') > -1) {

    const architecture = os.arch() === 'x32' ? 'win32' : 'win64';
    fullPath = walletDir + fileName + '-v' + version + '-' + architecture + '.exe';

  }

  if(fs.existsSync(fullPath)){
    fs.unlink(fullPath)
  }

  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  const selectedTheme = settings.get('settings.display.theme');

  const getBackgroundColor = () => {
    if(!selectedTheme || selectedTheme === "theme-darkEcc")
      return "#1c1c23";
    else if(selectedTheme && selectedTheme === "theme-defaultEcc")
      return "#181e35";
  }

  app.setAppUserModelId("com.github.csmartinsfct.sapphire");

  mainWindow = new BrowserWindow({
    show: false,
    width: 1367,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    title: "Sapphire",
    backgroundColor: getBackgroundColor(),
    frame: false,
    webPreferences: {backgroundThrottling: false}
  });

  mainWindow.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.on('show', function (event) {
    mainWindow.setSkipTaskbar(false);
  });

  mainWindow.on('focus', function (event) {
  	sendMessage("focused");
  });

  mainWindow.on('blur', function (event) {
    sendMessage("unfocused");
  });

  mainWindow.on('leave-full-screen', function(event){
  if (process.platform === 'darwin'){
  		sendMessage("full-screen");
  		fullScreen = false
  	}
  });

  mainWindow.on('enter-full-screen', function(event){
  	if (process.platform === 'darwin'){
  		sendMessage("full-screen");
  		fullScreen = true;
  	}
  });

  mainWindow.on('close', function (event) {
    if (ds !== undefined && ds.minimise_on_close !== undefined && ds.minimise_on_close) {
      event.preventDefault();
      if (!ds.minimise_to_tray) {
        mainWindow.minimize();
      } else {
        mainWindow.hide();
      }
    } else {
      app.quit();
    }
    return false;
  });

	mainWindow.webContents.on('before-input-event', async function (event, input) {
		if ((input.key.toLowerCase() === 'q' || input.key.toLowerCase() === "w") && input.control) {
			event.preventDefault();
			sendMessage("closing_daemon");
			let closedDaemon = false;
			do{
				closedDaemon = await daemonManager.stopDaemon();
			}while(!closedDaemon);
			app.exit(0);
		}
	});

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
});

function setupTrayIcon() {
  var trayImage;
  var imageFolder = __dirname + '/dist/assets';

  // Determine appropriate icon for platform
  if (process.platform === "darwin" || process.platform === "linux") {
    trayImage = imageFolder + '/trayIconTemplate.png';
  } else {
    trayImage = imageFolder + '/icon.ico';
  }
  tray = new Tray(nativeImage.createFromPath(trayImage));

	const defaultMenu = [
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: async function() {
        sendMessage("closing_daemon");
        let closedDaemon = false;
        do {
          closedDaemon = await daemonManager.stopDaemon();
        } while (!closedDaemon);
        app.exit(0);
      }
    }
  ];

  tray.setToolTip('Sapphire');
  //const contextMenu = Menu.buildFromTemplate(defaultMenu);
  //tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

function setupEventHandlers() {

	ipcMain.on('messagingView', (e, args) => {
		if(args){
			mainWindow.setMinimumSize(400,600);
		}
		else{
			if(mainWindow.getSize()[0] < 800){
				mainWindow.setSize(800, mainWindow.getSize()[1]);
			}
			mainWindow.setMinimumSize(800,600);
		}
	});

	ipcMain.on('autoStart', (e, autoStart) => {
		if(autoStart)
			autoECCLauncher.enable();
		else autoECCLauncher.disable();
	});

	ipcMain.on('show', (e, args) => {
    mainWindow.show()
		mainWindow.focus();
	});

  ipcMain.on('app:ready', (e, args) => {
    console.log("ELECTRON GOT READY MESSAGE");
    guiManager = new GUIManager();
    daemonManager = new DaemonManager();
    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    });
  });

  ipcMain.on('autoStart', (e, autoStart) => {
    if(autoStart)
      autoECCLauncher.enable();
    else autoECCLauncher.disable();
  });

  ipcMain.on('minimize', (e, args) => {
    if(ds !== undefined && ds.minimise_to_tray !== undefined && ds.minimise_to_tray){
      mainWindow.setSkipTaskbar(true);
      mainWindow.hide();
      return;
    }
    mainWindow.minimize();
  });

  ipcMain.on('full-screen', (e, args) => {
    if(fullScreen)
      mainWindow.setFullScreen(false);
    else
      mainWindow.setFullScreen(true);

    fullScreen = !fullScreen;
  });

  ipcMain.on('hideTray', (e, hideTray) => {
    if(!hideTray)
      setupTrayIcon();
    else
      tray.destroy()
  });

  ipcMain.on('reloadSettings', () => {
    ds = settings.get('settings.display');
  });

  ipcMain.on('maximize', (e, args) => {
    if(!maximized)
      mainWindow.maximize();
    else mainWindow.unmaximize();

    maximized = !maximized;
  });

  //done with initial setup tell DaemonManager to start
  ipcMain.on('initialSetup', (e, args) => {
    settings.set('settings.initialSetup', true);
    daemonManager.startDaemonChecker();
  });

  ipcMain.on('close', async (e, args) => {
      //daemonManager.stopDaemon();
    if (ds !== undefined && ds.minimise_on_close !== undefined && ds.minimise_on_close) {
        if (!ds.minimise_to_tray) {
          mainWindow.minimize();
        } else {
          mainWindow.hide();
        }
      } else {
        let closedDaemon = false;
        do{
          closedDaemon = await daemonManager.stopDaemon();
          console.log(closedDaemon)
        }while(!closedDaemon);
        app.quit();
      }
  });

  event.on('wallet', (exists, daemonCredentials) => {
    var initialSetup = settings.has('settings.initialSetup');

    sendMessage("daemonCredentials", daemonCredentials)

    if(initialSetup && exists){
      sendMessage("setup_done");
    }
    else if(initialSetup && !exists){
      sendMessage("import_wallet");
    }
    else if(!initialSetup && exists){
      sendMessage("partial_initial_setup");
    }
    else if(!initialSetup && !exists){
      sendMessage("initial_setup");
    }
  });

  event.on('daemonUpdate', () => {
    console.log("electron got daemon update message, sending to GUI");
    daemonUpdate = true;
    sendMessage('daemonUpdate');
  });

  event.on('guiUpdate', () => {
    console.log("electron got gui update message, sending to GUI");
    guiUpdate = true;
    sendMessage('guiUpdate');
  });

  // TODO Csmartins.

  event.on('updateFailed', (errorMessage) => {
    console.log(errorMessage)
    app.quit();
  });

  event.on('updatedDaemon', () => {
    sendMessage("daemonUpdated");
    daemonUpdate = false;
    if(guiUpdate){
      event.emit('updateGui');
    }
  });

  event.on('daemonStarted', () => {
    sendMessage("importedWallet");
  });


  //downloader events.
  event.on('downloading-file', (payload) => {
    sendMessage('downloading-file', payload)
  });

  event.on('downloaded-file', () => {
    sendMessage('downloading-file');
  });

  event.on('verifying-file', () => {
    sendMessage('verifying-file');
  });

  event.on('unzipping-file', () => {
    sendMessage('unzipping-file');
  });

  event.on('file-download-complete', () => {
    sendMessage('file-download-complete');
  });

  event.on('download-error', (payload) => {
    sendMessage('download-error', payload);
    console.log(payload);
  });

  ipcMain.on('importWallet', (e, args) => {
    openFile();
  });

  ipcMain.on('update', (e, args) => {
    console.log("electron got update signal, sending to daemon");
    console.log(guiUpdate);
    console.log(daemonUpdate);
    if(guiUpdate && daemonUpdate){
      event.emit('updateDaemon', false);
    }
    else if(guiUpdate){
      event.emit('updateGui');
    }
    else {
      event.emit('updateDaemon');
    }
  });
}

function sendMessage(type, argument = undefined) {
	console.log("sending message: ", type);
  mainWindow.webContents.send(type, argument);
}


function openFile () {
  console.log("called open file");
  var lang = traduction();
 dialog.showOpenDialog({ title: lang.selectAFileName, filters: [

   { name: 'wallet', extensions: ['dat'] }

  ]}, function (fileNames) {
  if (fileNames === undefined){
  	sendMessage("importCancelled");
  	return;
  }
  var fileName = fileNames[0];
  if(fileName.indexOf("wallet.dat") == -1)
  	 dialog.showMessageBox({ title: lang.wrongFileSelected, message: lang.pleaseSelectAFileNamed, type: "error",
        buttons: ["OK"] }, function(){
        	openFile();
        });
   else{
   	sendMessage("importStarted");
    walletPath = `${grabEccoinDir()}wallet.dat`;
	console.log(walletPath);

   	copyFile(fileName, walletPath, function(err){
		if(err){
			console.log("error copying wallet: ", err);
		}
		else{
			sendMessage('importedWallet');
			event.emit('start');
		}
   	})
   }
 });
}

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
  	if(err.indexOf("ENOENT") > -1){
  		done(err);
  	}
    done(err);
  });
  wr.on("close", function(ex) {
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
