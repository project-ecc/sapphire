	
const homedir = require('os').homedir();
const { exec } = require('child_process');
import Wallet from '../utils/wallet';

  async function stopDaemon(){
    var self = this;
    return new Promise(function(resolve, reject){
      self.wallet.walletstop()
          .then((data) => {
            if(data == "ECC server stopping"){
              console.log("stopping daemon");
              resolve(true);
            }
            else{
              
              return true;
            }
          })
          .catch(err => {
            console.log("failed to stop daemon:", err);
            resolve(false);
          });
      });
  }

function runExec(cmd, timeout) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve('program exited without an error');
      }
    });
  });
}

/*process.on('message', function(m) {
  

  process.send("ok");
});*/

setTimeout(installGUI, 2000);
