import db from '../../app/utils/database/db'
const Address = db.Address;
const Transaction = db.Transaction

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
        }));
        console.log(created);
        Transaction.create({
          transaction_id: transaction.txId,
          time: transaction.time,
          amount: transaction.amount,
          category: transaction.category,
          address: transaction.address,
          fee: transaction.fee,
          confirmations: transaction.confirmations,
          status: pending === false ? 'confirmed' : 'pending'

        }
        ).then(transaction => {
          address.addTransaction(transaction).then(fulfill);
          return transaction;
        });
      });
  });
}


function getTransactionById(modelId) {
  Transaction.findById(modelId).then(transaction => {
    return transaction;
    // project will be an instance of Project and stores the content of the table entry
    // with id 123. if such an entry is not defined you will get null
  });
}

function getAllTransactions(limit = 100, offset = 0) {
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      include: [{
        model: Address,
        where: { id: db.Sequelize.col('transactions.addressId') }
      }],
      offset,
      limit
    }).then(transactions => {
      console.log(transactions)
      resolve(transactions);
    });
  });
}
function getTransactionsBytxId(transactionId) {
  // search for specific attributes - hash usage
  Transaction.findAll({
    where: {
      transaction_id: transactionId
    }
  }).then(transactions => {
    return transactions;
    // projects will be an array of Project instances with the specified name
  });
}

function checkForMostRecentTransaction() {

}

function updateTransaction(id, ogTransaction) {
  Transaction.update({
    updatedAt: null,
  }, {
    where: {
      id
    }
  });
}

export {
  addTransaction,
  getAllTransactions
};

