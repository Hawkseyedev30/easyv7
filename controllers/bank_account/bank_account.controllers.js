var {
  Admin,
  Activity_system,
  Bank,
  BankAccount,
  Request_All,
  BankAccountGroup,
  Transactions_limit,
  Transaction_withdraw,
  Systemsettings,
  Gatway_setting,
  Botlog_limittime,
  Api_logs_banks,
} = require("../../models");

const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const Notify = require("../../helpers/notify");
const config = require("../../config/app.json")[app["env"]];
const fs = require("fs");
const scbeasy = require("../scb/classscb");
const Apiurlscb = require("../../helpers/apiurl_scb");
const Api_callback = require("./api");
const Api_ckrungsri = require("./krungsribizonlineBalance");
const io = require("socket.io-client");
var socket = io.connect(config["BASE_URL"], { reconnect: true });
const ApiKruthai_helper = require("../../helpers/Apikrunthai");
const Apiscbbiz_helper = require("../../helpers/scb_buisnet");
const Apikrunthai_businessy = require("../../helpers/Apikrunthai_businessy");



var md5 = require("md5");
const Scbapi = new scbeasy();
var moment = require("moment");
require("moment/locale/th");
const Apipaynoex = require("../../apis/PayoneX");
const Apiscb_helper = require("../../helpers/login.helpers");
const ApiGateway_helper = require("../../helpers/gateway_w");



const urlendpoint = require("../../config/app.json")[app["env"]];


const getAllBankAccounts = async function (req, res) {
  let err, bankAccounts;

  [err, bankAccounts] = await to(
    BankAccountGroup.findAll({
      include: [
        {
          model: BankAccount,
          as: "bankAccounts",
          include: [
            {
              as: "bank",
              model: Bank,
              attributes: {
                include: [],
                exclude: ["deleted_at", "created_at", "updated_at"],
              },
              required: true,
              // where: { to_user_id: user_id, request_status: "Requested" },
            },
            {
              model: Request_All,
              as: "Request_Alls", // Use the correct alias from your model definition
              attributes: {
                include: [],
                exclude: ["deleted_at", "created_at", "updated_at"],
              },
              order: [["id", "DESC"]],
              limit: 10,
            },
            {
              model: Api_logs_banks,
              as: "logs_banks", // Use the correct alias from your model definition
              // attributes: {
              //   include: [],
              //   exclude: ["deleted_at", "created_at", "updated_at"],
              // },
              order: [["id", "DESC"]],
              limit: 10,
            },
            {
              model: Botlog_limittime,
              as: "Botlog_limittimes", // Use the correct alias from your model definition
              // attributes: {
              //   include: [],
              //   exclude: ["deleted_at", "created_at", "updated_at"],
              // },
              order: [["id", "DESC"]],
              limit: 10,
            },
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
            status_bank: {
              [Op.in]: [
                "Active",
                "Inactive",
                "Pending",
                "Banned",
                "Delete",

                "Full_credit_limit",
                "Vault",
              ],
            },
            merchantId:req.user.merchantId
          },
          attributes: {
            exclude: ["deviceId", "pin"],
          },
          order: [["level_Bank", "ASC"]],
          // required: true,
        },
      ],
    })
  );

  //console.log(bankAccounts)

  return ReS(res, {
    data: bankAccounts,
    code: 1000,
    message: "success",
  });
};





async function loginbababalancekrungthai(params) {


  

  const axios = require('axios');
  let data = JSON.stringify({
    "accessToken": params.auth
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: urlendpoint["API_KRUNGTHAI_BUS"] + '/api/app/v3/krungthai_business/summary',
    headers: {
      'apiToken': '7c31fe0a-60cf-4877-98c2-c34d75bb6875',
      'Content-Type': 'application/json'
    },
    data: data
  };
  const autths = await axios.request(config);




  if (autths.data.success == true) {
    await BankAccount.update(
      {
        //  balance: balanceSummary.totalAvailableBalance,
        balance: autths.data.data.totalLedgerBalance,
      },
      {
        where: {
          id: params.id,
        },
      }
    );

  }

  return autths

  //return await axios.request(config);
}


async function balancekrungthai(params) {

  const axios = require('axios');
  let data = JSON.stringify({
    "devicesid": params.deviceId,
    "password": params.password,
    "Device_Model": params.Device_Model,
    "Device_Version": params.Device_Version,
    "Device_Platform": params.Device_Platform,
    "pin": params.pin
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: urlendpoint["API_KRUNGTHAI_BUS"] + '/api/app/v3/krungthai_business/login_auth',
    headers: {
      'apiToken': '7c31fe0a-60cf-4877-98c2-c34d75bb6875',
      'Content-Type': 'application/json'
    },
    data: data
  };

  const autths = await axios.request(config);
  await BankAccount.update(
    {
      //  balance: balanceSummary.totalAvailableBalance,
      auth: autths.data.data.access_token,
    },
    {
      where: {
        id: params.id,
      },
    }
  );
  return autths



}

const getalluser = async function (req, res) {
  let auth_info, err, user;

  [err, user] = await to(
    BankAccount.findAll({
      include: [
        {
          as: "bank",
          model: Bank,
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
          // where: { to_user_id: user_id, request_status: "Requested" },
        },
        {
          model: Request_All,
          as: "Request_Alls", // Use the correct alias from your model definition
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          order: [["id", "DESC"]],
          limit: 10,
        },
      ],
      attributes: {
        include: [],
        exclude: ["deviceId", "pin"],
      },
      where: {
        //accountType:"deposit"
      },
      order: [["id", "ASC"]],
      //limit: 3,
    })
  );

  //console.log(user)

  return ReS(res, {
    data: user,
    code: 1000,
    message: "success",
  });
};

const getAllBank_deposit = async function (req, res) {
  let auth_info, err, user;

  [err, user] = await to(
    BankAccount.findAll({
      include: [
        {
          as: "bank",
          model: Bank,
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
          // where: { to_user_id: user_id, request_status: "Requested" },
        },
        {
          model: Request_All,
          as: "Request_Alls", // Use the correct alias from your model definition
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          order: [["id", "DESC"]],
          limit: 10,
        },
      ],
      attributes: {
        include: [],
        exclude: ["deviceId", "pin"],
      },
      where: {
        accountType: "deposit",
        status_bank: "Active",
      },
      order: [["id", "ASC"]],
      //limit: 3,
    })
  );

  //console.log(user)

  return ReS(res, {
    data: user,
    code: 1000,
    message: "success",
  });
};

const create_BankAccount = async function (req, res) {
  let body = req.body;

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
  } else if (!body.pin) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_pin_require",
        message: {
          th: "กรุณากรอก pin ของคุณ....",
          en: "Please input your pin.",
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
          th: "กรุณากรอก deviceId ของคุณ....",
          en: "Please input your deviceId.",
        },
      },
      422
    );
  }

  let auth_info, err, Banks, user;
  [err, Banks] = await to(
    Bank.findOne({
      where: {
        bank_id: req.body.bank,
      },
    })
  );

  [err, user] = await to(
    BankAccount.findOne({
      where: {
        accountNumber: body.accountNo,
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

  // console.log(datachack);
  if (datachack.status.code == "1006") {
  }

  if (datachack.status.code == 1000) {
    let datasave = {
      bankId: 4,
      name:
        randomString(10) +
        datachack.data.titleTH +
        "" +
        datachack.data.nameTH +
        " " +
        datachack.data.lastNameTH,
      prefix: randomString(15),
      accountNumber: body.accountNo,
      accountName:
        datachack.data.titleTH +
        "" +
        datachack.data.nameTH +
        " " +
        datachack.data.lastNameTH,
      telephoneNumber: body.accountNo,
      isActive: false,
      sameBankLimit: 0,
      otherBankLimit: 0,
      balance: 0,
      accountType: "deposit",
      status_bank: body.status_bank || "Active",
      totalWithdrawalTxns: 0,
      totalWithdrawalVolume: 0,
      merchantId: body.merchantId,
      bankId: Banks.id,
      pin: body.pin,
      deviceId: body.deviceId,
      bankAccountGroupId: body.bankAccountGroupId,
      status_promptpay_qr: body.status_promptpay_qr || 0,

    };

    let creates = await BankAccount.create(datasave);

    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: {
          th: "เพิ่มบัญชีธนาคารสำเร็จ",
          en: "This account number already exists in the system.",
        },
      },
      200
    );
  } else {
    return ReE(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: {
          th: "เกิดข้อผิดพลาด กรุณาทำรายการใหม่อีกครั้ง",
          en: "An error occurred. Please try again.",
        },
      },
      200
    );
  }
};

