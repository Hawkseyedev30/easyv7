var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  Transaction_manual,
  Req_qrcode,
  TransactionsV2,
  BankAccountGroup,
  Systemsettings,
  Botlog_limittime,
  Create_deposits,
  TransactionsV2
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const Apiscb_helper = require("../../helpers/login.helpers");
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const Notify = require("../../helpers/notify");
const Apichack_history_by = require("../auth/auth_controller");
const Apicllback = require("./api");
const fuzzball = require("fuzzball");
const config = require("../../config/app.json")[app["env"]];
//const date = require("date-and-time");
//const now = new Date();
const urlendpoint = "https://apidev.payment-backend88.com";
const CountTrans = require("../../helpers/count_number_of_times.helpers");

const krungsribizonline = require("../krungsribizonline/krungsribizonline.class");
const krungsribizonlineDep = require("../krungsribizonline/deposit");
const krungsri = new krungsribizonline();
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
const io = require("socket.io-client");
var socket = io.connect(config["BASE_URL"], { reconnect: true });
var moment = require("moment");
require("moment/locale/th");
var md5 = require("md5");
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");

async function sreat(str) {
  let d = await TransactionsV2.findOne({
    where: {
      double_check: str,
    },
  });
  return d;
}

function generateUuid() {
  return uuidv4();
}

