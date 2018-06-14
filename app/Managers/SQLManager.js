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

const ReduxTimeCecker = db.define('time_checker', {
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

  const add = Address
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
          add.addTransaction(transaction)
        return transaction;
      })

      /*
       findOrCreate returns an array containing the object that was found or created and a boolean that will be true if a new object was created and false if not, like so:

      [ {
          username: 'sdepold',
          job: 'Technical Lead JavaScript',
          id: 1,
          createdAt: Fri Mar 22 2013 21: 28: 34 GMT + 0100(CET),
          updatedAt: Fri Mar 22 2013 21: 28: 34 GMT + 0100(CET)
        },
        true
       ]

   In the example above, the "spread" on line 39 divides the array into its 2 parts and passes them as arguments to the callback function defined beginning at line 39, which treats them as "user" and "created" in this case. (So "user" will be the object from index 0 of the returned array and "created" will equal "true".)
      */
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
  updateTransaction,
  Address,
  Transaction
}