function randomString(len, charSet) {
  charSet = charSet || "0123456789";
  var randomString = "";
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

const create_BankAccountApiscb_Kbankz = async function (req, res) {
  //



try {

 





  // let chack = await Apiscb_Kbankz.transferData()

  // console.log(chack)

  let body = req.body;







 

  if (!body.accountNo) {
    return ReE(res, {
      static_key: "api_response_auth_login_accountNo_require",
      message: {
        th: "กรุณากรอก accountNo ของคุณ....",
        en: "Please input your accountNo.",
      },
    });
  } else if (!body.pin) {
    return ReE(res, {
      static_key: "api_response_auth_login_pin_require",
      message: {
        th: "กรุณากรอก pin ของคุณ....",
        en: "Please input your pin.",
      },
    });
  } else if (!body.deviceId) {
    return ReE(res, {
      static_key: "api_response_auth_login_deviceId_require",
      message: {
        th: "กรุณากรอก deviceId ของคุณ....",
        en: "Please input your deviceId.",
      },
    });
  } else if (!body.accountType) {
    return ReE(res, {
      static_key: "api_response_auth_login_deviceId_require",
      message: {
        th: "กรุณากรอก accountType ของคุณ....",
        en: "Please input your accountType.",
      },
    });
  }else if (!body.channel) {
    return ReE(res, {
      static_key: "api_response_auth_login_channel_require",
      message: {
        th: "กรุณากรอก channel ของคุณ....",
        en: "Please input your channel.",
      },
    });
  }
  



  let auth_info, err, Banks, user;
  [err, Banks] = await to(
    Bank.findOne({
      where: {
        bank_id: req.body.bank,
      },
    })
  );

  [err, user] = await to(
    BankAccount.findOne({
      where: {
        accountNumber: body.accountNo,
        accountType: body.accountType,
        merchantId: req.user.merchantId,
      },
    })
  );
  if (user) {
    // const Apiscb_Kbankz = require("../../kbank/dist/index");

    // let chack = await Apiscb_Kbankz.Loginkbank_auth(user);

    //console.log(chack);

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


  let datasave = ""


 if(body.channel == "ktb-business"){



  datasave = {
    name: body.accountName,
    prefix: randomString(15),
    accountNumber: body.accountNo,
    accountName: body.accountName,
    telephoneNumber: body.telephoneNumber,
    isActive: false,
    sameBankLimit: 0,
    otherBankLimit: 0,
    balance: 0,
    accountType: body.accountType,
    totalWithdrawalTxns: 0,
    totalWithdrawalVolume: 0,
    merchantId: req.user.merchantId,
    bankId: Banks.id,
    pin: body.pin,
    litmit_status: 1,
    deviceId: body.deviceId,
    status_bank: body.status_bank || "Active",
    bankAccountGroupId: body.bankAccountGroupId,
    channel: body.channel,
    type_Deposit: "BANK_APP",
    status_promptpay_qr: body.status_promptpay_qr || 0,
  };

  



  }



  let creates = await BankAccount.create(datasave);

  if (!creates) {
    await Activity_system.create({
      types: "addBankAccount",
      description: `${moment().locale("th").format("lll")} ${req.user.username
        } พยายามเพิ่มบัญชีธนาคาร ${req.body.bank}, ${body.accountName}, ${body.accountNo
        }, ประเภทบัญชี${body.accountType == "deposit"
          ? "ฝากเงิน"
          : body.accountType == "withdrawal"
            ? "ถอนเงิน"
            : body.accountType
        } แต่ไม่สำเร็จ`,
      IP: req.user.IP || "",
      status: 0,
      note: "บันทึกข้อมูลไม่สำเร็จ",
      token: req.user.auth_token,
      username: req.user.username,
    });
  }
  if (creates) {
    await Activity_system.create({
      types: "addBankAccount",
      description: `${moment().locale("th").format("lll")} ${req.user.username
        } เพิ่มบัญชีธนาคาร ${req.body.bank}, ${body.accountName}, ${body.accountNo
        }, ประเภทบัญชี${body.accountType == "deposit"
          ? "ฝากเงิน"
          : body.accountType == "withdrawal"
            ? "ถอนเงิน"
            : body.accountType
        }`,
      IP: req.user.IP || "",
      status: 1,
      note: "",
      token: req.user.auth_token,
      username: req.user.username,
    });
  }
  // let chackSystemsettings = await Systemsettings.findOne({
  //   where: {
  //     bankAccountId: body.edit_id,
  //   },
  // });

  let errs, call;
  [errs, submitEdit] = await to(Api_callback.submitEditTransaction(creates));

  if (errs) {
    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: {
          th: errs || "เกิดข้อผิดพลาด กรุณาทำรายการใหม่อีกครั้ง",
          en: "This account number already exists in the system.",
        },
      },
      200
    );
  }
  // let call = await Api_callback.submitEditTransaction(creates);

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





  } catch (err) {


    console.log(err)

     return ReE(
    res,
    {
      // static_key: "api_response_auth_login_accountNo_already_exists",
      message:"เพิ่มบัญชี ธนาคารไม่ สำเร็จ"
    },
    200
  );

  }



};

