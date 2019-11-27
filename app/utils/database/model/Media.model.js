module.exports = function (sequelize, DataTypes) {
  const Media = sequelize.define('media', {
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING
    },
    file_type: {
      type: DataTypes.STRING
    },
    file_size: {
      type: DataTypes.INTEGER
    },
    thumbnail: {
      type: DataTypes.BLOB
    },
    extension: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.BLOB
    },
    date: {
      type: DataTypes.INTEGER
    },
  });

  // class association method
  Media.associate = function (models) {
    Media.belongsTo(models.Peer, {as: 'owner'})
    Media.belongsTo(models.Conversation)
    Media.belongsTo(models.Message)
  };

  return Media;
};
