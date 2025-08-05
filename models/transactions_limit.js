"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transactions_limit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transactions_limit.init(
    {
      ref: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      txnBatchRunDate: {
        allowNull: true,
        type: DataTypes.DATE, // Change to DATE for date-only storage
      },
      txnSequence: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0, // Set default value
      },
      sortSequence: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0, // Set default value
      },
      txnDateTime: {
        allowNull: false,
        type: DataTypes.DATE, // Change to DATE for date-only storage
      },
      
      accFrom: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      txnAmount: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2), // Adjust precision and scale as needed
      },
      txnCurrency: {
        allowNull: false,
        type: DataTypes.STRING(3), // Assuming currency code is 3 characters
      },
      txnDebitCreditFlag: {
        allowNull: false,
        type: DataTypes.ENUM("D", "C"), // Use ENUM for debit/credit options
      },
      txnRemark: {
        allowNull: false,
        type: DataTypes.TEXT, // Allow longer text for remarks
      },
      annotation: {
        allowNull: true,
        type: DataTypes.TEXT, // Allow longer text for annotations
      },
      txnChannel: {
        allowNull: false,
        type: DataTypes.TEXT, // Store channel data as JSON
      },
      txnCode: {
        allowNull: false,
        type: DataTypes.TEXT, // Store code data as JSON
      },
    },
    {
      sequelize,
      modelName: "Transactions_limit",
      tableName: "transactions_limit",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      // paranoid: true, //use for soft delete with using deleted_at
      // underscored: true //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Transactions_limit;
};
