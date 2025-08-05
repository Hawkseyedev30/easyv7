"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Getdata_permissionsv1 extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Getdata_permissionsv1.init(
    {
      name: { // เพิ่ม field name
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: { // เพิ่ม field description
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      uuid: { // เพิ่ม field action
        type: DataTypes.STRING,
        allowNull: false,
      },
      action: { // เพิ่ม field action
        type: DataTypes.STRING,
        allowNull: false,
      },
      resource: { // เพิ่ม field resource
        type: DataTypes.STRING,
        allowNull: false,
      },
      attributes: { // เพิ่ม field attributes
        type: DataTypes.TEXT,
        allowNull: true,
      },
      conditions: { // เพิ่ม field conditions
        type: DataTypes.TEXT,
        allowNull: true,
      },
      flatpermission: { // เพิ่ม field flat_permission  (snake_case ตาม convention)
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true, // เพิ่ม unique constraint เพื่อป้องกันการซ้ำ
      },
      ispublic: { // เพิ่ม field is_public (snake_case ตาม convention)
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // กำหนด default value เป็น true
      },
    },
    {
      sequelize,
      modelName: "Getdata_permissionsv1",
      tableName: "getdata_permissionsv1",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  Getdata_permissionsv1.associate = (models) => {
    Getdata_permissionsv1.belongsToMany(models.Role, {
        through: 'RolePermission', // Name of the junction table
        as: 'roles',
        foreignKey: 'permissionId',
    });
};
  return Getdata_permissionsv1;
};
