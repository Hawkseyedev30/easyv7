"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_withdraw extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction_withdraw.init(
    {
      transaction_id: {
        type: DataTypes.INTEGER,
        references: { model: "transaction", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      recipientName: {
        type: DataTypes.STRING,
        allowNull: true,
        // defaultValue: 2,
      },
      recipientAccount: {
        type: DataTypes.STRING,
        allowNull: true,
        //  defaultValue: 2,
      },
      amount: {
        type: DataTypes.FLOAT(16, 2),
        allowNull: true,
        defaultValue: 0,
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      recipientBank: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      senderAccount: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      qrString: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transactionDateTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      ref: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      X_SESSION_IBID: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      X_REQUEST_ID: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Authorization: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        references: { model: "member", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      senderAccountId: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      reqby_admin_id: {
        type: DataTypes.INTEGER,
        references: { model: "admin", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Transaction_withdraw",
      tableName: "transaction_withdraw",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      // paranoid: true, //use for soft delete with using deleted_at
      // underscored: true //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Transaction_withdraw;
};
