module.exports = function (sequelize, DataTypes) {
  const Transaction = sequelize.define('transactions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    is_main: DataTypes.BOOLEAN,
    transaction_id: DataTypes.STRING,
    time: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(11, 8),
    category: DataTypes.STRING,
    fee: DataTypes.DECIMAL(2, 8),
    confirmations: DataTypes.INTEGER,
    status: DataTypes.STRING
  });

  // class association method
  Transaction.associate = function (models) {
    Transaction.belongsTo(models.Address);
  };

  return Transaction;
};
