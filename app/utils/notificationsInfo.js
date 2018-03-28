import low from 'lowdb';
import storage from 'lowdb/lib/storages/file-async';

let remote = require('electron').remote;
const app = remote.app;

const db = low(app.getPath('userData') + '/notificationsInfo.json', {
    storage
});

db.defaults({info: {lastCheckedNews: new Date(new Date().setFullYear(2000)).getTime(), lastCheckedEarnings: new Date(new Date().setFullYear(2000)).getTime(), lastCheckedChat: {}}}).write();

export default db;
