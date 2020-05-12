module.exports = function (sequelize, DataTypes) {
  const Media = sequelize.define('message_media', {
    message_id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    media_id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }

  });

  // class association method
  Media.associate = function (models) {
    Media.hasMany(models.Address);
    // Contact.belongsTo(models.AnsRecord);
  };

  return Media;
};