const getall_bankinfo = async function (req, res) {
  let auth_info, err, Banks, user;
  [err, Banks] = await to(Bank.findAll({
    where : {
      sts:1
    }
  }));

  return ReS(
    res,
    {
      // static_key: "api_response_auth_login_accountNo_already_exists",
      message: "success",
      data: Banks,
    },
    200
  );
};

const update_BankAccount = async function (req, res) {
  let body = req.body;
  let activityData = {};

  let chack = await BankAccount.findOne({
    attributes: {
      include: [],
      exclude: ["deviceId", "pin"],
    },
    where: {
      id: body.edit_id,
    },
  });
  if (chack.accountType == "deposit") {
    if (body.status_bank == "Active") {
      await Botlog_limittime.destroy({
        where: {
          bot_isActive: 1,
        },
      });
    }
  }

  //console.log(chack)

  let auth_info, err, Banks, user;

  [err, Banks] = await to(
    BankAccount.update(body, {
      where: { id: body.edit_id },
    })
  );

  if (Banks) {
    if (body.types == "onSwitch") {
      (activityData.types = body.types),
        (activityData.description = `${moment().locale("th").format("lll")}  ${req.user.username
          } ${body.description} บัญชี ${body.data.bank.bank_id}, ${body.data.name
          }, ${body.data.accountNumber}`),
        (activityData.IP = req.user.IP || "000.00.0.0"),
        (activityData.status = 1),
        (activityData.note = body.note || "");
      activityData.token = req.user.auth_token;
      activityData.username = req.user.username;
    }
    if (body.types == "update_status_bank") {
      (activityData.types = body.types),
        (activityData.description = `${moment().locale("th").format("lll")} ${req.user.username
          } ${body.description} (${body.note == "Captcha"
            ? "ติดแคปช่า หรือ ยืนยันตัวตน"
            : body.note == "Face_Scan"
              ? "ติดสแกนหน้า"
              : body?.note
          })`),
        (activityData.IP = req.user.IP || "000.00.0.0"),
        (activityData.status = 1),
        (activityData.note =
          body.note == "Captcha"
            ? "ติดแคปช่า หรือ ยืนยันตัวตน"
            : body.note == "Face_Scan"
              ? "ติดสแกนหน้า"
              : body?.note);
      activityData.token = req.user.auth_token;
      activityData.username = req.user.username;
    }
    if (body.types == "Delete") {
      (activityData.types = body.types),
        (activityData.description = `${moment().locale("th").format("lll")} ${req.user.username
          } ${body.description}`),
        (activityData.IP = req.user.IP || "000.00.0.0"),
        (activityData.status = 1),
        (activityData.note = body.note || "");
      activityData.token = req.user.auth_token;
      activityData.username = req.user.username;
    }
    if (body.types == "Switch_bank_type") {
      (activityData.types = body.types),
        (activityData.description = `${moment().locale("th").format("lll")} ${req.user.username
          } ${body.description}`),
        (activityData.IP = req.user.IP || "000.00.0.0"),
        (activityData.status = 1),
        (activityData.note = body.note || "");
      activityData.token = req.user.auth_token;
      activityData.username = req.user.username;
    }
    await Activity_system.create(activityData);
    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: "success",
        //data:Banks
      },
      200
    );
  } else {
    if (body.types == "onSwitch") {
      (activityData.types = body.types),
        (activityData.description = `${moment().locale("th").format("lll")}  ${req.user.username
          } ${body.description} พยายาม เปิด/ปิด บัญชี ${body.data.bank.bank_id
          }, ${body.data.name}, ${body.data.accountNumber} แต่ไม่สำเร็จ`),
        (activityData.IP = req.user.IP || "000.00.0.0"),
        (activityData.status = 0),
        (activityData.note = body.note || "");
      (activityData.username = req.user.username),
        (activityData.token = req.user.auth_token);
    }
    if (body.types == "update_status_bank") {
      (activityData.types = body.types),
        (activityData.description = `${moment().locale("th").format("lll")}  ${req.user.username
          } พยายาม ${body.description} (${body.note == "Captcha"
            ? "ติดแคปช่า หรือ ยืนยันตัวตน"
            : body.note == "Face_Scan"
              ? "ติดสแกนหน้า"
              : body?.note
          }) แต่ไม่สำเร็จ`),
        (activityData.IP = req.user.IP || "000.00.0.0"),
        (activityData.status = 0),
        (activityData.note = body.note || "");
      activityData.token = req.user.auth_token;
      activityData.username = req.user.username;
    }
    if (body.types == "Delete") {
      (activityData.types = body.types),
        (activityData.description = `${moment().locale("th").format("lll")} ${req.user.username
          } พยายาม ${body.description} แต่ไม่สำเร็จ`),
        (activityData.IP = req.user.IP || "000.00.0.0"),
        (activityData.status = 0),
        (activityData.note = body.note || "");
      activityData.token = req.user.auth_token;
      activityData.username = req.user.username;
    }
    if (body.types == "Switch_bank_type") {
      (activityData.types = body.types),
        (activityData.description = `${moment().locale("th").format("lll")} ${req.user.username
          } พยายาม ${body.description} แต่ไม่สำเร็จ`),
        (activityData.IP = req.user.IP || "000.00.0.0"),
        (activityData.status = 0),
        (activityData.note = body.note || "");
      activityData.token = req.user.auth_token;
      activityData.username = req.user.username;
    }
    await Activity_system.create(activityData);
    return ReE(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: "!!ล้มเหลวในการบันทึกข้อมูล กรุณาทำรายการใหม่อีกครั้ง",
        //data:Banks
      },
    );
  }
};

const postIsActiveBank = async function (req, res) {
  let body = req.body;

  let auth_info, err, Banks, user;
  [err, Banks] = await to(
    BankAccount.update(body, {
      where: { id: body.edit_id },
    })
  );

  if (Banks) {
    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: "success",
        //data:Banks
      },
      200
    );
  } else {
    return ReE(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: "success",
        //data:Banks
      },
      200
    );
  }
};

