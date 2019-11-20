module.exports = function (sequelize, DataTypes) {
  const ConversationUser = sequelize.define('conversation_users', {
    network_key: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    role: {
      type: DataTypes.STRING
    },
    tag_line: {
      type: DataTypes.STRING
    },
    display_image: {
      type: DataTypes.BLOB
    }
  });

  // class association method
  ConversationUser.associate = function (models) {
    ConversationUser.belongsTo(models.Peer)
    ConversationUser.hasMany(models.Message)
    ConversationUser.hasOne(models.Conversation)
  };

  return ConversationUser;
};