function conRes(res) {
  return Object.values(JSON.parse(JSON.stringify(res)));
}
async function save_member(params, user) {
  let d = generateUuid();

  let double_checks = md5(user.amount + moment(user.time_create).format());

  let datassave = {
    request_All_id: user.id,
    amount: user.amount,
    remark: user.type_status,
    bank_from: user.fron_bank,
    acc_from: user.acc_from,
    reqby_admin_id: 4,
    name_member: params.bankAccountName,
    txn_type: "",
    ref: d,
    description: user.description,
    type: "deposit",
    status: "pending",
    member_id: params.id,
    CustomersId: params.id,
    merchantId: params.merchantId,
    nodere: "",
    double_check: double_checks,
  };

  let chack_level2 = await sreat(double_checks);

  if (chack_level2) {
    return false;
  }

  let Transactions = await TransactionsV2.create(datassave);

  let count = 0;
  let countTrans = await CountTrans.count_the_number_of_times_deposited(Transactions?.member_id);
  if (countTrans?.status) {
    count = countTrans?.count
  }
  // Notification message for Telegram
  let msg = `
  <b>Notification: Deposit GBPVEGAS</b>
  <pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
  <b>หมายเลขอ้างอิง (Ref):</b> ${d}
  <b>ชื่อสมาชิก:</b> ${params.bankAccountName}
  <b>เลขที่บัญชีสมาชิก:</b> ${params.bankAccountNumber}
  <b>จำนวนเงินที่ฝาก:</b> ${user.amount} บาท
  <b>ประเภทธุรกรรม:</b> ฝากเงิน
  <b>ฝากเข้าบัญชี:</b> ${user.fron_bank}
  <b>จำนวนที่ฝากวันนี้:</b> ${count} 
  <b>เวลาตามสลิป:</b> ${moment(user.time_create).format("YYYY-MM-DD HH:mm:ss")} 
  </code></pre>
  <i><b>หมายเหตุ:</b> ${moment(user.date_creat).fromNow()} </i>
  `;

  let datanoti = {
    msg: msg,
    tpye: "success",
    type: "deposit",
    data: {
      ref: d,
      name_member: params.bankAccountName, // Use member's name
      amount: user.amount, // Use deposit amount
      type: "ฝากเงิน",
      nodere: `มีรายการฝากเงินเข้ามาใหม่`,
    },
  };

  await Notify.sendTelegram(datanoti);

  // Emit socket event
  socket.emit("send_notification", {
    to: "Allroom",
    data: datassave,
    message: "มีรายการฝากเงินเข้ามาใหม่",
  });

  // Update Request_All status
  const status_pay = await Request_All.update(
    {
      status_pay: 0,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  return Transactions.id;
}
async function save_memberbay(params, user) {
  let d = generateUuid();

  let double_checks = md5(user.amount + moment(user.time_create).format());

  let datassave = {
    request_All_id: user.id,
    amount: user.amount,
    remark: user.type_status,
    bank_from: user.fron_bank,
    acc_from: user.acc_from,
    reqby_admin_id: 4,
    name_member: params.bankAccountName,
    txn_type: "",
    ref: d,
    description: user.description,
    type: "deposit",
    status: "pending",
     member_id: params.id,
    CustomersId: params.id,
    merchantId: params.merchantId,
    nodere: "",
    double_check: double_checks,
  };

  let chack_level2 = await sreat(double_checks);

  if (chack_level2) {
    return false;
  }

  let Transactions = await TransactionsV2.create(datassave);
  let count = 0;
  let countTrans = await CountTrans.count_the_number_of_times_deposited(Transactions?.member_id);
  if (countTrans?.status) {
    count = countTrans?.count
  }
  // Notification message for Telegram
  let msg = `
<b>Notification: Deposit GBPVEGAS By Krungsri</b>
<pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
<b>หมายเลขอ้างอิง (Ref):</b> ${d}
<b>ชื่อสมาชิก:</b> ${params.bankAccountName}
<b>เลขที่บัญชีสมาชิก:</b> ${params.bankAccountNumber}
<b>จำนวนเงินที่ฝาก:</b> ${user.amount} บาท
<b>ประเภทธุรกรรม:</b> ฝากเงิน
<b>ฝากเข้าบัญชี:</b> ${user.fron_bank}
<b>จำนวนที่ฝากวันนี้:</b> ${count} 
<b>เวลาตามสลิป:</b> ${moment(user.date_creat).format("YYYY-MM-DD HH:mm:ss")}
</code></pre>
<i><b>หมายเหตุ:</b> ${moment(user.date_creat).format()}  </i>
  `;

  let datanoti = {
    msg: msg,
    tpye: "success",
    type: "deposit",
    data: {
      ref: d,
      name_member: params.bankAccountName, // Use member's name
      amount: user.amount, // Use deposit amount
      type: "ฝากเงิน",
      nodere: `มีรายการฝากเงินเข้ามาใหม่`,
    },
  };

  await Notify.sendTelegram(datanoti);

  // Emit socket event
  socket.emit("send_notification", {
    to: "Allroom",
    data: datassave,
    message: "มีรายการฝากเงินเข้ามาใหม่",
  });

  // Update Request_All status
  const status_pay = await Request_All.update(
    {
      status_pay: 0,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  return Transactions.id;
}
async function save_memberqrcode(params, user, dataqr) {
  let d = generateUuid();
  let datassave = {
    request_All_id: user.id,
    amount: user.amount,
    remark: user.type_status,
    bank_from: user.fron_bank,
    acc_from: user.acc_from,
    reqby_admin_id: 4,
    name_member: params.bankAccountName,
    txn_type: "",
    ref: d,
    description: user.description,
    type: "deposit",
    status: "pending",
    member_id: params.id,
    nodere: "",
    // time_creat:"",
  };

  let Transactions = await TransactionsV2.create(datassave);
  let count = 0;
  let countTrans = await CountTrans.count_the_number_of_times_deposited(Transactions?.member_id);
  if (countTrans?.status) {
    count = countTrans?.count
  }
  let msg = `
  <b>Notification: Deposit GBPVEGAS By Qr Code</b>
  <pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
  <b>หมายเลขอ้างอิง (Ref):</b> ${d}
  <b>ชื่อสมาชิก:</b> ${params.bankAccountName}
  <b>เลขที่บัญชีสมาชิก:</b> ${params.bankAccountNumber}
  <b>จำนวนเงินที่ฝาก:</b> ${user.amount} บาท
  <b>ประเภทธุรกรรม:</b> ฝากเงิน qrcode
  <b>ฝากเข้าบัญชี:</b> ${user.fron_bank}
  <b>จำนวนที่ฝากวันนี้:</b> ${count} 
  <b>เวลาตามสลิป:</b> ${moment(user.time_create).format("YYYY-MM-DD HH:mm:ss")}
  </code></pre>
  
  <i><b>หมายเหตุ:</b> ${moment(user.date_creat).fromNow()} </i>
  `;

  let datanoti = {
    msg: msg,
    tpye: "success",
    type: "deposit",
    data: {
      ref: d,
      name_member: params.bankAccountName, // Use member's name
      amount: user.amount, // Use deposit amount
      type: "ฝากเงิน",
      nodere: `มีรายการฝากเงินเข้ามาใหม่`,
    },
  };
  await Notify.sendTelegram(datanoti);

  socket.emit("send_notification", {
    to: "Allroom",
    data: datassave,
    message: "มีรายการเข้ามา",
  });
  //socket.emit("sendNotification_live", Transactions);
  // console.log(Transactions)
  const status_pay = await Request_All.update(
    {
      status_pay: 0,
    },

    {
      where: {
        id: user.id,
      },
    }
  );

  //

  return Transactions.id;
}

async function getall_member(params) {
  let bodyBankAccount = await Member.findAll({
    where: {
      // accountType: "deposit",
      merchantId: params,
    },
  });

  return bodyBankAccount;
}
async function get_Request_All(params) {
  let bodyBankAccount = await Request_All.findAll({
    where: {
      // accountType: "deposit",
      //  bankAccount_id: params,
      type_status: "ฝากเงิน",
      status_pay: 1,
    },
  });

  //console.log(bodyBankAccount)

  return bodyBankAccount;
}

async function depositalls(member, user) {
  for (const rr of conRes(member)) {
    let regex = new RegExp(rr.accnum);
    let bodyBankAccount = await Member.findOne({
      where: {
        bankAccountNumber: {
          [Op.regexp]: regex, // Assuming you're using Sequelize
        },
      },
    });
    // ... rest of your code
  }
  return member;
}
async function depositall(member, acc) {
  const dataall = [];
  // console.log(acc.merchantId)
  for (const rr of conRes(member)) {
    let bodyBankAccount = "";
    if (rr.to_bank == "kbank") {
      let normalizedThai = ""; // "จินตนา สุทธิวงศ์"
      let rrto = rr.name_to;
      // ตรวจสอบว่า rr.name_to เป็น string หรือไม่
      if (typeof rrto === "string") {
        // ลบเครื่องหมายบวกทั้งหมด

        rrto = rrto.replace(/\+/g, ""); // Remove '+' symbols
        rrto = rrto.trim().toLowerCase(); // Trim whitespace and convert to lowercase

        // Remove common prefixes (adjust the regex as needed)
        // rrto = rrto.replace(/^(miss|mr\.|น\.ส\.|นาย)\s+/i, "");
        rrto = rrto.replace(
          /^(mrs\.|miss|ms\.|mr\.|dr\.|นางสาว|น\.ส\.|นาง|นาย|ด\.ช\.|ด\.ญ\.)\s+/i,
          ""
        );

        normalizedEnglish = normalizeName(rrto);
        // "jintana sud"
        normalizedThai = normalizeName(rrto); // "จินตนา สุทธิวงศ์"

        // console.log(normalizedThai);
        // console.log(normalizedThai);
      } else {
        console.error("rr.name_to is not a string");
      }
      bodyBankAccount = await Member.findOne({
        where: {
          userStatus: 1,
          //rr.accnum = 1097
          bankAccountNumber: {
            [Op.like]: `%${rr.accnum}%`,
          },

          [Op.or]: [
            {
              bankAccountName: {
                [Op.like]: `%${normalizedThai}%`,
              },
            },
            {
              bankAccountName_En: {
                [Op.like]: `%${normalizedEnglish}%`,
              },
            },
          ],

          merchantId: acc.merchantId,
        },
      });
    } else {
      bodyBankAccount = await Member.findOne({
        where: {
          userStatus: 1,
          //rr.accnum = 1097
          bankAccountNumber: {
            [Op.like]: `%${rr.accnum}%`,
          },

          merchantId: acc.merchantId,
        },
      });
    }

    // console.log(rr);
    if (bodyBankAccount) {
      //  console.log(bodyBankAccount);
      const combinedData = { ...bodyBankAccount.dataValues };
      let save_members = await save_member(combinedData, rr, acc);
      //
      //
      // dataall.push(combinedData);
    }
  }
  return dataall;
  //
}

function normalizeName(name) {
  // Remove common titles (adjust the regex as needed)
  name = name.replace(/^(miss|mr\.|น\.ส\.|นาย)\s+/i, "");

  // Convert to lowercase and trim whitespace
  name = name.trim().toLowerCase();

  return name;
}

async function depositall_qrcode(member, acc) {
  const dataall = [];
  // console.log(acc.merchantId)
  for (const rr of conRes(member)) {
    let rrto = rr.name_to;
    let normalizedEnglish = "";
    // "jintana sud"
    let normalizedThai = ""; // "จินตนา สุทธิวงศ์"

    // ตรวจสอบว่า rr.name_to เป็น string หรือไม่
    if (typeof rrto === "string") {
      // ลบเครื่องหมายบวกทั้งหมด
      rrto = rrto.replace(/\+/g, ""); // Remove '+' symbols
      rrto = rrto.trim().toLowerCase(); // Trim whitespace and convert to lowercase

      // Remove common prefixes (adjust the regex as needed)
      rrto = rrto.replace(/^(miss|mr\.|น\.ส\.|นาย)\s+/i, "");

      normalizedEnglish = normalizeName(rrto);
      // "jintana sud"
      normalizedThai = normalizeName(rrto); // "จินตนา สุทธิวงศ์"

      // console.log(normalizedEnglish);
      // console.log(normalizedThai);
    } else {
      console.error("rr.name_to is not a string");
    }

    let bodyBankAccount = await Member.findOne({
      where: {
        // bankAccountNumber = 8029661097
        //rr.accnum = 1097
        bankAccountNumber: {
          [Op.like]: `%${rr.accnum}%`,
        },
        bankAccountName: {
          [Op.like]: `%${normalizedThai}%`,
        },
        merchantId: acc.merchantId,
      },
    });
    let bodyBankAccount2 = await Member.findOne({
      where: {
        // bankAccountNumber = 8029661097
        //rr.accnum = 1097
        bankAccountNumber: {
          [Op.like]: `%${rr.accnum}%`,
        },
        bankAccountName: {
          [Op.like]: `%${normalizedEnglish}%`,
        },
        merchantId: acc.merchantId,
      },
    });

    //console.log(bodyBankAccount2);

    if (bodyBankAccount) {
      let user_Req_qrcode = await Req_qrcode.findOne({
        where: {
          userId: bodyBankAccount.userId,
          amount: rr.amount,
        },
      });

      if (user_Req_qrcode) {
        const combinedData = { ...bodyBankAccount.dataValues };
        let save_members = await save_memberqrcode(combinedData, rr, acc);

        const status_pay = await Req_qrcode.update(
          {
            status: "SUCCESS",
          },

          {
            where: {
              id: user_Req_qrcode.id,
            },
          }
        );

        dataall.push(user_Req_qrcode);
      }

      //  console.log(user_Req_qrcode)
    } else if (bodyBankAccount2) {
      let user_Req_qrcode = await Req_qrcode.findOne({
        where: {
          userId: bodyBankAccount2.userId,
          amount: rr.amount,
        },
      });

      if (user_Req_qrcode) {
        const combinedData = { ...bodyBankAccount.dataValues };
        let save_members = await save_memberqrcode(combinedData, rr, acc);

        const status_pay = await Req_qrcode.update(
          {
            status: "SUCCESS",
          },

          {
            where: {
              id: user_Req_qrcode.id,
            },
          }
        );

        dataall.push(user_Req_qrcode);
      }
      return dataall;
    } else {
      return false;
    }
  }
  return dataall;
  //
}

async function depositallbay(member, acc) {
  const dataall = [];

  for (const rr of conRes(member)) {
    let bodyBankAccount = await Member.findOne({
      include: [
        {
          as: "Bank",
          model: Bank,
          where: {
            bank_id: rr.to_bank.toLowerCase(),
          },
        },
      ],
      where: {
        userStatus: 1,
        //rr.accnum = 1097
        bankAccountNumber: {
          [Op.like]: `%${rr.accnum}%`,
        },
        merchantId: acc.merchantId,
      },
    });

    if (bodyBankAccount) {
      const combinedData = { ...bodyBankAccount.dataValues };

      // console.log(bodyBankAccount)
      let save_members = await save_memberbay(combinedData, rr, acc);
      //
      //
      // dataall.push(combinedData);
    }
  }
  return dataall;
  //
}

const getdepositalls = async function (req, res) {
  let err, bankAccounts;

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
            accountType: "deposit",
            status_bank: "Active",
            //channel:"krungsribizonline"
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
      const teamParticipant = await Botlog_limittime.create({
        old_data: [],
        name_bot: "ดึงรายการฝากเงิน",
        accnum: element.accountNumber,
        bankAccountID: element.id,
        bot_status: "SUCCESS",
        bot_isActive: 1,
      });
      //   console.log(element);

      if (element.channel == "scb-easy") {
        let datapost = {
          accountNo: element.accountNumber,
        };

        let gosace = await Apichack_history_by.chack_history_by(datapost);

        //let datachack = await getall_member(element.merchantId);
        let get_Request_Alls = await get_Request_All(element.id);

        if (get_Request_Alls.length > 0) {
          let chack_depositall = await depositall(get_Request_Alls, element);
        }

        //
      } else if (element.channel == "k-biz") {
        if (element.status_promptpay_qr == true) {
          let datapost = {
            accountNo: element.accountNumber,
          };
          let gosace = await Apichack_history_by.chack_history_by(datapost);
          let get_Request_Alls = await get_Request_All(element.id);

          if (get_Request_Alls.length > 0) {
            // [err, user_data] = await to(depositscb(element));

            let chack_depositall = await depositall_qrcode(
              get_Request_Alls,
              element
            );

            datachacklogin.push(chack_depositall);
          }

          // console.log(get_Request_Alls)
        } else {
          let datapost = {
            accountNo: element.accountNumber,
          };
          let gosace = await Apichack_history_by.chack_history_by(datapost);
          // console.log(gosace)
          let get_Request_Alls = await get_Request_All(element.id);
          // console.log(get_Request_Alls)
          if (get_Request_Alls.length > 0) {
            // [err, user_data] = await to(depositscb(element));

            let chack_depositall = await depositall(get_Request_Alls, element);
          }

          //  console.log(get_Request_Alls)
        }

        // let chack_auth = await Apiscb_helper.chack_auth(element.auth);
        //console.log(chack_auth.data)
      } else if (element.channel == "krungsribizonline") {
        let gosace = await pay_krungsribizonline(element);

        let get_Request_Alls = await get_Request_All(element.id);

        if (get_Request_Alls.length > 0) {
          //   // console.log(get_Request_Alls)
          //   // [err, user_data] = await to(depositscb(element));

          let chack_depositall = await depositallbay(get_Request_Alls, element);
        }
      }
    }
    return {
      code: 1000,
      data: datachacklogin[0],
      message: "confirm_account success",
    };
  }

  //co
};

async function setapicallback(params) {
  //console.log(params);

  let bodyBankAccount = await TransactionsV2.findAll({
    include: [
      {
        as: "members",
        model: Member,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
        required: true,
        // where: { to_user_id: user_id, request_status: "Requested" },
      },
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
      status: "pending",
    },
  });

  //
  for (const rr of conRes(bodyBankAccount)) {
    let data_member = await Apicllback.submitDepositTransaction(rr);

    // console.log(rr)
    //  console.log(data_member.data)
    // console.log(data_member.data.data.status)

    let js = data_member.data.data;
    let jss = JSON.stringify(js);

    // console.log(JSON.stringify(js))
    //  console.log(jss)
    //ข้อมูลที่ส่งไปยัง depositCallbackUrl
    if (data_member.data.data.status == true) {
      const status_pay = await TransactionsV2.update(
        {
          status: "success",
          longtext_res: jss
        },
        {
          where: {
            id: rr.id,
          },
        }
      );
    } else if (data_member.data.status == false) {
      const status_pay = await TransactionsV2.update(
        {
          status: "rejected",
          //  longtext_res:js
        },
        {
          where: {
            id: rr.id,
          },
        }
      );
    }

    //console.log()
  }

  return 1;

  //
}

const getdeposit_callback = async function (req, res) {
  let body = req.body;

  let bodyBankAccount = await TransactionsV2.findAll({
    include: [
      {
        as: "members",
        model: Member,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
        required: true,
        // where: { to_user_id: user_id, request_status: "Requested" },
      },
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
      status: "pending",
    },
  });

  return ReS(res, {
    data: bodyBankAccount,
    code: 1000,
    message: "success",
  });
};

const getdepositall = async function (req, res) {
  let body = req.body;

  // socket.emit("sendNotification_linebot", "5555555555555555");

  let goto = await getdepositalls();

  // console.log(goto)

  let auth_info, err, users, Banks, user;

  [err, user] = await to(setapicallback(goto?.data));

  return ReS(res, {
    // data: user,
    code: 1000,
    message: "confirm_account success",
  });
};
const gtdata_deposit = async function (req, res) {
  let body = req.body;
  const startDate = moment(body.startDate).startOf("day").format("YYYY-MM-DD 00:01")
  const endDate = moment(body.endDate).endOf("day").format("YYYY-MM-DD 23:59")

  const page = parseInt(body.offset) ? parseInt(body.offset) : 1; //  หน้าปัจจุบัน, เริ่มต้นที่ 1


//console.log(page)

  const limit = parseInt(body.limit) || 10; // จำนวนรายการต่อหน้า
  const offset = (page - 1) * limit; // คำนวณ offset

  console.log(req.user.merchantId);
  //console.log(endDate);
  const transactionsp = await TransactionsV2.findAndCountAll({
    include: [
      {
        as: "Create_deposits_uuid",
        model: Create_deposits,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
        required: true,
        where: { merchantId: req.user.merchantId },
      },
    ],

    where: {
      type: "deposit",
      // merchantId: req.user.merchantId
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },
    limit: limit,
    offset: offset,
    order: [["id", "desc"]],
  });


  const transactionsp1 = await Create_deposits.findAndCountAll({
    where: {
     merchantId: req.user.merchantId,
    },
    offset: offset,
    limit: limit,
    order: [["id", "desc"]],
  });


  let dataret = {
    data: transactionsp,
    code: 1000,
    startDate: startDate,
    currentPage: page,
    // totalPages: Math.ceil(count / limit),
    //  totalItems: count,
    message: "Transactions retrieved successfully",
  }
  let dataret2 = {
    data: transactionsp1,
    code: 1000,
    startDate: startDate,
    currentPage: page,
    // totalPages: Math.ceil(count1 / limit),
    // totalItems: count1,
    message: "Transactions retrieved successfully",
  }


  return ReS(res, {
    data_transactions: dataret,
    data_create_deposits: dataret2,
  });



};

async function create_m(params) {
  let datassave = {
    request_All_id: user.id,
    amount: user.amount,
    remark: user.type_status,
    bank_from: user.fron_bank,
    acc_from: user.acc_from,
    reqby_admin_id: 4,
    name_member: params.bankAccountName,
    txn_type: "",
    ref: d,
    description: user.description,
    type: "deposit",
    status: "pending",
    member_id: params.id,
    nodere: "",
    // time_creat:"",
  };
}
const create_create_Manual = async function (req, res) {
  let body = req.body;
  if (!body.userId) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "กรุณากรอก userId ของคุณ....",
      },
      422
    );
  } else if (!body.create_time) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_password_require",
        message: "กรุณากรอก create_time ของคุณ",
      },
      422
    );
  }
  let user = await Member.findOne({
    where: {
      userId: body.userId,
    },
  });

  if (user) {
    let user_Transaction_manual = await Transaction_manual.findOne({
      where: {
        member_id: user.id,
        status: "pending",
      },
    });

    if (user_Transaction_manual) {
      let user_Transaction_manual = await Transaction_manual.update(
        {
          status: "cancel",
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      // return ReE(res, {
      //    data: user_Transaction_manual,
      //   code: 400,
      //   message: "Error มีรายการรอดำเนินการอยู่",
      // });
    }
    let d = generateUuid();

    let bodyBankAccount = await BankAccount.findOne({
      where: {
        accountType: "deposit",
        status_bank: "Active",
      },
    });

    let datassave = {
      amount: body.amount,
      remark: body.remark,
      bank_from: bodyBankAccount.bankId,
      acc_from: bodyBankAccount.accountNumber,
      reqby_admin_id: req.user.id,

      // name_member: user.bankAccountName,
      // txn_type: "",
      ref: d,
      date_new1: body.create_time,
      //description: user.description,
      type: "deposit",
      status: "pending",
      member_id: user.id,
      //  nodere: "",
      // time_creat:"",
    };

    let creates = await Transaction_manual.create(datassave);

    let datauser_Transaction_manual = await Transaction_manual.findOne({
      include: [
        {
          as: "members",
          model: Member,
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
          // where: { to_user_id: user_id, request_status: "Requested" },
        },
      ],

      where: {
        // member_id: user.id,
        id: creates.id,
      },
    });

    return ReS(res, {
      data: datauser_Transaction_manual,
      code: 1000,
      message: " success",
    });
    //console.log(creates)
  }
};
const getall_Transaction_manual = async function (req, res) {
  // console.log(req)
  let datauser_Transaction_manual = await Transaction_manual.findAll({
    include: [
      {
        as: "members",
        model: Member,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
        required: true,
        // where: { to_user_id: user_id, request_status: "Requested" },
      },
    ],
    order: [["id", "desc"]],
  });

  return ReS(res, {
    data: datauser_Transaction_manual,
    code: 1000,
    message: " success",
  });
};

const upload_Manual = async function (req, res) {
  console.log(req);

  return ReS(res, {
    // data: bodyBankAccount,
    code: 1000,
    message: " success",
  });
};
const callback_payonexs = async function (req, res) {
  // console.log(req)

  return ReS(res, {
    // data: bodyBankAccount,
    code: 1000,
    message: " success",
  });
};

const getdeposit_callback_rejected = async function (req, res) {
  let body = req.body;

  let bodyBankAccount = await TransactionsV2.findAll({
    include: [
      {
        as: "members",
        model: Member,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
        required: true,
        // where: { to_user_id: user_id, request_status: "Requested" },
      },
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
      status: "rejected",
    },
    order: [["id", "desc"]],
  });

  return ReS(res, {
    data: bodyBankAccount,
    code: 1000,
    message: "success",
  });
};
const chack_krungsribizonline = async function (req, res) {
  let user = req.body;

  try {
    let loginResult = await krungsri.login(user.username, user.password);
    if (loginResult) {
      let portfolioData = await krungsri.getPortfolioData();

      // console.log(portfolioData)

      // let portfolioData2 = await krungsri.StatementInquiryResult_today2(portfolioData.dataacc);

      // console.log(portfolioData2)

      return ReS(res, {
        data: portfolioData,
        //  data: portfolioData2,
        code: 1000,
        message: "success",
      });
    } else {
      return ReE(res, {
        code: 500,
        message: "Login fail",
      });
    }
  } catch (err) {
    console.log("err", err);
    return ReE(res, {
      code: 500,
      message: "Error",
    });
  }
};

const chack_transi = async function (req, res) {
  // ... other code ...

  try {
    let portfolioData = await krungsri.getPortfolioData();
    let cookies = await krungsri.getkook();

    const axios = require("axios");
    let data = '{"pageIndex":1,"pageoffset":""}';

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx/GetStatementToday",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "th,en;q=0.9",
        Connection: "keep-alive",
        "Content-Type": "application/json; charset=UTF-8",
        Origin: "https://www.krungsribizonline.com",
        Referer:
          "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx?token=OSAwi8c9ntEjqrYKhCnQFk7fLgUgUzL5MLyPCwg1j1NbimeOQVjBctvHX2G2xkB3QVH0JNqoCYLrR8um5kynENicQknjna8etp-VBzSapIZg_h0yIh2ssS9Q5wsGdTauFOi4Pq3HyycMx5HSQG0ggBpfkd7em4zTQFh27Uaay0Fp-aGMu1bauHaLoXDK9qpPlJHDoJKK0jBFti0rMUxJh0INj8xP3Epowauizr5QlabD7lEt934YkHsf60Cm2-MQ0&ma=226084",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua":
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        Cookie: `${cookies}`,
      },
      data: data,
    };

    let datato = await axios.request(config);

    let dd = JSON.parse(datato.data.d, null, 4);

    console.log(dd);

    return ReS(res, {
      data: portfolioData,
      code: 1000,
      message: "success",
    });
  } catch (err) {
    console.log("err", err);
    return ReE(res, {
      code: 500,
      message: "Error",
    });
  }
};
function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}
async function pay_krungsribizonline(params) {
  // console.log(params)

  //

  await sleep(3000);

  try {
    let cookies = await krungsri.getkook();

    const axios = require("axios");
    let data = '{"pageIndex":1,"pageoffset":""}';

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx/GetStatementToday",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "th,en;q=0.9",
        Connection: "keep-alive",
        "Content-Type": "application/json; charset=UTF-8",
        Origin: "https://www.krungsribizonline.com",
        Referer:
          "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx?token=OSAwi8c9ntEjqrYKhCnQFk7fLgUgUzL5MLyPCwg1j1NbimeOQVjBctvHX2G2xkB3QVH0JNqoCYLrR8um5kynENicQknjna8etp-VBzSapIZg_h0yIh2ssS9Q5wsGdTauFOi4Pq3HyycMx5HSQG0ggBpfkd7em4zTQFh27Uaay0Fp-aGMu1bauHaLoXDK9qpPlJHDoJKK0jBFti0rMUxJh0INj8xP3Epowauizr5QlabD7lEt934YkHsf60Cm2-MQ0&ma=226084",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua":
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        Cookie: `${cookies}`,
      },
      data: data,
    };

    let datato = await axios.request(config);

    let dd = JSON.parse(datato.data.d, null, 4);
    if (!dd) {
      let loginResult = await krungsri.login(params.deviceId, params.pin);

      return false;
    }

    let chack = await krungsribizonlineDep.Insert_datadep_krungsribizonline(
      dd.Statements,
      params
    );
    return true;
  } catch (err) {
    // console.log("err", err);
    return false;
  }
}