const processBankDeposits = async function (req, res) {
  let err, bankAccounts;

  [err, bankAccounts] = await to(
    BankAccountGroup.findAll({
      include: [
        {
          model: BankAccount,
          as: "bankAccounts",
          include: [
            {
              as: "bank",
              model: Bank,
              attributes: {
                include: [],
                exclude: ["deleted_at", "created_at", "updated_at"],
              },
              required: true,
            },

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
            accountType: {
              [Op.in]: ["withdrawal", "deposit"],
            },
            // status_promptpay_qr: 0,
            // status_bank: "Active",
          },
          attributes: {
            exclude: ["deviceId", "pin", "auth"],
          },
          required: true,
        },
        // {
        //   model: BankAccount,
        //   as: "Deposit",
        //   include: [
        //     {
        //       as: "bank",
        //       model: Bank,
        //       attributes: {
        //         include: [],
        //         exclude: ["deleted_at", "created_at", "updated_at"],
        //       },
        //       required: true,
        //     },
        //     {
        //       model: Systemsettings,
        //       as: "setting", // Use the correct alias from your model definition
        //       attributes: {
        //         include: [],
        //         exclude: ["deleted_at", "created_at", "updated_at"],
        //       },
        //     },
        //   ],
        //   where: {
        //     accountType: {
        //       [Op.in]: ["deposit"],
        //     },
        //     //  status_promptpay_qr: 0,
        //     status_bank: "Active",
        //   },
        //   attributes: {
        //     exclude: ["deviceId", "pin", "auth", "channel"],
        //   },
        //   required: true,
        // },
      ],

      where: {
        isActive: true,
      },
      // order: [["id", "ASC"]],
    })
  );

  //console.log(bankAccounts)

  return ReS(res, {
    data: bankAccounts,
    code: 1000,
    message: "success",
  });
};

const getbank_info = async function (req, res) {
  let auth_info, err, Banks, user;
  [err, Banks] = await to(Bank.findAll({}));

  return ReS(
    res,
    {
      // static_key: "api_response_auth_login_accountNo_already_exists",
      message: "success",
      data: Banks,
    },
    200
  );
};

const get_balance_summery2 = async function (req, res) {
  // let body = req.body;
  // let auth_info, err, Banks, user;
  // [err, Banks] = await to(
  //   BankAccount.findOne({
  //     where: { id: body.id },
  //   })
  // );
  // if (Banks.channel == "k-biz") {
  //   const Apiscb_Kbankz = require("../../kbank/dist/index");
  //   let chack = await Apiscb_Kbankz.Loginkbank_auth(Banks);
  // } else if (Banks.channel == "scb-easy") {
  //      // ถ้าเจอเงือนไข Banks.channel == "scb-easy"
  //      // -สิ่งที่อยากให้ทำคือ  สร้างฟังชั่นอีกหน้า  เพื่อที่จะส่งข้อมูล Banks scb-easy  ไปเช็คยอดคงเหลือ
  //   //console.log(Banks)
  // }
};

//ส่งค่าเข้าไป อัพเดทข้อมูล ในฟังชั่น checkSCBEasyBalance  ฟิว bank.sameBankLimit คือ ยอดที่จำกัดต่อวัน totalWithdrawalAmounts คือ ยอดที่โอนไปแล้วในวันนี้
// async function checkSCBEasyBalance(params, bank,totalWithdrawalAmounts) {
//   if (params.data.status.code === 1000) {
//     let datasave = {
//       balance: params.data.totalAvailableBalance,
//       isActive: true,
//       otherBankLimit:totalWithdrawalAmounts-bank.sameBankLimit
//       //auth:"",
//     };

//     await BankAccount.update(datasave, {
//       where: {
//         id: bank.id,
//       },
//     });
//   }

//   return true;
// }
// async function sendTelegram(params) {
//   const TelegramBot = require("node-telegram-bot-api");

//   const token = "7539160765:AAGBfzMk92oTZm3ULIPgjxCKa1uLflSqSgg";

//   // สร้าง instance ของ TelegramBot
//   const bot = new TelegramBot(token, { polling: false });

//   // ฟังก์ชั่นส่งการแจ้งเตือนไปยัง Telegram
//   async function sendTelegramNotification(chatId, message) {
//     try {
//       // ใช้ method sendMessage ของ TelegramBot เพื่อส่งข้อความ
//       await bot.sendMessage(chatId, message);
//       console.log("Telegram notification sent successfully.");
//     } catch (error) {
//       console.error("Error sending Telegram notification:", error);
//     }
//   }

//   // ตัวอย่างการใช้งาน
//   const chatId = "6249044726"; // แทนที่ด้วย Chat ID ของคุณ หรือ Group Chat ID
//   // const message = params;

//   sendTelegramNotification(chatId, params);
// }
async function checkRemainingLimit(
  remainingLimit,
  threshold,
  totalWithdrawalAmounts,
  limtdely,
  accountNumber
) {
  let msg = `
<b>⚠️ แจ้งเตือน : วงเงินใกล้หมด ⚠️</b>
<pre><code style="background-color: #FFC107; color: black; padding: 10px; border-radius: 5px;">
<b>บัญชี:</b> ${accountNumber}
<b>ยอดที่ทำรายการได้ขณะนี้ :</b> ${parseFloat(remainingLimit).toFixed(2)} บาท
<b>ยอดเงินที่ตั้งค่าการแจ้งเตือน:</b> ${parseFloat(threshold).toFixed(2)} บาท
</code></pre>
<i><b>หมายเหตุ:</b> ยอดคงเหลือใกล้ถึงวงเงินที่กำหนด กรุณาตรวจสอบและเปลี่ยนบัญชีหากจำเป็น </i>
<i><b>เปลี่ยนบัญชีที่นี่:</b><a href="https://backend.payment-backend88.com/#/bank-management/bank-accounts">คลิกเข้าสู่หลังบ้าน</a></i>

`;

  let datanoti = {
    msg: msg,
    tpye: "worning",
    type_option: "limit",
    data: {
      accountNumber: accountNumber,
      remainingLimit: parseFloat(remainingLimit).toFixed(2),
      threshold: parseFloat(threshold).toFixed(2),
      nodere:
        "ยอดคงเหลือใกล้ถึงวงเงินที่กำหนด กรุณาตรวจสอบและเปลี่ยนบัญชีหากจำเป็น",
    },
  };

  await Notify.sendTelegram(datanoti);
}
async function checkSCBEasyBalance(params, bank, totalWithdrawalAmounts, auth) {
  //ถ้าเหลือน้อยน้อยกว่า ยอดก่อนวงเงินเต็ม
  const settting = 2000;

  // console.log(params);
  // console.log(totalWithdrawalAmounts);

  if (params.status.code === 1000) {
    // คำนวณ ยอดคงเหลือที่สามารถโอนได้ในวันนี้
    let remainingLimit = bank.otherBankLimit - totalWithdrawalAmounts;
    //console.log(remainingLimit);

    //   await BankAccount.update(
    //   { isActive: true },
    //   { where: { id: activeId } }
    // );

    //    Full_credit_limit

    let datasave = {
      balance: params.totalAvailableBalance,

      isActive: true,
      limit_Left: remainingLimit,
      auth: auth,
    };

    await BankAccount.update(datasave, {
      where: {
        id: bank.id,
      },
    });
    if (remainingLimit < settting) {
      let remainingLimits = await checkRemainingLimit(
        remainingLimit,
        settting,
        totalWithdrawalAmounts,
        bank.sameBankLimit,
        bank.accountNumber // ส่งเลขบัญชีเข้าไปด้วย
      );
    }

    // sendTelegram
  }

  return true;
}

