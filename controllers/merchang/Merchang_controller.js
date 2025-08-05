var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  BankAccount_swet,
  Merchant,
  Bank,
  Member,
  TransactionsV2,
  Systemsettings,
  Req_qrcode,
  Customers,
  Gatway_setting,
  Admin
  , TransactionFeeSetting
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const Apiscb_helper = require("../../helpers/login.helpers");
const Apigatway_helper = require("../../helpers/Api_Center");
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const bcrypt_p = require("bcrypt-promise");

const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];
//const date = require("date-and-time");
const Apipaynoex = require("../../apis/PayoneX");
const scbeasy = require("../scb/classgendevice");
const Apikbank = require("../../kbank/dist/index");
const scbeasys = require("../scb/classscb");
const scb = new scbeasy();
const scbs = new scbeasys();
const Jimp = require("jimp");
const jsQr = require("jsqr");
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
const multer = require("multer");
var md5 = require("md5");
const generatePayload = require("promptpay-qr");
const qrcode = require("qrcode");
const urlendpoint = "https://apidev.payment-backend88.com";

const Apiscbbiz_helper = require("../../helpers/scb_buisnet");
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");

function generateUuid() {
  return uuidv4();
}

var moment = require("moment");
require("moment/locale/th");
async function updates_acc(params) {
  let upnew = await User_account.update(
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

async function gettoken_playonex_v2() {
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

  return chackauth.data.data.token;
}

async function gettrankbank(params, bank) {
  let Loginkbank_auths = await Apikbank.inquiryFundTransferAccount(
    bank,
    params
  );

  return Loginkbank_auths;
}

async function gettrankbankScb(params) {
  const axios = require("axios");
  let data = JSON.stringify(params);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.payonex.asia/banks/get-name",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: await gettoken_playonex_v2(),
    },
    data: data,
  };

  const response = await axios.request(config);

  return response;
}

async function createcus(items) {
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

  const create_customer = await Apipaynoex.create_customers(
    items,
    chackauth.data.data.token
  );

  if (create_customer.data.success == true) {
    // สร้างก้อน object ให้ตรงกับ fields ในตาราง Customers
    let newCustomerData = {
      customer_uuid: create_customer.data.data.customerUuid,
      partner: create_customer.data.data.partner,
      client_code: create_customer.data.data.clientCode,
      name: create_customer.data.data.name,
      search_name: create_customer.data.data.searchName[0], // ตรวจสอบว่าเป็น Array หรือไม่
      account_no: create_customer.data.data.accountNo,
      bank_code: create_customer.data.data.bankCode,
      status: create_customer.data.data.status,
    };

    // บันทึกลงตาราง Customers
    let create = await Customers.create(newCustomerData);

    // ส่ง response สำเร็จ (ถ้าต้องการ)
    return create;
  }

  // console.log(create_customer)
}

const create_customersget = async function (chack_customer) {
  try {
    // const chack_customer = await Apibackend.getAllmembersgatway();

    // วนลูปตรวจสอบข้อมูลลูกค้าแต่ละรายการ
    const existingCustomer = await Customers.findOne({
      where: {
        account_no: chack_customer.bankAccountNumber, // ตรวจสอบชื่อบัญชี
      },
    });
    console.log(existingCustomer);
    if (!existingCustomer) {
      // ถ้ายังไม่มีลูกค้าชื่อนี้ในตาราง
      // สร้าง req.body สำหรับ create_customers

      let datapost = {
        name: chack_customer.bankAccountName,
        bankCode:
          chack_customer.banks.bank_id == "kkp"
            ? "KK"
            : chack_customer.banks.bank_id.toUpperCase(), // ดึง bankCode จากข้อมูลลูกค้า
        accountNo: chack_customer.bankAccountNumber, // ดึง accountNo จากข้อมูลลูกค้า
      };

      let gopost = await createcus(datapost);
    } else {
      /// console.log(customer);
    }
    return false;

    // ส่ง response สำเร็จ (หรือ response อื่นๆ ตามต้องการ)
  } catch (error) {
    console.error("Error processing customers:", error);
    return true;
  }
};

//let bank =