const StatementInquiryResult = async function (req, res) {
  // ... other code ...

  try {
    // let portfolioData = await krungsri.StatementInquiryResult_today();

    // function conRes(res) {
    //   return Object.values(JSON.parse(JSON.stringify(res)));
    // }
    //let portfolioData = await krungsri.getPortfolioData();
    let cookies = await krungsri.getkook();

    const axios = require("axios");
    let data = '{"pageIndex":1,"pageoffset":""}';

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx/GetStatementToday",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "th,en;q=0.9",
        Connection: "keep-alive",
        "Content-Type": "application/json; charset=UTF-8",
        Origin: "https://www.krungsribizonline.com",
        Referer:
          "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx?token=OSAwi8c9ntEjqrYKhCnQFk7fLgUgUzL5MLyPCwg1j1NbimeOQVjBctvHX2G2xkB3QVH0JNqoCYLrR8um5kynENicQknjna8etp-VBzSapIZg_h0yIh2ssS9Q5wsGdTauFOi4Pq3HyycMx5HSQG0ggBpfkd7em4zTQFh27Uaay0Fp-aGMu1bauHaLoXDK9qpPlJHDoJKK0jBFti0rMUxJh0INj8xP3Epowauizr5QlabD7lEt934YkHsf60Cm2-MQ0&ma=226084",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua":
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        Cookie: `${cookies}`,
      },
      data: data,
    };

    let datato = await axios.request(config);

    let dd = JSON.parse(datato.data.d, null, 4);

    // let chack = await krungsribizonlineDep.Insert_datadep_krungsribizonline(
    //   dd.Statements
    // );

    console.log("portfolioData", dd);

    return ReS(res, {
      data: cookies,
      code: 1000,
      message: "success",
    });
  } catch (err) {
    console.log("err", err);
    return ReE(res, {
      code: 500,
      message: "Error",
    });
  }
};
async function gettrankbank(params) {
  let data = JSON.stringify(params);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint + "/api/v1/auth/verifying_accountsen",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);

  return response;
}
const botver = async function (req, res) {
  let auth_info, err, users, Banks, user, transferData;

  let members = await Member.findOne({
    where: {
      bankAccountName_En: null,
    },
  });

  [err, user] = await to(
    BankAccount.findOne({
      where: {
        run_from: "amt",
        // status_bank: "Active",
        // merchantId: req.user.id,
      },
    })
  );

  [err, Banks] = await to(
    Bank.findOne({
      where: {
        id: members.bankId,
      },
    })
  );

  let datapostlogin = {
    member: {
      accountNo: members.bankAccountNumber,
      bank: Banks.scb_code,
    },
    bank: {
      username: user.deviceId,
      pin: user.pin,
    },
  };

  let datare = await gettrankbank(datapostlogin);

  let name_en = datare.data.data.beneficiaryName;

  let memberupdate = await Member.update(
    {
      bankAccountName_En: name_en,
    },
    {
      where: {
        id: members.id
      },
    }
  );

  return ReE(res, {
    data: memberupdate,
    message: "Error",
  });
};
module.exports = {
  getdepositall,
  getdeposit_callback,
  gtdata_deposit,
  callback_payonexs,
  getdeposit_callback_rejected,
  create_create_Manual,
  getall_Transaction_manual,
  upload_Manual,
  setapicallback,
  chack_krungsribizonline,
  chack_transi,
  StatementInquiryResult,
  botver,
};
