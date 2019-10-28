module.exports = function (sequelize, DataTypes) {
  const Media = sequelize.define('media', {
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
    conversation_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    created_by_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    date: {
      type: DataTypes.INTEGER
    },
  });

  // class association method
  Media.associate = function (models) {
    Media.hasMany(models.Address);
    Media.belongsTo(models.Conversation)
  };

  return Media;
};
