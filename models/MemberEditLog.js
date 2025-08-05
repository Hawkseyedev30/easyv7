"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MemberEditLog extends Model {
    static associate(models) {
      // สามารถกำหนด association กับ Model อื่นๆ ได้ที่นี่
      // เช่น MemberEditLog.belongsTo(models.Member);
    }
  }

  MemberEditLog.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Member", // อ้างอิง Model Member
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      old_data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      new_data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User", // อ้างอิง Model User
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
       // defaultValue: DataTypes.NOW, // เพิ่มบรรทัดนี้
      },
    },
    {
      sequelize,
      modelName: "MemberEditLog",
      tableName: "member_edit_logs", // กำหนดชื่อตารางในฐานข้อมูล
      timestamps: false,
    }
  );
  return MemberEditLog;
};
