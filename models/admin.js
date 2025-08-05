"use strict";

const bcrypt = require("bcrypt");
const bcrypt_p = require("bcrypt-promise");
const { TE, to } = require("../services/util.service");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Admin.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true
      },
      invalid_email_password: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      
      profile_photo: {
        type: DataTypes.STRING
      },
      admin_status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1,
        allowNull: true
      },
      admin_type: {
        type: DataTypes.ENUM(['admin', 'programer', 'superadmin']),
       // defaultValue: 1,
        allowNull: true
      },
      role: {
        type: DataTypes.STRING,
       // defaultValue: 1,
        allowNull: true
      },
      roleID: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      IP: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      
      merchantId: {
        type: DataTypes.INTEGER,
        references: { model: "merchant", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
       Active_merchantId: {
        type: DataTypes.INTEGER,
       // references: { model: "merchant", key: "id" },
      //  onDelete: "CASCADE",
        allowNull: true,
      },
      auth_token: DataTypes.TEXT,
      added_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      user_device_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: "Admin",
      tableName: "admin",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Admin.prototype.comparePassword = async function (pw) {
    let err, pass;
    if (!this.password) TE("password not set");

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE("invalid password");

    return this;
  };

  return Admin;
};
