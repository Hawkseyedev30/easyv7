var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  BankAccountGroup,
  Systemsettings,
  Transactions_limit
} = require("../../models");

const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const Apiscb_helper = require("../../helpers/login.helpers");
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];
//const date = require("date-and-time");
//const now = new Date();
var md5 = require("md5");
//const value = date.format(now, "HH:mm:ss");
const Notify = require("../../helpers/notify");
const lemit = require("../../controllers/bank_account/bank_account.controllers");
const moment = require("moment-timezone"); // Import moment-timezone
require("moment/locale/th");
const timezone = "Asia/Bangkok";








async function sreat(str) {
  let d = await Request_All.findOne({
    where: {
      description: str,
    },
  });
  return d;
}

async function updates_acc(params) {
  let upnew = User_account.update(
    {
      auth: params.auth,
    },
    {
      where: {
        id: params.id,
      },
    }
  );

  return upnew;
}

const loginauth = async function (req, res) {
  let body = req.body;

  if (!body.accountNo) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_accountNo_require",
        message: "กรุณากรอก accountNo ของคุณ....",
      },
      422
    );
  } else if (!body.pin) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_pin_require",
        message: "กรุณากรอก pin ของคุณ",
      },
      422
    );
  } else if (!body.deviceId) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_deviceId_require",
        message: "กรุณากรอก deviceId ของคุณ",
      },
      422
    );
  }

  let auth_info, err, user;

  [err, user] = await to(
    User_account.findOne({
      where: {
        accountNo: body.accountNo,
      },
    })
  );

  const payloads = await Apiscb_helper.payload(req.body.deviceId);

  // console.log(payloads);

  const verifyuserssss = await Apiscb_helper.verifyusers(
    req.body.deviceId,
    payloads.payload,
    payloads.tag,
    payloads.dtag,
    payloads.dsig
  );
  // console.log(verifyuserssss);
  //
  if (verifyuserssss.data.status.code === 1000) {
    const preAuths = await Apiscb_helper.preAuth(
      verifyuserssss.headers["api-auth"]
    );

    if (preAuths.data.status.statuscode == 0) {
      const pinEncrypts = await Apiscb_helper.pinEncrypt(
        preAuths.data.e2ee.pseudoSid,
        preAuths.data.e2ee.pseudoRandom,
        req.body.pin,
        preAuths.data.e2ee.pseudoOaepHashAlgo,
        preAuths.data.e2ee.pseudoPubKey
      );
      const fasteasylogins = await Apiscb_helper.fasteasylogin(
        req.body.deviceId,
        preAuths.data.e2ee.pseudoSid,
        pinEncrypts,
        verifyuserssss.headers["api-auth"]
      );

      let user_account_ids = {
        user_account_id: user.id,
      };
      let datas = fasteasylogins.data.data;
      datas = { ...datas, ...user_account_ids };
      //const createw = await Datauser.create(datas);
      let giup = await updates_acc({
        auth: fasteasylogins.headers["api-auth"],
        id: user.id,
      });

      return ReS(
        res,
        {
          static_key: "1000",
          message: "Success",
          auth: fasteasylogins.headers["api-auth"],
        },
        200
      );
    }
  } else if (verifyuserssss.data.status.code === 1036) {
  }
};

