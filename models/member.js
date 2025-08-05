"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Member.init(
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        // primaryKey: true,
      },
      userStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bankAccountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankAccountName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      telephoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trueWalletUsername: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankAccountName_En: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'bank', 
          key: 'id',
        },
      },
      merchantId: {
        type: DataTypes.INTEGER,
        references: { model: "merchant", key: "id" },
        onDelete: "CASCADE",
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: "Member",
      tableName: "member",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Member;
};
