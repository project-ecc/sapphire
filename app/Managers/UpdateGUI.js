const homedir = require('os').homedir();
const { exec, execFile } = require('child_process');
const os = require('os');

function installGUI(){
	console.log("installing GUI...");

	const guiVersion = process.env.version;

  if (process.platform === 'linux') {
    const walletDir = `${homedir}/.eccoin-wallet/`;

    const fileName = 'sapphire';
    const architecture = os.arch() === 'x32' ? 'linux32' : 'linux64';
    const fullPath = walletDir + fileName + '-v' + guiVersion + '-' + architecture;

    runExec(`chmod +x ${fullPath} && ${fullPath}`, 1000).then(() => {
      process.exit();
    })
    .catch(() => {
      process.exit();
    });
  }
  else if(process.platform === 'darwin'){

    const walletDir =`${homedir}/Library/Application Support/.eccoin-wallet/`;
    const fileName = 'sapphire';
    let fullPath = walletDir + fileName + '-v' + guiVersion + '-mac.dmg';

    // This must be added to escape the space.
    fullPath = `"${fullPath}"`;
    console.log(fullPath)
    runExec(`open ${fullPath}`, 1000).then(() => {
      process.exit();
    })
    .catch(() => {
      process.exit();
    });

  }
  else if (process.platform.indexOf('win') > -1) {
    const walletDir = `${homedir}\\.eccoin-wallet\\`;

    const fileName = 'sapphire';
    const architecture = os.arch() === 'x32' ? 'win32' : 'win64';
    const fullPath = walletDir + fileName + '-v' + guiVersion + '-' + architecture + '.exe';

    console.log(fullPath)
    runExec(fullPath, 1000).then(() => {
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