const get_balance = async function (req, res) {
  let body = req.body;

  let auth_info, err, user;

  [err, user] = await to(
    User_account.findOne({
      where: {
        accountNo: body.accountNo,
      },
    })
  );
  // const transferData = require("../../middleware/dist/index")

  if (!user) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_deviceId_require",
        message: {
          th: "กรุณากรอก deviceId ของคุณ",
          en: "Please input your deviceId.",
        },
      },
      422
    );
  }

  let getbalance = await Apiscb_helper.balance(user.accountNo, user.auth);

  console.log(getbalance.data);

  return ReS(
    res,
    {
      static_key: "api_response_auth_login_deviceId_require",
      message: {
        th: "Success",
        en: "Success",
      },
      data: getbalance.data,
    },
    200
  );
};
const create_account = async function (req, res) {
  let body = req.body;

  // console.log(body)

  if (!body.accountNo) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_accountNo_require",
        message: {
          th: "กรุณากรอก accountNo ของคุณ....",
          en: "Please input your accountNo.",
        },
      },
      422
    );
  } else if (!body.deviceId) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_deviceId_require",
        message: {
          th: "กรุณากรอก deviceId ของคุณ",
          en: "Please input your deviceId.",
        },
      },
      422
    );
  } else if (!body.pin) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_pin_require",
        message: {
          th: "กรุณากรอก pin ของคุณ",
          en: "Please input your pin.",
        },
      },
      422
    );
  }

  let auth_info, err, user;

  [err, user] = await to(
    User_account.findOne({
      where: {
        accountNo: body.accountNo,
      },
    })
  );
  if (user) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_accountNo_already_exists",
        message: {
          th: "มีเลขบัญชีนี้แล้วในระบบ",
          en: "This account number already exists in the system.",
        },
      },
      422
    );
  }

  let datachack = await Apiscb_helper.chackdevie_auth(body.deviceId);

  if (datachack.status.code == 1000) {
    let datasave = {
      name:
        datachack.data.titleTH +
        "" +
        datachack.data.nameTH +
        " " +
        datachack.data.lastNameTH,
      accountNo: body.accountNo,

      bank_id: 2,
      pin: body.pin,
      deviceId: body.deviceId,
      status: 1,
      totalAvailableBalance: "0.00",
      token: "",
    };

    let creates = await User_account.create(datasave);

    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: {
          th: "เพิ่มบัญชี ธนาคารสำเร็จ",
          en: "This account number already exists in the system.",
        },
      },
      200
    );
  } else {
  }

  //console.log(datasave);
};


 async function checkWithdrawalTransactions(data,bankAccount) {

  
    const transactions = data.data.txnList;

    // กรองเฉพาะรายการที่เป็นการถอนเงิน
    const withdrawals = transactions.filter(
      (txn) => txn.txnCode.description === "ถอนเงิน"
    );

    for (const element of withdrawals) {
      let ref = md5(
        element.txnRemark + element.txnDateTime + element.txnAmount
      );

      let datadaver = {
        ref: ref,
        txnBatchRunDate: element.txnBatchRunDate,
        txnSequence: element.txnSequence,
        sortSequence: element.sortSequence,
        txnDateTime: element.txnDateTime,
        txnAmount: element.txnAmount,
        txnCurrency: element.txnCurrency,
        txnDebitCreditFlag: element.txnDebitCreditFlag,
        txnRemark: element.txnRemark,
        annotation: null,
        txnChannel: element.txnChannel.code,
        txnCode: element.txnCode.description,
        accFrom: bankAccount.accountNumber,
        //  updated_at: 2025-01-07T05:58:54.738Z,
        //created_at: 2025-01-07T05:58:54.738Z
      };
      let datafull = await sreat(ref);
    //   console.log(datadaver)
      if (!datafull) {
        let saves = await Transactions_limit.create(datadaver);
        
        // notifition(datasave);
      }
      //  await Transactions_limit.create(datadaver);
    }

    // รวมจำนวนเงินที่ถอนได้ทั้งหมด
    const totalWithdrawalAmount = withdrawals.reduce(
      (total, txn) => total + txn.txnAmount,
      0
    );

     console.log(totalWithdrawalAmount)

    return {
      withdrawals,
      totalWithdrawalAmount,
    };
  }


