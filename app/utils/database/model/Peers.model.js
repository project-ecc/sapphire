module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Peers', {
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    network_key: {
      type: DataTypes.STRING,
      unique: true
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
    last_seen: {
      type: DataTypes.INTEGER
    }
  });
};
