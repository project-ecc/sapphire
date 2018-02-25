import low from 'lowdb';
import storage from 'lowdb/lib/storages/file-async';

let remote = require('electron').remote
const app = remote.app

const db = low(app.getPath('userData') + '/transactionsInfo.json', {
    storage
});
	
db.defaults({addresses: [], info: {done: false, processedFrom: 0}}).write();

export default db;