const verifying_accounts = async function (req, res) {
  let body = req.body;

  //console.log(body)
  if (!body.accountNo) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "กรุณากรอก accountNo ของคุณ....",
      },
      422
    );
  } else if (!body.bank_id) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_password_require",
        message: "กรุณากรอก bank_id ของคุณ",
      },
      422
    );
  }

  let cHak_memss = await Customers.findOne({
    where: {
      account_no: req.body.accountNo,

      merchantId: req.user.id,
    },
  });

  if (cHak_memss) {
    return ReE(res, {
      data: cHak_memss,
      code: 400,
      message: "มีเลขบัญชีนี้แล้วในระบบ",
    });
  }

  let auth_info, err, users, Banks, user, transferData;

  [err, user] = await to(
    BankAccount.findOne({
      where: {
        status_bank: "Active",
        //   channel: "scb-business",
        accountType: "verifying_account",
      },
      order: [["updated_at", "ASC"]],
    })
  );

  [err, Banks] = await to(
    Bank.findOne({
      where: {
        bank_id: req.body.bank_id,
      },
    })
  );
  //console.log(user)
  //console.log(Banks)
  if (!user) {
    return ReE(res, {
      data: "ไม่สามารถ สมัครใช้งานได้ในขณะนี้",
      code: 400,
      message: "error ",
    });
  }

  if (user.channel == "k-biz") {
    let datapostlogin = {
      accountNo: req.body.accountNo,
      bank: Banks.scb_code,
      bankCode: Banks.scb_code,
      bankAbv: Banks.bank_id,
    };

    let transferDatas = await gettrankbank(datapostlogin, user);



    // console.log(req.user)

    let chackmem = await Customers.findOne({
      include: [
        {
          as: "banks",
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
        account_no: req.body.accountNo,
        merchantId: req.user.id,
      },
    });

    if (chackmem) {
      return ReE(res, {
        data: chackmem,
        code: 102,
        message: "Error มี ชื่อสมาชิกนี้เคยสมัครมาแล้ว",
      });
    }
    let chackmemv2 = await Customers.findOne({
      include: [
        {
          as: "banks",
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
        name: transferDatas.beneficiaryNameTh,
        merchantId: req.user.id,
      },
    });

    if (chackmemv2) {
      return ReE(res, {
        data: chackmemv2,
        code: 102,
        message: "Error มี ชื่อสมาชิกนี้เคยสมัครมาแล้ว",
      });
    }

    const uuid = generateUuid();
    let data_Report = {
      customer_uuid: uuid,
      partner: req.user.name,
      account_no: req.body.accountNo,
      name: transferDatas.beneficiaryNameTh,
      bankId: Banks.id,
      bank_code: Banks.bank_id,
      merchantId: req.user.id,
      status: "PENDING",


    };

    // console.log(data_Report);
    let save_mem = await Customers.create(data_Report);

    let chackmems = await Customers.findOne({
      include: [
        {
          as: "banks",
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
        customer_uuid: data_Report.customer_uuid,
        //  merchantId: req.user.id,
      },
    });

    // //  console.log(chackmems);

    return ReS(res, {
      data: chackmems,
      code: 1000,
      message: "success",
    });
  } else if (user.channel == "scb-business") {
    let chackmem = await Customers.findOne({
      include: [
        {
          as: "banks",
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
        account_no: req.body.accountNo,
        merchantId: req.user.id,
      },
    });

    if (chackmem) {
      return ReE(res, {
        data: chackmem,
        code: 102,
        message: "Error มี ชื่อสมาชิกนี้เคยสมัครมาแล้ว",
      });
    }

    let chack_authv1 = await Apiscbbiz_helper.ckack_authscb(user.auth);

    //console.log(chack_authv1);

    if (chack_authv1.data.success == false) {
      let datapost = {
        deviceId: user.deviceId,
        pin: user.pin,
      };

      let chack_auth = await Apiscbbiz_helper.login_scbkrungthai(datapost);
      //  console.log(chack_auth.data);

      user.auth = chack_auth.data.data.sessionId;

      if (chack_auth.data.success == true) {
        let upnew = BankAccount.update(
          {
            // auth: params.auth,
            //  isActive: 1,

            auth: chack_auth.data.data.sessionId,
          },
          {
            where: {
              id: user.id,
            },
          }
        );
      }
    }

    let datapostckack = {
      sessionId: user.auth,
      accountNumber: req.body.accountNo,
      bankCode: Banks.scb_code,
    };

    let chack_verrify = await Apiscbbiz_helper.verrifyscb(datapostckack);

    if (chack_verrify.data.data.validationResult == "PASSED") {
      const data_uuid = chack_verrify.data.data;

      let bankname_th = "";
      let bankname_en = "";

      if (Banks.scb_code == "014") {
        bankname_th = data_uuid.accountName;
      } else {
        bankname_th = data_uuid.accountDisplayName;
        bankname_en = data_uuid.accountName;
      }

      // console.log(data_uuid)
      let chackmem = await Customers.findOne({
        include: [
          {
            as: "banks",
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
          name: data_uuid.accountName,
          merchantId: req.user.id,
        },
      });

      if (chackmem) {
        return ReE(res, {
          data: chackmem,
          code: 102,
          message: "Error มี ชื่อสมาชิกนี้เคยสมัครมาแล้ว",
        });
      }

      console.log(data_uuid);

      const uuid = generateUuid();
      let datareport = {
        customer_uuid: uuid,
        partner: req.user.name,
        account_no: data_uuid.accountNumber,
        name: bankname_th,
        bankId: Banks.id,
        bank_code: Banks.bank_id,
        merchantId: req.user.id,
        status: "PENDING",
        // bankId:Banks.id,
      };

      let savemem = await Customers.create(datareport);

      let chackmems = await Customers.findOne({
        include: [
          {
            as: "banks",
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
          customer_uuid: datareport.customer_uuid,
          merchantId: req.user.id,
        },
      });

      // //  console.log(chackmems);

      return ReS(res, {
        data: chackmems,
        code: 1000,
        message: "success",
      });
    } else if (
      chack_verrify.data.data.validationResult == "BLOCK_NOT_FOUND_ACCT" ||
      chack_verrify.data.data.validationResult == "NOT_FOUND_ACCOUNT"
    ) {
      return ReE(
        res,
        {
          message: chack_verrify.data.data.validationResultDescription,
        },
        200
      );
    }
  }
};

const api_callback_true = async function (req, res) {
  let body = req.body.message;

  if (!body) {
    return res.render("/view/index.ejs");
  }

  var decoded = jwt_decode(body);

  if (members) {
    return ReS(res, { msg: datade });
  }
};
async function createpasshes(pw) {
  let salt, hash;
  [err, salt] = await to(bcrypt_p.genSalt(10));
  if (err) TE(err.message, true);

  [err, hash] = await to(bcrypt_p.hash(pw, salt));
  if (err) TE(err.message, true);

  let pwhash = hash;

  return pwhash;
}
const create_merchant_v1 = async function (req, res) {
  let body = req.body;

  if (!body.name) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_accountNo_require",
        message: "กรุณากรอก name ของคุณ....",
      },
      422
    );
  } else if (!body.deposit_minlimit) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_pin_require",
        message: "กรุณากรอก deposit_minlimit ของคุณ",
      },
      422
    );
  } else if (!body.withdrawalLimit) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_pin_require",
        message: "กรุณากรอก withdrawalLimit ของคุณ",
      },
      422
    );
  } else if (!body.withdrawalCallbackUrl) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_pin_require",
        message: "กรุณากรอก withdrawalCallbackUrl ของคุณ",
      },
      422
    );
  } else if (!body.depositCallbackUrl) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_deviceId_require",
        message: "กรุณากรอก depositCallbackUrl ของคุณ",
      },
      422
    );
  }

  let chack = await Merchant.findOne({
    where: {
      name: body.name,
    },
  });

  if (chack) {
    return ReE(
      res,
      {
        // static_key: "api_response_auth_login_deviceId_require",
        message: "Merchant นี้มีแล้วในระบบ",
      },
      422
    );
  }

  const uuid = generateUuid();
  let token;
  const datapost = {
    name: body.name,
    token_auth: "",
    isActive: 1,
    urlendpoint: "",
    withdrawalCallbackUrl: body.withdrawalCallbackUrl,
    depositCallbackUrl: body.depositCallbackUrl,
    withdrawalLimit: body.withdrawalLimit,
    withdrawStrategy: body.withdrawStrategy,
    maximumWithdrawTxsPerBankAccount: body.maximumWithdrawTxsPerBankAccount,
    maximumWithdrawVolumePerBankAccount:
      body.maximumWithdrawVolumePerBankAccount,

    prefix: uuid,
  };



  let createm = await Merchant.create(datapost);

  let genUser = randomString(6);
  let genPass = randomString(10);
  let pass = await createpasshes(genPass);



  let created = await Admin.create({
    username: createm.name + genUser,
    name: createm.name + genUser, //body?.username,
    password: pass, //body?.password,
    admin_type: "admin",
    merchantId: createm.id,
    role: "Owner",
    roleID: "",
    Active_merchantId: createm.id
    // IP: body?.IP,
  })




  let create_TransactionFeeSetting = await TransactionFeeSetting.create({
    depositFeePercentage: 0,
    withdrawalFeePercentage: 0,
    isActive: body.isActive,
    merchantId: createm.id
    // IP: body?.IP,
  })




  token = await jwt.sign(
    {
      user_id: createm.id,
      username: createm.prefix,
      //  token_v: Key_apiservers.token_v,
      user_type: "Merchant",
      // user_device_id: body.Merchant,
    },
    CONFIG.jwt_encryption,
    { expiresIn: "365d" }
  );

  await Merchant.update(
    {
      token_auth: token,
      //
    },
    {
      where: { id: createm.id },
    }
  );

  // let ruser = await Admin.findOne({ where: { id: body.id } });

  return ReS(res, {
    data: createm,
    useradmin: {
      username: created.username,
      password: genPass,
    },
    token: token,
    message: "Create Merchant Successfully",
  });

  // console.log(datapost);
};
const request = async function (
  method,
  uri,
  data = null,
  auth = "",
  host = ""
) {
  const config = {
    method: "" + method + "",
    url: "" + uri + "",
    headers: {
      // "origin": "aaaa",
      // "accept-encoding": "gzip",
      // "accept-language": "th",
      // "content-type": "application/json; charset=UTF-8",
      // "scb-channel": "APP",
      // "user-agent": "" + this.useragent + "",
      // "th.co.scb-easy-rquid": "fdbe576e-0e23-422c-a31b-f38cdfacf350",
      // "th.co.scb-easy-sessionid": "a55f83a9-ca84-454c-99d6-8b911139f62c",
      // "authority": "scbeasy.co",
      // "accept": "application/json, text/plain, /",
      // "api-auth": "" + auth + "",
      // "host": "" + this.host + "",

      "user-agent": "" + agent + "",
      "scb-channel": "APP",
      "accept-language": "th",
      "content-type": "application/json; charset=UTF-8",
      "api-auth": "" + auth + "",
      origin: "" + Math.floor(Math.random() * 1000) + "",
    },
    // proxy: false,
    // httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://192.168.1.18:8000`),
    data: data,
  };
  const response = await axios(config)
    .then((r) => r)
    .catch((e) => e.response);
  return response;
};
function randomString(len, charSet) {
  charSet = charSet || "abcdefghijklmnopqrstuvwxyz0123456789";
  var randomString = "";
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}
const confirm_accounts = async function (req, res) {
  let body = req.body;

  try {
    let chackmems = await Customers.findOne({
      include: [
        {
          as: "banks",
          model: Bank,
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        customer_uuid: body.customer_uuid,
      },
    });

    if (chackmems) {
      let saves = await Customers.update(
        {
          status: "SUCCESS",
        },
        {
          where: { customer_uuid: chackmems.customer_uuid }, // แก้ไขตรงนี้จาก userId เป็น id
        }
      );

      // let setregister = await create_customersget(chackmems);

      if (saves) {
        return ReS(res, {
          code: 1000,
          message: "confirm_account success",
        });
      }
    } else {
      return ReS(res, {
        code: 500, // หรือ code อื่นๆ ที่เหมาะสม
        message: "เกิดข้อผิดพลาดในการยืนยันบัญชี ไม่มี Userid รายการนี้",
      });
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return ReS(res, {
      code: 500, // หรือ code อื่นๆ ที่เหมาะสม
      message: "เกิดข้อผิดพลาดในการยืนยันบัญชี",
    });
  }
};
const getdatamerchant = async function (req, res) {
  let dataall = await Merchant.findAll({});

  return ReS(res, {
    data: dataall,
    code: 1000,
    message: "confirm_account success",
  });
};
const transferpromtpay = async function (req, res) {
  let data = {
    amount: req.body.amount,
    accountFrom: req.body.accountNo,
    promptPayID: req.body.promptPayID,
    auth: req.body.auth,
  };

  let dataall = await scbs.transferpromtpay(
    data.amount,
    data.accountFrom,
    data.promptPayID,
    data.auth
  );

  return ReS(res, {
    data: dataall.data,
    code: 1000,
    message: "confirm_account success",
  });
};

const getdatamerchantbanner = async function (req, res) {
  let dataall = await scbs.banner(req.body.auth);

  return ReS(res, {
    data: dataall.data,
    code: 1000,
    message: "confirm_account success",
  });
};

async function generatePaymentQRCode(amount, accountNumber) {
  const amountNumber = parseFloat(amount);
  const payload = generatePayload(accountNumber, { amount: amountNumber });

  // สร้าง QR Code ในรูปแบบ Base64
  // const qrCodeBase64 = await qrcode.toDataURL(payload, { type: "image/png" });

  return payload;
}

const createscanqrcode = async function (req, res) {
  let body = req.body;
  const amount = body.amount;

  if (!amount) {
    return ReE(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_require",
        message: "กรุณากรอก จำนวนเงินที่ต้องการ.",
      },
      422
    );
  }
  if (!req.body.userId) {
    return ReE(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_require",
        message: "กรุณากรอก จำนวนเงินที่ต้องการ.",
      },
      422
    );
  }
  let bodyBankAccount = await BankAccount.findOne({
    where: {
      accountType: "deposit",
      status_bank: "Active",
      status_promptpay_qr: 1,
    },
  });

  if (!bodyBankAccount) {
    return ReE(
      res,
      {
        results: null,
        code: 200,
        message: "ไม่มี ฟังชั่น scanqrcode",
      },
      422
    );
  }

  let user_member = await Member.findOne({
    where: {
      userId: req.body.userId,
    },
  });

  if (!user_member) {
    return ReE(
      res,
      {
        results: null,
        code: 422,
        message: "ไม่มี userId ",
      },
      422
    );
  }

  const decimal = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");

  // นำเศษสตางค์ไปต่อท้าย amount
  let amounts = parseFloat(amount) + "." + decimal;

  const accountNumber = bodyBankAccount.telephoneNumber;

  const qrCode = await generatePaymentQRCode(amounts, accountNumber);

  const uuid = generateUuid();
  function generateQrExpireTime(minutes = 15) {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + minutes * 60000); // แปลงนาทีเป็น milliseconds
    return expiryDate.getTime();
  }

  const qrExpireTime = generateQrExpireTime(30);
  let datasave = {
    uuid: uuid,
    userId: user_member.userId,
    qrCode: qrCode,
    customerName: user_member.bankAccountName,
    customerAccountNo: user_member.bankAccountNumber,
    customerBankCode: user_member.bankId,
    qrExpireTime: qrExpireTime,
    qrType: "QRCODE",
    transferAmount: amounts,
    amount: amounts,
    status: "PENDING",
  };
  let user_Req_qrcode = await Req_qrcode.findOne({
    where: {
      status: "PENDING",
      userId: user_member.userId,
      // referenceId:req.body.referenceId
    },
  });

  if (user_Req_qrcode) {
    return ReE(
      res,
      {
        results: null,
        code: 422,
        message: "มีรายการรอดำเนินการ",
      },
      422
    );
  }

  let user_Req_qrcodereferenceId = await Req_qrcode.findOne({
    where: {
      referenceId: req.body.referenceId,
    },
  });

  if (user_Req_qrcodereferenceId) {
    return ReE(
      res,
      {
        results: null,
        code: 422,
        message: "มี referenceId นี้แล้ว",
      },
      422
    );
  }
  let createqr = await Req_qrcode.create(datasave);

  let datareteun = {
    urlpay: `https://qrpay.payment-backend88.com/?uuid=${datasave.uuid}`,
    qrCode: qrCode,
    uuid: datasave.uuid,
    qrExpireTime: datasave.qrExpireTime,
  };

  //console.log(datareteun);
  return ReS(res, {
    results: datareteun,
    code: 200,
    message: "create qrcode success",
  });
};

