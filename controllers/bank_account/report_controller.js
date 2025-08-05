var {
  Admin,
  User_account,
  Bank,
  BankAccount,
  Request_All,
  BankAccountGroup,
  Transactions_limit,
  TransactionsV2,
  TransactionFeeSetting
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




async function setrepoetfree(items) {


  let auth_info, err, Banks, user;


  for (const element of items) {

    if (element.type == "withdraw") {

      [err, Banks] = await to(
        TransactionsV2.update({
          fee: parseFloat(element.settleAmount) - parseFloat(element.amount)
        }, {
          where: { id: element.id },
        })
      );

    } else {

      let amounts = element.amount


      const TransactionFeeSettings = await TransactionFeeSetting.findOne({ where: { merchantId: element.merchantId } });
     // console.log(element)
      // ตรวจสอบว่ามีการตั้งค่าค่าธรรมเนียมหรือไม่ และค่าธรรมเนียมเป็นตัวเลขที่ถูกต้อง
      const depositFeePercentage = TransactionFeeSettings ? parseFloat(TransactionFeeSettings.depositFeePercentage) : 0;
      const amounts_tranfger = amounts - (amounts * (depositFeePercentage / 100));


      [err, Banks] = await to(
        TransactionsV2.update({
          fee: parseFloat(element.amount) - amounts_tranfger
        }, {
          where: { id: element.id },
        })
      );





    }

    //  console.log( - element.amount)

  }









}

const report = async function (req, res) {
  let body = req.body;

  const startDate = moment(body.startDate).startOf("day").format("YYYY-MM-DD HH:mm")

  const endDate = moment(body.endDate).endOf("day").format("YYYY-MM-DD HH:mm")


  async function calculateTransactionSummary(transactions) {
    const summary = {};

    transactions.forEach((transaction) => {
      const date = moment(transaction.created_at).format("YYYY-MM-DD");
      const status = transaction.status;
      const type = transaction.type;
      const amount = transaction.amount;
      const free = transaction.fee;

      if (!summary[date]) {
        summary[date] = {
          label: null,
          deposit: 0,
          deposit_pending: 0,
          deposit_reject: 0,
          deposit_fee: 0,
          withdraw_fee: 0,
          withdraw: 0,
          withdraw_pending: 0,
          withdraw_reject: 0,
          //     withdraw: 0,
          //   withdraw: 0,
          total: 0,
        };
      }

      if (type === "deposit") {
        if (status === "SUCCESS") {
          summary[date].deposit += parseFloat(amount);
          summary[date].deposit_fee += parseFloat(free);

          summary[date].label = date;
        } else if (status === "REJECTED") {
          summary[date].deposit_reject += parseFloat(amount);

          summary[date].label = date;
        } else if (status === "PENDING") {
          summary[date].deposit_pending += parseFloat(amount);

          summary[date].label = date;
        }
        //  summary[date].deposit += parseFloat(amount);
        //  summary[date].label = date;

      } else if (type === "withdraw") {
        if (status === "SUCCESS") {
          summary[date].withdraw += parseFloat(amount);
          summary[date].withdraw_fee += parseFloat(free);

          summary[date].label = date;
        } else if (status === "REJECTED") {
          summary[date].withdraw_reject += parseFloat(amount);

          summary[date].label = date;
        } else if (status === "PENDING") {
          summary[date].withdraw_pending += parseFloat(amount);

          summary[date].label = date;
        }
        //  summary[date].label = date;
        // summary[date].withdraw += parseFloat(amount);
      }
      summary[date].total = summary[date].deposit - summary[date].withdraw;
    });

    // แปลงข้อมูลเป็นรูปแบบที่ Chart.js ใช้
    const chartData = Object.values(summary).map((data) => ({
      label: data.label,
      data: { ...data },
    }));

    return { data: chartData, success: true };
  }

  var daa_all = await TransactionsV2.findAll({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
      // status: "SUCCESS" 
    },
  });

  let tests = await setrepoetfree(daa_all)


  let test = await calculateTransactionSummary(daa_all)
  return ReS(res, {
    data: test.data,
    weekstartDate: test.weekstartDate,
    weekendDate: test.weekendDate,
    message: `สรุปภาพรวม วันที่ ${startDate}-${endDate}`,
  });
};

