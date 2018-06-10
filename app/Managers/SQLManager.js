const Sequelize = require('sequelize');
const sqlite3 = require('sqlite3');
let remote = require('electron').remote;
const app = remote.app;
// create the database
const db = new Sequelize({
  // sqlite! now!
  dialect: 'sqlite',

  // the storage engine for sqlite
  // - default ':memory:'
  storage: app.getPath('userData') +'/database.sqlite'
})

const Transaction = db.define('transactions', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_id: Sequelize.STRING,
  time: Sequelize.INTEGER,
  amount: Sequelize.DECIMAL(11, 8) ,
  category: Sequelize.STRING,
  address: Sequelize.STRING,
  fee: Sequelize.DECIMAL(2, 8) ,
  confirmations: Sequelize.INTEGER,
  status: Sequelize.STRING
}); // used to define the Table Product

db.sync();


/**
 * Functions all below here for manipulating the data.
 * @param transaction
 * @param pending
 */

function addTransaction(transaction, pending = false) {

  Transaction.create({
    transaction_id: transaction.txId,
    time: transaction.time,
    amount: transaction.amount,
    category: transaction.category,
    address: transaction.address,
    fee: transaction.fee,
    confirmations: transaction.confirmations,
    status: pending === false ? "confirmed" : "pending"

  }).then(transaction => {
    return transaction;
  })
}


function getTransactionById(modelId){

  Transaction.findById(modelId).then(transaction => {
    return transaction;
    // project will be an instance of Project and stores the content of the table entry
    // with id 123. if such an entry is not defined you will get null
  })
}
function getTransactionsBytxId(transactionId){

  // search for specific attributes - hash usage
  Transaction.findAll({
    where: {
      transaction_id: transactionId
    }
  }).then(transactions => {
    return transactions
    // projects will be an array of Project instances with the specified name
  });
}

function updateTransaction(id, ogTransaction){
  Transaction.update({
    updatedAt: null,
  }, {
    where: {
      id: id
    }
  });
}

export {
  addTransaction,
  getTransactionById,
  getTransactionsBytxId,
  updateTransaction
}