async function Insert_datadep(params, fron_bank) {
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

  async function notifition(str) {
    let message = `แจ้งเตือน มียอดฝากเงินเข้ามาใหม่\nจำนวนเงิน : ${str.amount}\nเลขบัญชี : ${str.accnum}\nจาก : ${str.to_bank}\nประเภท : ${str.statsu}\nสถานะ : รอดำเนินการ\nระบบ : auto`;
    let notify = await Notify.sendTelegram(message);
  }

  function splitStr(str) {
    // Function to split string
    var string = str.split(" ");

    return string;
  }

  for (const rr of conRes(params.txnList)) {

    
    console.log(rr);
    // if (rr.txnCode.description == "ฝากเงิน") {
    //   let datatext1 = splitStr(rr.txnRemark);

    //   let number = "";
    //   let names = "";
    //   // console.log

    //   if (rr.txnChannel.code == "ENET") {
    //     console.log(rr);
    //     if (datatext1[1] == "SCB") {
    //       number = datatext1[2].replace(/x/g, "");
    //       names = `${datatext1[4]} ${datatext1[5]}`;
    //     } else {
    //       let number1 = datatext1[2].replace(/X/g, "");
    //       number = number1.replace("/", "");
    //     }
    //   }

    //   let dis = md5(rr.txnRemark + rr.txnDateTime + rr.txnAmount);
    //   let datasave = {
    //     description: dis,
    //     date_creat: moment(rr.txnDateTime).format(),
    //     date_creat_qr: moment(rr.txnDateTime).format("L"),
    //     time_creat: moment(rr.txnDateTime).format("LT"),
    //     amount: rr.txnAmount,
    //     name_to: names,
    //     accnum: number,
    //     to_bank: datatext1[1],
    //     status: rr.txnCode.description,
    //     fron_bank: fron_bank.accountNumber,
    //     status_pay: 1,
    //     status: 1,
    //     remark: rr.txnRemark,
    //     bankAccount_id: fron_bank.id,
    //     type_status: rr.txnCode.description,
    //   };
    //   // console.log(datasave)
    //   let datafull = await sreat(dis);
    //   // console.log(datafull)
    //   await notifition(datasave);

    //   if (!datafull) {
    //     let saves = await Request_All.create(datasave);
    //   }

    //   //  if()

    //   //  let saves = await Request_allscb.create(datasave);
    //   // console.log(datatext1[2].replace(/x/g, ''))
    //   // console.log(datafull)
    // } else if (rr.txnCode.description == "ถอนเงิน") {
    //   let dis = md5(rr.txnRemark + rr.txnDateTime + rr.txnAmount);
    //   let datasave = {
    //     description: dis,
    //     date_creat: moment(rr.txnDateTime).format(),
    //     date_creat_qr: moment(rr.txnDateTime).format("L"),
    //     time_creat: moment(rr.txnDateTime).format("LT"),
    //     amount: rr.txnAmount,

    //     bankAccount_id: fron_bank.id,
    //     status: rr.txnCode.description,
    //     fron_bank: fron_bank.accountNumber,
    //     status_pay: 1,
    //     status: 1,
    //     remark: rr.txnRemark,
    //     type_status: rr.txnCode.description,
    //   };
    //   // console.log(datasave)
    //   let datafull = await sreat(dis);
    //   // console.log(datafull)
    //   if (!datafull) {
    //     let saves = await Request_All.create(datasave);
    //     // notifition(datasave);
    //   }
    // }
  }
}

