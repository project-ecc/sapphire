import db from '../../app/utils/database/db'
const Address = db.Address;
const Transaction = db.Transaction;
const AnsRecord = db.AnsRecord;

/**
 * Functions all below here for manipulating the data.
 * @param transaction
 * @param pending
 */

async function addTransaction(transaction, pending = false) {
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
        Transaction.create({
          transaction_id: transaction.txId,
          time: transaction.time,
          amount: transaction.amount,
          category: transaction.category,
          address: transaction.address,
          fee: transaction.fee,
          confirmations: transaction.confirmations,
          status: pending === false ? 'confirmed' : 'pending',
          is_main: transaction.is_main

        }
        ).then(transaction => {
          address.addTransaction(transaction).then(fulfill);
          return transaction;
        }).error(err => {
          reject(err)
        });
      });
  });
}

async function deleteTransactionById(transactionId) {
  Transaction.destroy({
    where: {
      id: transactionId
    }
  }).then(affectedRows => {
    return affectedRows > 1;
  })
}

async function deleteTransactionByName(txId){

}

async function deletePendingTransaction(txId){
  Transaction.destroy({
    where: {
      transaction_id: txId,
      status: "pending"
    }
  }).then(affectedRows => {
    return affectedRows > 1;
  })
}

async function truncateTransactions() {
  Transaction.destroy({
    where: {
      subject: 'programming'
    },
    truncate: true /* this will ignore where and truncate the table instead */
  }).then(affectedRows => {
    return affectedRows > 0;
  })
}

async function getTransactionById(modelId) {
  Transaction.findById(modelId).then(transaction => {
    return transaction;
    // project will be an instance of Project and stores the content of the table entry
    // with id 123. if such an entry is not defined you will get null
  });
}

async function getAllTransactionsWithAddress(limit = null, offset = 0) {
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      include: [{
        model: Address,
        where: { id: db.Sequelize.col('transactions.addressId') }
      }],
      offset,
      limit,
      order: [
        ['time', 'DESC'],
      ]
    }).then(transactions => {
      resolve(transactions);
    });
  });
}

async function getAllTransactions(limit = null, offset = 0, where = null){
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      include: [{ all: true, nested: true }],
      where,
      offset,
      limit,
      order: [
        ['time', 'DESC'],
      ]
    }).then(transactions => {
      resolve(transactions);
    }).error(err => {
      reject(err);
    });
  });
}

async function getLatestTransaction(){
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      limit: 1,
      where: {
        //your where conditions, or without them if you need ANY entry
      },
      order: [['time', 'DESC']]
    }).then(transaction => {
      resolve(transaction);
    }).error(err => {
      reject(err);
    });
  });
}

async function getTransactionsBytxId(transactionId) {
  // search for specific attributes - hash usage
  Transaction.findAll({
    where: {
      transaction_id: transactionId
    }
  }).then(transactions => {
    return transactions;
  });
}

async function checkForMostRecentTransaction() {

}

async function updateTransaction(id, ogTransaction) {
  Transaction.update({
    updatedAt: null,
  }, {
    where: {
      id
    }
  });
}

async function getAllPendingTransactions(){
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      where: {
        status: "pending"
      },
    }).then(transactions => {
      console.log(transactions)
      resolve(transactions);
    }).error(err => {
      reject(err)
    });
  });
}

async function getAllRewardTransactions(){
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      where: {
        category: "generate"
      },
    }).then(transactions => {
      resolve(transactions);
    }).error(err => {
      reject(err)
    });
  });
}

/**
 * Address functions
 */

async function addAddress(address, withAns = false){
  return new Promise((fulfill, reject) => {
    Address
      .findOrCreate({
        where: {
          address: address.normalAddress
        },
        defaults: {
          current_balance: address.amount,
          address: address.normalAddress
        }
      })
      .spread((newAddress, created) => {
        if (withAns){
          AnsRecord
          .findOrCreate({
            where: {
              name: address.address
            },
            defaults: {
              code: address.code,
              expire_time: address.expiryTime,
            }
          }).spread((ansRecord, created) => {
            ansRecord.setAddress(newAddress).then(fulfill);
            return ansRecord;
          }).error(err => {
            console.log(err);
            reject(err);
          });
        }
        return newAddress;
      }).error(err => {
        console.log(err);
        reject(err);
    });
  });
}

async function getAllAddresses() {
  return new Promise((resolve, reject) => {
    Address.findAll({
    }).then(addresses => {
      resolve(addresses);
    }).error(err => {
      reject(err)
    });
  });
}

async function deleteAddressById(id){
  Address.destroy({
    where: {
      id: id
    }
  }).then(affectedRows => {
    return affectedRows > 1;
  })
}

async function deleteAddressByName(addressString){
  Address.destroy({
    where: {
      address: addressString
    }
  }).then(affectedRows => {
    return affectedRows > 1;
  })
}


/**
 * AnsRecord functions
 */

async function addAnsRecord(ansRecord, addressString){

}

async function deleteAnsRecordById(id){
  AnsRecord.destroy({
    where: {
      id: id
    }
  }).then(affectedRows => {
    return affectedRows > 1;
  })
}

async function deleteAnsRecordByName(recordName) {
  AnsRecord.destroy({
    where: {
      name: recordName
    }
  }).then(affectedRows => {
    return affectedRows > 1;
  })
}
export {
  addTransaction,
  getAllTransactions,
  addAddress,
  deleteAddressByName,
  addAnsRecord,
  deleteAnsRecordById,
  deleteAnsRecordByName,
  deleteTransactionById,
  deleteAddressById,
  deleteTransactionByName,
  truncateTransactions,
  getTransactionById,
  getTransactionsBytxId,
  updateTransaction,
  getAllPendingTransactions,
  getAllRewardTransactions,
  getAllTransactionsWithAddress,
  deletePendingTransaction,
  getLatestTransaction,
  Address,
  AnsRecord,
  Transaction,
  getAllAddresses
};

