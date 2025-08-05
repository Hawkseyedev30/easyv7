"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Request_All extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Request_All.init(
    {
      accnum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      date_creat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      time_creat: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fron_bank: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      to_bank: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      insert_time: {
        type: DataTypes.DATE(6),
        allowNull: true,
      },
      status_pay: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name_to: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bankAccount_id: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      req_tpye:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      type_status: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status_show: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Request_All",
      tableName: "request_All",
      // deletedAt: 'deleted_at',
      createdAt: "created_at",
      updatedAt: "updated_at",
      // paranoid: true, //use for soft delete with using deleted_at
      // underscored: true //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Request_All;
};
