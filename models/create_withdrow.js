"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Create_withdrow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Create_withdrow.init(
    {
      platform_order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Assuming this should be unique
      },
      merchant_order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true // Good for searching
      },
      order_datetime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      account_no: {
        type: DataTypes.STRING,
        allowNull: false,
       // index: true // Good for searching
      },
      bank: {
        type: DataTypes.STRING,
        allowNull: false,
       // index: true // Good for searching
      },
      account_name: {
        type: DataTypes.STRING,
        allowNull: false,
       // index: true // Good for searching
      },
      amount: {
        type: DataTypes.STRING,
        allowNull: false,
       // index: true // Good for searching
      },
      
      amount: {
        type: DataTypes.DECIMAL(10, 2), // Example: up to 10 digits, 2 decimal places
        allowNull: false
      },
      transfer_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Or false, depending on requirements
      },
    
      status: { // To store our system's status of the payment
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING' // Default status when created
      },
      payment_gateway_status: { // To store the status received from gateway callback
        type: DataTypes.STRING,
        allowNull: true
      },
      callback_data: { // To store the raw callback payload for auditing
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      //  defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
       // defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      sequelize,
      modelName: "Create_withdrow",
      tableName: "create_withdrow",
    //   deletedAt: "deleted_at",
    //   createdAt: "created_at",
    //   updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Create_withdrow;
};