// async function checkSCBEasyBalance(params, bank,totalWithdrawalAmounts) {
//   if (params.data.status.code === 1000) {
//     let datasave = {
//       balance: params.data.totalAvailableBalance,
//       isActive: true,
//       otherBankLimit:totalWithdrawalAmounts-bank.sameBankLimit
//       //auth:"",
//     };

//     await BankAccount.update(datasave, {
//       where: {
//         id: bank.id,
//       },
//     });
//   }

//   return true;
// }

//สรร้างฟังชั่น Nodejs เช็คว่า เวลาตอนนี้ เลยเที่ยงคืนหรือยัง  ถ้าเลยแล้ว จะสร้างคำสั่ง ให้อัพเดท ถอนเงินใหม่ ของวันใหม่

const getKBankBalance = async (bankAccount) => {
  const Apiscb_Kbankz = require("../../kbank/dist/index");
  let chack = await Apiscb_Kbankz.Loginkbank_auth(bankAccount);


  return chack
  // ... process the 'chack' result and return the balance summary
};

const getSCBEasyBalance = async (bankAccount) => {
  let chack_auth = await Apiscb_helper.chack_auth(bankAccount.auth);

  // console.log(chack_auth.data);

  if (chack_auth.data.status.code === "1002") {
    let datalogin = {
      deviceId: bankAccount.deviceId,
      pin: bankAccount.pin,
      id: bankAccount.id,
      accountNo: bankAccount.accountNumber,
    };

    let gologin = await Apiscb_helper.Loginbank_auth(datalogin);

    if (gologin.data.data.status.code == 1000) {
      bankAccount.auth = gologin.data.auth;
    }
  }

  let dataauth_v2 = await Apiurlscb.summary(
    bankAccount.auth,
    bankAccount.accountNumber
  );


  return dataauth_v2

  // ... process the 'balance' result and return the balance summary
};