const scanqrcode = async function (req, res) {
  const upload = multer().single("image");
  upload(req, res, async function (err) {
    const jimp = await Jimp.read(req.file.buffer);
    const qr = await jsQr(
      jimp.bitmap.data,
      jimp.bitmap.width,
      jimp.bitmap.height
    );
    if (qr) {
      try {
        let databank = {
          deviceId: "973b06e8-8103-45e8-a6f9-b1eab1fc9b23",
        };

        const verify_user = await Apiscb_helper.posy_verifyusers(
          databank.deviceId
        );
        // console.log(verify_user);
        if (verify_user.data.data.status.code === 1000) {
          // let data_Slip = await scb.paymentsbillscanurl(

          // );

          const axios = require("axios");
          let data = JSON.stringify({
            img_url: qr.data,
            api_auth: verify_user.data.headers["api-auth"],
          });

          let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://scb.promplayvip.com/scbeasy/payments",
            headers: {
              "Content-Type": "application/json",
            },
            data: data,
          };

          let success = await axios.request(config);

          return ReE(res, {
            results: success.data,
            code: 200,
            message: " success",
          });
        }
      } catch (error) {
        console.log(error);
        //next();
      }
    } else {
      return ReE(res, {
        results: qr,
        code: 400,
        message: " error",
      });
      //  return res.status(400).json(qr);
    }
  });
};

