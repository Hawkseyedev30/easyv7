var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  Transaction_manual,
  Customers,
  TransactionsV2,
  TransactionFeeSetting,
  Create_deposits
} = require("../../models");
const { ReE, ReS, to } = require("../../services/util.service");
const Apikbank = require("../../kbank/dist/index");
const Api_createdeposit = require("./deposit_controller");

const { Op } = require("sequelize");
var fs = require("fs");
const multer = require("multer");
const Jimp = require("jimp");
const jsQr = require("jsqr");
var md5 = require("md5");
var moment = require("moment");
require("moment/locale/th");
moment.locale("th");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage/qr");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var Uploadall = multer({ storage: storage }).fields([
  { name: "img_url", maxCount: 1 },
]);
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");

function generateUuid() {
  return uuidv4();
}

const getTransactions = async function (req, res) {
  try {
    const page = parseInt(req.query.page) || 1; //  หน้าปัจจุบัน, เริ่มต้นที่ 1
    const limit = req.query.limit ? parseInt(req.query.limit) : 10; // จำนวนรายการต่อหน้า
    const offset = (page - 1) * limit; // คำนวณ offset

    // ใช้ findAndCountAll เพื่อให้ได้ทั้งข้อมูลและจำนวนทั้งหมดสำหรับการทำ pagination
    const { count, rows } = await TransactionsV2.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [
        ["id", "DESC"], // เรียงตามวันที่สร้างล่าสุด (ตัวอย่าง)
        // หรือ ['id', 'DESC'] หากต้องการเรียงตาม ID ล่าสุด
      ],
      // สามารถเพิ่มเงื่อนไขอื่นๆ (where clause) ได้ตามต้องการ
    });

    return ReS(
      res,
      {
        data: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        message: "Transactions retrieved successfully",
      },
      200
    );
  } catch (error) {
    console.error("Failed to get transactions:", error);
    // แก้ไข typo: error.respornse.data -> error.response.data
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred while fetching transactions.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;

    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    );
  }
};
const listTransactions = async function (req, res) {
  // Extract the request body.
  const requestBody = req.body;




  // --- Input Validation ---
  // Check if the request body is empty or null.
  if (!requestBody || Object.keys(requestBody).length === 0) {
    return ReS(res, { message: "Request body cannot be empty." }, 400);
  }

  // Extract the platform order ID from the request body.
  const platformOrderId = requestBody.uuid;

  // Check if the platformOrderId (uuid) is provided and is not empty.
  if (!platformOrderId) {
    return ReS(res, { message: "Platform Order ID (uuid) is required." }, 400);
  }

  try {
    // Attempt to find a transaction record using the platform order ID.
    // TransactionsV2 is assumed to be a Sequelize model or similar ORM.
    const transactionRecord = await TransactionsV2.findOne({
      //     include: [
      //   {
      //     as: "Create_deposits_uuid",
      //     model: Create_deposits,
      //     attributes: {
      //       include: [],
      //       exclude: ["deleted_at", "created_at", "updated_at"],
      //     },
      //     required: true,
      //    // where: { merchantId: req.user.merchantId },
      //   },
      // ],

      where: {
        platformOrderId: platformOrderId,
      },
    });



    if (transactionRecord) {


      if (transactionRecord.type == "withdraw") {


        const transactionRecords = await TransactionsV2.findOne({
          //     include: [
          //   {
          //     as: "Create_deposits_uuid",
          //     model: Create_deposits,
          //     attributes: {
          //       include: [],
          //       exclude: ["deleted_at", "created_at", "updated_at"],
          //     },
          //     required: true,
          //    // where: { merchantId: req.user.merchantId },
          //   },
          // ],

          where: {
            platformOrderId: platformOrderId,
          },
        });

        return ReS(
          res,
          {
            data: transactionRecords,
            message: "Transactions retrieved successfully",
          },
          200
        );

      }else if (transactionRecord.type == "deposit") {


        const transactionRecordsdeposit = await TransactionsV2.findOne({
              include: [
            {
              as: "Create_deposits_uuid",
              model: Create_deposits,
              attributes: {
                include: [],
                exclude: ["deleted_at", "created_at", "updated_at"],
              },
              required: true,
             // where: { merchantId: req.user.merchantId },
            },
          ],

          where: {
            platformOrderId: platformOrderId,
          },
        });

        return ReS(
          res,
          {
            data: transactionRecordsdeposit,
            message: "Transactions retrieved successfully",
          },
          200
        );

      }

    //  return ReE(res, { message: "Request body cannot be empty." }, 400);

    }


    if (!transactionRecord) {

      return ReE(res, { message: "Request body cannot be empty.deposit" }, 400);

    }

    // Return the found transaction record. If not found, transactionRecord will be null.
    return ReS(
      res,
      {
        data: transactionRecord,
        message: "Transactions retrieved successfully",
      },
      200
    );
  } catch (error) {
    // Log the error for debugging purposes.
    console.error("Error retrieving transaction:", error);
    // Return an error response if something goes wrong during the database query.
    return ReS(res, { message: "Failed to retrieve transaction.", error: error.message }, 500);
  }
};
const fetchAllTransactions = async function (req, res) {






};

