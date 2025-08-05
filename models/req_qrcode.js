"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Req_qrcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Req_qrcode.init(
    {
      uuid: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      qrCode: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      customerName: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      customerAccountNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      customerBankCode: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      qrExpireTime: {
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      qrType: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      bankAccountId: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      
      transferAmount: {
        allowNull: true,
        type: DataTypes.DECIMAL(10, 2),
      },
      amount: {
        allowNull: true,
        type: DataTypes.DECIMAL(10, 2),
      },
      status: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      userId: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      referenceId: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      remark: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      note: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      
    },
    {
      sequelize,
      modelName: "Req_qrcode",
      tableName: "req_qrcode",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Req_qrcode;
};
