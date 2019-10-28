module.exports = function (sequelize, DataTypes) {
  const Conversation = sequelize.define('conversation_permissions', {
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    change_info: {
      type: DataTypes.BOOLEAN
    },
    post_messages: {
      type: DataTypes.BOOLEAN
    },
    edit_messages: {
      type: DataTypes.BOOLEAN
    },
    delete_messages: {
      type: DataTypes.BOOLEAN
    },
    ban_users: {
      type: DataTypes.BOOLEAN
    },
    invite_users: {
      type: DataTypes.BOOLEAN
    },
    pin_messages: {
      type: DataTypes.BOOLEAN
    }

  });

  // class association method
  Conversation.associate = function (models) {
    Conversation.hasMany(models.Address);
    // Contact.belongsTo(models.AnsRecord);
  };

  return Conversation;
};
