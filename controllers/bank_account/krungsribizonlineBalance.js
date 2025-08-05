var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  BankAccountGroup,
  Systemsettings,
  Transactions_limit,
  Botlog_limittime,
} = require("../../models");

const krungsribizonline = require("../krungsribizonline/krungsribizonline.class");
const Apikrungsribizonline = new krungsribizonline();
var moment = require("moment");
require("moment/locale/th");
var md5 = require("md5");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
async function checkWithdrawalTransactions(data, bankAccount) {
  const transactions = data.data.Statements;

  // กรองเฉพาะรายการที่เป็นการถอนเงิน
  const withdrawals = transactions.filter(
    (txn) => txn.TransactionCategory === "โอนเงิน"
  );

  const transactionPromises = withdrawals.map(async (element) => {
    let ref = md5(
      element.AccountRef + element.BookingDateTime + element.Amount
    );

    let datadaver = {
      ref: ref,
      txnDateTime: element.BookingDateTime, // Use BookingDateTime as it's more specific
      txnAmount: element.Amount,
      txnCurrency: element.AmountCurrency,
      txnDebitCreditFlag: element.MneIndicator === "DBIT" ? "D" : "C", // Assuming DBIT means Debit
      txnRemark: element.Description, // Use Description as it contains more details
      annotation: null,
      txnChannel: element.ExtendedOrigin, // Use ExtendedOrigin for channel
      txnCode: element.TransactionCategory, // Use TransactionCategory for code
      accFrom: bankAccount.accountNumber,
      //  updated_at: 2025-01-07T05:58:54.738Z,
      //created_at: 2025-01-07T05:58:54.738Z
    };

    // Remove unnecessary properties
    delete datadaver.txnBatchRunDate;
    delete datadaver.txnSequence;
    delete datadaver.sortSequence;

    let datafull = await sreat(ref);
    if (!datafull) {
      await Transactions_limit.create(datadaver);
    }
  });

  await Promise.all(transactionPromises);

  // รวมจำนวนเงินที่ถอนได้ทั้งหมด
  const totalWithdrawalAmount = withdrawals.reduce(
    (total, txn) => total + txn.Amount,
    0
  );

  return {
    withdrawals,
    totalWithdrawalAmount,
  };
}

async function sreat(str) {
  let d = await Transactions_limit.findOne({
    where: {
      ref: str,
    },
  });
  return d;
}








async function getPortfolioData(params) {
  const axios = require("axios");
  let data = JSON.stringify({
    deviceId: params.deviceId,
    pin: params.pin,
    accountNumber: params.accountNumber,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://botserver.payment-888.com/api/v1/auth/chack_loginkrungsribizonline",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6Imhhd2tzZXllIiwibWVyY2hhbnRJZCI6NiwidXNlcl90eXBlIjoiYWRtaW4iLCJ1c2VyX2RldmljZV9pZCI6IjI1MDEwMDY0NjQ1MzczNjEzMzAwMDUzNzM2NTEwODAxOTIwMjQiLCJpYXQiOjE3NDE2ODEwMTYsImV4cCI6MTc0MTg1MzgxNn0.8l-jt5uxTwza5zvGI0rykx-FMwGUz3EX6BcFKGK1ViY",
    },
    data: data,
  };

  const dataresut = await axios.request(config);
  return dataresut.data;
}

async function statementInquiryResult_today(items) {

  const axios = require('axios');

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://botserver.payment-888.com/api/v1/auth/statementInquiryResult_today',
    headers: { 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6Imhhd2tzZXllIiwibWVyY2hhbnRJZCI6NiwidXNlcl90eXBlIjoiYWRtaW4iLCJ1c2VyX2RldmljZV9pZCI6IjI1MDEwMDY0NjQ1MzczNjEzMzAwMDUzNzM2NTEwODAxOTIwMjQiLCJpYXQiOjE3NDI4MTQ4OTYsImV4cCI6MTc0Mjk4NzY5Nn0.ocVEKgJqTqzF-5EVJU90UOIEUAxU-7ar3D0yTKCjArA'
    }
  };
  
  const dataresut = await axios.request(config);
  return dataresut.data;




}

const krungsribizonlineBalance = async (bankAccount) => {
  try {
    //let loginResult = await Apikrungsribizonline.login(bankAccount.deviceId, bankAccount.pin);
    const accountData = await getPortfolioData(bankAccount);
    const statementInquiryResult_todays = await statementInquiryResult_today(bankAccount);

    
    let datasave = await checkWithdrawalTransactions(statementInquiryResult_todays,bankAccount)

   const startDate1 = new Date(
      moment().startOf("day").format("YYYY-MM-DD HH:mm")
    );
    const endDate1 = new Date(moment().endOf("day").format("YYYY-MM-DD HH:mm"));
  
    //
    async function upDate_limit(params) {}
    let sumalls = await Transactions_limit.findAll({
      where: {
        accFrom: bankAccount.accountNumber,
        txnDateTime: {
          [Op.between]: [startDate1, endDate1],
        },
      },
    });
  
   
    const totalWithdrawalAmounts = sumalls.reduce(
      (total, txn) => total + parseFloat(txn.txnAmount),
      0
    );

    if (accountData.code == 1000) {



      let remainingLimit = bankAccount.otherBankLimit - totalWithdrawalAmounts;
      //console.log(remainingLimit);
  
      //   await BankAccount.update(
      //   { isActive: true },
      //   { where: { id: activeId } }
      // );
  
      //    Full_credit_limit
  
      let datasave = {
        balance: accountData.Balance,
  
        isActive: true,
        limit_Left: remainingLimit,
       // auth: auth,
      };
  
      await BankAccount.update(datasave, {
        where: {
          id: bankAccount.id,
        },
      });

      // const updateslib = await BankAccount.update(
      //   { balance: accountData.Balance },
      //   { where: { id: bankAccount.id } }
        
      // );

      console.log(
        `อัปเดตยอดเงินบัญชี ID ${bankAccount.id} สำเร็จ: ${accountData.Balance}`
      );
    }
    //   const accountBalance = accountData.accountBalance;
    //   const numericBalance = parseFloat(
    //     accountBalance.replace("THB ", "").replace(",", "")
    //   );

    //   if (!isNaN(numericBalance)) {
    //     // ตรวจสอบว่าเป็นตัวเลขหรือไม่
    //

   
    //   } else {
    //     console.error(`ไม่สามารถแปลงยอดเงินเป็นตัวเลขได้: ${accountBalance}`);
    //   }
    // } else {
    //   console.error("ไม่พบข้อมูลยอดเงินใน API response");
    // }
  } catch (error) {
    console.error(
      `เกิดข้อผิดพลาดในการอัปเดตยอดเงินบัญชี ID ${bankAccount.id}:`,
      error
    );
  }
};









module.exports = { krungsribizonlineBalance };

//