const chack_Invoice = async function (req, res) {
  let body = req.body;

  const startDate = moment(body.startDate).startOf("day").format("YYYY-MM-DD HH:mm")

  const endDate = moment(body.endDate).endOf("day").format("YYYY-MM-DD HH:mm")


  var transactionsData = await TransactionsV2.findAll({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
      // status: "SUCCESS" 
    },
  });



 const report = {
        totalAllTransactions: transactionsData.length,
        depositSummary: {},
        withdrawSummary: {}
    };



  let tests = await setrepoetfree(transactionsData)

 const depositTransactions = transactionsData.filter(
        transaction => transaction.type && transaction.type.toLowerCase() === 'deposit'
    );
    const withdrawTransactions = transactionsData.filter(
        transaction => transaction.type && transaction.type.toLowerCase() === 'withdraw'
    );
    report.depositSummary = {
        totalCount: depositTransactions.length,
        totalAmount: depositTransactions.reduce((sum, transaction) => sum + (parseFloat(transaction.fee) || 0), 0),
        Product: "Invoice deposit",
        Description: "เรียกเก็บค่า ธรรมเนียมของรายการฝากเงิน",
        Invoice_enddate: `เริ่มจากวันที่ ${startDate} ถึง ${endDate}`,

    };

    report.withdrawSummary = {
        totalCount: withdrawTransactions.length,
        totalAmount: withdrawTransactions.reduce((sum, transaction) => sum + (parseFloat(transaction.fee) || 0), 0),
        Description: "เรียกเก็บค่า ธรรมเนียมของรายการถอนเงิน",
        Product: "Invoice withdraw",
        Invoice_enddate: `เริ่มจากวันที่ ${startDate} ถึง ${endDate}`,
    };

 // let test = await calculateTransactionSummarys(daa_all)
  return ReS(res, {
    data: report,
    Total_Due:report.withdrawSummary.totalAmount+report.depositSummary.totalAmount
    //  weekstartDate: test.weekstartDate,
    //  weekendDate: test.weekendDate,
    //  message: `สรุปภาพรวม วันที่ ${startDate}-${endDate}`,
  });
};
const reportv2 = async function (req, res) {
  let data = {
    dataTransaction: [
      {
        id: 544,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 101.3,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "94a9040b-541c-40af-b2be-ff8d8b18f1cb",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:43.000Z",
        updated_at: "2025-02-20T08:59:43.000Z",
      },
      {
        id: 545,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 216.26,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "f82e9045-0806-4834-88db-bb11a7e5f227",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "deposit",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:43.000Z",
        updated_at: "2025-02-20T08:59:43.000Z",
      },
      {
        id: 546,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 102.31,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "42193134-a2d3-479d-9c42-f2d1aeb079f6",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:43.000Z",
        updated_at: "2025-02-20T08:59:43.000Z",
      },
      {
        id: 547,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 101.3,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "33cea585-8c67-4f56-876a-b29993c53ae5",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:44.000Z",
        updated_at: "2025-02-20T08:59:44.000Z",
      },
      {
        id: 548,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 196.6,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "f3899ad1-54f4-4c43-ad6f-4561f2d676a1",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "deposit",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:44.000Z",
        updated_at: "2025-02-20T08:59:44.000Z",
      },
      {
        id: 549,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 150.45,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "141ecf5a-c622-4240-a917-ca4947f0e5be",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:44.000Z",
        updated_at: "2025-02-20T08:59:44.000Z",
      },
      {
        id: 550,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 100.3,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "bb4aa78c-e4b3-4319-80dd-541ef4b32264",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:45.000Z",
        updated_at: "2025-02-20T08:59:45.000Z",
      },
      {
        id: 551,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 196.6,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "5e283262-1eef-479b-8b3a-65ebd7974e13",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "deposit",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:45.000Z",
        updated_at: "2025-02-20T08:59:45.000Z",
      },
      {
        id: 552,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 110.33,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "3af06887-0ffa-43c8-a478-e98b2a4aae9f",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:45.000Z",
        updated_at: "2025-02-20T08:59:45.000Z",
      },
      {
        id: 553,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 98.3,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "de1f3d3b-ab76-4955-9797-235832cdd689",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "deposit",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:45.000Z",
        updated_at: "2025-02-20T08:59:45.000Z",
      },
      {
        id: 554,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 110.33,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "2e0421be-8ce8-4356-ac2b-1efba3db0749",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:46.000Z",
        updated_at: "2025-02-20T08:59:46.000Z",
      },
      {
        id: 555,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 98.3,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "141b322c-9af3-4b9f-ab60-fb5ec205df94",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "deposit",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T08:59:46.000Z",
        updated_at: "2025-02-20T08:59:46.000Z",
      },
      {
        id: 561,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 101.3,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "637c20b6-0ba9-4eea-b59e-50113f856939",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "PayoneX",
        date_new1: null,
        created_at: "2025-02-20T09:13:14.000Z",
        updated_at: "2025-02-20T09:16:03.000Z",
      },
      {
        id: 562,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 1,
        remark: "tesata",
        bank_from: null,
        acc_from: null,
        name_member: "นาย อนุวัฒน์ สุขสา",
        txn_type: "",
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "5b0ac871-b741-4f5c-98d0-e7ec5e0c28de",
        c_before: null,
        c_after: null,
        description: "5b0ac871-b741-4f5c-98d0-e7ec5e0c28de",
        datw_new: null,
        type_option: "deposit",
        status: "success",
        member_id: 90,
        reqby_admin_id: 4,
        nodere: "ฝากเงินแบบ Manual ไม่มีสลิป",
        date_new1: null,
        created_at: "2025-02-20T15:56:13.000Z",
        updated_at: "2025-02-20T15:56:13.000Z",
      },
      {
        id: 563,
        request_All_id: null,
        status_showadmin: 2,
        status_showmember: 2,
        amount: 2,
        remark: null,
        bank_from: null,
        acc_from: null,
        name_member: "นาย สุรพล ภูต้องสี",
        txn_type: null,
        datamember: null,
        bank_to: null,
        add_from: null,
        ref: "8e3621c0-1423-4982-980b-b01be9de182e",
        c_before: null,
        c_after: null,
        description: null,
        datw_new: null,
        type_option: "ถอน",
        status: "success",
        member_id: 86,
        reqby_admin_id: 4,
        nodere: "ถอนโดยระบบออโต้",
        date_new1: null,
        created_at: "2025-02-21T00:17:18.000Z",
        updated_at: "2025-02-21T00:17:19.000Z",
      },
    ],
    totalByDay: [
      {
        date: "2025-02-20",
        deposit: 0,
        withdraw: 1684.6799999999996,
        profit_and_loss: -1684.6799999999996,
      },
      {
        date: "2025-02-21",
        deposit: 0,
        withdraw: 2,
        profit_and_loss: -2,
      },
    ],
    AllProfit_and_loss: -1686.6799999999996,
    totalDeposit: 0,
    totalWithdraw: 1686.6799999999996,
    length: {
      deposit: 6,
      withdraw: 9,
    },
  };
};
module.exports = {
  report,
  reportv2,
  chack_Invoice
};
