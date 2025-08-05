"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Api_logs_bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Api_logs_bank.init(
    {
      log_type: {
        type: DataTypes.ENUM("bank_api", "gateway_api", "other"),
        allowNull: false
      },
      api_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      request_method: {
        type: DataTypes.STRING,
        allowNull: true
      },
      request_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      request_headers: {
        type: DataTypes.JSON, // Use JSON type
        allowNull: true
      },
      request_body: {
        type: DataTypes.JSON, // Use JSON type
        allowNull: true
      },
      response_status: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      response_headers: {
        type: DataTypes.JSON, // Use JSON type
        allowNull: true
      },
      response_body: {
        type: DataTypes.JSON, // Use JSON type
        allowNull: true
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      execution_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true
      },
      latestPollingStatus: {
        type: DataTypes.JSON,
        allowNull: true
      },
      bankAccount_id: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Api_logs_bank", // Corrected model name
      tableName: "api_logs_bank", // Match the table name from the migration
      timestamps: true,
      underscored: true, // Use snake_case for column names
      createdAt: "created_at", // Use snake_case for column names
      updatedAt: "updated_at", // Use snake_case for column names
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Api_logs_bank;
};
