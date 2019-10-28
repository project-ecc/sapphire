module.exports = function (sequelize, DataTypes) {
  const ConversationUser = sequelize.define('conversation_users', {
    user_id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    conversation_id: {
      type: DataTypes.STRING,
      unique: true
    },
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
    // ConversationUser.hasMany(models.Address);
    // Contact.belongsTo(models.AnsRecord);
  };

  return ConversationUser;
};
