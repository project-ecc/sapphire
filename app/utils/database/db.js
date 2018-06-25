const Connection = require('sequelize-connect');
const Sequelize = require('sequelize');
const sqlite3 = require('sqlite3');
const remote = require('electron').remote;

const app = remote.app;
export const orm = new Connection(
  '',
  '',
  '',
  {
    // sqlite! now!
    dialect: 'sqlite',

    // the storage engine for sqlite
    // - default ':memory:'
    storage: `${app.getPath('userData')}/database.sqlite`
  }
)
.then((instance) => {
  return instance;
});
