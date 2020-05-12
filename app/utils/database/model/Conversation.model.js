module.exports = function (sequelize, DataTypes) {
  const Conversation = sequelize.define('conversations', {
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    description: {
      type: DataTypes.STRING
    },
    conversation_image: {
      type: DataTypes.BLOB
    },
    conversation_type: {
      type: DataTypes.ENUM(['PRIVATE', 'GROUP', 'SUPER_GROUP', 'CHANNEL', 'BROADCAST'])
    },
    participants_count: {
      type: DataTypes.INTEGER
    },
    admin_permission_id: {
      type: DataTypes.UUID
    },
    default_permission_id: {
      type: DataTypes.UUID
    }
  });

  // class association method
  Conversation.associate = function (models) {
    Conversation.belongsTo(models.Peer, {as: 'owner'})
    Conversation.belongsToMany(models.Peer, {through: models.ConversationUser, as: 'conversationPeers'})
    Conversation.hasMany(models.Message)
  };

  return Conversation;
};
