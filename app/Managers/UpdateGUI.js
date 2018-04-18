import {grabWalletDir} from "../utils/platform.service";

const homedir = require('os').homedir();
const { exec, execFile } = require('child_process');
const os = require('os');

function installGUI(){
	console.log("installing GUI...");

	const guiVersion = process.env.version;
	const walletDir = grabWalletDir();

  if (process.platform === 'linux') {

    const fileName = 'Sapphire';
    const architecture = os.arch() === 'x32' ? 'linux32' : 'linux64';
    const fullPath = walletDir + fileName + '-' + architecture + '-' + guiVersion;

    runExec(`chmod +x ${fullPath} && ${fullPath}`, 1000).then(() => {
      process.exit();
    })
    .catch(() => {

    });
  }
  else if(process.platform === 'darwin'){

    const fileName = 'Sapphire';
    const fullpath = walletDir + fileName + '-' + guiVersion + '.dmg';

    runExec(`open ${fullpath}`, 1000).then(() => {
      process.exit();
    })
    .catch(() => {
      process.exit();
    });

  }
  else if (process.platform.indexOf('win') > -1) {

    const fileName = 'Sapphire';
    const architecture = os.arch() === 'x32' ? 'win32' : 'win64';
    const fullPath = walletDir + fileName + '-' + architecture + '-' + guiVersion + '.exe';

    runExec(`${fullPath}.exe`, 1000).then(() => {
      process.exit();
    })
    .catch(() => {
      process.exit();
    });
  }
}

function runExec(cmd, timeout) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        console.log(stdout)
        resolve('program exited without an error');
      }
    });

  });
}

/*process.on('message', function(m) {


  process.send("ok");
});*/

setTimeout(installGUI, 2000);
