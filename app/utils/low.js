import low from 'lowdb';
import storage from 'lowdb/lib/storages/file-async';

let remote = require('electron').remote;
const app = remote.app;


const db = low(app.getPath('userData') + '/db.json', {
    storage
});

db.defaults({friends: []}).write();

export default db;
