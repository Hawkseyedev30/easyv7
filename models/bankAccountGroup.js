"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BankAccountGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BankAccountGroup.init(
    {
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "merchant",
          key: "id",
        },
      },
      
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prefix: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      numberOfMemberInBankAccountGroup: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

    },
    {
      sequelize,
      modelName: "BankAccountGroup",
      tableName: "bankAccountGroup",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    //   deletedAt: "deleted_at",
    //   createdAt: "created_at",
    //   updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return BankAccountGroup;
};
