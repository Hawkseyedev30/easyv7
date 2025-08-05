"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_tranfer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction_tranfer.init(
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
      QrScanner: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(["pending", "success", "rejected", "cancel"]),
        allowNull: false,
      },

      bankAccounttoid: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      bankAccountfromid: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      nodere: {
        type: DataTypes.TEXT,
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
      modelName: "Transaction_tranfer",
      tableName: "transaction_tranfer",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Transaction_tranfer;
};
