"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BankAccount_swet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Example: Link to Merchant, Bank, BankAccountGroup if needed
      // BankAccount_swet.belongsTo(models.Merchant, { foreignKey: 'merchantId', as: 'merchant' });
      // BankAccount_swet.belongsTo(models.Bank, { foreignKey: 'bankId', as: 'bank' });
      // BankAccount_swet.belongsTo(models.BankAccountGroup, { foreignKey: 'bankAccountGroupId', as: 'bankAccountGroup' });
    }
  }
  BankAccount_swet.init(
    {
      // Added explicit id definition based on SQL schema
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "merchant", // Ensure this matches the actual table name for merchants
          key: "id",
        },
      },
      bankAccountGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "bankAccountGroup", // Ensure this matches the actual table name for bank account groups
          key: "id",
        },
      },
      pin: {
        type: DataTypes.STRING, // Maps to varchar(255)
        allowNull: false,
      },
      auth: {
        type: DataTypes.TEXT, // Maps to text
        allowNull: true, // DEFAULT NULL implies allowNull: true
      },
      deviceId: {
        type: DataTypes.TEXT, // Maps to text
        allowNull: true, // DEFAULT NULL implies allowNull: true
      },
      bankId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "bank", // Ensure this matches the actual table name for banks
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING, // Maps to varchar(255)
        allowNull: false,
      },
      prefix: {
        type: DataTypes.STRING, // Maps to varchar(255)
        allowNull: false,
      },
      accountNumber: {
        type: DataTypes.STRING, // Maps to varchar(255)
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING, // Maps to varchar(255)
        allowNull: false,
      },
      telephoneNumber: {
        type: DataTypes.STRING, // Maps to varchar(255)
        allowNull: true, // DEFAULT NULL implies allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN, // Maps to tinyint(1)
        allowNull: false,
        defaultValue: true, // Matches DEFAULT 1
      },
      sameBankLimit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00, // Matches DEFAULT 0.00
      },
      otherBankLimit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00, // Matches DEFAULT 0.00
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00, // Matches DEFAULT 0.00
      },
      accountType: {
        // Updated ENUM values to match SQL schema
        type: DataTypes.ENUM(
          "deposit",
          "current",
          "savings",
          "withdrawal"
        ),
        allowNull: false,
      },
      latestPollingStatus: {
        // Using JSON type which often maps to longtext in MySQL
        type: DataTypes.JSON,
        allowNull: true, // DEFAULT NULL implies allowNull: true
      },
      settings: {
        // Using JSON type which often maps to longtext in MySQL
        type: DataTypes.JSON,
        allowNull: true, // DEFAULT NULL implies allowNull: true
      },
      run_from: {
        type: DataTypes.STRING, // Maps to varchar(255)
        allowNull: true, // DEFAULT NULL implies allowNull: true
      },
      channel: {
        // Updated ENUM values to match SQL schema
        type: DataTypes.ENUM(
          "k-biz",
          "kplus",
          "scb-easy",
          "true_wallet"
        ),
        allowNull: false,
      },
      // Removed type_Deposit as it's not in the SQL schema
      // Removed litmit_status as it's not in the SQL schema
      // Removed limit_Left as it's not in the SQL schema
      status_bank: {
        // Updated ENUM values to match SQL schema
        type: DataTypes.ENUM(
          "Active",
          "Inactive",
          "Pending",
          "Banned",
          "Delete"
        ),
        allowNull: false,
      },
      // Removed status_promptpay_qr as it's not in the SQL schema
      // Removed level_Bank as it's not in the SQL schema

      // Timestamps are handled by Sequelize options below
      // Note: The provided SQL has two `created_at` columns which is invalid.
      // Assuming standard Sequelize timestamp behavior is desired.
    },
    {
      sequelize,
      modelName: "BankAccount_swet",
      tableName: "bankAccount_swet",
      timestamps: true, // Enable timestamps
      paranoid: true, // Enable soft deletes
      deletedAt: "deleted_at", // Map deleted_at column for soft deletes
      createdAt: "created_at", // Map created_at column
      updatedAt: "updated_at", // Map updated_at column
      // underscored: true, // Use this if you prefer snake_case for default fields like createdAt -> created_at
    }
  );
  return BankAccount_swet;
};
