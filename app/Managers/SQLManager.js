import db from '../../app/utils/database/db';
const Address = db.Address;
const Transaction = db.Transaction;
// const AnsRecord = db.AnsRecord;
const Contact = db.Contact;
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;

/**
 * Functions all below here for manipulating the data.
 * @param transaction
 * @param pending
 */

async function addTransaction(transaction, pending = false) {
  return new Promise((resolve, reject) => {
    Address
      .findOrCreate({
        where: {
          address: transaction.address
        }
      })
      .spread((address, created) => {
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
        }).catch(err => {
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
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      include: [{ all: true, nested: true }],
      where,
      raw: true,
      limit: limit,
      offset: offset,
      order: [
        ['time', 'DESC'],
      ]
    }).then(transactions => {
      resolve(transactions);
    }).catch(err => {
      reject(err);
    });
  });
}

async function getUnconfirmedTransactions(){
  return new Promise((resolve, reject) => {
    Transaction.findAll({
      include: [{ all: true, nested: true }],
        where: {
          status: 'pending'
        },
      raw: true,
      order: [
        ['time', 'DESC'],
      ]
    }).then(transactions => {
      resolve(transactions);
    }).catch(err => {
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
    }).catch(err => {
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
    }).catch(err => {
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
    }).catch(err => {
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
    }).catch(err => {
      reject(err)
    });
  });
}

/**
 * Address functions
 */

async function addAddress(address, belongsToMe = false){
  return new Promise(async (resolve, reject) => {
    await Address
      .findOrCreate({
        where: {
          address: address
        },
        defaults: {
          current_balance: 0,
          address: address,
          is_mine: belongsToMe
        }
      })
      .spread(async (newAddress, created) => {
        if(!created){
          newAddress.current_balance = address.amount;
          newAddress.is_mine = belongsToMe;
          await newAddress.save()
        }
        resolve(newAddress);
        return newAddress;
      }).catch(err => {
        console.log(err);
        reject(err);
    });
  });
}

async function getAddress(a){
  return new Promise(async (resolve, reject)=>{
    await Address.find({
      where: {
        address: a
      }
    }).then(address => {
      resolve(address);
    }).catch(err => {
      reject(err);
    })
  });
}

async function getAllAddresses() {
  return new Promise(async (resolve, reject) => {
    await Address.findAll().then(addresses => {
      resolve(addresses);
    }).catch(err => {
      reject(err)
    });
  });
}

async function getAllMyAddresses(){
  return new Promise(async (resolve, reject) => {
      await Address.findAll({
        where: {
          is_mine: true
        },
        order: [['createdAt', 'DESC']]
      }).then(addresses => {
        resolve(addresses)
      }).catch(err => {
        reject(err)
      })
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
 * Contacts functions
 */

async function addContact(contactObject){
  return new Promise(async (resolve, reject) => {
    let name = contactObject.name;
    await Contact
      .findOrCreate({
        where: {
          name: name
        },
        defaults: {
          name: name
        }
      })
      .spread(async (newContact, created) => {
        const address = await Address.findOrCreate({
          where: {
            address: contactObject.address
          },
          defaults: {
            address: contactObject.address,
            is_mine: false
          }
        });
        newContact.setAddress(address[0]);

        await newContact.save();
        resolve(newContact)
      }).catch(err => {
      console.log(err);
      reject(err);
    });
  });
}

async function findContact(name){
  return new Promise(async(resolve, reject) => {
    await Contact.findAll({
      include: [
        {
          model: Address,
          where: {
            id: db.Sequelize.col('contacts.addressId')
          }
        }
      ],
      where: {
        name: name
      }
    }).then(transactions => {
      resolve(transactions);
    }).catch(err => {
      reject(err)
    });
  });
}

async function getContacts(){
  return new Promise(async (resolve, reject) => {
    await Contact.findAll({
      include: [
        {
          model: Address
        }
      ]
    }).then(contacts => {
      resolve(contacts);
    }).catch(err => {
      reject(err)
    });
  });
}

async function deleteContact(contact) {
  return new Promise(async (resolve, reject) => {
    await contact.destroy().then( deleted => {
      resolve(deleted);
    }).catch(err => {
      reject(err);
    });
  });
}

async function clearTransactions () {
  return new Promise(async (resolve, reject) => {
    let result = await Transaction.destroy({
      where: {},
      truncate: true
    }).then( result => {
      resolve(result);
    }).catch(err => {
      reject(err);
    });

  })
}

async function clearAddresses () {
  return new Promise(async (resolve, reject) => {
    let result = await Address.destroy({
      where: {},
      truncate: true
    }).then( result => {
      resolve(result);
    }).catch(err => {
      reject(err);
    });

  })
}

async function clearDB(){
  return new Promise(async (resolve, reject) => {

    await Transaction.destroy({
      where: {},
      truncate: true
    });

    await Address.destroy({
      where: {
        is_mine: 1
      }
    });

    resolve(true)
  });
}

/**
 * export functions.
 */
export {
  clearDB,
  addTransaction,
  getAllTransactions,
  addAddress,
  getAddress,
  deleteAddressByName,
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
  Transaction,
  getAllAddresses,
  getAllMyAddresses,
  searchAllTransactions,
  updatePendingTransaction,
  updateTransactionsConfirmations,
  addContact,
  findContact,
  getContacts,
  deleteContact,
  clearTransactions,
  clearAddresses,
  getUnconfirmedTransactions
};

