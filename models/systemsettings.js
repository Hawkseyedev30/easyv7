"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Systemsettings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Systemsettings.init(
    {
      minimumWithdrawalAmount: { // ยอดถอนขั้นต่ำ
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
      },
      bankAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //   model: "bankAccount",
        //   key: "id",
        // },
      },
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "merchant",
          key: "id",
        },
      },
      minimumDepositAmount: { // ยอดฝากขั้นต่ำ
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
      },
      maximumWithdrawalAmount: { // ยอดถอนไม่เกิน
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
      },
      dailyWithdrawalLimit: { // ยอดถอนไม่เกินต่อวัน
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
      },
      maxDailyWithdrawalTransactions: { // จำนวนยอดถอนได้ไม่เกินต่อวัน
        type: DataTypes.INTEGER, 
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Systemsettings",
      tableName: "systemsettings",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Systemsettings;
};