const get_balance_summery = async function (req, res) {


  let body = req.body;
  let err, Banks;
  [err, Banks] = await to(
    BankAccount.findOne({
      where: { id: body.id },
    })
  );

  if (!Banks) {
    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: "success",
        // data: user,
      },
      200
    );
  }
  //console.log(Banks)

  let balanceSummary;
  //console.log(Banks);



  if (Banks.channel == "k-biz") {
    balanceSummary = await getKBankBalance(Banks);
  } else if (Banks.channel == "scb-easy") {


    balanceSummary = await getSCBEasyBalance(Banks);


    const startDate1 = moment(new Date()).startOf("day").format("YYYY-MM-DD HH:mm")
    const endDate1 = moment(new Date()).endOf("day").format("YYYY-MM-DD HH:mm");
    let sumalls = await Transaction_withdraw.findAll({
      where: {
        senderAccountId: Banks.id,
        created_at: {
          [Op.between]: [startDate1, endDate1],
        },
      },
    });
    const totalWithdrawalAmounts = sumalls.reduce(
      (total, txn) => total + parseFloat(txn.amount),
      0
    );

    let totalLlimit = Banks.otherBankLimit - totalWithdrawalAmounts
    await BankAccount.update(
      {
        balance: balanceSummary.totalAvailableBalance,
        limit_Left: totalLlimit,
      },
      {
        where: {
          id: Banks.id,
        },
      }
    );





  } else if (Banks.channel == "krungsribizonline") {
    balanceSummary = await Api_ckrungsri.krungsribizonlineBalance(Banks);
  } else if (Banks.channel == "PayoneX") {
    let data_Gatway_setting = await Gatway_setting.findOne({
      where: {
        name: "PayoneX",
      },
    });

    let ataitem_post = {
      accessKey: data_Gatway_setting.accessKey,
      secretKey: data_Gatway_setting.secretKey,
    };

    let chackauth = await Apipaynoex.authenticate(ataitem_post);

    var axios = require("axios");

    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.payonex.asia/profile/balance",
      headers: {
        Accept: "application/json",
        Authorization: chackauth.data.data.token,
      },
    };
    let datachackplay = await axios(config);

    // console.log(datachackplay)

    if (datachackplay.data.success == true) {
      await BankAccount.update(
        {
          balance: datachackplay.data.data.balance,
        },
        {
          where: {
            id: Banks.id,
          },
        }
      );
      return ReS(
        res,
        {
          // static_key: "api_response_auth_login_accountNo_already_exists",
          message: "success",
          // data: user,
        },
        200
      );
    }


    // Handle unknown bank channels
  } else if (Banks.channel == "KTB_NEX") {

    balanceSummary = await getdata_trankrungthai(Banks);

    // console.log(balanceSummary);
  } else if (Banks.channel == "scb-business") {



    let chack_authv1 = await Apiscbbiz_helper.ckack_authscb(Banks.auth);

    //console.log(chack_authv1);

    if (chack_authv1.data.success == false) {
      let datapost = {
        deviceId: Banks.deviceId,
        pin: Banks.pin,
      };

      let chack_auth = await Apiscbbiz_helper.login_scbkrungthai(datapost);
      console.log(chack_auth.data);

      Banks.auth = chack_auth.data.data.sessionId;

      if (chack_auth.data.success == true) {
        let upnew = BankAccount.update(
          {
            // auth: params.auth,
            //  isActive: 1,

            auth: chack_auth.data.data.sessionId,
          },
          {
            where: {
              id: Banks.id,
            },
          }
        );
      }
    }


    let chack_balance = await Apiscbbiz_helper.get_balance_summery(Banks.auth);


    if (chack_balance.data.success == true) {


      const startDate1 = moment(new Date()).startOf("day").format("YYYY-MM-DD HH:mm")
      const endDate1 = moment(new Date()).endOf("day").format("YYYY-MM-DD HH:mm");
      let sumalls = await Transaction_withdraw.findAll({
        where: {
          senderAccountId: Banks.id,
          created_at: {
            [Op.between]: [startDate1, endDate1],
          },
        },
      });
      const totalWithdrawalAmounts = sumalls.reduce(
        (total, txn) => total + parseFloat(txn.amount),
        0
      );

      let totalLlimit = Banks.otherBankLimit - totalWithdrawalAmounts
      await BankAccount.update(
        {
          balance: chack_balance.data.data.totalAvailableBalance,
          limit_Left: totalLlimit,
        },
        {
          where: {
            id: Banks.id,
          },
        }
      );


    }



  } else if (Banks.channel == "Wealth") {



    const balanceSummarys = await ApiGateway_helper.get_balance_gateWay(Banks);


    //console.log(balanceSummarys.data.data.data.balance)


    const startDate1 = moment(new Date()).startOf("day").format("YYYY-MM-DD HH:mm")
    const endDate1 = moment(new Date()).endOf("day").format("YYYY-MM-DD HH:mm");
    let sumalls = await Transaction_withdraw.findAll({
      where: {
        senderAccountId: Banks.id,
        created_at: {
          [Op.between]: [startDate1, endDate1],
        },
      },
    });
    const totalWithdrawalAmounts = sumalls.reduce(
      (total, txn) => total + parseFloat(txn.amount),
      0
    );

    let totalLlimit = Banks.otherBankLimit - totalWithdrawalAmounts
    await BankAccount.update(
      {
        balance: balanceSummarys.data.data.data.balance,
        limit_Left: totalLlimit,
      },
      {
        where: {
          id: Banks.id,
        },
      }
    );

    //

    // console.log(balanceSummary);
  } else if (Banks.channel == "ktb-business") {
    // balanceSummary = await getKBankBalance(Banks);
    // let baba = await balancekrungthai(Banks);


    let baba = await Apikrunthai_businessy.getbalance(Banks,Banks.auth)


    if(!baba.staust == true || baba.data == 500) {

      baba = await Apikrunthai_businessy.authenticateBankData(Banks)

    // chack_baba = await Apikrunthai_businessy.getbalance(Banks,Banks.auth)
    }



  //  console.log(chack_baba)
     

   // let baba = await Apikrunthai_businessy.authenticateBankData(Banks)


 //console.log(baba)

    const startDate1 = moment(new Date()).startOf("day").format("YYYY-MM-DD HH:mm")
    const endDate1 = moment(new Date()).endOf("day").format("YYYY-MM-DD HH:mm");
    let sumalls = await Transaction_withdraw.findAll({
      where: {
        senderAccountId: Banks.id,
        created_at: {
          [Op.between]: [startDate1, endDate1],
        },
      },
    });
    const totalWithdrawalAmounts = sumalls.reduce(
      (total, txn) => total + parseFloat(txn.amount),
      0
    );

    let totalLlimit = Banks.otherBankLimit - totalWithdrawalAmounts
    await BankAccount.update(
      {
        balance: baba.data.totalLedgerBalance,
        limit_Left: totalLlimit,
      },
      {
        where: {
          id: Banks.id,
        },
      }
    );
    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: "success",
        balance: baba.data.totalLedgerBalance,
      },
      200
    );

  } else {
    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: "success",
        // data: user,
      },
      200
    );
  }
  socket.emit("ready_to_search", "success");

  return ReS(
    res,
    {
      message: "success",
      data: balanceSummary, // Return the actual balance summary
    },
    200
  );
};
const delete_bank_account = async function (req, res) {
  let body = req.body;

  await BankAccount.update(
    { deletedAt: moment().format() },
    {
      where: {
        id: body.id,
      },
    }
  );
  return ReS(
    res,
    {
      // static_key: "api_response_auth_login_accountNo_already_exists",
      message: "success",
      // data: user,
    },
    200
  );
};
async function gettranDecode(accountData) {
  const bankTable = await Bank.findAll({});

  accountData.transactions = accountData.transactions.map((transaction) => {
    transaction.datetimes = transaction.dateTime;

    if (
      transaction.cmt &&
      transaction.cmt.match(/^(\d{3})-(\d+)$/) &&
      transaction.type === "เงินโอนเข้า"
    ) {
      const bankCode = transaction.cmt.substring(0, 3);
      const accountNumber = transaction.cmt.substring(4);

      const bankInfo = bankTable.find((bank) => bank.scb_code === bankCode);

      if (bankInfo) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");

        // แยกส่วนเวลาจาก transaction.dateTime
        const timeParts = transaction.dateTime.split(" ")[2];
        const timeWithoutSuffix = timeParts.substring(0, 5);

        const formattedDateTimeRe = `${year}-${month}-${day} ${timeWithoutSuffix}:00`;

        return {
          type: transaction.type,
          accountNumber: accountNumber,
          bankcmt: bankInfo.bank_id,
          dateTime: transaction.dateTime,
          datetimes: transaction.datetimes,
          dateTimere: formattedDateTimeRe,
          cmt: `${bankInfo.bank_name}-${accountNumber}`,
          balance: transaction.balance,
          transSeqNo: transaction.transSeqNo,
          isNegativeBalance: transaction.isNegativeBalance,
        };
      }
    }
    return transaction;
  });

  return accountData;
}
async function getdata_trankrungthai(params) {
  // let datainfo = JSON.stringify(params.settings);
  // let datainfos = JSON.parse(datainfo, null, 4);

  let accountData = await ApiKruthai_helper.getkrungthai_datainfobank(params);

  console.log(accountData);
  await BankAccount.update(
    {
      balance: accountData.availableBalance,
    },
    {
      where: {
        id: params.id,
      },
    }
  );
  // console.log(accountData.availableBalance)
  // let tran = await gettranDecode(accountData);

  // let bankup = await BankAccount.update(
  //   { balance: tran.availableBalance },
  //   {
  //     where: {
  //       id: params.id,
  //     },
  //   }
  // );

  // // accountData.transactions.forEach(transaction => {
  // //   transaction.balance = parseFloat(parseFloat(transaction.balance).toFixed(2));
  // // });
  // let accountDataInsert_datadep_krungthai =
  //   await ApiKruthai_helper.Insert_datadep_krungthai(tran, params);

  //console.log(accountDataInsert_datadep_krungthai);
  return accountData.availableBalance;
  // console.log(accountDataInsert_datadep_krungthai);
}

