"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tfa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tfa.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      issuer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tempSecret: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      IP: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      user_device_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Tfa", 
      tableName: "tfa",
      deletedAt: false,
      createdAt: false,
      updatedAt: false,
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Tfa;
};
