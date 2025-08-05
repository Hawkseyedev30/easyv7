var {
  Admin,
  User_account,
  Activity_system,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  TransactionsV2,
  KayApi,
  Transaction_withdraw,
  Tfa,
  Role,
  Create_deposits
} = require("../models");

const { to, ReE, ReS, TE } = require("../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const CONFIG = require("../config/config.json");
const bcrypt_p = require("bcrypt-promise");

var url = require("url");
const app = require("../services/app.service");
const config = require("../config/app.json")[app["env"]];
const io = require("socket.io-client");
var socket = io.connect(config["BASE_URL"], { reconnect: true });
var moment = require("moment");
require("moment/locale/th");
const crypto = require("crypto");
const base32 = require("hi-base32");
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");

const GoogleAuthenticator = require("./GoogleAuthenticator");

const authenticator = require("js-google-authenticator");
const authenticators = new GoogleAuthenticator();

//  function ค้นหา
async function SearchData(searchParams, type) {
  try {
    if (type == "withdrawal") {
      console.log("typeWithdrawal", type);
      const withdrawalTransaction = await TransactionsV2.findAndCountAll({
        include: [
          {
            model: Member,
            as: "members",
            attributes: {
              exclude: ["deleted_at"],
            },
            required: true,
          },
          {
            model: Transaction_withdraw,
            as: "Transaction_withdraws",
            attributes: {
              exclude: ["deleted_at"],
            },
            required: true,
          },
          {
            model: Admin,
            as: "Admins",
            attributes: {
              exclude: ["deleted_at"],
            },
            required: true,
          },
        ],
        where: searchParams,
        order: [["id", "desc"]],
      });
      return [null, withdrawalTransaction];
    }
    if (type == "deposit") {
      console.log("typeDeposit", type);
      let transactions = await TransactionsV2.findAndCountAll({
        include: [
          {
            as: "members",
            model: Member,
            attributes: {
              include: [],
              exclude: ["deleted_at"],
            },
            required: true,
            // where: { to_user_id: user_id, request_status: "Requested" },
          },
          {
            model: Request_All,
            as: "transaction_bank", // Use the correct alias from your model definition
            attributes: {
              include: [],
              exclude: ["deleted_at"],
            },
          },
        ],
        where: searchParams,
        order: [["id", "desc"]],
      });
      return [null, transactions];
    }
  } catch (error) {
    return [error, null];
  }
}

const getSearchDataTransaction = async function (req, res) {
  try {
    const { body } = req;
    const searchItem = {}; // Object to build dynamic WHERE clause for TransactionsV2
    const depositSearchItem = { status: "PENDING" }; // Object to build dynamic WHERE clause for Create_deposits

    // Add search criteria from body to searchItem for TransactionsV2
    if (body.ref) {
      searchItem.referenceId = body.ref; // Assuming 'ref' maps to 'referenceId' in TransactionsV2
    }
    if (body.name_member) {
      // Assuming 'name_member' maps to 'customer' or a related field in TransactionsV2
      // You might need to adjust this based on your TransactionsV2 model structure
      // For example, if customer is stored as a name:
      // searchItem.customer = body.name_member;
      // Or if it's a UUID and you need to find by name via a join:
      // This example assumes 'customer' field directly stores the customer's UUID
      // and you might need a separate lookup if 'name_member' is the actual name.
      // For now, I'll leave a placeholder or assume direct mapping if possible.
      // If 'name_member' means customer's actual name, you'd need to join with Customers table.
      // For simplicity, I'll assume it's part of the customer field or similar direct search.
      // If 'customer' in TransactionsV2 is a UUID, you would need to find customer UUID by name first.
      // For this example, I'll add a comment.
      // Example if 'name_member' is part of a 'note' or 'remark' field:
      // searchItem.note = { [Op.like]: `%${body.name_member}%` };
      // Or if you need to search by customer name, you'd typically join with the Customers table.
      // As per the original code, 'customer' is used, so let's assume it's a direct match or UUID.
      searchItem.customer = body.name_member; // Assuming direct match or UUID
    }
    if (body.member_id) {
      searchItem.customer = body.member_id; // Assuming 'member_id' maps to 'customer' in TransactionsV2
    }
    if (body.status) {
      searchItem.status = body.status;
    }
    if (body.type) {
      searchItem.type = body.type;
    }

    // Calculate start and end dates for filtering
    const startDate = moment(body.startDate).startOf("day").toDate(); // Convert to Date object
    const endDate = moment(body.endDate).endOf("day").toDate();     // Convert to Date object

    // Add date range filter to searchItem for TransactionsV2
    // This will filter by 'created_at' within the specified date range
    // Ensure 'Op' is imported from 'sequelize' or available globally
    searchItem.created_at = {
      [Op.between]: [startDate, endDate],
    };

    // Add date range filter to depositSearchItem for Create_deposits
    depositSearchItem.created_at = {
      [Op.between]: [startDate, endDate],
    };

    const page = parseInt(body.page) || 1; // Current page, defaults to 1
    const limit = body.limit ? parseInt(body.limit) : 10; // Items per page, defaults to 10
    const offset = (page - 1) * limit; // Calculate offset for pagination

    // Query for TransactionsV2
    const { count, rows } = await TransactionsV2.findAndCountAll({
      where: searchItem, // Apply dynamic search criteria including date range
      limit: limit,
      offset: offset,
      order: [["id", "desc"]], // Order by ID in descending order
    });

    // Query for Create_deposits (PENDING transactions)
     const { count2, rows2 }= await Create_deposits.findAndCountAll({
      where: depositSearchItem, // Apply dynamic search criteria including date range and status
      offset: offset, // Use the same pagination for pending deposits
      limit: limit,
      order: [["id", "desc"]],
    });

    return ReS(res, {
      data_transactions: rows,
      data_create_deposits:rows2, // Access rows property for Create_deposits
      code: 1000,
      startDate: startDate,
      endDate: endDate, // Also return endDate for clarity
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      message: "Transactions retrieved successfully",
    });
  } catch (error) {
    console.error("Unexpected error in getSearchDataTransaction:", error);
    return ReE(
      res,
      {
        message: error.message || "Internal server error",
        status_code: 500,
      },
      200 // Changed to 200 as per common practice for API errors in your previous ReS/ReE examples
    );
  }
};

// Exporting functions

module.exports = {
  getSearchDataTransaction,
};
