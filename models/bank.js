"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Bank.init(
    {
      bank_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankNameEn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankNameTh: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bank_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountLength: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      kbank_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      scb_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url_pic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sts: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bank_to_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      bank_from_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imgv2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imgv3: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bankCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Bank",
      tableName: "bank",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Bank;
};