async function Insert_datadep_Kbiz(params, fron_bank) {
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

  // async function notifition(str) {
  //   let message = `แจ้งเตือน มียอดฝากเงินเข้ามาใหม่\nจำนวนเงิน : ${str.amount}\nเลขบัญชี : ${str.accnum}\nจาก : ${str.to_bank}\nประเภท : ${str.statsu}\nสถานะ : รอดำเนินการ\nระบบ : AUTO`;
  //   let notify = await Walllet.notify(message);
  // }

  function splitStr(str) {
    // Function to split string
    var string = str.split(" ");

    return string;
  }

  for (const rr of params) {
    let cleanedAccountNumber = "";
    let req_tpye = "";
    let bank_to = "";

    if (rr.statement.transNameTh == "รับโอนเงิน") {
      let stat = "ฝากเงิน";

      if (rr.statement.transType == "FTOT") {
        cleanedAccountNumber = Array.from(rr.statement.toAccountNumber)
          .filter((char) => char !== "x" && char !== "-")
          .join("");
        req_tpye = "BANKPAY";
        bank_to = "kbank";
      } else if (rr.statement.transType == "FTOB") {
        bank_to = rr.statement.bankNameEn;
        cleanedAccountNumber = rr.statement.toAccountNo;
        req_tpye = "BANKPAY";
      } else if (rr.statement.transType == "FTPP") {
        cleanedAccountNumber = Array.from(rr.statement.toAccountNo)
          .filter((char) => char !== "x" && char !== "-")
          .join("");

        bank_to = rr.statement.bankNameEn;
        req_tpye = "QRPAY";
      }

      //  let txn_types = md5(rr.statement.depositAmount + rr.statement.transDate+cleanedAccountNumber);

      let datasave = {
        description: rr.statement.origRqUid,
        date_creat: moment(rr.statement.transDate).format(),
        date_creat_qr: moment(rr.statement.transDate).format("L"),
        time_creat: moment(rr.statement.transDate).format("LT"),
        amount: rr.statement.depositAmount,
        name_to: rr.statement.toAccountNameTh,
        accnum: cleanedAccountNumber,

        to_bank: bank_to,
        status: stat,
        fron_bank: fron_bank.accountNumber,
        status_pay: 1,
        status: 1,
        remark: stat,
        bankAccount_id: fron_bank.id,
        type_status: stat,
        req_tpye: req_tpye,
      };
      //   //
      let datafull = await sreat(rr.statement.origRqUid);
      // console.log(datafull)
      if (!datafull) {
        let saves = await Request_All.create(datasave);
        // notifition(datasave);
      }

      //  console.log(datasave);
    }
    //   let datatext1 = splitStr(rr.txnRemark);
    //   // console.log(datatext1)
    //   let number = "";
    //   let names = "";

    //   if (datatext1[1] == "SCB") {
    //     number = datatext1[2].replace(/x/g, "");
    //     names = `${datatext1[4]} ${datatext1[5]}`;
    //   } else {
    //     let number1 = datatext1[2].replace(/X/g, "");
    //     number = number1.replace("/", "");
    //   }

    //let dis = md5(rr.txnRemark + rr.txnDateTime + rr.txnAmount);

    //   let datafull = await sreat(dis);
    //   // console.log(datafull)
    //   if (!datafull) {
    //     let saves = await Request_All.create(datasave);
    //     // notifition(datasave);
    //   }

    //   //  if()

    //   //  let saves = await Request_allscb.create(datasave);
    //   // console.log(datatext1[2].replace(/x/g, ''))
    //   // console.log(datafull)
    // } else if (rr.txnCode.description == "ถอนเงิน") {
    //   let dis = md5(rr.txnRemark + rr.txnDateTime + rr.txnAmount);
    //   let datasave = {
    //     description: dis,
    //     date_creat: moment(rr.txnDateTime).format(),
    //     date_creat_qr: moment(rr.txnDateTime).format("L"),
    //     time_creat: moment(rr.txnDateTime).format("LT"),
    //     amount: rr.txnAmount,

    //     bankAccount_id: fron_bank.id,
    //     status: rr.txnCode.description,
    //     fron_bank: fron_bank.accountNumber,
    //     status_pay: 1,
    //     status: 1,
    //     remark: rr.txnRemark,
    //     type_status: rr.txnCode.description,
    //   };
    //   // console.log(datasave)
    //   let datafull = await sreat(dis);
    //   // console.log(datafull)
    //   if (!datafull) {
    //     let saves = await Request_All.create(datasave);
    //     // notifition(datasave);
    //   }
    // }
  }
}
const chack_history = async function (req, res) {
  let err, user;

  let body = req.body;

  [err, user] = await to(
    BankAccount.findOne({
      where: {
        accountNumber: body.accountNo,
      },
    })
  );

  if (err) {
    return ReE(res, {
      message: "ERROR accountNumber_require ",
    });
  }

  const startDate = new Date(
    moment().add(-2, "days").startOf("day").format("YYYY-MM-DD")
  );
  const endDate = new Date(moment().endOf("day").format("YYYY-MM-DD"));
  let auth_info, users;

  if (!user) {
    return ReE(res, {
      message: "ERROR accountNumber_require ",
    });
  }

  let datapost = {
    startdate: startDate,
    accountNo: user.accountNumber,
    enddate: endDate,
    auth: user.auth,
  };

  if (user.channel == "scb-easy") {
    let datachack = await Apiscb_helper.history(datapost);

    if (datachack.data.status.code === "1002") {
      let datalogin = {
        deviceId: user.deviceId,
        pin: user.pin,
        id: user.id,
        accountNo: body.accountNo,
      };
      let gologin = await Apiscb_helper.Loginbank_auth(datalogin);

      [err, users] = await to(
        BankAccount.findOne({
          where: {
            accountNumber: body.accountNo,
          },
        })
      );
      let dataposts = {
        startdate: startDate,
        accountNo: users.accountNumber,
        enddate: endDate,
        auth: users.auth,
      };

      let datachack = await Apiscb_helper.history(dataposts);

      if (datachack.data.status.code === 1000) {
        let save = await Insert_datadep(datachack.data.data, users);

        return ReS(res, {
          data: {
            data: datachack.data,

            // auth: fasteasylogins.headers["api-auth"],
          },

          message: "SUCCESS FULL",
        });
      } else {
      }

      // console.log(datachack.data);

      // Insert_datadep
    } else if (datachack.data.status.code === 1011) {
      return ReE(res, {
        data: datachack.data,
        code: 1011,
        message: "ERROR",
      });
    } else if (datachack.data.status.code === 1000) {
      console.log(datachack);

      let save = await Insert_datadep(datachack.data.data, user);

      return ReS(res, {
        data: datachack.data,
        code: 1011,
        message: "SUCCESS",
      });
    } else {
      return ReS(res, {
        data: datachack.data,
        code: 1011,
        message: "SUCCESS",
      });
    }
  } else if (user.channel == "k-biz") {
    const Apiscb_Kbankz = require("../../kbank/dist/index");

    let chack = await Apiscb_Kbankz.Loginkbank_auth(user);

    let save = await Insert_datadep_Kbiz(chack, user);

    return ReS(res, {
      data: chack,
      code: 1011,
      message: "SUCCESS",
    });
  }
  return ReS(res, {
    //  data: datachack.data,
    code: 1011,
    message: "SUCCESS",
  });

  // console.log(datachack.data)
};

