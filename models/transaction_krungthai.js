'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionKrungthai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Example: If you added a bankAccountId foreign key in the migration:
      // TransactionKrungthai.belongsTo(models.BankAccount, {
      //   foreignKey: 'bankAccountId',
      //   as: 'bankAccount'
      // });
    }
  }
  TransactionKrungthai.init({
    // id is automatically added by Sequelize as primary key
    transactionIndex: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionRefId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transactionCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    descriptionTransactionInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    descriptionName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descriptionChannel: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    transactionComment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    withdraw: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: true,
    },
    deposit: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: true,
    },
    ledgerBalance: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    transactionType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentRef: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_pay: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    
  }, {
    sequelize,
    modelName: 'TransactionKrungthai', // The name used in associations (e.g., models.TransactionKrungthai)
    tableName: 'transaction_krungthai', // Explicitly define the table name
   // underscored: true, // Use snake_case for automatically added attributes like createdAt, updatedAt
    timestamps: true, // Enable timestamps
    createdAt: 'created_at', // Map createdAt to the 'created_at' column
    updatedAt: 'updated_at', // Map updatedAt to the 'updated_at' column
  });
  return TransactionKrungthai;
};