"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VerificationOtp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VerificationOtp.init(
    {
      admin_id: {
        type: DataTypes.INTEGER,
        references: { model: "Admin", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
      user_device_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiration_time: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      otp_type: {
        type: DataTypes.ENUM("Login", "Payment", "Wallet"),
        allowNull: false,
      },
      deleted_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "VerificationOtp",
      tableName: "verification_otps",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true, //use for soft delete with using deleted_at
      underscored: true //making underscored colomn as deletedAt to deleted_at
    }
  );
  return VerificationOtp;
};
