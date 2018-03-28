const fs = require('fs');
const request = require('request-promise-native');
const checksum = require('checksum');
const extract = require('extract-zip');
/**
 * This function downloads files and can either unzip them or validate them against a checksum value (cs)
 * @param srcUrl
 * @param destFolder
 * @param destFileName
 * @param cs
 * @param unzip
 */
export function downloadFile(srcUrl, destFolder, destFileName, cs = null, unzip = false) {
  return new Promise((resolve, reject) => {
    const downloadRequestOpts = {
      url: srcUrl,
      encoding: null,
    };

    const fileName = destFolder + destFileName;

    request.get(downloadRequestOpts).then(async (res) => {
      fs.writeFileSync(fileName, res);

      if (cs !== null) {
        const validated = await validateChecksum(fileName, cs);
        if (!validated) reject(validated);
      }

      if(unzip) {
        const unzipped = await unzipFile(fileName, destFolder, true);
        if(!unzipped) reject(unzipped);
      }
      resolve(true);

    }).catch((err) => {
      console.log(`Error extracting  zip ${err}`);
      fs.unlink(destFileName);
      resolve(err);
    });
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
  return new Promise((resolve, reject) =>{
    extract(fileToUnzip, { dir: targetDirectory }, (err) => {
      if (err) {
        console.log(err);
        reject(err)
      } else {
        console.log('unzip successfully.');
        if(deleteOldZip){
          if (fs.existsSync(fileToUnzip)) {
            fs.unlink(fileToUnzip, (deleteFileError) => {
              if (deleteFileError) {
                console.log(deleteFileError);
                reject(deleteFileError)
              } else {
                console.log('File successfully deleted');
                resolve(true);
              }
            });
          }
        }
        resolve(true);
      }
    });
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
    checksum.file(fileName, (error, sum) => {

      console.log(`checksum from file ${sum}`);
      console.log(`validating against ${toValidateAgainst}`);
      console.log('Done downloading verifying');

      if (toValidateAgainst === sum) {
        resolve(true);
      } else {
        reject('Checksums do not match!');
      }
    });
  });
}
