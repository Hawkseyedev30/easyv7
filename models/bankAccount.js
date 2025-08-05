"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BankAccount.init(
    {
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "merchant",
          key: "id",
        },
      },
      bankAccountGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "bankAccountGroup",
          key: "id",
        },
      },
      pin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      auth: {
        type: DataTypes.TEXT,
      },
      deviceId: {
        type: DataTypes.TEXT,
      },
      bankId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "bank",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      prefix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accounts: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      telephoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      sameBankLimit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      otherBankLimit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      accountType: {
        type: DataTypes.ENUM(
          "deposit",
          "current",
          "savings",
          "withdrawal",
          "verifying_account"
        ),
        allowNull: false,
      },
      latestPollingStatus: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      settings: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      run_from: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      channel: {
        type: DataTypes.ENUM(
          "k-biz",
          "kplus",
          "scb-easy",
          "true_wallet",
          "scb-business",
          "kbank-business",
          "ktb-business",

          "KTB_NEX"

        ),
        allowNull: false,
      },
      type_Deposit: {
        type: DataTypes.ENUM("QR_PLAY", "BANK_APP", "QR_GATEWAY"),
        allowNull: false,
      },

      litmit_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      limit_Left: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      status_bank: {
        type: DataTypes.ENUM(
          "Active",
          "Inactive",
          "Pending",
          "Banned",
          "Delete",
          "Full_credit_limit",
          "Vault",
          "Face_Scan",
          "Captcha",
          "Verify"
        ),
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status_promptpay_qr: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      level_Bank: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Device_Model: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Device_Version: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Device_Platform: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },

    {
      sequelize,
      modelName: "BankAccount",
      tableName: "bankAccount",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return BankAccount;
};