const getdatamerchantall = async function (req, res) {
  let data = {
    id: "449fbaad-767e-405a-80cd-c14620e4e6de",
    merchantId: "54474d2a-1ec2-4614-9504-281f225c07d5",
    bankAccountGroupId: "3377d75e-b4e2-4fe1-9904-a3227e2bf028",
    bankId: 4,
    bankAccountNumber: "1382415449",
    bankAccountName: "น.ส. กัญญาพัชร์ ปิยพัทธ์วราพร",
    telephoneNumber: "0958250860",
    trueWalletUsername: null,
    createdAt: "2024-12-26T17:00:57.895Z",
    updatedAt: "2024-12-26T17:00:57.895Z",
    bank: {
      id: 4,
      bankId: "004",
      bankCode: "KBANK",
      bankName: "ธนาคารกสิกรไทย",
      imageUrl:
        "https://rtbprd-app-banks-logo.s3.ap-southeast-1.amazonaws.com/KBANK.png",
      createdAt: "2022-02-03T04:40:55.192Z",
      updatedAt: "2022-02-03T04:40:55.192Z",
    },
    merchant: {
      id: "54474d2a-1ec2-4614-9504-281f225c07d5",
      merchantGroupId: null,
      name: "DEKBAN9",
      prefix: "DB9",
      depositCallbackUrl: "https://api.lnwapi.co/public/deposits/callback",
      withdrawalCallbackUrl: "https://api.lnwapi.co/public/withdraws/callback",
      withdrawalLimit: 5000,
      withdrawStrategy: "own",
      maximumWithdrawTxsPerBankAccount: 0,
      maximumWithdrawVolumePerBankAccount: 0,
      isActive: true,
      settings: null,
      createdAt: "2024-06-04T08:54:24.719Z",
      updatedAt: "2024-06-04T08:54:24.719Z",
    },
  };
  return ReS(res, {
    results: data,
    code: 1000,
    message: "confirm_account success",
  });
};

