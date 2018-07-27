module.exports = function (sequelize, DataTypes) {
  const Setting = sequelize.define('settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: DataTypes.STRING,
    value: DataTypes.STRING
  });

  return Setting;
};
