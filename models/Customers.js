"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Customers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Customers.init(
    {
       customer_uuid: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, //  กำหนดให้สร้าง UUID อัตโนมัติ
      },
       partner: {
        type: DataTypes.STRING,
      },
      client_code: {
        type: DataTypes.STRING,
      },
      name_en: {
        type: DataTypes.STRING,
      },
      name_th: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      search_name: {
        type: DataTypes.STRING,
      },
      account_no: {
        type: DataTypes.STRING,
      },
      merchantId: {
        type: DataTypes.INTEGER,
        references: { model: "merchant", key: "id" },
        // onDelete: "CASCADE",
        allowNull: true
      },
      bank_code: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      bankId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'bank',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Customers",
      tableName: "customers",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Customers;
};
