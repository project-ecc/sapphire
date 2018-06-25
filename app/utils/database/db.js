var Connection 		= require('sequelize-connect');
let remote = require('electron').remote;
const app = remote.app;

export let orm = new Connection(
  {
    // sqlite! now!
    dialect: 'sqlite',

    // the storage engine for sqlite
    // - default ':memory:'
    storage: app.getPath('userData') +'/database.sqlite'
  }
)
.then(function(instance){
  return instance
});
