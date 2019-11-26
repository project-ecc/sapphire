module.exports = function (sequelize, DataTypes) {
  let Message =  sequelize.define('messages', {
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true
    },
    content: {
      type: DataTypes.STRING
    },
    is_pinned : {
      type: DataTypes.BOOLEAN
    },
    is_sent: {
      type: DataTypes.BOOLEAN
    },
    reply_message_id: {
      type: DataTypes.UUID
    },
    date: {
      type: DataTypes.INTEGER
    },
    edit_date: {
      type: DataTypes.INTEGER
    }
  });

  // class association method
  Message.associate = function (models) {
    Message.belongsTo(models.Conversation);
    Message.belongsTo(models.ConversationUser);
    Message.belongsTo(models.Peer, {as: 'owner'})
  };

  return Message;
};
