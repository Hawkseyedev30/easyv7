'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TransactionsV2 extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Example:
      // TransactionsV2.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  TransactionsV2.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    logUuid: {
      type: DataTypes.UUID, // Based on char(36) and common usage for UUIDs
      allowNull: false,
      field: 'log_uuid',
    },
    CustomersId: {
        type: DataTypes.INTEGER,
        references: { model: "customers", key: "id" },
        // onDelete: "CASCADE",
        allowNull: true
      },
    bankAccount_id: {
      type: DataTypes.INTEGER,
      references: { model: "bankAccount", key: "id" },
      onDelete: "CASCADE",
      allowNull: true,
    },
    merchantId: {
        type: DataTypes.INTEGER,
        references: { model: "merchant", key: "id" },
        // onDelete: "CASCADE",
        allowNull: true
    },
    successTime: {
      type: DataTypes.BIGINT,
      field: 'success_time',
    },
    clientCode: {
      type: DataTypes.STRING,
      field: 'client_code',
    },
    partnerCode: {
      type: DataTypes.STRING,
      field: 'partner_code',
    },
    bankCallbackInfo: {
      type: DataTypes.JSON, // longtext often stores JSON
      field: 'bank_callback_info',
    },
    tag: {
      type: DataTypes.JSON, // longtext often stores JSON
    },
    duplicateFromUuid: {
      type: DataTypes.UUID,
      field: 'duplicate_from_uuid',
    },
    changeStatusNote: {
      type: DataTypes.TEXT,
      field: 'change_status_note',
    },
    duplicateSlip: {
      type: DataTypes.TEXT,
      field: 'duplicate_slip',
    },
    oldTransaction: {
      type: DataTypes.JSON,
      field: 'old_transaction',
    },
    eventCreatedAt: {
      type: DataTypes.BIGINT,
      field: 'event_created_at',
    },
    eventUpdatedAt: {
      type: DataTypes.BIGINT,
      field: 'event_updated_at',
    },
    referenceId: {
      type: DataTypes.STRING,
      field: 'reference_id',
    },
    customer: {
      type: DataTypes.JSON,
    },
    amount: {
      type: DataTypes.DECIMAL(19, 4),
    },
    bank: {
      type: DataTypes.JSON,
    },
    topupInfo: {
      type: DataTypes.JSON,
      field: 'topup_info',
    },
    rate: {
      type: DataTypes.DECIMAL(12, 6),
    },
    channelName: {
      type: DataTypes.STRING,
      field: 'channel_name',
    },
    fee: {
      type: DataTypes.DECIMAL(19, 4),
    },
    feePlatform: {
      type: DataTypes.DECIMAL(19, 4),
      field: 'fee_platform',
    },
    feeSale: {
      type: DataTypes.DECIMAL(19, 4),
      field: 'fee_sale',
    },
    feePartner: {
      type: DataTypes.DECIMAL(19, 4),
      field: 'fee_partner',
    },
    settleAmount: {
      type: DataTypes.DECIMAL(19, 4),
      field: 'settle_amount',
    },
    status: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    actions: {
      type: DataTypes.JSON,
    },
    unknownCustomersMain: {
      type: DataTypes.JSON,
      field: 'unknown_customers_main',
    },
    unknownCustomers: {
      type: DataTypes.JSON,
      field: 'unknown_customers',
    },
    name: {
      type: DataTypes.STRING,
    },
    settleCurrency: {
      type: DataTypes.STRING(3),
      field: 'settle_currency',
    },
    settleRate: {
      type: DataTypes.DECIMAL(12, 6),
      field: 'settle_rate',
    },
    rateDisplay: {
      type: DataTypes.DECIMAL(12, 6),
      field: 'rate_display',
    },
    callbackDatetime: {
      type: DataTypes.BIGINT,
      field: 'callback_datetime',
    },
    callbackData: {
      type: DataTypes.TEXT,
      field: 'callback_data',
    },
    responseTime: {
      type: DataTypes.STRING,
      field: 'response_time',
    },
    responseFullTime: {
      type: DataTypes.STRING,
      field: 'response_full_time',
    },
    refUuid: {
      type: DataTypes.STRING, // varchar(255), not char(36)
      field: 'ref_uuid',
    },
    settleType: {
      type: DataTypes.STRING,
      field: 'settle_type',
    },
    currency: {
      type: DataTypes.STRING(3),
    },
    feePayment: {
      type: DataTypes.DECIMAL(19, 4),
      field: 'fee_payment',
    },
    profit: {
      type: DataTypes.DECIMAL(19, 4),
    },
    platformOrderId: {
      type: DataTypes.STRING,
      field: 'platform_order_id',
    },
    merchantOrderId: {
      type: DataTypes.STRING,
      field: 'merchant_order_id',
    },
    settleCode: {
      type: DataTypes.STRING,
      field: 'settle_code',
    },
    settleEmail: {
      type: DataTypes.STRING,
      field: 'settle_email',
    },
    settleAccount: {
      type: DataTypes.STRING,
      field: 'settle_account',
    },
    settleName: {
      type: DataTypes.STRING,
      field: 'settle_name',
    },
    settleNetwork: {
      type: DataTypes.STRING,
      field: 'settle_network',
    },
    settleGateway: {
      type: DataTypes.STRING,
      field: 'settle_gateway',
    },
    note: {
      type: DataTypes.TEXT,
    },
    transferAmount: {
      type: DataTypes.DECIMAL(19, 4),
      field: 'transfer_amount',
    },
    refMerchantOrderId: {
      type: DataTypes.STRING,
      field: 'ref_merchant_order_id',
    },
    settleExternalFee: {
      type: DataTypes.DECIMAL(19, 4),
      field: 'settle_external_fee',
    },
    qrcode: {
      type: DataTypes.TEXT,
    },

    create_deposits_id: {
      type: DataTypes.INTEGER,
      references: { model: "Create_deposits", key: "id" },
      onDelete: "CASCADE",
      allowNull: true,
    },

    promptpay: {
      type: DataTypes.STRING,
    },
    transferItemId: {
      type: DataTypes.STRING,
      // field: 'prompt_name',
    },
    transferOrderId: {
      type: DataTypes.STRING,
      //  field: 'prompt_name',
    },
    promptName: {
      type: DataTypes.STRING,
      field: 'prompt_name',
    },
    qrcodeRef: {
      type: DataTypes.STRING,
      field: 'qrcode_ref',
    },
    balance: {
      type: DataTypes.DECIMAL(19, 4),
    },
    slipUrl: {
      type: DataTypes.TEXT,
      field: 'slip_url',
    },
    callbackLog: {
      type: DataTypes.JSON,
      field: 'callback_log',
    },
    bankUuid: {
      type: DataTypes.UUID,
      field: 'bank_uuid',
    },
    middlewareBankUuid: {
      type: DataTypes.UUID,
      field: 'middleware_bank_uuid',
    },
    withdrawSlip: {
      type: DataTypes.TEXT,
      field: 'withdraw_slip',
    },
    taskBy: {
      type: DataTypes.STRING,
      field: 'task_by',
    },
    statementTime: {
      type: DataTypes.BIGINT,
      field: 'statement_time',
    },
    settleSlip: {
      type: DataTypes.JSON,
      field: 'settle_slip',
    },
    slipInformation: {
      type: DataTypes.TEXT,
      field: 'slip_information',
    },
    buyRate: {
      type: DataTypes.STRING,
      field: 'buy_rate',
    },
    updatedBy: {
      type: DataTypes.STRING,
      field: 'updated_by',
    },
    // createdAt and updatedAt are handled by Sequelize because of `timestamps: true`
    // and `underscored: true` will map them to created_at and updated_at
  }, {
    sequelize,
    modelName: 'TransactionsV2',
    tableName: 'transactionsv2',
   // deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    // underscored: true, // This maps camelCase fields in the model to snake_case columns in the DB
    // e.g., logUuid in model becomes log_uuid in DB table
    // and Sequelize's createdAt/updatedAt become created_at/updated_at
  });
  return TransactionsV2;
};
