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

var md5 = require("md5");
const moment = require("moment"); // Import moment-timezone
require("moment/locale/th");

async function Insert_datadep_krungsribizonline(params, fron_bank) {
  function conRes(res) {
    return Object.values(JSON.parse(JSON.stringify(res)));
  }
  async function sreat(str) {
    let d = await Request_All.findOne({
      where: {
        description: str,
      },
    });
    return d;
  }
  function splitStr(str) {
    // Function to split string
    var string = str.split(" ");

    return string;
  }

  for (const rr of params) {
    let cleanedAccountNumber = "";
    let req_tpye = "";
    let bank_to = "";

    if (rr.TransactionCategory == "รับโอนเงิน") {
      let stat = "ฝากเงิน";

      //   if (rr.statement.transType == "FTOT") {

      let text = rr.Description;
      // const parts = str.split("<br>");

      const start = text.indexOf("บัญชีต้นทาง : ");
      if (start !== -1) {
        const sub = text.substring(start);
        const end = sub.indexOf("<br>");

        cleanedAccountNumber = sub.substring(16, end);
      } else {
        console.log("ไม่พบข้อมูล");
      }

      let txn_types = md5(
        rr.Amount + rr.BookingDateTime + cleanedAccountNumber
      );

   let datasave = {
        description: txn_types,
        date_creat: moment(rr.BookingDateTime).format(),
        date_creat_qr: moment(rr.BookingDateTime).format("L"),
        time_creat: moment(rr.BookingDateTime).format("LT"),

        amount: rr.Amount,
        // name_to: rr.toAccountNameTh,
        accnum: cleanedAccountNumber,
        to_bank: rr.BankName,
        req_tpye: "BANKPAY",
        fron_bank: fron_bank.accountNumber,
        status_pay: 3,
        status: 1,
        remark: stat,
        bankAccount_id: fron_bank.id,
        type_status: stat,
        // req_tpye: req_tpye,
      };
      let datafull = await sreat(txn_types);

      //console.log(datafull)

      if (!datafull) {
        let saves = await Request_All.create(datasave);
        // notifition(datasave);
      }
    }
  }
}

module.exports = { Insert_datadep_krungsribizonline };
