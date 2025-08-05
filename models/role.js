"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Role.init(
    {
      UUID: {
        type: DataTypes.TEXT,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      explain: {
        // Add explain field
        type: DataTypes.TEXT,
      },
      roleName: {
        // Add roleName field with enum
        type: DataTypes.ENUM(
          "Merchant",
          "Admin",
          "Cs",
          "Viewer",
          "Accounting",
          "Head_Admin",
          "Owner",
          "Subowner",
          "Manager",
          "Assist_Manager",
          "Head_Accounting"
        ),
      },
      // permissions: {
      //   type: DataTypes.TEXT,
      //   allowNull: false,
      // },
      merchantId: {
        // Add merchantId field
        type: DataTypes.INTEGER,
      },
      isPublic: {
        // Add isPublic field
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "roles",
      // deletedAt: "deleted_at",
      // createdAt: "created_at",
      // updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  Role.associate = (models) => {
    Role.belongsToMany(models.Getdata_permissionsv1, {
      through: "RolePermission", // Name of the junction table
      as: "permissions",
      foreignKey: "roleId",
    });
  };
  return Role;
};
