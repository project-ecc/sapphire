module.exports = function (sequelize, DataTypes) {
  const AnsRecord = sequelize.define('ans_records', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      code: DataTypes.STRING,
      expire_time: DataTypes.BIGINT,
      payment_hash: DataTypes.STRING,
      service_hash: DataTypes.STRING
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['name', 'code']
        }
      ]
    }
  );

  // class association method
  AnsRecord.associate = function (models) {
    AnsRecord.belongsTo(models.Address);
  };

  return AnsRecord;
};
