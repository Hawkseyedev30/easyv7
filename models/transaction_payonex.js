"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_payonex extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction_payonex.init(
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      partner: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerUuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      clientCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      settlement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      reconcile: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      qrCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      settleAmount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      settleCurrency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fee: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      rate: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0,
      },
      memberId: {
        type: DataTypes.INTEGER,
        references: { model: "member", key: "id" },
        onDelete: "CASCADE",
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: "Transaction_payonex",
      tableName: "transaction_payonex",
    //  deletedAt: "deleted_at",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      // paranoid: true, //use for soft delete with using deleted_at
      // underscored: true //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Transaction_payonex;
};
