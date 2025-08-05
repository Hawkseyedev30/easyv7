"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_manual extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction_manual.init(
    {
      amount: {
        type: DataTypes.FLOAT(16, 2),
        allowNull: true,
        defaultValue: 0,
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bank_from: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      acc_from: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      qrString: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      txn_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      add_from: {
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

      type_option: {
        type: DataTypes.ENUM(["ฝาก", "ถอน"]),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(["pending", "success", "rejected", "cancel"]),
        allowNull: false,
      },

      member_id: {
        type: DataTypes.INTEGER,
        references: { model: "member", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      
      nodere: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      time_creat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transaction_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reqby_admin_id: {
        type: DataTypes.INTEGER,
        references: { model: "admin", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Transaction_manual",
      tableName: "transaction_manual",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      // paranoid: true, //use for soft delete with using deleted_at
      // underscored: true //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Transaction_manual;
};