const findTransactionById = async function (req, res) { };
const searchTransactions = async function (req, res) { };
const updateTransaction = async function (req, res) { };
const editTransaction = async function (req, res) { };
const withdrowTransaction = async function (req, res) {
  try {
    const body = req.body;

    // --- Validation ---
    if (body.customerUuid == "") {
      return ReE(
        res,
        {
          message:
            "Customer information (customerUuid) is required and must be an object.",
        },
        400
      );
    }
    const { customer_uuid, client_code, partner, account_no, bank_code, name } =
      body;
    if (!client_code) {
      return ReE(
        res,
        { message: "customerUuid.client_code is required." },
        400
      );
    }
    if (!partner) {
      return ReE(res, { message: "customerUuid.partner is required." }, 400);
    }
    if (!account_no) {
      return ReE(res, { message: "customerUuid.account_no is required." }, 400);
    }
    if (!bank_code) {
      return ReE(res, { message: "customerUuid.bank_code is required." }, 400);
    }
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return ReE(res, { message: "Amount must be a positive number." }, 400);
    }
    if (!body.referenceId) {
      return ReE(
        res,
        { message: "Reference ID (referenceId) is required." },
        400
      );
    }



    // --- Prepare TransactionsV2 Data ---
    // Assuming 'THB' as default currency. This could come from config or request.
    const currency = "THB";

    let datamer = await Merchant.findOne({
      where: {
        id: req.user.id,
      },
    });

    const transactionAmountlet = datamer.balance;

    const transactionAmount = parseFloat(body.amount);

    if (transactionAmountlet < transactionAmount) {
      return ReE(
        res,
        { message: "error amount loads balance" },
        400
      );
    }
    const TransactionFeeSettings = await TransactionFeeSetting.findOne({ where: { merchantId: req.user.id } });
    const customerUuids = await Customers.findOne({ where: { customer_uuid: req.body.customerUuid } });


    if (!customerUuids) {
      return ReE(
        res,
        { message: "error customerUuids" },
        400
      );
    }

    // ตรวจสอบว่ามีการตั้งค่าค่าธรรมเนียมหรือไม่ และค่าธรรมเนียมเป็นตัวเลขที่ถูกต้อง
    const withdrawal_fee_percentage = TransactionFeeSettings ? parseFloat(TransactionFeeSettings.withdrawalFeePercentage) : 0;

    const amounts_tranfger = transactionAmount + (transactionAmount * (withdrawal_fee_percentage / 100));



    const newTransactionData = {
      logUuid: generateUuid(), // Internal unique ID for this log entry
      clientCode: client_code,
      partnerCode: partner,
      referenceId: body.referenceId, // Client's provided reference ID
      merchantOrderId: body.referenceId, // Using client's reference as merchant order ID
      platformOrderId: generateUuid(), // Platform's internal unique order ID
      customer: body.customerUuid, // Store the provided customer object
      amount: transactionAmount,
      transferAmount: amounts_tranfger, // Amount to be transferred
      currency: currency,
      settleCurrency: currency,
      type: "withdraw",
      status: "PENDING", // Initial status for a new withdrawal request
      note: body.note || body.remark || "Withdrawal request",
      eventCreatedAt: Date.now(),
      eventUpdatedAt: Date.now(),
      merchantId: req.user.id,
      // --- Fields from TransactionsV2 model that are NOT NULL and need values ---
      // These are placeholders or defaults; adjust based on your business logic.
      bank: {
        // Placeholder for the bank details involved in the withdrawal (e.g., payer's bank)
        accountNo: customerUuids.account_no,
        accountName: customerUuids.name,
        bankCode: customerUuids.bank_code,
      },
      rate: 1,
      channelName: partner || "DEFAULT_CHANNEL", // Or derive from partner/client
      fee: 0, // Calculate actual fees
      feePlatform: 0,
      feeSale: 0,
      feePartner: 0,
      settleAmount: amounts_tranfger, // Should be amount - fees for merchant, or just amount for customer payout
      settleRate: 1,
      rateDisplay: 1,
      refUuid: body.referenceId, // Can be used for an external system reference if different from merchantOrderId
      feePayment: 0,
      profit: 0, // Profit calculation for withdrawals might be different

      // CRITICAL: The 'balance' field is NOT NULL in your TransactionsV2 model.
      // It requires a meaningful value (e.g., customer's balance AFTER this transaction,
      // or merchant's/platform's balance).
      // Setting to 0 here is a placeholder and needs proper business logic.
      balance: transactionAmountlet - transactionAmount,
      updatedBy: req.user ? req.user.username : "system", // If user context is available
      // Sequelize handles 'createdAt' and 'updatedAt' automatically
    };

    let updatedatatran = await Merchant.update(
      {
        //  bankAccount_id: cahack_banktranfers.id,
        balance: transactionAmountlet - transactionAmount,

      },
      {
        where: {
          id: datamer.id,
        },
      }
    );



    // --- Create TransactionsV2 ---
    const [err, transaction] = await to(
      TransactionsV2.create(newTransactionData)
    );

    if (err) {
      console.error("Failed to create withdrawal transaction:", err);
      return ReE(
        res,
        {
          message: "Failed to create withdrawal transaction.",
          error: err.message,
        },
        500
      );
    }

    return ReS(
      res,
      {
        data: transaction,
        message: "Withdrawal request created successfully.",
      },
      201
    );
  } catch (error) {
    console.error("Error in createWithdrawal function:", error);
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred during withdrawal creation.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;
    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    );
  }

  // TransactionsV2
};
const getbalance = async function (req, res) { };

const create_deposit = async function (req, res) {

  try {

    let body = req.body;

    let babkdep = await BankAccount.findOne({
      where: {
        status_bank: "Active",
        accountType: "deposit",
      },
    })

    if (babkdep.channel == 'k-biz') {


      let Loginkbank_auths = await Apikbank.Loginkbank_auth(babkdep)


      let gettran = await Apikbank.getTransactionList(babkdep)

      console.log(gettran)

    } else if (babkdep.channel == 'k-pay') {

    }







  } catch (err) {

    console.log(err)
  }

}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}

module.exports = {
  getTransactions,
  listTransactions,
  fetchAllTransactions,
  findTransactionById,
  searchTransactions,
  updateTransaction,
  editTransaction,
  getbalance,
  withdrowTransaction,
  create_deposit

  //   upload_Manual,
  //   upload_Manual,
  //   upload_Manual,
};

//-----------
// module.exports = {
//   upload_Manual,
//   createRecordContactSupport,
//   sendlogo,
//   createqr,
// };

//const createRecordContactSupport = async function (req, res) {}

// async function qr(url) {

// }


