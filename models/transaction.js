'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction.init({
   
    request_All_id: {
      type: DataTypes.INTEGER,
      references: { model: "request_All", key: "id" },
      onDelete: "CASCADE",
      allowNull: true
    },
    status_showadmin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 2
    },
    status_showmember: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 2
    },
    amount: {
      type: DataTypes.FLOAT(16, 2),
      allowNull: true,
      defaultValue: 0
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bank_from: {
      type: DataTypes.STRING,
      allowNull: true
    },
    acc_from: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name_member: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    txn_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    datamember: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bank_to: {
      type: DataTypes.STRING,
      allowNull: true
    },
    add_from: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ref: {
      type: DataTypes.STRING,
      allowNull: true
    },
    c_before: {
      type: DataTypes.FLOAT(16, 1),
      allowNull: true
    },
    c_after: {
      type: DataTypes.FLOAT(16, 1),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    datw_new: {
      type: DataTypes.DATE,
      allowNull: true
    },
    type_option: {
      type: DataTypes.ENUM(['ฝาก', 'ถอน', 'คืนยอดเสีย','ค่าคอม', 'โบนัส', 'ฟรี']),
      allowNull: false,
     
    },
    status: {
      type: DataTypes.ENUM(['pending', 'success', 'rejected', 'cancel', 'confirm','inq', 'processing', 'reviewing','inq_manual','verification','withdrawal_confirm_queued']),
      allowNull: false,
     
    },
    longtext_res: {
      type: DataTypes.JSON,
      allowNull: true,
     
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: true,
     
    },
    bankAccount_id: {
      type: DataTypes.INTEGER,
      references: { model: "bankAccount", key: "id" },
      onDelete: "CASCADE",
      allowNull: true,
    },
    member_id: {
      type: DataTypes.INTEGER,
      references: { model: "member", key: "id" },
      onDelete: "CASCADE",
      allowNull: true
    },
    reqby_admin_id: {
      type: DataTypes.INTEGER,
      references: { model: "admin", key: "id" },
      onDelete: "CASCADE",
      allowNull: false,
    },
    nodere: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_new1: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: "transaction",
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
   // paranoid: true, //use for soft delete with using deleted_at
   // underscored: true //making underscored colomn as deletedAt to deleted_at
  });
  return Transaction;
};