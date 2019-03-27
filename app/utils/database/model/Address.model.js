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
    status: {
      type: DataTypes.STRING
    },
    current_balance: DataTypes.BIGINT,
    is_mine: DataTypes.BOOLEAN
  });

  // class association method
  Address.associate = function (models) {
    Address.hasMany(models.Transaction);
    // Address.hasMany(models.AnsRecord);
  };

  return Address;
};
