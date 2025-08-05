"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payments.init(
    {
       platform_order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Assuming this should be unique
      },
      merchant_order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true // Good for searching
      },
      order_datetime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      expire_datetime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2), // Example: up to 10 digits, 2 decimal places
        allowNull: false
      },
      transfer_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Or false, depending on requirements
      },
      qrcode: {
        type: DataTypes.TEXT, // QR codes can be long
        allowNull: true
      },
      qrbase64: {
        type: DataTypes.TEXT, // Base64 strings can be very long
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true // Good for searching
      },
      bankAccountSenderId: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      //  defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
       // defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      sequelize,
      modelName: "Payments",
      tableName: "Payments",
    //   deletedAt: "deleted_at",
    //   createdAt: "created_at",
    //   updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Payments;
};