const chack_history_by = async function (data_req) {
  let body = data_req;

  [err, user] = await to(
    BankAccount.findOne({
      where: {
        accountNumber: body.accountNo,
      },
    })
  );

  if (err) {
    return 0;
  }

  const startDate = new Date(
    moment().add(-2, "days").startOf("day").format("YYYY-MM-DD")
  );
  const endDate = new Date(moment().endOf("day").format("YYYY-MM-DD"));
  let auth_info, users;

  if (!user) {
    return 0;
  }

  let datapost = {
    startdate: startDate,
    accountNo: user.accountNumber,
    enddate: endDate,
    auth: user.auth,
  };

  if (user.channel == "scb-easy") {
    let datachack = await Apiscb_helper.history(datapost);

    if (datachack.data.status.code === "1002") {
      let datalogin = {
        deviceId: user.deviceId,
        pin: user.pin,
        id: user.id,
        accountNo: body.accountNo,
      };
      let gologin = await Apiscb_helper.Loginbank_auth(datalogin);

      [err, users] = await to(
        BankAccount.findOne({
          where: {
            accountNumber: body.accountNo,
          },
        })
      );
      let dataposts = {
        startdate: startDate,
        accountNo: users.accountNumber,
        enddate: endDate,
        auth: users.auth,
      };

      let datachack = await Apiscb_helper.history(dataposts);

      if (datachack.data.status.code === 1000) {
        let save = await Insert_datadep(datachack.data.data, users);

        return 1;
      } else {
      }

      // console.log(datachack.data);

      // Insert_datadep
    } else if (datachack.data.status.code === 1011) {
      return 0;
    } else if (datachack.data.status.code === 1000) {
      // console.log(datachack.data);

      let save = await Insert_datadep(datachack.data.data, user);

      return 1;
    } else {
      return 1;
    }
  } else if (user.channel == "k-biz") {
    const Apiscb_Kbankz = require("../../kbank/dist/index");

    let chack = await Apiscb_Kbankz.Loginkbank_auth(user);
    //console.log(chack);

    let save = await Insert_datadep_Kbiz(chack, user);

    return 1;
  }
  return 1;

  // console.log(datachack.data)
};

async function chacklimitwit(data_req) {
  let err, user;

  let body = data_req;

  [err, user] = await to(
    BankAccount.findOne({
      where: {
        accountNumber: body.accountNo,
      },
    })
  );

  if (err) {
    return 0;
  }
  const startDate = new Date(
    moment().add(-2, "days").startOf("day").format("YYYY-MM-DD")
  );
  const endDate = new Date(moment().endOf("day").format("YYYY-MM-DD"));
  let auth_info, users;

  if (!user) {
    return 0;
  }

  let datapost = {
    startdate: startDate,
    accountNo: user.accountNumber,
    enddate: endDate,
    auth: user.auth,
  };

  if (user.channel == "scb-easy") {
    let datachack = await Apiscb_helper.chack_auth(user.auth);

 

    if (datachack.data.status.code === "1002") {
      let datalogin = {
        deviceId: user.deviceId,
        pin: user.pin,
        id: user.id,
        accountNo: body.accountNo,
      };
      let gologin = await Apiscb_helper.Loginbank_auth(datalogin);
      //console.log(gologin.data);

      [err, users] = await to(
        BankAccount.findOne({
          where: {
            accountNumber: body.accountNo,
          },
        })
      );
      let dataposts = {
        startdate: startDate,
        accountNo: users.accountNumber,
        enddate: endDate,
        auth: users.auth,
      };

      let datachack = await Apiscb_helper.history(dataposts);

      if (datachack.data.status.code === 1000) {
      //  console.log(datachack.data);
        //  let save = await Insert_datadep(datachack.data.data, users);

        return 1;
      } else {
      }

      // console.log(datachack.data);

      // Insert_datadep
    } else if (datachack.data.status.code === "1011") {
      return 0;
    } else if (datachack.data.status.code == "1000") {


      let datachacks = await Apiscb_helper.history(datapost);

     // console.log(datachacks.data);


      //  console.log(datachack.data);
       let save = await checkWithdrawalTransactions(datachacks.data,user);
       console.log(save);
      return save;
    } else {
      //let datachack = await Apiscb_helper.history(datapost);

    //  console.log(datapost);

      return 1;
    }
  }
  //

  //

  //     // console.log(datachack.data);

  //     // Insert_datadep
  //   } else if (datachack.data.status.code === 1011) {
  //     return 0;
  //   } else if (datachack.data.status.code === 1000) {
  //     // console.log(datachack.data);

  //     let save = await Insert_datadep(datachack.data.data, user);

  //     return 1;
  //   } else {
  //     return 1;
  //   }
  // } else if (user.channel == "k-biz") {
  //   const Apiscb_Kbankz = require("../../kbank/dist/index");

  //   let chack = await Apiscb_Kbankz.Loginkbank_auth(user);
  //   //console.log(chack);

  //   let save = await Insert_datadep_Kbiz(chack, user);

  //   return 1;
  // }
  // return 1;
}

