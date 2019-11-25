module.exports = function (sequelize, DataTypes) {
  let MyAccount =  sequelize.define('my_account', {
    id: {
      allowNull: false,
      type: DataTypes.STRING,
      primaryKey: true
    },
    network_name: {
      type: DataTypes.STRING
    },
    display_name: {
      type: DataTypes.STRING
    },
    public_payment_address: {
      type: DataTypes.STRING
    },
    private_payment_address: {
      type: DataTypes.STRING
    },
    display_image: {
      type: DataTypes.BLOB
    },
    is_active: {
      type: DataTypes.BOOLEAN
    }
  });

  // class association method
  MyAccount.associate = function (models) {
    MyAccount.belongsTo(models.Peer)
  };

  return MyAccount;
};
