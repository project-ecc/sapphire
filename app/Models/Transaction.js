const Sequelize = require('sequelize');
// define the Transaction Model
export const Transaction = db.define('transactions', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_id: Sequelize.STRING,
  time: Sequelize.INTEGER,
  amount: Sequelize.DECIMAL(11, 8) ,
  category: Sequelize.STRING,
  fee: Sequelize.DECIMAL(2, 8) ,
  confirmations: Sequelize.INTEGER,
  status: Sequelize.STRING
});
