const homedir = require('os').homedir();
const { exec, execFile } = require('child_process');

function installGUI(){
	console.log("installing GUI...");
	const guiVersion = process.env.version;
    const path = `${homedir}/.eccoin-wallet/Sapphire`;
    if (process.platform === 'linux') {
     runExec(`chmod +x ${path} && ${path}`, 1000).then(() => {
        process.exit();
      })
      .catch(() => {

      });
    }
    else if(process.platform === 'darwin'){
      const path = `"${homedir}/Library/Application\ Support/.eccoin-wallet/Sapphire-${guiVersion}.dmg"`;

      runExec(`open ${path}`, 1000).then(() => {
        process.exit();
      })
      .catch(() => {
        process.exit();
      });

    } else if (process.platform.indexOf('win') > -1) {
      runExec(`${path}.exe`, 1000).then(() => {
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
