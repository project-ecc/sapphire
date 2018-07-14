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
      service_hash: DataTypes.STRING,
      creation_block: DataTypes.INTEGER,
      is_live: DataTypes.BOOLEAN
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['name', 'code']
        }
      ],
      name: {
        singular: "ansrecord",
        plural: "ansrecords"
      }
    }
  );

  // class association method
  AnsRecord.associate = function (models) {
    AnsRecord.belongsTo(models.Address);
  };

  return AnsRecord;
};
