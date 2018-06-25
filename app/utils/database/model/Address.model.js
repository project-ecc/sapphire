module.exports = function (sequelize, DataTypes) {
  const Address = sequelize.define('addresses', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    address: {
      type: DataTypes.STRING,
      unique: true
    },
    current_balance: DataTypes.BIGINT
  });

  // class association method
  Address.associate = function (models) {
    Address.hasMany(models.Transaction);
  };

  return Address;
};
