module.exports = function (sequelize, DataTypes) {
  let Peer =  sequelize.define('peers', {
    id: {
      allowNull: false,
      type: DataTypes.STRING,
      primaryKey: true
    },
    network_name: {
      type: DataTypes.STRING
    },
    display_name: {
      type: DataTypes.STRING
    },
    public_payment_address: {
      type: DataTypes.STRING
    },
    private_payment_address: {
      type: DataTypes.STRING
    },
    display_image: {
      type: DataTypes.BLOB
    },
    last_seen: {
      type: DataTypes.INTEGER
    }
  });

  // class association method
  Peer.associate = function (models) {
    Peer.belongsToMany(models.Conversation, {
      through: models.ConversationUser,
      foreignKey: 'peer_id',
      as: 'conversations'
    })
    Peer.belongsToMany(models.Message, {
      through: models.ConversationUser,
      foreignKey: 'peer_id',
      as: 'messages'
    })
  };

  return Peer;
};