const notifyforword = async function (req, res) {
  //console.log(req.body);

  return ReS(res, {
    // results: qr,
    // code: 400,
    message: "confirm_account success",
  });
};
const edit_merchans = async function (req, res) {


  let updates = await Merchant.update(req.body, {
    where: {
      id: req.user.merchantId,
    },
  });

  if (!updates) {
    return ReE(res, {
      results: null,
      code: 402,
      message:
        "เกิดข้อผิดพลาด ไม่มีธนาคารใช้ฝาก สำหรับ QR โปรทำรายการใหม่อีกครั้ง",
    });
  }

  return ReS(res, {
    // results: qr,
    // code: 400,
    message: "confirm_edit success",
  });
  // console.log(update)
};

const merchang_info = async function (req, res) {
  let updates = req.user;

  const datamer = await Merchant.findOne({
    include: [
      {
        as: "setting_Merchant",
        model: Systemsettings,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
        required: true,
        // where: { to_user_id: user_id, request_status: "Requested" },
      },
    ],
    where: {
      id: req.user.id,
    },
  });

  if (!updates) {
    return ReE(res, {
      // results: qr,
      // code: 400,
      message: "error",
    });
  }

  return ReS(res, {
    results: datamer,
    // code: 400,
    message: "success",
  });
  // console.log(update)
};
const chackDeposit = async function (req, res) {
  let bodyBankAccount = await Request_All.findAll({
    where: {
      // accountType: "deposit",
      //bankAccount_id: params,
      type_status: "ฝากเงิน",
      status_pay: 1,
    },
  });

  return ReS(res, {
    results: bodyBankAccount,
    // code: 400,
    message: "success",
  });
};

