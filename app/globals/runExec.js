const { exec } = require('child_process');

export default async function runExec(cmd, timeout) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve('program exited without an error');
      }
    });
    setTimeout(() => {
      resolve('program still running');
    }, timeout);
  });
}
