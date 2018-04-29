import low from 'lowdb';
import storage from 'lowdb/lib/storages/file-async';
var fs = require('fs');

let remote = require('electron').remote;
const app = remote.app;

let db = null;
let path = app.getPath('userData') + '/transactionsInfo.json';

try{
  db = low( path, {storage});
}catch(err){;
  fs.unlinkSync(path);
  db = low( path, {storage});
}

db.defaults({addresses: [], info: {done: false, processedFrom: 0}}).write();

export default db;
