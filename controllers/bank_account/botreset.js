var {
  Admin,
  User_account,
  Bank,
  BankAccount,
  Request_All,
  BankAccountGroup,
  Transactions_limit,
  TransactionsV2,
  Transaction_withdraw,
} = require("../../models");

const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];
const fs = require("fs");
const scbeasy = require("../scb/classscb");
const Apiurlscb = require("../../helpers/apiurl_scb");
var md5 = require("md5");
const Scbapi = new scbeasy();
var moment = require("moment");
require("moment/locale/th");
const Apiscb_helper = require("../../helpers/login.helpers");
const Notify = require("../../helpers/notify");
// Assuming you have sequelize instance and BankAccount model imported
 const { sequelize } = require('../../models'); // Or wherever your sequelize instance is defined
// const BankAccount = require('./models/bankAccount'); // Adjust path as necessary
// Assuming ReS is a response utility function like:
// const ReS = (res, data, code) => res.status(code || 200).json(data);
// const ReE = (res, err, code) => res.status(code || 500).json({ error: err.message });

const botnotify_timezone = async function (req, res) {
  // This function is intended to be run around 11 PM ("5 ทุ่ม").

  // Use a transaction to ensure atomicity: either both updates succeed or neither does.
  const transaction = await sequelize.transaction(); // Start transaction (Requires sequelize instance)

  try {
    console.log("Starting scheduled bank account status update...");

    // --- Part 1: Deactivate active KTB withdrawal accounts ---
    // Directly update accounts matching the criteria without fetching them first.
    const [deactivatedCount] = await BankAccount.update(
      { status_bank: "Inactive" }, // Fields to update
      {
        where: {
          accountType: "withdrawal",
         // channel: "ktb-business", // Specify KTB channel
          status_bank: "Active", // Only deactivate if currently active
        },
        transaction, // Run this update within the transaction
      }
    );
    console.log(`${deactivatedCount}`);

    // --- Part 2: Activate withdrawal account(s) with level_Bank = 10 ---
    // Directly update the specific account(s) to Active.
    // Note: This will activate ALL accounts matching the criteria. If only one should be active,
    // you might need more specific criteria or logic.
    // Consider adding 'status_bank: "Inactive"' to the 'where' clause if you only
    // want to activate accounts that are currently inactive.
    const [activatedCount] = await BankAccount.update(
      { status_bank: "Active" }, // Fields to update
      {
        where: {
          accountType: "withdrawal",
          level_Bank: 10,
          // Optional: Add this line if you only want to activate inactive ones
          // status_bank: "Inactive"
        },
        transaction, // Run this update within the transaction
      }
    );
    console.log(
      `Activated ${activatedCount} level_Bank 10 withdrawal account(s).`
    );

    // If both updates were successful, commit the transaction
    await transaction.commit();
    console.log("Bank account status update completed successfully.");

    //let bank_auth = "KTB"


    let msg = `⚠️【 Payment-Backend88-NOTICE 】⚠️

**แจ้ง  ${`ปิดระบบ ถอนออโต้ withdrawal`}**
⚠️  เราจะดำเนินการบำรุงรักษาระบบถอนในเวลาดังนี้


❌ ปิดระบบ ถอนออโต้ กรุงไทยตั้งแต่เวลา เวลา 23.00 - 01.30
——————————————

✅  เปิดระบบ ถอน บัญชี กสิกรไทย เวลา 23.00 - 01.30
    สถานะธนาคาร : Active
——————————————

❌ Withdrawals will be unavailable from 11:00 PM to 01:30 AM.

เราขออภัยในความไม่สะดวกที่เกิดขึ้น 🙏🏻
We apologize for the inconvenience.`


 let datanoti = {
    msg: msg,
    tpye: "worning",
    type_option: "withdraw",
    data: {
     // accountNumber: accountNumber,
     // remainingLimit: parseFloat(remainingLimit).toFixed(2),
     // threshold: parseFloat(threshold).toFixed(2),
      nodere:
        "ยอดคงเหลือใกล้ถึงวงเงินที่กำหนด กรุณาตรวจสอบและเปลี่ยนบัญชีหากจำเป็น",
    },
  };

  await Notify.sendTelegram(datanoti);



    return ReS(
      res,
      {
        message: "success",
       // deactivatedKTBAccounts: deactivatedCount,
        //activatedLevel10Accounts: activatedCount,
      },
      200
    );
  } catch (error) {
    // If any error occurs, roll back the transaction
   // await transaction.rollback();
   // console.error("Error during scheduled bank account status update:", error);

    // Return an error response
    // Assuming you have an error response helper ReE or similar
    // return ReE(res, error, 500);
    return res.status(500).json({
      error: "Failed to update bank account statuses.",
      details: error.message, // Provide error details for debugging
    });
  }
};






const botnotify_time_in = async function (req, res) {



  console.log(req.body)


  return ReS(
    res,
    {
      message: "success",
    
    },
    200
  );





}




const callbacks = async function (req, res) {



  //console.log(req.body)


  return ReS(
    res,
    {
      message: "success",
    
    },
    200
  );





}
  // let auth_info, err, user;
// module.exports = { botnotify_timezone }; // Export if needed

const botreset_summerrylimit = async function (req, res) {
  // let auth_info, err, user;
  //
  const auth_info = await BankAccount.findAll({
    where: { channel: "scb-easy" },
  });
  //async function upDate_limit(params) {}
  for (const data_backacc of auth_info) {
    //
    let totalWithdrawalAmounts = await sumbyaxx(data_backacc.accountNumber);

    let remainingLimit = data_backacc.otherBankLimit - totalWithdrawalAmounts;

    await BankAccount.update(
      {
        limit_Left: remainingLimit,
      },
      {
        where: { id: data_backacc.id },
      }
    );

    // let chack_auth = await Apiscb_helper.chack_auth(bankAccounts.auth);
    //console.log(remainingLimit)
  }

  return ReS(
    res,
    {
      // static_key: "api_response_auth_login_accountNo_already_exists",
      message: "success",
      // data: totalWithdrawalAmounts
    },
    200
  );
};

async function sumbyaxx(acc) {
  const startDate1 = moment().startOf("day").format("YYYY-MM-DD HH:mm");
  const endDate1 = moment().endOf("day").format("YYYY-MM-DD HH:mm");

  let sumalls = await Transactions_limit.findAll({
    where: {
      accFrom: acc,
      created_at: {
        [Op.between]: [startDate1, endDate1],
      },
    },
  });

  // console.log(sumalls);

  const totalWithdrawalAmounts = sumalls.reduce(
    (total, txn) => total + parseFloat(txn.txnAmount),
    0
  );

  // let updateaxcc =  await BankAccount.update(
  //     { limit_Left: params.otherBankLimit - totalWithdrawalAmounts },
  //     { where: { id: params.id } }
  //   );

  return totalWithdrawalAmounts;
}

module.exports = {
  botreset_summerrylimit,
  botnotify_timezone,
  botnotify_time_in,
  callbacks
};
