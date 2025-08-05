"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User_account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User_account.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      data_user_id: {
        type: DataTypes.INTEGER,
        // references: { model: "datauser", key: "id" },
        // onDelete: "CASCADE",
        allowNull: true,
      },
      bank_id: {
        type: DataTypes.INTEGER,
        references: { model: "bank", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
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
      status: {
        type: DataTypes.INTEGER,
      },
      totalAvailableBalance: {
        type: DataTypes.STRING,
      },
      token: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "User_account",
      tableName: "user_account",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return User_account;
};
