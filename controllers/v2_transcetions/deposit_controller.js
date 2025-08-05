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
  Create_notify,
  Otp_forword,
  Create_deposits,
  Customers,
  TransactionsV2,
  TransactionFeeSetting,
  TransactionKrungthai
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const Apiscb_helper = require("../../helpers/login.helpers");
const ApiKruthai_helper = require("../../helpers/Apikrunthai");
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const Notify = require("../../helpers/notify");
const Apichack_history_by = require("../auth/auth_controller");

const fuzzball = require("fuzzball");
const config = require("../../config/app.json")[app["env"]];
//const date = require("date-and-time");
//const now = new Date();
const path = require("path"); // Required for path manipulation

const generatePayload = require("promptpay-qr");
const urlendpoint = "https://apidev.payment-backend88.com";
const fs = require("fs");


const io = require("socket.io-client");
var socket = io.connect(config["BASE_URL"], { reconnect: true });
var moment = require("moment");
require("moment/locale/th");
var md5 = require("md5");
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");


const { permission } = require("process");
function conRes(res) {
  return Object.values(JSON.parse(JSON.stringify(res)));
}
function generateUuid() {
  return uuidv4();
}




const ApiGateway_helper = require("../../helpers/gateway_w");





async function getWithdrawalTransactions_by(id) {
  try {
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
}




async function findRecentDeposits() {
  const deposits = await TransactionKrungthai.findAll({
    where: {
      transactionType: "Deposit",
    },
    order: [["transactionDateTime", "DESC"]],
    limit: 10,
  });
  // console.log(deposits);
}

async function generatePaymentQRCode(amount, accountNumber) {
  const amountNumber = parseFloat(amount);
  const payload = generatePayload(accountNumber, { amount: amountNumber });

  // สร้าง QR Code ในรูปแบบ Base64
  // const qrCodeBase64 = await qrcode.toDataURL(payload, { type: "image/png" });

  return payload;
}

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
    type_option: "ฝาก",
    status: "pending",
    member_id: params.id,
    nodere: "",
    double_check: double_checks,
  };

  let chack_level2 = await sreat(double_checks);

  if (chack_level2) {
    return false;
  }

  let Transactions = await TransactionsV2.create(datassave);
  let count = 0;
  let countTrans = await CountTrans.count_the_number_of_times_deposited(
    Transactions?.member_id
  );
  if (countTrans?.status) {
    count = countTrans?.count;
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
<b>จำนวนครั้งที่ฝากวันนี้:</b> ${count} 
<b>เวลาตามสลิป:</b> ${moment(user.time_create).format("YYYY-MM-DD HH:mm:ss")} 
</code></pre>
<i><b>หมายเหตุ:</b> ${moment(user.date_creat).fromNow()} </i> 
`;

  let datanoti = {
    msg: msg,
    tpye: "success",
    type_option: "deposit",
    data: {
      ref: d,
      name_member: params.bankAccountName, // Use member's name
      amount: user.amount, // Use deposit amount
      type_option: "ฝากเงิน",
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
async function save_membervertify(params, user) {
  let d = generateUuid();

  let double_checks = md5(
    params.accnum + params.amount + moment(params.time_create).format()
  );

  let datassave = {
    request_All_id: params.id,
    amount: params.amount,
    remark: `ยอดฝาก จาก ${params.name_to ? params.name_to : "ไม่มีชื่อลูกค้า"
      } จำนวนเงิน  ${params.amount} ฝากเข้ามาเวลา ${params.time_creat
      } ประมาณ ${moment(params.date_creat).fromNow()} `,
    bank_from: params.fron_bank,
    acc_from: user.accountNumber,
    reqby_admin_id: 4,
    name_member: params.name_to,
    txn_type: "",
    ref: d,
    description: double_checks,
    type_option: "ฝาก",
    status: "verification",
    member_id: 92,
    nodere: "ยอดฝาก หาสมาชิกไม่เจอ แอดมินโปรดตรวจสอบ",
    double_check: double_checks,
  };

  // console.log(datassave)
  // console.log(datassave)

  let chack_level2 = await sreat(double_checks);

  if (chack_level2) {
    return false;
  }

  let Transactions = await TransactionsV2.create(datassave);

  // Update Request_All status
  const status_pay = await Request_All.update(
    {
      status_pay: 0,
    },
    {
      where: {
        id: params.id,
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
    type_option: "ฝาก",
    status: "pending",
    member_id: params.id,
    nodere: "",
    double_check: double_checks,
  };

  let chack_level2 = await sreat(double_checks);

  if (chack_level2) {
    return false;
  }

  let Transactions = await TransactionsV2.create(datassave);
  let count = 0;
  let countTrans = await CountTrans.count_the_number_of_times_deposited(
    Transactions?.member_id
  );
  if (countTrans?.status) {
    count = countTrans?.count;
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
<b>จำนวนครั้งที่ฝากวันนี้:</b> ${count} 
<b>เวลาตามสลิป:</b> ${moment(user.date_creat).format("YYYY-MM-DD HH:mm:ss")}
</code></pre>
<i><b>หมายเหตุ:</b> ${moment(user.date_creat).format()}  </i>
  `;

  let datanoti = {
    msg: msg,
    tpye: "success",
    type_option: "deposit",
    data: {
      ref: d,
      name_member: params.bankAccountName, // Use member's name
      amount: user.amount, // Use deposit amount
      type_option: "ฝากเงิน",
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

async function save_memberkrunthai(params, user) {
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
    type_option: "ฝาก",
    status: "pending",
    member_id: params.id,
    nodere: "",
    double_check: double_checks,
  };

  let chack_level2 = await sreat(double_checks);

  if (chack_level2) {
    return false;
  }

  let Transactions = await TransactionsV2.create(datassave);
  let count = 0;
  let countTrans = await CountTrans.count_the_number_of_times_deposited(
    Transactions?.member_id
  );
  if (countTrans?.status) {
    count = countTrans?.count;
  }
  // Notification message for Telegram
  let msg = `
<b>Notification: Deposit GBPVEGAS By Krunthai</b>
<pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
<b>หมายเลขอ้างอิง (Ref):</b> ${d}
<b>ชื่อสมาชิก:</b> ${params.bankAccountName}
<b>เลขที่บัญชีสมาชิก:</b> ${params.bankAccountNumber}
<b>จำนวนเงินที่ฝาก:</b> ${user.amount} บาท
<b>ประเภทธุรกรรม:</b> ฝากเงิน
<b>ฝากเข้าบัญชี:</b> ${user.fron_bank}
<b>จำนวนครั้งที่ฝากวันนี้:</b> ${count} 
<b>เวลาตามสลิป:</b> ${moment(user.date_creat).format("YYYY-MM-DD HH:mm:ss")}
</code></pre>
<i><b>หมายเหตุ:</b> ${moment(user.date_creat).format()}  </i>
  `;

  let datanoti = {
    msg: msg,
    tpye: "success",
    type_option: "deposit",
    data: {
      ref: d,
      name_member: params.bankAccountName, // Use member's name
      amount: user.amount, // Use deposit amount
      type_option: "ฝากเงิน",
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
    type_option: "ฝาก",
    status: "pending",
    member_id: params.id,
    nodere: "",
    // time_creat:"",
  };

  let Transactions = await TransactionsV2.create(datassave);
  let count = 0;
  let countTrans = await CountTrans.count_the_number_of_times_deposited(
    Transactions?.member_id
  );
  if (countTrans?.status) {
    count = countTrans?.count;
  }
  let msg = `
<b>Notification: Deposit GBPVEGAS By Qr Code</b>
<pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
<b>หมายเลขอ้างอิง (Ref):</b> ${d}
<b>ชื่อสมาชิก:</b> ${params.bankAccountName}
<b>เลขที่บัญชีสมาชิก:</b> ${params.bankAccountNumber}
<b>จำนวนเงินที่ฝาก:</b> ${user.amount} บาท
<b>ประเภทธุรกรรม:</b> ฝากเงิน
<b>ฝากเข้าบัญชี:</b> ${user.fron_bank}
<b>จำนวนครั้งที่ฝากวันนี้:</b> ${count} 
<b>เวลาตามสลิป:</b> ${moment(user.time_create).format("YYYY-MM-DD HH:mm:ss")}
</code></pre>

<i><b>หมายเหตุ:</b> ${moment(user.date_creat).fromNow()} </i>
`;

  let datanoti = {
    msg: msg,
    tpye: "success",
    type_option: "deposit",
    data: {
      ref: d,
      name_member: params.bankAccountName, // Use member's name
      amount: user.amount, // Use deposit amount
      type_option: "ฝากเงิน",
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
async function get_Requeววววst_All(params) {
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
async function get_Request_All(params) {
  // Get the start and end of today

  let bodyBankAccounst = await Request_All.findAll({
    where: {
      // accountType: "deposit",
      //  bankAccount_id: params,
      type_status: "ฝากเงิน",
      status_pay: 1,
      // Filter for records created today
    },
  });

  //console.log(bodyBankAccount)

  return bodyBankAccounst;
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

async function depositallScb(member, acc) {
  const dataall = [];

  for (const rr of conRes(member)) {
    let bodyBankAccount = "";

    // console.log(rr);

    if (rr.to_bank == "SCB") {
      //console.log(rr)
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
      let rrto = rr.to_bank;

      bodyBankAccount = await Member.findOne({
        include: [
          {
            as: "Bank",
            model: Bank,
            where: {
              bank_id: rr.to_bank,
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
    }

    if (bodyBankAccount) {
      //  console.log(bodyBankAccount);
      const combinedData = { ...bodyBankAccount.dataValues };
      let save_members = await save_member(combinedData, rr, acc);
      //
      //
      dataall.push(combinedData);
    } else {
      //  const combinedData2 = { ...bodyBankAccount.dataValues };

      //   console.log(rr);
      let save_members = await save_membervertify(rr, acc);
    }
  }
  return dataall;
  //
}
function normalizeName(name) {
  // ลบเครื่องหมาย "+" ทั้งหมดออกจากชื่อ
  name = name.replace(/\++/g, "");

  // ลบช่องว่างนำหน้าและต่อท้าย และแปลงเป็นตัวพิมพ์เล็ก
  name = name.trim().toLowerCase();

  // ลบคำนำหน้าชื่อทั่วไป (ปรับ regex ตามความจำเป็น)
  name = name.replace(
    /^(mrs\.|miss|ms\.|mr\.|dr\.|นางสาว|น\.ส\.|นาง|นาย|ด\.ช\.|ด\.ญ\.)\s+/i,
    ""
  );
  const create_deposit_new = async function (req, res) {
    let body = req.body;

    let chackCreate_deposits = await Create_deposits.findOne({
      include: [
        {
          as: "members",
          model: Member,
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
          where: { userId: body.userId },
        },
      ],
      where: {
        status: "pending",
        createdAt: {
          [Op.gte]: moment().subtract(15, "minutes"), // Check if created within the last 15 minutes
        },
      },
    });

    if (!chackCreate_deposits) {
      let members = await Member.findOne({
        where: {
          userId: body.userId,
        },
      });

      let create_deposits = await Create_deposits.create({
        member_id: members.id,
        customerName: members.bankAccountName,
        customerAccountNo: members.bankAccountNumber,
        customerBankCode: members.bankId,
        qrExpireTime: "",
        amount: body.amount,
        status: "pending",
      });

      console.log(create_deposits);
      chackCreate_deposits = create_deposits; // Assign the newly created deposit to chackCreate_deposits
    }

    console.log(chackCreate_deposits);

    return ReS(res, {
      data: chackCreate_deposits,
      code: 200,
      message: "success",
    });
  };

  // แทนที่ช่องว่างหลายช่องด้วยช่องว่างเดี่ยว
  name = name.replace(/\s+/g, " ");

  return name;
}

async function depositall(member, acc) {
  const dataall = [];
  // console.log(acc.merchantId)
  for (const rr of conRes(member)) {
    let bodyBankAccount = "";

    if (rr.to_bank == "kbank") {
      let normalizedEnglish = "";
      // "jintana sud"
      let normalizedThai = ""; // "นาย ธีระศักดิ์ แซ่++"

      let rrto = rr.name_to;

      if (typeof rrto === "string") {
        normalizedEnglish = normalizeName(rrto);
        normalizedThai = normalizeName(rrto);
      }

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

        console.log(rrto);
        // console.log(normalizedThai);
      } else {
        console.error("rr.name_to is not a string");
      }

      bodyBankAccount = await Member.findOne({
        include: [
          {
            as: "Bank",
            model: Bank,
            // where: {
            //   bank_id: rr.to_bank.toLowerCase(),
            // },
          },
        ],
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

      let rrto = rr.to_bank;

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

      console.log(bodyBankAccount);
      //  console.log(bodyBankAccount);
      // const combinedData = { ...bodyBankAccount.dataValues };
      // let save_members = await save_member(combinedData, rr, acc);
      // //
      // //
      // dataall.push(combinedData);
    } else {
      //  let save_members = await save_membervertify(rr, acc);
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

async function depositallkrungthai(member, acc) {
  const dataall = [];

  for (const rr of conRes(member)) {
    let bodyBankAccount = await Member.findOne({
      include: [
        {
          as: "Bank",
          model: Bank,
          where: {
            bank_id: rr.to_bank,
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
    // console.log(bodyBankAccount)
    if (bodyBankAccount) {
      const combinedData = { ...bodyBankAccount.dataValues };

      // console.log(bodyBankAccount)
      let save_members = await save_memberkrunthai(combinedData, rr, acc);
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
      socket.emit("ready_to_getdeposit", teamParticipant);
      if (element.channel == "scb-easy") {
        let datapost = {
          accountNo: element.accountNumber,
        };

        let gosace = await Apichack_history_by.chack_history_by(datapost);
        console.log(gosace);
        //let datachack = await getall_member(element.merchantId);
        let get_Request_Alls = await get_Request_All(element.id);
        //console.log(get_Request_Alls);
        if (get_Request_Alls.length > 0) {
          let chack_depositall = await depositallScb(get_Request_Alls, element);
        }

        //
      } else if (element.channel == "k-biz") {
        let datapost = {
          accountNo: element.accountNumber,
        };
        let gosace = await Apichack_history_by.chack_history_by(datapost);
        // console.log(gosace)
        let get_Request_Alls = await get_Request_All(element.id);
        console.log(get_Request_Alls)
        if (get_Request_Alls.length > 0) {
          // [err, user_data] = await to(depositscb(element));

          let chack_depositall = await depositall(get_Request_Alls, element);
        }

        // let chack_auth = await Apiscb_helper.chack_auth(element.auth);
        //console.log(chack_auth.data)
      } else if (element.channel == "krungsribizonline") {
        let gosace = await pay_krungsribizonline(element);

        let get_Request_Alls = await get_Request_All(element.id);

        if (get_Request_Alls.length > 0) {
          for (const element of get_Request_Alls) {
            console.log(element);
          }
          //   //   // console.log(get_Request_Alls)
          //   //   // [err, user_data] = await to(depositscb(element));

          //  let chack_depositall = await depositallbay(get_Request_Alls, element);
        }
      } else if (element.channel == "KTB_NEX") {
        let gosace = await getdata_trankrungthai(element);

        let get_Request_Alls = await get_Request_All(element.id);
        //  console.log(get_Request_Alls)
        if (get_Request_Alls.length > 0) {
          //   //   // console.log(get_Request_Alls)
          //   //   // [err, user_data] = await to(depositscb(element));

          let chack_depositall = await depositallkrungthai(
            get_Request_Alls,
            element
          );
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
  const startDate = moment().add(-30, "days").startOf("day").toDate();
  const endDate = moment().add(-7, "days").endOf("day").toDate();

  console.log(startDate);
  console.log(endDate);

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
      },
      {
        model: Request_All,
        as: "transaction_bank",
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
      },
    ],
    where: {
      // status: "pending",
      //type_option: "ฝาก",
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },

    limit: 50,
  });

  // console.log(`Found ${bodyBankAccount.length} pending transactions to process.`); // Log total count

  let totalLoopTime = 0; // Variable to track total time

  for (const rr of conRes(bodyBankAccount)) {
    const iterationStartTime = performance.now();

    // Start time for this iteration
    console.log(rr);
  }

  return 1;
}

async function setapicallback7(params) {
  //console.log(params);
  const startDate = moment().startOf("day").toDate();
  const endDate = moment().endOf("day").toDate();

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
      created_at: {
        [Op.between]: [startDate, endDate],
      },
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
          longtext_res: jss,
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
  // let user = await setapicallback(goto?.data);

  return ReS(res, {
    //  data: user,
    code: 1000,
    message: "confirm_account success",
  });
};
const getdepositall2 = async function (req, res) {
  let body = req.body;

  // socket.emit("sendNotification_linebot", "5555555555555555");

  //  let goto = await getdepositalls();

  // console.log(goto)
  let user = await setapicallback();

  return ReS(res, {
    //  data: user,
    code: 1000,
    message: "confirm_account success",
  });
};
function conRes(res) {
  return JSON.parse(JSON.stringify(res));
}
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
  let tran = await gettranDecode(accountData);

  let bankup = await BankAccount.update(
    { balance: tran.availableBalance },
    {
      where: {
        id: params.id,
      },
    }
  );

  // accountData.transactions.forEach(transaction => {
  //   transaction.balance = parseFloat(parseFloat(transaction.balance).toFixed(2));
  // });
  let accountDataInsert_datadep_krungthai =
    await ApiKruthai_helper.Insert_datadep_krungthai(tran, params);

  //console.log(accountDataInsert_datadep_krungthai);
  return accountDataInsert_datadep_krungthai;
  // console.log(accountDataInsert_datadep_krungthai);
}

//let data =
const getdepositalltest = async function (req, res) {
  // let datatest = await ApiKruthai_helper.getkrungthai_datainfobank();

  //let teamParticipant = "555555555555555555"

  // socket.emit("ready_to_getdeposit", teamParticipant);
  return ReS(res, {
    // data: datatest,
    code: 1000,
    message: "confirm_account success",
  });
};

async function create_Create_notify(params) {
  let d = generateUuid();
  let datassave = {
    notification_title: "แจ้งเตือน",
    notification_text: `บัญชี ${params.channel} เลขบัญชี ${params.accountNumber}  ชื่อ ${params.name} ถูก ${params.status_bank}`,

    notification_logjson: `บัญชี ${params.channel} เลขบัญชี ${params.accountNumber}  ชื่อ ${params.name} ถูก ${params.status_bank}`,
    is_read: 1,
    master_notification_id: params.id,
    type: "bank_notification",
  };

  let chack = await Create_notify.findOne({
    where: {
      master_notification_id: params.id,
      type: "bank_notification",
    },
  });

  if (!chack) {
    let create_noti = await Create_notify.create(datassave);

    return { status: true, data: create_noti };
  } else {
    return { status: false, data: null };
  }

  // return datassave;
}

async function chackbank(params) {
  const notifications = [];
  for (const rr of conRes(params)) {
    if (rr.status_bank === "Delete") {
      let create_noti = await create_Create_notify(rr);
      if (create_noti.status) {
        notifications.push(create_noti.data);
      }
    } else if (rr.status_bank === "Banned") {
      let create_noti = await create_Create_notify(rr);
      if (create_noti.status) {
        notifications.push(create_noti.data);
      }
    }
  }
  return notifications;
}

const botchack_nonebank = async function (req, res) {
  // ... other code ...

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

  if (!bankAccounts) {
    // Handle the case where no bank accounts are found
    return ReE(res, {
      code: 404,
      message: "No active bank accounts found.",
    });
  }

  let datachack_banklitmit_and = await BankAccount.findAll({});

  let chackbanks = await chackbank(datachack_banklitmit_and);

  if (chackbanks.length > 0) {
    for (const notification of chackbanks) {
      let msg = `
      <b>🏛️ แจ้งเตือน: บัญชี ถูก Ban หรือ ถูกลบออกจากระบบ </b>
      <pre><code style="background-color: #FFC107; color: black; padding: 10px; border-radius: 5px;">
      <b>รายละเอียด:</b> ${notification.notification_text}
      <b>เวลาที่แจ้งเตือน:</b> ${moment(notification.createdAt).format(
        "YYYY-MM-DD HH:mm:ss"
      )}
      </code></pre>
      <i><b>หมายเหตุ:</b> ${moment(notification.createdAt).fromNow()}</i>
      `;

      let datanoti = {
        msg: msg,
        tpye: "worning", // Changed to 'worning' for deleted accounts
        type_option: "notify",
        data: {
          type_option: "notify",
          nodere: notification.notification_text,
        },
      };
      await Notify.sendTelegram(datanoti);
    }
  }

  //
  //console.log(datachack_banklitmit_and)
  return ReS(res, {
    data: chackbanks,
    code: 1000,
    message: "Bank account deletion check completed.",
  });
};
// const botchack_nonebank = async function (req, res) {
//   // let datatest = await ApiKruthai_helper.getkrungthai_datainfobank();

//   let err, bankAccounts;

//   [err, bankAccounts] = await to(
//     BankAccountGroup.findOne({
//       include: [
//         {
//           model: BankAccount,
//           as: "bankAccounts",
//           include: [
//             {
//               model: Systemsettings,
//               as: "setting", // Use the correct alias from your model definition
//               attributes: {
//                 include: [],
//                 exclude: ["deleted_at", "created_at", "updated_at"],
//               },
//             },
//           ],
//           where: {
//             accountType: "deposit",
//             status_bank: "Active",
//             //channel:"krungsribizonline"
//           },

//           required: true,
//         },
//       ],
//       where: {
//         isActive: 1,
//       },
//       // order: [["id", "ASC"]],
//     })
//   );

//   if (!bankAccounts) {
//   }

//   let datachack_banklitmit_and = await BankAccount.findAll({});

//   let chackbanks = await chackbank(datachack_banklitmit_and);

//   if (chackbanks.status == true) {
//     let msg = `
//     <b>🏛️ แจ้งเตือน:มียอดฝาก  มาใหม่ ✅</b>
//     <pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
//     <b>หมายเลขอ้างอิง (Ref):</b> ${d}
//     <b>ชื่อสมาชิก:</b> ${params.bankAccountName}
//     <b>จำนวนเงินที่ฝาก:</b> ${user.amount} บาท
//     <b>ประเภทธุรกรรม:</b> ฝากเงิน
//     <b>ฝากเข้าบัญชี:</b> ${user.fron_bank}
//     <b>เลขที่บัญชีสมาชิก:</b> ${params.bankAccountNumber}
//     <b>เวลาตามสลิป:</b> ${moment(user.time_create).format(
//       "YYYY-MM-DD HH:mm:ss"
//     )}
//     </code></pre>

//     <i><b>หมายเหตุ:</b> ${moment(user.date_creat).fromNow()} </i>
//     `;

//     let datanoti = {
//       msg: msg,
//       tpye: "success",
//       type_option: "notify",
//       data: {
//         type_option: "notify",
//         nodere: chackbanks.data.notification_text,
//       },
//     };
//     await Notify.sendTelegram(datanoti);
//   }

//   //
//   //console.log(datachack_banklitmit_and)
//   return ReS(res, {
//     // data: datatest,
//     code: 1000,
//     message: "confirm_account success",
//   });
// };

const gtdata_deposit = async function (req, res) {
  let body = req.body;
  const startDate = new Date(
    moment().startOf("day").format("YYYY-MM-DD HH:mm")
  );
  const endDate = new Date(moment().endOf("day").format("YYYY-MM-DD HH:mm"));
  //console.log(startDate);
  //console.log(endDate);
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
    where: {
      type_option: "ฝาก",
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },
    offset: body.offset,
    limit: body.limit,
    order: [["id", "desc"]],
  });
  let transactionsp = await Request_All.findAndCountAll({
    where: {
      status_pay: 1,
      // created_at: {
      //   [Op.between]: [startDate, endDate],
      // },
    },
    offset: body.offset,
    limit: body.limit,
    order: [["id", "desc"]],
  });
  return ReS(res, {
    data: transactions,
    datapanding: transactionsp,
    code: 1000,
    startDate: startDate,
    endDate: endDate,
    message: "success",
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
    type_option: "ฝาก",
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
      type_option: "ฝาก",
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

  let chacklogin = await getPortfolioData(params);

  let chackstatemen = await statementInquiryResult_today();

  //console.log(chackstatemen.data.Statements)

  let chack = await krungsribizonlineDep.Insert_datadep_krungsribizonline(
    chackstatemen.data.Statements,
    params
  );
  return true;
}

async function statementInquiryResult_today() {
  const axios = require("axios");

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://localhost:1333/api/v1/auth/statementInquiryResult_today",
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6Imhhd2tzZXllIiwibWVyY2hhbnRJZCI6NiwidXNlcl90eXBlIjoiYWRtaW4iLCJ1c2VyX2RldmljZV9pZCI6IjI1MDEwMDY0NjQ1MzczNjEzMzAwMDUzNzM2NTEwODAxOTIwMjQiLCJpYXQiOjE3NDI4MTQ4OTYsImV4cCI6MTc0Mjk4NzY5Nn0.ocVEKgJqTqzF-5EVJU90UOIEUAxU-7ar3D0yTKCjArA",
    },
  };

  const dataresut = await axios.request(config);
  return dataresut.data;
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
    url: "http://localhost:1333/api/v1/auth/chack_loginkrungsribizonline",
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

  let chack_bankserver = await chackauth_tokenbankserver();

  let bankacc = await chackbank_tokenbankserver(chack_bankserver.data.token);
  console.log(bankacc.data);

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
    bank: bankacc.data.data,
  };

  let datachack = await Apiscb_helperchack_auth(
    datapostlogin,
    chack_bankserver.data.token
  );

  // let datachack = await Apiscb_helper.chack_auth(user.auth);

  // let datare = await gettrankbank(datapostlogin);

  // let name_en = datare.data.data.beneficiaryName;

  // let memberupdate = await Member.update(
  //   {
  //     bankAccountName_En: name_en,
  //   },
  //   {
  //     where: {
  //       id: members.id,
  //     },
  //   }
  // );

  return ReE(res, {
    data: datapostlogin,
    message: "Error",
  });
};

async function chackauth_tokenbankserver(params) {
  const axios = require("axios");
  let data = JSON.stringify({
    accessKey: "832ec7f1-5471-4fc8-9641",
    secretKey: "9641-4c42f874940e",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://localhost:1331/api/v2/scb/genared_token",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  return await axios.request(config);
}

async function Apiscb_helperchack_auth(params, token) {
  const axios = require("axios");
  let data = JSON.stringify(params);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://localhost:1331/api/v2/scb/genared_verrify",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  return await axios.request(config);
  // console.log(params)
}

async function chackbank_tokenbankserver(params) {
  const axios = require("axios");

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "http://localhost:1331/api/v2/scb/genared_chackbank",
    headers: {
      Authorization: `Bearer ${params}`,
    },
  };

  return await axios.request(config);
}

const backupData = async (requestAllData, transactionData) => {
  try {
    // ตัวอย่าง: บันทึกข้อมูลลงในไฟล์ JSON

    const backupDir = path.join(__dirname, "devies");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log(`Directory created: ${backupDir}`);
    }

    const backupObject = {
      Request_All: requestAllData,
      TransactionsV2: transactionData,
      timestamp: new Date().toISOString(),
    };

    let dataoff = await fs.writeFile(
      backupFileName,
      JSON.stringify(backupObject, null, 2)
    );

    const backupFileName = path.join(
      backupDir,
      `backup_${new Date().toISOString()}.json`
    );

    //   console.log(`Data backed up to ${backupFileName}`);

    // ตัวอย่าง: ส่งข้อมูลไปยัง API สำรอง
    // const axios = require('axios');
    // await axios.post('YOUR_BACKUP_API_ENDPOINT', backupObject);

    // ตัวอย่าง: บันทึกข้อมูลลงฐานข้อมูลสำรอง
    // await BackupRequestAll.bulkCreate(requestAllData);
    // await BackupTransaction.bulkCreate(transactionData);
  } catch (error) {
    console.error("Error backing up data:", error);
  }
};

const bot_chackdata_lastday = async function (req, res) {
  try {
    // Calculate the start date (3 days ago)
    const startDate = moment().subtract(3, "days").startOf("day").toDate();

    // Find all Request_All records *before* the start date (more than 3 days ago)
    const data_Request_All = await Request_All.findAll({
      where: {
        created_at: {
          [Op.lt]: startDate, // Less than startDate (before 3 days ago)
        },
        status_pay: 1,
      },
      order: [["created_at", "DESC"]],
    });

    // Find all TransactionsV2 records *before* the start date (more than 3 days ago)
    const data_Transaction = await TransactionsV2.findAll({
      where: {
        created_at: {
          [Op.lt]: startDate, // Less than startDate (before 3 days ago)
        },
      },
      order: [["created_at", "DESC"]],
    });

    //   const backupObject = {
    //     Request_All: data_Request_All,
    //     TransactionsV2: data_Transaction,
    //     timestamp: new Date().toISOString(),
    //   };

    //   const backupFileName = `backup_${new Date().toISOString()}.json`;
    //   await fs.writeFile(backupFileName, JSON.stringify(backupObject, null, 2));

    //   console.log(`Data backed up to ${backupFileName}`);

    let max = await Apicllbackup.bot_chackdata_lastday(
      data_Request_All,
      data_Transaction
    );

    return ReS(res, {
      data: {
        Request_All: data_Request_All,
        TransactionsV2: data_Transaction,
        startDate: startDate, // Still useful to know the cutoff
      },
      code: 1000,
      message: "Successfully retrieved data from before the last 3 days.",
    });
  } catch (error) {
    console.error("Error in bot_chackdata_lastday:", error);
    return ReE(res, {
      code: 500,
      message: "An error occurred while retrieving data.",
    });
  }
};

const bot_chackdata_lastdays = async function (req, res) {
  try {
    // Calculate the start date (3 days ago)
    const startDate = moment().subtract(3, "days").startOf("day").toDate();

    // Find all Request_All records *before* the start date (more than 3 days ago)
    const data_Request_All = await Request_All.findAll({
      where: {
        created_at: {
          [Op.lt]: startDate, // Less than startDate (before 3 days ago)
        },
        status_pay: 1,
      },
      order: [["created_at", "DESC"]],
    });

    // Find all TransactionsV2 records *before* the start date (more than 3 days ago)
    const data_Transaction = await TransactionsV2.findAll({
      where: {
        created_at: {
          [Op.lt]: startDate, // Less than startDate (before 3 days ago)
        },
      },
      order: [["created_at", "DESC"]],
    });

    let max = await Apicllbackup.bot_chackdata_lastday(
      data_Request_All,
      data_Transaction
    );

    if (max) {
      return ReS(res, {
        data: {
          Request_All: data_Request_All,
          TransactionsV2: data_Transaction,
          startDate: startDate, // Still useful to know the cutoff
        },
        code: 1000,
        message: "Successfully retrieved data from before the last 3 days.",
      });
    } else {
      return ReE(res, {
        code: 500,
        message: "Error backing up data.",
      });
    }
  } catch (error) {
    console.error("Error in bot_chackdata_lastday:", error);
    return ReE(res, {
      code: 500,
      message: "An error occurred while retrieving data.",
    });
  }
};

const sms_forword = async function (req, res) {
  let body = req.body;

  console.log(chack);

  return ReS(res, {
    code: 200,
    message: "success",
  });
};

const create_deposit = async function (req, res) {
  let body = req.body;

  let chack = await CreateDeposit.findAll({
    where: {
      status: "pending",
    },
  });
  console.log(chack);

  return ReS(res, {
    code: 200,
    message: "success",
  });
};
async function generatePaymentQRCode(amount, accountNumber) {
  const amountNumber = parseFloat(amount);
  const payload = generatePayload(accountNumber, { amount: amountNumber });

  // สร้าง QR Code ในรูปแบบ Base64
  // const qrCodeBase64 = await qrcode.toDataURL(payload, { type: "image/png" });

  return payload;
}
const create_deposit_new = async function (req, res) {
  try {
    const body = req.body;

    // Validate request body
    if (!body.customerUuid) {
      return ReE(res, { message: "Customer information (customerUuid) is required and must be an object." }, 400);
    }

    const { customerUuid, referenceId } = body;
    if (!customerUuid || !referenceId) {
      return ReE(res, { message: "All fields in customerUuid are required." }, 400);
    }

    if (typeof body.amount !== "number" || body.amount <= 0) {
      return ReE(res, { message: "Amount must be a positive number." }, 400);
    }

    if (!body.referenceId) {
      return ReE(res, { message: "Reference ID (referenceId) is required." }, 400);
    }

    let data_cus = await Customers.findOne({ where: { customer_uuid: customerUuid } });
    if (!data_cus) {
      return ReE(res, { message: "customer_uuid is required." }, 400);
    }
    // Generate QR Code
    const qrExpireTimew = generateQrExpireTime(10);
    const decimal = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    const amounts = parseFloat(body.amount) + "." + decimal;
    let databanlacc = await BankAccount.findOne({
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
      where: {
        accountType: "deposit",
        status_bank: "Active",
      },
    });

    if (!databanlacc) {
      return ReE(res, { message: "ไม่พบธนาคาร" }, 200); // Use 500 Internal Server Error
    }


    const accountNumber = databanlacc.telephoneNumber;





    // const accountNumber = "0043329989";
    const qrCode = await generatePaymentQRCode(amounts, accountNumber);

    // Fetch merchant data
    const datamer = await Merchant.findOne({ where: { id: req.user.id } });
    if (!datamer) {
      return ReE(res, { message: "Merchant not found." }, 404);
    }

    const transactionAmountlet = datamer.balance;
    const transactionAmount = parseFloat(body.amount);

    if (transactionAmountlet < transactionAmount) {
      return ReE(res, { message: "Insufficient balance." }, 400);
    }

    // Prepare transaction data
    const newTransactionData = {
      logUuid: generateUuid(),
      clientCode: "",
      qrcode: qrCode,
      slip_url: "",
      partnerCode: req.user.id,
      referenceId: body.referenceId,
      merchantOrderId: body.referenceId,
      platformOrderId: generateUuid(),
      customer: body.customerUuid,
      amount: transactionAmount,
      transferAmount: transactionAmount,
      currency: "THB",
      settleCurrency: "THB",
      type: "deposit", // Changed from "withdraw" to "deposit"
      status: "PENDING",
      note: body.note || body.remark || "Deposit request",
      eventCreatedAt: Date.now(),
      eventUpdatedAt: Date.now(),
      bank: {
        accountNo: data_cus.account_no,
        accountName: data_cus.name,
        bankCode: data_cus.bank_code,
      },
      rate: 1,
      channelName: req.user.name || "DEFAULT_CHANNEL",
      fee: 0,
      feePlatform: 0,
      feeSale: 0,
      feePartner: 0,
      settleAmount: transactionAmount,
      settleRate: 1,
      rateDisplay: 1,
      refUuid: body.referenceId,
      feePayment: 0,
      profit: 0,
      balance: transactionAmountlet - transactionAmount,
      updatedBy: req.user ? req.user.username : "system",
    };

    // Update merchant balance
    await Merchant.update(
      { balance: transactionAmountlet - transactionAmount },
      { where: { id: datamer.id } }
    );

    // Create transaction
    const [err, transaction] = await to(TransactionsV2.create(newTransactionData));
    if (err) {
      console.error("Failed to create deposit transaction:", err);
      return ReE(res, { message: "Failed to create deposit transaction.", error: err.message }, 500);
    }

    return ReS(res, { data: transaction, message: "Deposit request created successfully." }, 201);
  } catch (error) {
    console.error("Error in createDeposit function:", error);
    const errorMessage = error.response?.data?.message || "An unexpected error occurred during deposit creation.";
    const errorData = error.response?.data || error.message;
    return ReE(res, { data: errorData, message: errorMessage }, error.status || 500);
  }
};

function generateQrExpireTime(minutes = 10) {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + minutes * 60000);
  return expiryDate.getTime();
}

async function generatePaymentQRCode(amount, accountNumber) {
  const amountNumber = parseFloat(amount);
  const payload = generatePayload(accountNumber, { amount: amountNumber });
  return payload;
}


const create_deposit_new_v2 = async function (req, res) {
  try {
    // 1. รับค่าจาก request body
    let body = req.body;
    const { customerUuid, referenceId } = body;



    if (!customerUuid || !referenceId) {
      return ReE(res, { message: "All fields in customerUuid are required." }, 400);
    }

    if (typeof body.amount !== "number" || body.amount <= 0) {
      return ReE(res, { message: "Amount must be a positive number." }, 400);
    }

    if (!body.referenceId) {
      return ReE(res, { message: "Reference ID (referenceId) is required." }, 400);
    }

    function generateQrExpireTime(minutes = 10) {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + minutes * 60000); // แปลงนาทีเป็น milliseconds
      return expiryDate.getTime();
    }

    // 2. กำหนดเวลาหมดอายุสำหรับรายการใหม่
    const qrExpireTimew = generateQrExpireTime(10);

    // 3. กำหนดจำนวนเงิน (ใช้ค่าจาก body โดยตรง ไม่ต้องเพิ่มเศษสตางค์สุ่ม ถ้าไม่จำเป็น)
    let amounts = parseFloat(body.amount); // แปลงจำนวนเงินเป็นตัวเลขทศนิยม

    // 4. ค้นหาบัญชีธนาคารสำหรับฝากเงินที่ Active
    // ควรมี logic เลือกบัญชีที่เหมาะสมกว่านี้ หากมีหลายบัญชี
    let bodyBankAccount = await BankAccount.findOne({
      where: {
        accountType: "deposit",
        status_bank: "Active",
        merchantId: req.user.id,
      },
    });

    // ค้นหาการตั้งค่าค่าธรรมเนียมการทำธุรกรรม
    const TransactionFeeSettings = await TransactionFeeSetting.findOne({ where: { merchantId: req.user.id } });

    // ตรวจสอบว่ามีการตั้งค่าค่าธรรมเนียมหรือไม่ และค่าธรรมเนียมเป็นตัวเลขที่ถูกต้อง
    const depositFeePercentage = TransactionFeeSettings ? parseFloat(TransactionFeeSettings.depositFeePercentage) : 0;

    // คำนวณจำนวนเงินหลังหักค่าธรรมเนียม (หักค่าธรรมเนียมเป็นเปอร์เซ็นต์จาก amounts)
    // ตัวอย่าง: ถ้า amounts = 100 และ depositFeePercentage = 5 (%)
    // ค่าธรรมเนียม = 100 * (5 / 100) = 5
    // amounts_tranfger = 100 - 5 = 95
    const amounts_tranfger = amounts - (amounts * (depositFeePercentage / 100));




    if(amounts < req.user.deposit_minlimit) {

      return ReE(res, { message: "ฝากเงิน ขั้นต่ำ "+req.user.deposit_minlimit, code: 404 }, 404);

    }
    // console.log(TransactionFeeSettings)

    // 5. ค้นหารายการฝากเงินที่สถานะ PENDING สำหรับสมาชิกคนนี้
    const existingDeposit = await Create_deposits.findOne({
      include: [
        {
          as: "BankAccounts",
          model: BankAccount,
          attributes: ["accountNumber", "telephoneNumber", "accountName", "id"],
          required: true,

          where: { merchantId: req.user.id }, // หากต้องการกรองตาม userId ใน BankAccount
        },

      ],
      where: {
        status: "PENDING",
        customerUuid: body.customerUuid,
      },
    });

    // 6. ค้นหาข้อมูลสมาชิก
    let customer = await Customers.findOne({
      where: {
        customer_uuid: body.customerUuid,
        merchantId: req.user.id,
      },
    });

    if (!customer) {


      return ReE(res, { message: "ไม่พบ customer", code: 404 }, 404);


    }


    //console


    if (bodyBankAccount && bodyBankAccount.channel == "ktb-business") {


      const accountNumber = bodyBankAccount.telephoneNumber;
      const qrCode = await generatePaymentQRCode(amounts, accountNumber);
      // 7. ตรวจสอบรายการ PENDING ที่มีอยู่
      if (existingDeposit) {
        const currentTime = new Date().getTime();



        // หากรายการ PENDING ที่มีอยู่หมดอายุแล้ว ให้อัปเดตสถานะเป็น expired
        if (existingDeposit.expires_at && currentTime > existingDeposit.expires_at) {
          console.log("รายการ PENDING ที่มีอยู่หมดอายุแล้ว (Expired)");
          await Create_deposits.update(
            { status: "expired" },
            { where: { id: existingDeposit.id } }
          );
        } else {
          // หากรายการ PENDING ที่มีอยู่ยังไม่หมดอายุ ให้คืนรายการนั้นกลับไป
          console.log("พบรายการ PENDING ที่ยังไม่หมดอายุ");
          // ดึงข้อมูลรายการ PENDING ที่มีอยู่พร้อม include relations อีกครั้ง


          await Create_deposits.update(
            { status: "expired" },
            { where: { id: existingDeposit.id } }
          );


          let create_deposits = await Create_deposits.create({
            customerUuid: customer.customer_uuid,
            merchantId: req.user.id,
            customerName: customer.name,
            bankAccount_id: bodyBankAccount.id,
            customerAccountNo: customer.account_no,
            customerBankCode: customer.bank_code,
            qrExpireTime: qrExpireTimew,
            referenceId: req.body.referenceId,
            qrType: "QR_PAY",
            uuid: generateUuid(),
            qrCode: qrCode,
            transferAmount: amounts_tranfger,
            amount: amounts,
            status: "PENDING",
            expires_at: qrExpireTimew,
          });

          // ดึงข้อมูลรายการที่สร้างใหม่พร้อม include relations
          const existingDepositv1 = await Create_deposits.findOne({
            include: [

              {
                as: "BankAccounts",
                model: BankAccount,
                attributes: ["accountNumber", "telephoneNumber", "accountName", "id"],
                required: true,
                // where: { customer_uuid: body.customer_uuid },
              },
            ],
            where: { id: create_deposits.id },
          });
          let datareteun = {
            urlpay: `https://qrpay.payeasy88-xtb.info/?uuid=${create_deposits.uuid}`,
            qrCode: qrCode,
            uuid: create_deposits.uuid,
            qrExpireTime: create_deposits.qrExpireTime,
            full_data: existingDepositv1
          };
          // 9. ส่งข้อมูลรายการที่สร้างใหม่กลับไป
          return ReS(res, {
            data: datareteun,
            code: 200,
            message: "success",
          });
        }
      }

      // 8. สร้างรายการฝากเงินใหม่ (กรณีไม่มีรายการ PENDING หรือรายการ PENDING เดิมหมดอายุแล้ว)
      console.log("สร้างรายการฝากเงินใหม่");
      if (!bodyBankAccount) {
        // Handle case where no active deposit bank account is found
        console.error("ไม่พบบัญชีธนาคารสำหรับฝากเงินที่ Active");
        return ReE(res, { message: "ไม่พบบัญชีธนาคารสำหรับฝากเงินที่ Active", code: 404 }, 404);
      }

      // สร้างรายการใหม่
      try {
        let create_deposits = await Create_deposits.create({
          customerUuid: customer.customer_uuid,
          merchantId: req.user.id,
          customerName: customer.name,
          bankAccount_id: bodyBankAccount.id,
          referenceId: req.body.referenceId,
          customerAccountNo: customer.account_no,
          customerBankCode: customer.bank_code,
          qrExpireTime: qrExpireTimew,
          qrType: "QR_PAY",
          qrCode: qrCode,
          uuid: generateUuid(),
          transferAmount: amounts_tranfger,
          amount: amounts,
          status: "PENDING",
          expires_at: qrExpireTimew,
        });

        // ดึงข้อมูลรายการที่สร้างใหม่พร้อม include relations
        const existingDepositv1 = await Create_deposits.findOne({
          include: [

            {
              as: "BankAccounts",
              model: BankAccount,
              attributes: ["accountNumber", "telephoneNumber", "accountName", "id"],
              required: true,
              // where: { customer_uuid: body.customer_uuid },
            },
          ],
          where: { id: create_deposits.id },
        });

        // 9. ส่งข้อมูลรายการที่สร้างใหม่กลับไป
        let datareteun = {
          urlpay: `https://qrpay.payeasy88-xtb.info/?uuid=${create_deposits.uuid}`,
          qrCode: qrCode,
          uuid: create_deposits.uuid,
          qrExpireTime: create_deposits.qrExpireTime,
          full_data: existingDepositv1
        };
        // 9. ส่งข้อมูลรายการที่สร้างใหม่กลับไป
        return ReS(res, {
          data: datareteun,
          code: 200,
          message: "success",
        });
      } catch (createError) {
        console.error("Error creating new deposit record:", createError);
        return ReE(res, { message: "เกิดข้อผิดพลาดในการสร้างรายการฝากเงินใหม่", code: 500 }, 500);
      }



    } else {

        return ReE(res, { message: "ไม่พบบัญชีธนาคารสำหรับฝากเงินที่ Active", code: 404 }, 404);


    }

  } catch (err) {
    // 10. จัดการข้อผิดพลาดทั่วไป
    console.error("Error in create_deposit_new_v2:", err);
    return ReE(res, { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", code: 500 }, 500);
  }
};

const create_deposit_new_v3 = async function (req, res) {
  try {
    // 1. รับค่าจาก request body
    let body = req.body;
    const { customerUuid, referenceId } = body;


    // console.log(req.user)



    if (!customerUuid || !referenceId) {
      return ReE(res, { message: "All fields in customerUuid are required." }, 400);
    }

    if (typeof body.amount !== "number" || body.amount <= 0) {
      return ReE(res, { message: "Amount must be a positive number." }, 400);
    }

    if (!body.referenceId) {
      return ReE(res, { message: "Reference ID (referenceId) is required." }, 400);
    }

    function generateQrExpireTime(minutes = 10) {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + minutes * 60000); // แปลงนาทีเป็น milliseconds
      return expiryDate.getTime();
    }

    // 2. กำหนดเวลาหมดอายุสำหรับรายการใหม่
    const qrExpireTimew = generateQrExpireTime(10);

    // 3. กำหนดจำนวนเงิน (ใช้ค่าจาก body โดยตรง ไม่ต้องเพิ่มเศษสตางค์สุ่ม ถ้าไม่จำเป็น)
    let amounts = parseFloat(body.amount); // แปลงจำนวนเงินเป็นตัวเลขทศนิยม

    // 4. ค้นหาบัญชีธนาคารสำหรับฝากเงินที่ Active
    // ควรมี logic เลือกบัญชีที่เหมาะสมกว่านี้ หากมีหลายบัญชี
    let bodyBankAccount = await BankAccount.findOne({
      where: {
        accountType: "deposit",
        status_bank: "Active",
      },
    });

    // ค้นหาการตั้งค่าค่าธรรมเนียมการทำธุรกรรม
    const TransactionFeeSettings = await TransactionFeeSetting.findOne({ where: { merchantId: req.user.merchantId } });

    // ตรวจสอบว่ามีการตั้งค่าค่าธรรมเนียมหรือไม่ และค่าธรรมเนียมเป็นตัวเลขที่ถูกต้อง
    const depositFeePercentage = TransactionFeeSettings ? parseFloat(TransactionFeeSettings.depositFeePercentage) : 0;

    // คำนวณจำนวนเงินหลังหักค่าธรรมเนียม (หักค่าธรรมเนียมเป็นเปอร์เซ็นต์จาก amounts)
    // ตัวอย่าง: ถ้า amounts = 100 และ depositFeePercentage = 5 (%)
    // ค่าธรรมเนียม = 100 * (5 / 100) = 5
    // amounts_tranfger = 100 - 5 = 95
    const amounts_tranfger = amounts - (amounts * (depositFeePercentage / 100));


    // console.log(TransactionFeeSettings)

    // 5. ค้นหารายการฝากเงินที่สถานะ PENDING สำหรับสมาชิกคนนี้
    const existingDeposit = await Create_deposits.findOne({
      include: [
        {
          as: "BankAccounts",
          model: BankAccount,
          attributes: ["accountNumber", "telephoneNumber", "accountName", "id"],
          required: true,
          // where: { userId: body.userId }, // หากต้องการกรองตาม userId ใน BankAccount
        },
      ],
      where: {
        status: "PENDING",
        customerUuid: body.customerUuid,
      },
    });

    // 6. ค้นหาข้อมูลสมาชิก
    let customer = await Customers.findOne({
      where: {
        customer_uuid: body.customerUuid,
      },
    });


    if (bodyBankAccount.channel == "ktb-business") {


      const accountNumber = bodyBankAccount.telephoneNumber;
      const qrCode = await generatePaymentQRCode(amounts, accountNumber);
      // 7. ตรวจสอบรายการ PENDING ที่มีอยู่
      if (existingDeposit) {
        const currentTime = new Date().getTime();



        // หากรายการ PENDING ที่มีอยู่หมดอายุแล้ว ให้อัปเดตสถานะเป็น expired
        if (existingDeposit.expires_at && currentTime > existingDeposit.expires_at) {
          console.log("รายการ PENDING ที่มีอยู่หมดอายุแล้ว (Expired)");
          await Create_deposits.update(
            { status: "expired" },
            { where: { id: existingDeposit.id } }
          );
        } else {
          // หากรายการ PENDING ที่มีอยู่ยังไม่หมดอายุ ให้คืนรายการนั้นกลับไป
          console.log("พบรายการ PENDING ที่ยังไม่หมดอายุ");
          // ดึงข้อมูลรายการ PENDING ที่มีอยู่พร้อม include relations อีกครั้ง


          await Create_deposits.update(
            { status: "expired" },
            { where: { id: existingDeposit.id } }
          );


          let create_deposits = await Create_deposits.create({
            customerUuid: customer.customer_uuid,
            merchantId: req.user.merchantId,
            customerName: customer.name,
            bankAccount_id: bodyBankAccount.id,
            customerAccountNo: customer.account_no,
            customerBankCode: customer.bank_code,
            qrExpireTime: qrExpireTimew,
            referenceId: req.body.referenceId,
            qrType: "QR_PAY",
            uuid: generateUuid(),
            qrCode: qrCode,
            transferAmount: amounts_tranfger,
            amount: amounts,
            status: "PENDING",
            expires_at: qrExpireTimew,
          });

          // ดึงข้อมูลรายการที่สร้างใหม่พร้อม include relations
          const existingDepositv1 = await Create_deposits.findOne({
            include: [

              {
                as: "BankAccounts",
                model: BankAccount,
                attributes: ["accountNumber", "telephoneNumber", "accountName", "id"],
                required: true,
                // where: { customer_uuid: body.customer_uuid },
              },
            ],
            where: { id: create_deposits.id },
          });
          let datareteun = {
            urlpay: `https://qrpay.payeasy88-xtb.info/?uuid=${create_deposits.uuid}`,
            qrCode: qrCode,
            uuid: create_deposits.uuid,
            qrExpireTime: create_deposits.qrExpireTime,
            full_data: existingDepositv1
          };
          // 9. ส่งข้อมูลรายการที่สร้างใหม่กลับไป
          return ReS(res, {
            data: datareteun,
            code: 200,
            message: "success",
          });
        }
      }

      // 8. สร้างรายการฝากเงินใหม่ (กรณีไม่มีรายการ PENDING หรือรายการ PENDING เดิมหมดอายุแล้ว)
      console.log("สร้างรายการฝากเงินใหม่");
      if (!bodyBankAccount) {
        // Handle case where no active deposit bank account is found
        console.error("ไม่พบบัญชีธนาคารสำหรับฝากเงินที่ Active");
        return ReE(res, { message: "ไม่พบบัญชีธนาคารสำหรับฝากเงินที่ Active", code: 404 }, 404);
      }

      // สร้างรายการใหม่
      try {
        let create_deposits = await Create_deposits.create({
          customerUuid: customer.customer_uuid,
          merchantId: req.user.merchantId,
          customerName: customer.name,
          bankAccount_id: bodyBankAccount.id,
          referenceId: req.body.referenceId,
          customerAccountNo: customer.account_no,
          customerBankCode: customer.bank_code,
          qrExpireTime: qrExpireTimew,
          qrType: "QR_PAY",
          qrCode: qrCode,
          uuid: generateUuid(),
          transferAmount: amounts_tranfger,
          amount: amounts,
          status: "PENDING",
          expires_at: qrExpireTimew,
        });

        // ดึงข้อมูลรายการที่สร้างใหม่พร้อม include relations
        const existingDepositv1 = await Create_deposits.findOne({
          include: [

            {
              as: "BankAccounts",
              model: BankAccount,
              attributes: ["accountNumber", "telephoneNumber", "accountName", "id"],
              required: true,
              // where: { customer_uuid: body.customer_uuid },
            },
          ],
          where: { id: create_deposits.id },
        });

        // 9. ส่งข้อมูลรายการที่สร้างใหม่กลับไป
        let datareteun = {
          urlpay: `https://qrpay.payeasy88-xtb.info/?uuid=${create_deposits.uuid}`,
          qrCode: qrCode,
          uuid: create_deposits.uuid,
          qrExpireTime: create_deposits.qrExpireTime,
          full_data: existingDepositv1
        };
        // 9. ส่งข้อมูลรายการที่สร้างใหม่กลับไป
        return ReS(res, {
          data: datareteun,
          code: 200,
          message: "success",
        });
      } catch (createError) {
        console.error("Error creating new deposit record:", createError);
        return ReE(res, { message: "เกิดข้อผิดพลาดในการสร้างรายการฝากเงินใหม่", code: 500 }, 500);
      }



    }

  } catch (err) {
    // 10. จัดการข้อผิดพลาดทั่วไป
    console.error("Error in create_deposit_new_v2:", err);
    return ReE(res, { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", code: 500 }, 500);
  }
};

const chack_deposit = async function (req, res) {

  let body = req.body;
  const { uuid } = body;


  // console.log(req.user)



  if (!uuid) {
    return ReE(res, { message: "uuid are required." }, 400);
  }



  const existingDepositv1 = await Create_deposits.findOne({
    include: [

      {
        as: "BankAccounts",
        model: BankAccount,
        attributes: ["accountNumber", "telephoneNumber", "accountName", "id"],
        required: true,
        // where: { customer_uuid: body.customer_uuid },
      },
    ],
    where: { uuid: body.uuid },
  });


  if (!existingDepositv1) {
    return ReE(res, { message: "เกิดข้อผิดพลาด ไม่เจอ uuid", code: 201 }, 201);

  }

  const existingDepositv1s = await TransactionsV2.findOne({

    where: { create_deposits_id: existingDepositv1.id },
  });
















  return ReS(res, {
    data: existingDepositv1s,
    code: 200,
    message: "success",
  });



}

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
  bot_chackdata_lastdays,
  getdepositalltest,
  botchack_nonebank,
  sms_forword,
  getdepositall2,
  create_deposit_new,
  create_deposit_new_v2,
  create_deposit_new_v3,
  chack_deposit
};