const update_status_chackDeposit = async function (req, res) {
  let body = req.body;

  const chack_ref = await Request_All.findOne({
    where: {
      id: body.id,
    },
  });

  if (!chack_ref) {
    return ReE(res, {
      code: 402,
      message: "error ไม่มี id นี้ในระบบ",
    });
  }

  let saves = await Request_All.update(
    {
      status_pay: 0,
    },
    {
      where: { id: body.id }, // แก้ไขตรงนี้จาก userId เป็น id
    }
  );

  if (saves) {
    return ReS(res, {
      message: "success",
    });
  } else {
    return ReE(res, {
      message: "error",
    });
  }
};

// let normalizedThai = ""; // "จินตนา สุทธิวงศ์"

// // ตรวจสอบว่า rr.name_to เป็น string หรือไม่
// if (typeof rrto === "string") {
//   // ลบเครื่องหมายบวกทั้งหมด
//   rrto = rrto.replace(/\+/g, ""); // Remove '+' symbols
//   rrto = rrto.trim().toLowerCase(); // Trim whitespace and convert to lowercase

//   // Remove common prefixes (adjust the regex as needed)
//   rrto = rrto.replace(/^(miss|mr\.|น\.ส\.|นาย)\s+/i, "");

//   normalizedEnglish = normalizeName(rrto);
//   // "jintana sud"
//   normalizedThai = normalizeName(rrto); // "จินตนา สุทธิวงศ์"

//   // console.log(normalizedEnglish);
//   // console.log(normalizedThai);
// } else {
//   console.error("rr.name_to is not a string");
// }

const getDeposit_recipients = async function (req, res) {
  let body = req.body;

  let trans = await TransactionsV2.findAndCountAll({
    include: [
      {
        model: Request_All,
        as: "transaction_bank", // Use the correct alias from your model definition
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
      },
    ],
    where: {
      status: "verification",
    },
    offset: parseFloat(body.offset),
    limit: parseFloat(body.limit),
    order: [["id", "desc"]],
  });

  // let bodyBankAccount = await TransactionsV2.findAll({
  //   include: [

  //     {
  //       model: Request_All,
  //       as: "transaction_bank", // Use the correct alias from your model definition
  //       attributes: {
  //         include: [],
  //         exclude: ["deleted_at", "created_at", "updated_at"],
  //       },
  //     },
  //   ],

  //   where: {
  //     status: "verification",
  //   },
  //   order: [["id", "desc"]],
  // });

  return ReS(res, {
    data: trans,
    code: 1000,
    message: "success",
  });
};

