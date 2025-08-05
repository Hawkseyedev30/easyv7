"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Botlog_limittime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Botlog_limittime.init(
    {
      old_data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      name_bot: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accnum: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankAccountID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "bankAccount",
          key: "id",
        },
      },
      bot_status: {
        type: DataTypes.ENUM("SUCCESS", "NONE"),
        allowNull: false,
      },
      bot_isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Botlog_limittime",
      tableName: "botlog_limittime",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Botlog_limittime;
};
