import low from 'lowdb';
import storage from 'lowdb/lib/storages/file-async';

let remote = require('electron').remote
const app = remote.app

const db = low(app.getPath('userData') + '/transactionsInfo.json', {
    storage
});
	
db.defaults({addresses: [], done: false, processedUpTo: "", processedFrom: ""}).write();

export default db;
