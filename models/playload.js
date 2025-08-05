"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Playload extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Playload.init(
    {
      deviceId: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      payload: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tag: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dtag: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dsig: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      auth: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      accountNo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pin: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status_online: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Playload",
      tableName: "playload",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Playload;
};