// const verifying_accountsv2 = async function (req, res) {
//   let body = req.body;

//   if (!body.accountNo) {
//     return ReE(
//       res,
//       {
//         static_key: "api_response_auth_login_email_require",
//         message: "กรุณากรอก accountNo ของคุณ....",
//       },
//       422
//     );
//   } else if (!body.bank_id) {
//     return ReE(
//       res,
//       {
//         static_key: "api_response_auth_login_password_require",
//         message: "กรุณากรอก bank_id ของคุณ",
//       },
//       422
//     );
//   }

//   let chackmems = await Member.findOne({
//     include: [
//       {
//         as: "banks",
//         model: Bank,
//         attributes: {
//           include: [],
//           exclude: ["deleted_at", "created_at", "updated_at"],
//         },
//         required: true,
//       },
//     ],
//     where: {
//       bankAccountNumber: req.body.accountNo,
//     },
//   });

//   if (chackmems) {
//     return ReE(res, {
//       data: chackmems,
//       code: 400,
//       message: "มีเลขบัญชีนี้แล้วในระบบ",
//     });
//   }

//   let auth_info, err, users, Banks, transferData, response;

//   let user = await BankAccount.findOne({
//     where: {
//       status_bank: "Active",
//       //   channel: "scb-business",
//       accountType: "verifying_account",
//     },
//     order: [["updated_at", "ASC"]],
//   });

//   [err, Banks] = await to(
//     Bank.findOne({
//       where: {
//         bank_id: req.body.bank_id,
//       },
//     })
//   );

//   let chackmem = await Member.findOne({
//     include: [
//       {
//         as: "banks",
//         model: Bank,
//         attributes: {
//           include: [],
//           exclude: ["deleted_at", "created_at", "updated_at"],
//         },
//         required: true,
//         // where: { to_user_id: user_id, request_status: "Requested" },
//       },
//     ],
//     where: {
//       bankAccountNumber: req.body.accountNo,
//     },
//   });

//   if (chackmem) {
//     return ReE(res, {
//       data: chackmem,
//       code: 102,
//       message: "Error มี ชื่อสมาชิกนี้เคยสมัครมาแล้ว",
//     });
//   }

//   let datalogin = {
//     bankCode: Banks.bankCode,
//     accountNo: req.body.accountNo,
//   };

//   if (!user) {
//     [err, response] = await to(gettrankbank(datalogin));

//     if (response.data.success === true) {
//       const data_uuid = response.data;

//       let chackmem = await Member.findOne({
//         include: [
//           {
//             as: "banks",
//             model: Bank,
//             attributes: {
//               include: [],
//               exclude: ["deleted_at", "created_at", "updated_at"],
//             },
//             required: true,
//             // where: { to_user_id: user_id, request_status: "Requested" },
//           },
//         ],
//         where: {
//           bankAccountName: data_uuid.data.bankCustomerNameTH,
//         },
//       });

//       if (chackmem) {
//         return ReE(res, {
//           data: chackmem,
//           code: 102,
//           message: "Error มี ชื่อสมาชิกนี้เคยสมัครมาแล้ว",
//         });
//       }

//       const uuid = generateUuid();
//       let datareport = {
//         userId: uuid,
//         userStatus: 0,
//         bankAccountNumber: req.body.accountNo,
//         bankAccountName: data_uuid.data.bankCustomerNameTH,
//         bankId: Banks.id,
//         merchantId: req.user.id,
//         // bankId:Banks.id,
//       };

//       let savemem = await Member.create(datareport);

//       let chackmems = await Member.findOne({
//         include: [
//           {
//             as: "banks",
//             model: Bank,
//             attributes: {
//               include: [],
//               exclude: ["deleted_at", "created_at", "updated_at"],
//             },
//             required: true,
//             // where: { to_user_id: user_id, request_status: "Requested" },
//           },
//         ],
//         where: {
//           id: savemem.id,
//         },
//       });

//       //  console.log(chackmems);

//       return ReS(res, {
//         data: chackmems,
//         code: 1000,
//         message: "success",
//       });
//     } else {
//       return ReE(res, {
//         msg: response.data,
//         code: 102,
//         message: "Error",
//       });
//     }
//   }

//   if (user.channel == "scb-business") {
//     // Apiscbbiz_helper
//     let chackmem = await Member.findOne({
//       include: [
//         {
//           as: "banks",
//           model: Bank,
//           attributes: {
//             include: [],
//             exclude: ["deleted_at", "created_at", "updated_at"],
//           },
//           required: true,
//           // where: { to_user_id: user_id, request_status: "Requested" },
//         },
//       ],
//       where: {
//         bankAccountNumber: req.body.accountNo,
//       },
//     });

