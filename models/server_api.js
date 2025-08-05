"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Server_api extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Server_api.init(
    {
      bankAccountId: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      accountTokenNumber: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lineToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userTokenIdentity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      channel: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      language: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Server_api",
      tableName: "server_api",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Server_api;
};
