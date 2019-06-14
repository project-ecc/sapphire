import {getPlatformFileName, grabWalletDir} from "./platform.service";

const fs = require('fs');
const request = require('request-promise-native');
const progress = require('request-progress');
const checksum = require('checksum');
const tar = require('tar');
const extract = require('extract-zip');
const path = require('path');
const event = require('../utils/eventhandler');
/**
 * This function downloads files and can either unzip them or validate them against a checksum value (cs)
 * @param srcUrl
 * @param destFolder
 * @param destFileName
 * @param cs
 *
 * @param unzip
 */
export function downloadFile(srcUrl, destFolder, destFileName, cs = null, unzip = false) {
  return new Promise((resolve, reject) => {
    const downloadRequestOpts = {
      url: srcUrl,
      encoding: null,
      timeout: 15000
    };

    const fileName = destFolder + destFileName;

    if(!fs.existsSync(destFolder)){
      fs.mkdirSync(destFolder);
    }

    progress(request.get(downloadRequestOpts), {
       throttle: 250,                    // Throttle the progress event to 2000ms, defaults to 1000ms
      // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
      // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
    })
      .on('progress', (state) => {
        // The state is an object that looks like this:
        // {
        //     percent: 0.5,               // Overall percent (between 0 to 1)
        //     speed: 554732,              // The download speed in bytes/sec
        //     size: {
        //         total: 90044871,        // The total payload size in bytes
        //         transferred: 27610959   // The transferred payload size in bytes
        //     },
        //     time: {
        //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
        //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
        //     }
        // }
        // console.log('progress', state);
        event.emit('downloading-file', state);
      })
      .on('error', function (err) {
        console.log(`Error extracting  zip ${err}`);
        if(fs.existsSync(destFileName)){
          fs.unlink(destFileName);
        }
        event.emit('download-error', err);
        resolve(err);
        // Do something with err
      })
      .on('end', async () => {
        event.emit('downloaded-file');
        console.log(fileName)
        try {
          if (cs !== null) {
            const validated = await validateChecksum(fileName, cs);
            if (!validated) reject(validated);
          }
          if(unzip) {
            const unzipped = await unzipFile(fileName, destFolder, true);
            if(!unzipped) reject(unzipped);
          }
          event.emit('file-download-complete');
          resolve(true);
        } catch (e){
          reject(e)
        }
      })
      .pipe(fs.createWriteStream(fileName));
  });
}

/**
 * This function unzips a file in the download function.
 * @param fileToUnzip
 * @param targetDirectory
 * @param deleteOldZip
 * @returns {Promise}
 */
export function unzipFile(fileToUnzip, targetDirectory, deleteOldZip = false) {
  return new Promise(async(resolve, reject) => {
    let ext = path.extname(fileToUnzip);
    console.log(ext);
    if(ext === '.zip'){
      extract(fileToUnzip, { dir: targetDirectory }, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          event.emit('unzipping-file', { message: 'Unzipped!' });
          console.log('unzip successfully.');
          if(deleteOldZip){
            if (fs.existsSync(fileToUnzip)) {
              fs.unlinkSync(fileToUnzip, (deleteFileError) => {
                if (deleteFileError) {
                  console.log(deleteFileError);
                  reject(deleteFileError)
                }
              });
            }
          }
          event.emit('unzipping-file', { message: 'Cleaning up..' });
          console.log('File successfully deleted');
          event.emit('file-download-complete');
          resolve(true);
        }
      });
    } else {
      await tar.x(  // or tar.extract(
        {
          file: fileToUnzip,
          cwd: targetDirectory
        }
      ).then(_=> {
        event.emit('unzipping-file', { message: 'Unzipped!' });
        console.log('unzip successfully.');
        if(deleteOldZip){
          if (fs.existsSync(fileToUnzip)) {
            fs.unlinkSync(fileToUnzip, (deleteFileError) => {
              if (deleteFileError) {
                console.log(deleteFileError);
                reject(deleteFileError)
              }
            });
          }
        }
        event.emit('unzipping-file', { message: 'Cleaning up..' });
        console.log('File successfully deleted');
        event.emit('file-download-complete');
        resolve(true);
      })
    }
  });
}
/**
 * This function validates the checksum of a file against an inputted checksum
 * @param fileName
 * @param toValidateAgainst
 * @returns {Promise}
 */
export function validateChecksum (fileName, toValidateAgainst) {
  return new Promise((resolve, reject) =>{

    checksum.file(fileName, {'algorithm': 'sha256'}, (error, sum) => {
      const payload = {fileChecksum: sum, serverChecksum: toValidateAgainst};
      console.log(payload)
      event.emit('verifying-file', payload);
      console.log(`checksum from file ${sum}`);
      console.log(`validating against ${toValidateAgainst}`);
      console.log('Done downloading verifying');

      //event.emit('verifying-file');
      if (toValidateAgainst === sum) {
        resolve(true);
      } else {
        reject('Checksums do not match!');
      }
    });
  });
}

export function moveFile(oldLocation, newLocation){
  return new Promise((resolve, reject) => {
    try {
      fs.unlinkSync(grabWalletDir() + getPlatformFileName());
    } catch (e) {
      console.log(e)
    }
    try {
      fs.renameSync(oldLocation, newLocation);
      console.log('Successfully renamed - AKA moved!')
      resolve(true);
    } catch (e) {
      console.log(e)
      reject(e);
    }
  });
}