// Import the helper at the top if not already done
// const ApiKruthai_helper = require("../../helpers/Apikrunthai");
// const { Server_api } = require("../../models"); // Make sure Server_api is imported

// ... other controller functions ...

/**
 * Controller function to fetch more Krungthai transactions.
 */
const getMoreKrungthaiData = async function (req, res) {
  const { bankAccountId, lastSeq } = req.body; // Get data from request body

  if (!bankAccountId || !lastSeq) {
    return ReE(res, { message: "Missing bankAccountId or lastSeq" }, 400);
  }

  let err, bankAccount, moreData;

  // Find the bank account data (you might already have this logic elsewhere)
  [err, bankAccount] = await to(
    BankAccount.findOne({
      where: { id: bankAccountId },
      include: [
        // Include necessary associations if needed by the helper
        { model: Server_api, as: "serverApi" }, // Assuming 'serverApi' is the alias
      ],
    })
  );

  if (err || !bankAccount) {
    return ReE(
      res,
      { message: "Bank account not found or error fetching it." },
      404
    );
  }

  // Call the helper function to get more transactions
  [err, moreData] = await to(
    ApiKruthai_helper.getMoreKrungthaiTransactions(bankAccount, lastSeq)
  );

  if (err) {
    console.error("Error fetching more Krungthai transactions:", err);
    return ReE(
      res,
      { message: err.message || "Failed to fetch more transactions." },
      500
    );
  }

  if (!moreData) {
    return ReE(res, { message: "No more data received from API." }, 500);
  }

  // --- Important: Extract the *new* lastSeq from the response ---
  // The API response structure might vary. Assuming it returns an object like:
  // { transactions: [...], hasViewMore: boolean, lastSeq: "newLastSeqValue" }
  // Or you might need to get it from the last item in the transactions array.
  let newLastSeq = null;
  if (moreData.transactions && moreData.transactions.length > 0) {
    // Option 1: If the API response includes a 'lastSeq' field directly
    // newLastSeq = moreData.lastSeq;

    // Option 2: Get it from the last transaction in the returned array
    newLastSeq =
      moreData.transactions[moreData.transactions.length - 1].transSeqNo;
  } else {
    // If no new transactions, keep the old lastSeq or handle as appropriate
    newLastSeq = lastSeq;
    moreData.hasViewMore = false; // No more transactions means no more viewing
  }
  // --- End: Extract new lastSeq ---

  // Send the relevant data back to the frontend
  return ReS(
    res,
    {
      transactions: moreData.transactions || [],
      hasViewMore: moreData.hasViewMore || false,
      lastSeq: newLastSeq, // Send the *new* last sequence number
    },
    200
  );
};

// Add this new function to the module exports at the bottom
// module.exports = {
//   // ... other exports ...
//   getMoreKrungthaiData, // Add the new function here
//   get_balance_summery, // Make sure this is exported if getdata_trankrungthai is called within it
//   // ...
// };

const history_bank_account = async function (req, res) {
  let body = req.body;

  let databack = await BankAccount.findOne({
    where: {
      id: body.id,
    },
  });

  let chack_auth = await Apiscb_helper.chack_auth(databack.auth);

  //
  if (chack_auth.data.status.code === "1002") {
    let datalogin = {
      deviceId: databack.deviceId,
      pin: databack.pin,
      id: databack.id,
      accountNo: databack.accountNumber,
    };
    let gologin = await Apiscb_helper.Loginbank_auth(datalogin);
    if (gologin.message == "Success") {
      databack.auth = gologin.auth;
    }
  }
  const startDate = new Date(moment().startOf("day").format("YYYY-MM-DD"));
  const endDate = new Date(moment().endOf("day").format("YYYY-MM-DD"));

  let data_limit = {};

  let getgitstrory = await Scbapi.transactions(
    databack.accountNumber,
    startDate.endDate,
    databack.auth
  );

  console.log(getgitstrory.data);

  return ReS(
    res,
    {
      // static_key: "api_response_auth_login_accountNo_already_exists",
      message: "success",
      data: databack,
    },
    200
  );
};
const upBankAccountGroup = async function (req, res) {
  let body = req.body;

  async function ensureSingleActive(activeId) {
    try {
      //  Find all BankAccountGroups and set isActive to false
      await BankAccountGroup.update({ isActive: false }, { where: {} });

      //  Find the specific BankAccountGroup by activeId and set isActive to true
      await BankAccountGroup.update(
        { isActive: true },
        { where: { id: activeId } }
      );

      return { msg: "Successfully updated isActive for BankAccountGroup." };
    } catch (error) {
      return { msg: "Error updating isActive for BankAccountGroup" };
      // console.error('Error updating isActive for BankAccountGroup:', error);
    }
  }

  let max = await ensureSingleActive(body.id);

  return ReS(
    res,
    {
      // static_key: "api_response_auth_login_accountNo_already_exists",
      message: max,
      //data: max,
    },
    200
  );
};
const getAllbank_accountgatway = async function (req, res) {
  let auth_info, err, user;

  [err, user] = await to(
    BankAccount.findAll({
      include: [
        {
          as: "bank",
          model: Bank,
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
          // where: { to_user_id: user_id, request_status: "Requested" },
        },
      ],

      where: {
        accountType: "deposit",
        status_bank: "Active",
      },
      order: [["id", "ASC"]],
      //limit: 3,
    })
  );

  //console.log(user)

  return ReS(res, {
    data: user,
    code: 1000,
    message: "success",
  });
};

async function chackbank_grob_update(params) {
  let datare = await BankAccount.findAll({
    include: [
      {
        as: "bank",
        model: Bank,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
        required: true,
      },
    ],

    required: true,

    where: {
      accountType: {
        [Op.in]: ["deposit"],
      },

      status_bank: "Active",
    },
    // order: [["id", "ASC"]],
  });

  return datare;
}

