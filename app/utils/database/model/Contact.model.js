module.exports = function (sequelize, DataTypes) {
  const Contact = sequelize.define('contacts', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true
    }
  });

  // class association method
  Contact.associate = function (models) {
    Contact.belongsTo(models.Address);
    // Contact.belongsTo(models.AnsRecord);
  };

  return Contact;
};
