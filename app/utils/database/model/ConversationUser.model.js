module.exports = function (sequelize, DataTypes) {
  const ConversationUser = sequelize.define('conversation_users', {
    role: {
      type: DataTypes.STRING
    },
    tag_line: {
      type: DataTypes.STRING
    },
  });

  // class association method
  ConversationUser.associate = function (models) {
    ConversationUser.belongsTo(models.Peer)
    ConversationUser.hasMany(models.Message)
    ConversationUser.belongsTo(models.Conversation)
  };

  return ConversationUser;
};
