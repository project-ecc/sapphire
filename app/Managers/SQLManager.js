const Sequelize = require('sequelize');
const sqlite3 = require('sqlite3');
let remote = require('electron').remote;
import { orm as db } from "../utils/database/db";
const app = remote.app;
// create the database
// const db = new Sequelize({
//   // sqlite! now!
//   dialect: 'sqlite',
//
//   // the storage engine for sqlite
//   // - default ':memory:'
//   storage: app.getPath('userData') +'/database.sqlite'
// })


// define the Transaction Model
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
  fee: Sequelize.DECIMAL(2, 8) ,
  confirmations: Sequelize.INTEGER,
  status: Sequelize.STRING
});


//define the Address model
const Address = db.define('addresses', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  address:{
    type: Sequelize.STRING,
    unique: true
  },
  current_balance: Sequelize.BIGINT
});

const AnsRecord = db.define('ans_record', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  code: Sequelize.STRING,
  expire_time: Sequelize.BIGINT,
  payment_hash: Sequelize.STRING,
  service_hash: Sequelize.STRING
});

const Contacts = db.define('contacts', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  address: Sequelize.STRING
})

const ReduxTimeChecker = db.define('time_checker', {
  // TODO
})

Transaction.belongsTo(Address)
Address.hasMany(Transaction)
AnsRecord.belongsTo(Address)


db.sync();

/**
 * Functions all below here for manipulating the data.
 * @param transaction
 * @param pending
 */

function addTransaction(transaction, pending = false) {
  return new Promise((fulfill, reject) => {
    Address
      .findOrCreate({
        where: {
          address: transaction.address
        }
      })
      .spread((address, created) => {
        console.log(address.get({
          plain: true
        }))
        console.log(created)
        Transaction.create({
            transaction_id: transaction.txId,
            time: transaction.time,
            amount: transaction.amount,
            category: transaction.category,
            address: transaction.address,
            fee: transaction.fee,
            confirmations: transaction.confirmations,
            status: pending === false ? "confirmed" : "pending"

          }
        ).then(transaction => {
          address.addTransaction(transaction).then(fulfill)
          return transaction;
        })
      })
  });
}


function getTransactionById(modelId){

  Transaction.findById(modelId).then(transaction => {
    return transaction;
    // project will be an instance of Project and stores the content of the table entry
    // with id 123. if such an entry is not defined you will get null
  })
}

function getAllTransactions(limit = 100, offset = 0) {
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      include: [{
        model: Address,
        where: { id: Sequelize.col('transactions.addressId') }
      }],
      offset: offset,
      limit: limit
    }).then(transactions => {
      resolve(transactions);
    })
  });
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

function checkForMostRecentTransaction(){

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
  updateTransaction,
  getAllTransactions
}

