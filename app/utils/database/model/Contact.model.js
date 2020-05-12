module.exports = function (sequelize, DataTypes) {
  const Contact = sequelize.define('contacts', {
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    network_key: {
      type: DataTypes.STRING,
      unique: true
    },
    network_name: {
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
    }
  });

  // class association method
  Contact.associate = function (models) {
    Contact.belongsTo(models.Address);
    // Contact.belongsTo(models.AnsRecord);
    //Contact.hasMany(models.Conversation);
  };

  return Contact;
};
