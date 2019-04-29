import low from 'lowdb';
import storage from 'lowdb/lib/storages/file-async';

var fs = require('fs');

let remote = require('electron').remote;
const app = remote.app;

let db = null;
let path = app.getPath('userData') + '/notificationsInfo.json';

try{
  db = low( path, {storage});
} catch (err) {
  fs.unlinkSync(path);
  db = low( path, {storage});
}

db.defaults({info: {lastCheckedNews: new Date(new Date().setFullYear(2000)).getTime(), lastCheckedEarnings: new Date(new Date().setFullYear(2000)).getTime(), lastCheckedChat: {}}}).write();

export default db;
