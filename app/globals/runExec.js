const { exec, execFile } = require('child_process');

export async function runExec(cmd, timeout) {
  return new Promise(async(resolve, reject) => {
    await exec(cmd,{timeout: timeout}, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
      // console.log(`stdout: ${stdout}`);
      // console.log(`stderr: ${stderr}`);
    });
  });
}

export async function runExecFile(cmd, args, timeout) {
  return new Promise(async(resolve, reject) => {
    await execFile(cmd, args, {timeout: timeout}, (error, stdout, stderr) => {
      if (error && stderr) {
        console.log(error)
        reject(error);
      } else {
        resolve(stdout);
      }
      // console.log(`stdout: ${stdout}`);
      // console.log(`stderr: ${stderr}`);
    });
  });
}
