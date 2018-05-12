import low from 'lowdb';
import storage from 'lowdb/lib/storages/file-async';
var fs = require('fs');

let remote = require('electron').remote;
const app = remote.app;

let db = null;
let path = app.getPath('userData') + '/ansAddressesInfo.json';

try{
  db = low( path, {storage});
}catch(err){;
  fs.unlinkSync(path);
  db = low( path, {storage});
}

db.defaults({addresses: {}}).write();

export default db;
