'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionFeeSetting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Merchant, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });
    }
  }
  TransactionFeeSetting.init({
    merchantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    depositFeePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    withdrawalFeePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'TransactionFeeSetting',
    tableName: 'transaction_fee_settings',
    paranoid: true,
    underscored: true,
  });
  return TransactionFeeSetting;
};