//     if (chackmem) {
//       return ReE(res, {
//         data: chackmem,
//         code: 102,
//         message: "Error มี ชื่อสมาชิกนี้เคยสมัครมาแล้ว",
//       });
//     }

//     let chack_authv1 = await Apiscbbiz_helper.ckack_authscb(user.auth);

//     if (chack_authv1.data.success == false) {
//       let datapost = {
//         deviceId: user.deviceId,
//         pin: user.pin,
//       };

//       let chack_auth = await Apiscbbiz_helper.login_scbkrungthai(datapost);
//       //  console.log(chack_auth.data);

//       user.auth = chack_auth.data.data.sessionId;

//       if (chack_auth.data.success == true) {
//         let upnew = BankAccount.update(
//           {
//             // auth: params.auth,
//             //  isActive: 1,

//             auth: chack_auth.data.data.sessionId,
//           },
//           {
//             where: {
//               id: user.id,
//             },
//           }
//         );
//       }
//     }

//     let datapostckack = {
//       sessionId: user.auth,
//       accountNumber: req.body.accountNo,
//       bankCode: Banks.scb_code,
//     };

//     let chack_verrify = await Apiscbbiz_helper.verrifyscb(datapostckack);

//     if (chack_verrify.data.data.validationResult == "PASSED") {
//       const data_uuid = chack_verrify.data.data;

//       let bankname_th = "";
//       let bankname_en = "";

//       if (Banks.scb_code == "014") {
//         bankname_th = data_uuid.accountName;
//       } else {
//         bankname_th = data_uuid.accountDisplayName;
//         bankname_en = data_uuid.accountName;
//       }

//       // console.log(data_uuid)
//       let chackmem = await Member.findOne({
//         include: [
//           {
//             as: "banks",
//             model: Bank,
//             attributes: {
//               include: [],
//               exclude: ["deleted_at", "created_at", "updated_at"],
//             },
//             required: true,
//             // where: { to_user_id: user_id, request_status: "Requested" },
//           },
//         ],
//         where: {
//           bankAccountName: data_uuid.accountName,
//         },
//       });

//       if (chackmem) {
//         return ReE(res, {
//           data: chackmem,
//           code: 102,
//           message: "Error มี ชื่อสมาชิกนี้เคยสมัครมาแล้ว",
//         });
//       }

//       const uuid = generateUuid();
//       let datareport = {
//         userId: uuid,
//         userStatus: 0,
//         bankAccountNumber: data_uuid.accountNumber,
//         bankAccountName: bankname_th,
//         bankId: Banks.id,
//         merchantId: req.user.id,
//         bankAccountName_En: bankname_en,
//         // bankId:Banks.id,
//       };

//       let savemem = await Member.create(datareport);

//       let chackmems = await Member.findOne({
//         include: [
//           {
//             as: "banks",
//             model: Bank,
//             attributes: {
//               include: [],
//               exclude: ["deleted_at", "created_at", "updated_at"],
//             },
//             required: true,
//             // where: { to_user_id: user_id, request_status: "Requested" },
//           },
//         ],
//         where: {
//           id: savemem.id,
//         },
//       });

//       //  console.log(chackmems);

//       return ReS(res, {
//         data: chackmems,
//         code: 1000,
//         message: "success",
//       });
//     } else if (
//       chack_verrify.data.data.validationResult == "BLOCK_NOT_FOUND_ACCT" ||
//       chack_verrify.data.data.validationResult == "NOT_FOUND_ACCOUNT"
//     ) {
//       return ReE(
//         res,
//         {
//           //data: chack_verrify.data,
//           message: chack_verrify.data.data.validationResultDescription,
//         },
//         200
//       );
//     }

//     // console.log(chack_verrify);
//   } else if (user.channel == "ktb-business") {
//   }

//   // console.log(datalogin);
//   //console.log(user);

//   // // let response = await chack_ver(datalogin);

//   // if (err) {
//   //   return ReE(res, {
//   //     data: chackmem,
//   //     code: 102,
//   //     message: "Error ข้อมูลไม่ถูกตต้อง กรุณาตรวจสอบดีๆ อีกครั้ง",
//   //   });
//   // }

//   // Banks.scb_code,
//   // req.body.accountNo,
// };
module.exports = {
  api_callback_true,
  create_merchant_v1,
  verifying_accounts,
  // verifying_accountsv2,
  confirm_accounts,
  getdatamerchant,
  getdatamerchantbanner,
  transferpromtpay,
  scanqrcode,
  createscanqrcode,
  notifyforword,
  edit_merchans,
  merchang_info,
  chackDeposit,
  update_status_chackDeposit,
  getDeposit_recipients,
};
