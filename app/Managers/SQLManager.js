const db = require('../../app/utils/database/db')
const Address = db.Address;
const Transaction = db.Transaction;
const AnsRecord = db.AnsRecord;
const Contact = db.Contact;
const Op = db.Sequelize.Op;

/**
 * Functions all below here for manipulating the data.
 * @param transaction
 * @param pending
 */

async function addTransaction(transaction, pending = false, belongsToMe = false) {
  return new Promise((resolve, reject) => {
    Address
      .findOrCreate({
        where: {
          address: transaction.address
        },
        defaults: {
          is_mine: belongsToMe
        }
      })
      .spread((address, created) => {
        // console.log(address.get({
        //   plain: true
        // }));
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
          address.addTransaction(transaction).then(resolve);
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

async function updatePendingTransaction(txId, confirmations){
  return new Promise((resolve, reject) => {
    let status = confirmations > 30 ? "confirmed": "pending";
    Transaction.update(
      {
        status: status,
        confirmations: confirmations
      },
      {
        where:
          {
            transaction_id: txId
          }
      }
    ).then(result =>
      resolve(result)
    ).catch(err =>
      reject(err)
    );
  });
}

async function updateTransactionsConfirmations(txId, confirmations){
  return new Promise((resolve, reject) => {
    Transaction.update(
      {
        confirmations: confirmations
      },
      {
        where: {
          transaction_id: txId
        }
      }
      ).then(result =>
        resolve(result)
      ).catch(err =>
        reject(err)
      );
  });
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
  console.log('limit:', limit)
  console.log('offset:', offset)
  console.log('where:', where)
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      include: [{ all: true, nested: true }],
      where,
      raw: true,
      limit: limit,
      offset,
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

async function searchAllTransactions(searchTerm) {
  return new Promise((resolve, reject) => {
    const term = searchTerm.toLowerCase();
    const where = {
      is_main: 1,
      $or: [{
        transaction_id: {
          [Op.like]: `%${term}%`
        },
      }, {
        amount: {
          [Op.like]: `%${term}%`
        }
      },{
        confirmations: {
          [Op.like]: `%${term}%`
        }
      },{
        category: {
          [Op.like]: `%${term}%`
        }
      }]
    };
    Transaction.findAll({
      include: [{ all: true, nested: true }],
      where,
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
    }).then(transactions => {
      resolve(transactions[0]);
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

async function addAddress(address, withAns = false, belongsToMe = false){
  return new Promise((fulfill, reject) => {
    Address
      .findOrCreate({
        where: {
          address: address.normalAddress
        },
        defaults: {
          current_balance: address.amount,
          address: address.normalAddress,
          is_mine: belongsToMe
        }
      })
      .spread(async (newAddress, created) => {
        console.log('created: ', created)
        if(!created){
          newAddress.is_mine = belongsToMe
          await newAddress.save()
        }
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
        fulfill(newAddress);
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


/**
 * Contacts functions
 */

async function addContact(contactObject, withAns = false){
  return new Promise((fulfill, reject) => {
    Contact
      .findOrCreate({
        where: {
          name: contactObject.name
        }
      })
      .spread((newContact, created) => {
        if (withAns){
          AnsRecord
            .findOrCreate({
              where: {
                name: contactObject.name,
                code: contactObject.code
              },
              defaults: {
                name: contactObject.name,
                code: contactObject.code
              }
            }).spread((ansRecord, created) => {
            //ansRecord.setAddress(newAddress).then(fulfill);
            return ansRecord;
          }).error(err => {
            console.log(err);
            reject(err);
          });
        }
        fulfill(newContact);
        return newContact;
      }).error(err => {
      console.log(err);
      reject(err);
    });
  });
}

async function findContact(name){
  return new Promise((resolve, reject) => {
    Contact.findAll({
      include: [
        {
          model: Address,
          where: {
            id: db.Sequelize.col('contacts.addressId'),
            address: name
          }
        },
        {
          model: AnsRecord,
          where: {
            id: db.Sequelize.col('contacts.ansrecordId'),
            name: name
          }
        }
      ]
    }).then(transactions => {
      resolve(transactions);
    }).error(err => {
      reject(err)
    });
  });
}

/**
 * export functions.
 */
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
  getAllAddresses,
  searchAllTransactions,
  updatePendingTransaction,
  updateTransactionsConfirmations,
  addContact,
  findContact
};

