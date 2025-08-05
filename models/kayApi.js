"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KayApi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  KayApi.init(
    {
      userFrom: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "merchant",
          key: "id",
        },
      },
      userTpye: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expdate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accessKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      secretKey: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: "KayApi",
      tableName: "kayApi",
    
      timestamps: false,
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return KayApi;
};
