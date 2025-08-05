"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Create_deposits extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Create_deposits.belongsTo(models.BankAccount, {
        foreignKey: "bankAccount_id",
        as: "bankAccount",
      });
      // Create_deposits.belongsTo(models.Customers, {
      //   foreignKey: "customerUuid",
      //   as: "Customers",
      // });
    }
  }
  Create_deposits.init(
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
     bankAccount_id: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      customerUuid: {
        type: DataTypes.STRING,
        allowNull: true,
       
      },
      merchantId: {
        type: DataTypes.INTEGER,
        references: { model: "merchant", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      qrCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerAccountNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerBankCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      qrExpireTime: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      qrType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transferAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referenceId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Create_deposits",
      tableName: "create_deposits",
      //  paranoid: true,
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Create_deposits;
};