const chack_historywit_by = async function (req, res) {
  let bankAccounts, err;

  [err, bankAccounts] = await to(
    BankAccountGroup.findOne({
      include: [
        {
          model: BankAccount,
          as: "bankAccounts",
          include: [
            {
              model: Systemsettings,
              as: "setting", // Use the correct alias from your model definition
              attributes: {
                include: [],
                exclude: ["deleted_at", "created_at", "updated_at"],
              },
            },
          ],
          where: {
            accountType: "withdrawal",
          },

          required: true,
        },
      ],
      where: {
        isActive: 1,
      },
      // order: [["id", "ASC"]],
    })
  );

  if (bankAccounts) {
    const datachacklogin = [];
    for (const element of bankAccounts.bankAccounts) {
      if (element.channel == "scb-easy") {
        let datapost = {
          accountNo: element.accountNumber,
          auth: element.auth,
        };
        //   console.log(datapost);
        let gosace = await lemit.getSCBEasyBalance(element);

        datachacklogin.push(gosace);
       // return gosace
      }
    }
   
  }
 
  
  return ReS(res, {
    //data: datachacklogin[0],
    message: "success",
  });

};

const chk_limits = async function (req, res) {
  let body = req.body;
  let auth_info, err, user;

  [err, user] = await to(
    User_account.findOne({
      where: {
        accountNo: body.accountNo,
      },
    })
  );
  //console.log(user)
  let datachack = await Apiscb_helper.chk_limit(user.auth);

  if (datachack.data.status.code === 1000) {
    return ReS(res, {
      data: datachack.data,
      message: "SUCCESS",
    });
  } else {
    return ReE(res, {
      data: datachack.data,
      message: "ERROR",
    });
  }

  //console.log(datachack.data)
};

const PostLoginbank_auths = async function (req, res) {
  let datalogin = {
    deviceId: req.body.deviceId,
    pin: req.body.pin,
    //id: user.id,
    //accountNo: req.body.accountNo,
  };

  let chack_auth = await Apiscb_helper.PostLoginbank_auth(datalogin);

  return ReS(res, {
    data: chack_auth.data,
    message: "ERROR",
  });
};

const chack_auths = async function (req, res) {
  let chack_auth = await Apiscb_helper.chack_auth(req.body.auth);

  return ReS(res, {
    data: chack_auth.data,
    message: "ERROR",
  });
};

const get_balance_post = async function (req, res) {
  let body = req.body;
  let getbalance = await Apiscb_helper.balance(body.accountNo, body.auth);

  console.log(getbalance.data);

  return ReS(
    res,
    {
      static_key: "api_response_auth_login_deviceId_require",
      message: {
        th: "Success",
        en: "Success",
      },
      data: getbalance.data,
    },
    200
  );
};
module.exports = {
  loginauth,
  create_account,
  get_balance,
  chack_history,
  chk_limits,
  chack_auths,
  chack_history_by,
  PostLoginbank_auths,
  get_balance_post,
  chack_historywit_by,
};
