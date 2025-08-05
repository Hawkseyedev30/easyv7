// RolePermission.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    //...
  }
  RolePermission.init({
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles', // Or whatever your Role model is named
        key: 'id'
      }
    },
    permissionId: { // Use 'permissionId' to match the association in your Role model
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'getdata_permissionsv1',
        key: 'id'
      }
    },
    isPublic: {
      // เพิ่ม field is_public (snake_case ตาม convention)
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1, // กำหนด default value เป็น true
    },
  }, {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'RolePermissions'
  });
  return RolePermission;
};