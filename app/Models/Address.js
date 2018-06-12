const Sequelize = require('sequelize');
//define the Address model
export const Address = db.define('addresses', {
  address: Sequelize.STRING,
  current_balance: Sequelize.BIGINT
});
