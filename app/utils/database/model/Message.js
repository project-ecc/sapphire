module.exports = function (sequelize, DataTypes) {
  let Message =  sequelize.define('messages', {
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.STRING
    },
    is_pinned : {
      type: DataTypes.BOOLEAN
    },
    from_id: {
      type: DataTypes.STRING
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
  };
};
