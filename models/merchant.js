"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Merchant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.TransactionFeeSetting, {
        foreignKey: "merchantId",
        as: "transactionFeeSettings",
      });
    }
  }
  Merchant.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prefix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      withdrawalCallbackUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      depositCallbackUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      token_auth: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      urlendpoint: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      withdrawalLimit: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      withdrawStrategy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      maximumWithdrawTxsPerBankAccount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      maximumWithdrawVolumePerBankAccount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      settings: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 0,
      },
      depositcallback_isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      deposit_minlimit: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      witdrow_minlimit: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },


      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Merchant",
      tableName: "merchant",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Merchant;
};