async function ensureSingleActivedeposit(activeId) {
  try {
    let chack = await chackbank_grob_update(activeId);

    for (const data_element of chack) {
      let dadasave = {
        merchantId: data_element.merchantId,
        bankAccountGroupId: activeId.bankgrobid,
        pin: data_element.pin,
        auth: data_element.auth,
        deviceId: data_element.deviceId,
        bankId: data_element.bankId,
        name: data_element.name,
        prefix: data_element.prefix,
        accountNumber: data_element.accountNumber,
        accountName: data_element.accountName,
        telephoneNumber: data_element.telephoneNumber,
        isActive: data_element.isActive,
        sameBankLimit: data_element.sameBankLimit,
        otherBankLimit: data_element.otherBankLimit,
        balance: data_element.balance,
        accountType: data_element.accountType,
        latestPollingStatus: data_element.latestPollingStatus,
        settings: data_element.settings,
        run_from: data_element.run_from,
        channel: data_element.channel,
        type_Deposit: data_element.type_Deposit,
        litmit_status: data_element.litmit_status,
        limit_Left: data_element.limit_Left,
        status_bank: data_element.status_bank,
        status_promptpay_qr: data_element.status_promptpay_qr,
        created_at: data_element.created_at,
        updated_at: data_element.updated_at,
        bank: data_element.bank.id,
      };

      let chack2 = await BankAccount.findOne({
        where: {
          accountNumber: data_element.accountNumber,

          bankAccountGroupId: activeId.bankgrobid,
        },
      });

      if (!chack2) {
        let save = await BankAccount.create(dadasave);

        console.log(save);
      } else {
        console.log("555");
      }
    }

    // for (const element of chack.Deposit) {

    //   console.log(element)

    // }

    return chack;
  } catch (error) {
    return { msg: "Error updating isActive for BankAccountGroup" };
    // console.error('Error updating isActive for BankAccountGroup:', error);
  }
}
const upBankAccountGroup_deposit = async function (req, res) {
  let body = req.body;

  if (!body.bankId) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "กรุณากรอก bankId ของคุณ....",
      },
      422
    );
  }

  try {
    let chackbankmy = await BankAccount.findOne({
      where: {
        id: body.bankId,
        accountType: "deposit",
        status_bank: "Active",
      },
    });

    if (!chackbankmy) {
      return ReE(
        res,
        {
          message:
            "เกิดข้อผิดพลาดในการปรับ level_Bank กรุณาเปิดใช้งาน บัญชีนี้ก่อน แล้วทำรายการเข้ามาใหม่ ",
        },
        200
      );
    }

    // อัพเดท level_Bank ของ bankId ที่ส่งเข้ามาเป็น 1
    await BankAccount.update(
      { level_Bank: 1 },
      {
        where: { id: body.bankId },
      }
    );

    // ดึงข้อมูล BankAccount อื่นๆ ที่มีสถานะ Active
    let chackbank = await BankAccount.findAll({
      where: {
        accountType: "deposit",
        status_bank: "Active",
        //  level_Bank: { [Sequelize.Op.ne]: 1 }, // เพิ่มเงื่อนไข level_Bank ไม่เท่ากับ 1
      },
    });

    if (chackbank && chackbank.length > 0) {
      let level = 2; // เริ่มต้น level ที่ 2
      for (const element of chackbank) {
        if (element.id != body.bankId) {
          // ตรวจสอบว่าไม่ใช่ bankId ที่ส่งเข้ามา
          await BankAccount.update(
            { level_Bank: level },
            {
              where: { id: element.id },
            }
          );
          level++;
        }
      }

      return ReS(
        res,
        {
          message: `ปรับ level_Bank เป็น 1 สำเร็จสำหรับ bankId: ${body.id}`,
        },
        200
      );
    } else {
      return ReE(
        res,
        {
          message:
            "เกิดข้อผิดพลาดในการปรับ level_Bank กรุณาเปิดใช้งาน บัญชีนี้ก่อน แล้วทำรายการเข้ามาใหม่",
        },
        200
      );
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัพเดท level_Bank:", error);
    return ReE(
      res,
      {
        message: "เกิดข้อผิดพลาดในการปรับ level_Bank",
      },
      500
    );
  }
};
const upBankAccountGroup_withdrawal = async function (req, res) {
  let body = req.body;

  if (!body.bankId) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "กรุณากรอก bankId ของคุณ....",
      },
      422
    );
  }

  try {
    let chackbankmy = await BankAccount.findOne({
      where: {
        id: body.bankId,
        accountType: "withdrawal",
        status_bank: "Active",
      },
    });

    if (!chackbankmy) {
      return ReE(
        res,
        {
          message:
            "เกิดข้อผิดพลาดในการปรับ level_Bank กรุณาเปิดใช้งาน บัญชีนี้ก่อน แล้วทำรายการเข้ามาใหม่ ",
        },
        200
      );
    }

    // อัพเดท level_Bank ของ bankId ที่ส่งเข้ามาเป็น 1
    await BankAccount.update(
      { level_Bank: 1 },
      {
        where: { id: body.bankId },
      }
    );

    // ดึงข้อมูล BankAccount อื่นๆ ที่มีสถานะ Active
    let chackbank = await BankAccount.findAll({
      where: {
        accountType: "withdrawal",
        status_bank: "Active",
        //  level_Bank: { [Sequelize.Op.ne]: 1 }, // เพิ่มเงื่อนไข level_Bank ไม่เท่ากับ 1
      },
    });

    if (chackbank && chackbank.length > 0) {
      let level = 2; // เริ่มต้น level ที่ 2
      for (const element of chackbank) {
        if (element.id != body.bankId) {
          // ตรวจสอบว่าไม่ใช่ bankId ที่ส่งเข้ามา
          await BankAccount.update(
            { level_Bank: level },
            {
              where: { id: element.id },
            }
          );
          level++;
        }
      }

      return ReS(
        res,
        {
          message: `ปรับ level_Bank เป็น 1 สำเร็จสำหรับ bankId: ${body.id}`,
        },
        200
      );
    } else {
      return ReE(
        res,
        {
          message:
            "เกิดข้อผิดพลาดในการปรับ level_Bank กรุณาเปิดใช้งาน บัญชีนี้ก่อน แล้วทำรายการเข้ามาใหม่",
        },
        200
      );
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัพเดท level_Bank:", error);
    return ReE(
      res,
      {
        message: "เกิดข้อผิดพลาดในการปรับ level_Bank",
      },
      500
    );
  }
};

module.exports = {
  getalluser,
  create_BankAccount,
  create_BankAccountApiscb_Kbankz,
  getall_bankinfo,
  update_BankAccount,
  postIsActiveBank,
  processBankDeposits,
  getbank_info,
  getAllBankAccounts,
  upBankAccountGroup,
  get_balance_summery,
  get_balance_summery2,
  delete_bank_account,
  history_bank_account,
  getAllBank_deposit,
  getAllbank_accountgatway,
  upBankAccountGroup_deposit,
  upBankAccountGroup_withdrawal,
  getSCBEasyBalance,
  getMoreKrungthaiData,
};
