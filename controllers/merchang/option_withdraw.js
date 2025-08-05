var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Admin,
  Member,
  TransactionsV2,
  Transaction_withdraw,
  Systemsettings,
  BankAccountGroup,
  Gatway_setting,
  Customers,
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
const Apipaynoex = require("../../apis/PayoneX");
const Apikrungsribizonline_helper = require("../../apis/krungsribizonline");
const Apichack_history_by = require("../auth/auth_controller");
const Apichack_transferconfirmation = require("./transferconfirmation");
const Apicllback = require("./api");
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IjRiZDIwM2Q4LTZkY2QtNGE4MC1iYjdlLTg2NDVlNzM2Y2NjNyIsInVzZXJfdHlwZSI6Ik1lcmNoYW50IiwiaWF0IjoxNzQwNjE2NDgxLCJleHAiOjE3NzIxNTI0ODF9.Ty61wohypWK4tcXIWJow7uK-SmKOALAoQ8vz_9uHQxk";

const config = require("../../config/app.json")[app["env"]];
//const date = require("date-and-time");
//const now = new Date();
const scbeasy = require("../scb/classscb");
const Notify = require("../../helpers/notify");
const scb = new scbeasy();
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
const io = require("socket.io-client");
var socket = io.connect(config["BASE_URL"], { reconnect: true });
const multer = require("multer");
const Jimp = require("jimp");
const jsQr = require("jsqr");
var md5 = require("md5");
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");
const urlendpoint = require("../../config/app.json")[app["env"]];

function generateUuid() {
  return uuidv4();
}

var moment = require("moment");
require("moment/locale/th");
const fs = require("fs");

async function updates_acc(params) {
  // console.log(params)

  let upnew = BankAccount.update(
    {
      // auth: params.auth,
      isActive: 1,

      balance: params.balance,
    },
    {
      where: {
        accountNumber: params.accountNumber,
      },
    }
  );

  return upnew;
}

async function fetchWrapper(...args) {
  const { default: fetch } = await import("node-fetch");
  return fetch(...args);
}

async function qr(url) {
  try {
    // Use the fetchWrapper
    const response = await fetchWrapper(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Load the image with Jimp
    const image = await Jimp.read(buffer);
    const { width, height, data } = image.bitmap;

    // Convert image data to a format jsQR can understand
    const qrCodeImageData = new Uint8ClampedArray(data.buffer);

    // Decode the QR code
    const qrCode = jsQr(qrCodeImageData, width, height);

    if (qrCode) {
      return qrCode.data;
    } else {
      console.log("No QR code found.");
      return null;
    }
  } catch (error) {
    console.error("Failed to decode QR code:", error);
    return null;
  }
}
async function getdatamerchang(params) {
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
      id: params,
    },
  });

  return datamer;
}
async function getWithdrawalTransactions_by(id) {
  try {
    const transactions = await TransactionsV2.findOne({
      include: [
        {
          model: Member,
          as: "members",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        type_option: "ถอน",
        id: id,
      },
      order: [["id", "desc"]],
    });

    if (
      !transactions ||
      !transactions.members ||
      !transactions.members.bankId
    ) {
      // Handle the case where transaction or member data is missing
      return null;
    }

    const dataall = await Bank.findOne({
      where: {
        id: transactions.members.bankId,
      },
    });

    return {
      ...transactions.toJSON(),
      bank: dataall ? dataall.toJSON() : null,
    };
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
}

//const kbankAccount_1 = require("../../kbank/dist/kbankAccount");

async function chack_balance(accountFroms) {
  if (accountFroms.channel == "scb-easy") {
    let chack_auth = await Apiscb_helper.chack_auth(accountFroms.auth);

    if (chack_auth.data.status.code == "1002") {
      let datalogin = {
        deviceId: accountFroms.deviceId,
        pin: accountFroms.pin,
        id: accountFroms.id,
        accountNo: accountFroms.accountNumber,
      };
      let auth_info, err, user, gologin;

      [err, gologin] = await to(Apiscb_helper.Loginbank_auth(datalogin));

      if (gologin.data.data.status.code == 1000) {
        accountFroms.auth = gologin.data.auth;
      }
    }

    let summey = await Apiscb_helper.balance(
      accountFroms.accountNumber,
      accountFroms.auth
    );

    if (summey.data.status.code == 1000) {
      return {
        balance: summey.data.totalAvailableBalance,
      };
    } else {
      return {
        balance: 0,
      };
    }
  } 
}

async function getWithdrawalTransactions_byv1(id, bankAccountNumber) {
  try {
    const transactions = await TransactionsV2.findOne({
      include: [
        {
          model: Member,
          as: "members",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        type_option: "ถอน",
        id: id,
      },
      order: [["id", "desc"]],
    });

    if (!transactions) {
      return false;
    }

    const dataall = await Bank.findByPk(transactions.members.bankId);
    //

    return {
      ...transactions.toJSON(),
      bank: dataall ? dataall.toJSON() : null,
    };
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
}

const withdraw = async function (req, res) {
  const body = req.body;
  const create_ref = generateUuid();
  if (body.amount < 0) {
    return ReE(res, {
      results: null,
      code: 402,
      message: "จำนวนเงินต้องมากกว่า 0",
    });
  }

  // 1. ตรวจสอบข้อมูลเบื้องต้นจาก body
  if (!body.userId || !body.amount) {
    return ReE(res, {
      results: null,
      code: 402,
      message: "ข้อมูลไม่ครบถ้วน",
    });
  }
  // ตรวจสอบ type_withdraw  (สมมติว่ามีค่าเป็น "auto" หรือ "manual")
  let type = {};
  if (body.type_withdraw) {
    type.type_withdraw = body.type_withdraw;
  }

  if (!type.type_withdraw) {
    return ReE(res, {
      results: null,
      code: 402,
      message: "ประเภทการถอนเงินไม่ถูกต้อง",
    });
  }
  const user = await Member.findOne({
    where: {
      userId: body.userId,
      merchantId: req.user.id,
    },
  });

  if (!user) {
    return ReE(res, {
      results: null,
      code: 402,
      message: "ไม่พบผู้ใช้",
    });
    // return res.status(404).json({ error: "ไม่พบผู้ใช้" });
  }

  let chack = await TransactionsV2.findOne({
    where: {
      type_option: "ถอน",
      member_id: user.id,
      status: {
        [Op.or]: ["inq", "processing", "confirm"],
      },
    },
  });

  if (chack) {
    return ReE(res, {
      results: chack,
      code: 402,
      message: "มีรายการถอนรอดำเนินการอยู่",
    });
  }

  const results_merchang = await getdatamerchang(req.user.id);

  if (type.type_withdraw == "auto") {
    // 2. ค้นหาข้อมูลของผู้ใช้จาก body.userId

    // 4. ค้นหา BankAccountGroup ที่ active
    let BankAccountGroups = await BankAccountGroup.findOne({
      where: {
        isActive: true,
      },
    });

    //console.log(BankAccountGroups)

    let accountFroms = await BankAccount.findOne({
      where: {
        merchantId: user.merchantId,
        accountType: "withdrawal",
        status_bank: "Active",
        bankAccountGroupId: BankAccountGroups.id,
      },
      order: [["limit_Left", "DESC"]],
    });

    if (!accountFroms) {
      return ReE(res, {
        results: null,
        code: 402, // ใช้ code 500  สำหรับ Internal Server Error (ไม่พบบัญชี)
        message: "ไม่สามารถดำเนินการได้ ไม่พบบัญชีถอน", // เปลี่ยนข้อความให้เหมาะสม
      });
    }

    if (
      accountFroms.channel == "scb-easy" ||
      accountFroms.channel == "k-biz" ||
      accountFroms.channel == "Wealth" ||
      accountFroms.channel == "ktb-business" ||
      accountFroms.channel == "krungsribizonline" ||
      accountFroms.channel == "PayoneX"
    ) {
      if (
        parseFloat(body.amount).toFixed(2) <
        results_merchang.setting_Merchant.minimumWithdrawalAmount
      ) {
        return ReE(res, {
          data: "",
          code: 401,
          message: `ไม่สามารถ ทำรายการได้ เนื่องจากจำนวนเงินที่ต้องการถอนขั่นต่ำที่ ${results_merchang.setting_Merchant.minimumWithdrawalAmount}`,
        });
      }

      if (
        parseFloat(body.amount) >=
          results_merchang.setting_Merchant.minimumWithdrawalAmount &&
        parseFloat(body.amount) <=
          results_merchang.setting_Merchant.maximumWithdrawalAmount
      ) {
        let status = "";

        let cahack_inq = await TransactionsV2.findOne({
          where: {
            status: "inq",
            type_option: "ถอน",
          },
        });
        //console.log(cahack_inq)
        if (!cahack_inq) {
          status = "inq";
        } else {
          status = "processing";
        }

        const datassave = {
          amount: body.amount,
          name_member: user.bankAccountName,
          reqby_admin_id: 4,
          ref: create_ref,
          type_option: "ถอน",
          status: status,
          member_id: user.id,
          nodere: "ถอนโดยระบบออโต้",
          bankAccount_id:accountFroms.id
        };
        //  console.log(datassave)
        const creates = await TransactionsV2.create(datassave);

        const chackv2 = await getWithdrawalTransactions_by(creates.id);

        let dataacc = {
          accfrom: {
            accountNumber: accountFroms.accountNumber,
            name: accountFroms.accountName,
            bankId: accountFroms.bankId,
            merchantId: req.user.id,
            channel: accountFroms.channel,
          },
        };
        let msg = `
 <b>Notification: Withdraw GBPVEGAS</b>
 <pre><code style="background-color: #f44336; color: white; padding: 10px; border-radius: 5px;">
 <b>หมายเลขอ้างอิง (Ref):</b> ${datassave.ref} 
 <b>ชื่อสมาชิก:</b> ${user.bankAccountName}
 <b>เลขที่บัญชี:</b> ${user.bankAccountNumber}
 <b>จำนวนเงิน:</b> ${body.amount}
 <b>ประเภทธุรกรรม:</b>  ถอนเงิน
 <b>สถานะรายการ:</b> ${status}
 <b>Chanal :</b> ${accountFroms.channel} 
 <b>วันที่/เวลา:</b> ${moment().format("YYYY-MM-DD HH:mm:ss")}
 </code></pre>
 <i><b>หมายเหตุ:</b> ${"รายการถอนเงินได้รับการอนุมัติแล้ว รอโอนตามลำดับ"}</i>
               `;

        let datanoti = {
          msg: msg,
          tpye: "worning",
          type_option: "withdraw",
          data: {
            ref: chackv2.ref,
            name_member: user.bankAccountName,
            amount: body.amount,
            type_option: datassave.type_option,
            nodere: `อนุมัติถอนเงินรอโอน`,
          },
        };

        // await Notify.sendTelegram(datanoti);
        return ReS(res, {
          data: chackv2,
          ...dataacc,
          code: 200,
          message: "อนุมัติถอนเงินรอโอน",
        });
      } else {
        const datassave = {
          amount: body.amount,
          name_member: user.bankAccountName,
          reqby_admin_id: 4,
          ref: create_ref,
          type_option: "ถอน",
          status: "confirm",
          member_id: user.id,
          nodere: "ถอนแบบระบบ manual กรุณาตรวจสอบ และ ยืนยันการถอนอีกครั้ง",
        };

        const creates = await TransactionsV2.create(datassave);

        const chackv2 = await getWithdrawalTransactions_by(creates.id);

        const accountFroms = await BankAccount.findOne({
          where: {
            merchantId: user.merchantId,
            accountType: "withdrawal",
            status_bank: "Active",
          },
        });

        let dataacc = {
          accfrom: {
            accountNumber: accountFroms.accountNumber,
            name: accountFroms.accountName,
            bankId: accountFroms.bankId,
            merchantId: req.user.id,
            channel: accountFroms.channel,
          },
        };
        let msg = `
<b>Notification:  ⏳👉 Withdraw Approve (Confirm) 👈⏳</b>
<pre><code style="background-color: #f44336; color: white; padding: 10px; border-radius: 5px;">
<b>หมายเลขอ้างอิง (Ref):</b> ${chackv2.ref}
<b>ชื่อสมาชิก:</b> ${user.bankAccountName}
<b>เลขที่บัญชี:</b> ${user.bankAccountNumber}
<b>จำนวนเงิน:</b> ${body.amount}
<b>Type option:</b> ${"ถอน"}
<b>Chanal :</b> ${accountFroms.channel}
<b>สถานะรายการ:</b> ${"confirm"}
 <b>วันที่/เวลาอนุมัติ:</b> ${moment().format("YYYY-MM-DD HH:mm:ss")}
</code></pre>
<i><b>หมายเหตุ:</b> <em style="color: #f44336;">รายการถอนเงินได้รับการอนุมัติแล้ว เนื่องจากจำนวนเงิน > ${
          results_merchang.setting_Merchant.maximumWithdrawalAmount
        } บาท รอตรวจสอบและยืนยันการถอนตามลำดับ</em></i>
                  `;
        let datanoti = {
          msg: msg,
          tpye: "worning",
          type_option: "withdraw",
          data: {
            ref: chackv2.ref,
            name_member: user.bankAccountName,
            amount: body.amount,
            type_option: type.type_withdraw,
            nodere: `อนุมัติถอนเงินรอ ตรวจสอบ ยืนยันการถอนอีกครั้ง`,
          },
        };

        // await Notify.sendTelegram(datanoti);
        return ReS(res, {
          data: chackv2,
          ...dataacc,
          code: 200,
          message: "อนุมัติถอนเงินรอ ตรวจสอบ ยืนยันการถอนอีกครั้ง",
        });
      }
    } 
  }
};

const saveTransaction = async (transactionData) => {
  try {
    // เชื่อมต่อกับฐานข้อมูล (สมมติว่าคุณใช้ Sequelize)
    const transaction = await Transaction_withdraw.create(transactionData);
    // console.log('TransactionsV2 saved:', transaction.id);
    return { id: transaction.id }; // คืนค่า true ถ้าบันทึกสำเร็จ
  } catch (error) {
    // console.error('Error saving transaction:', error);
    return false; // คืนค่า false ถ้าบันทึกไม่สำเร็จ
  }
};
async function getWithdrawalTransactions_confirm_withdraws(ref) {
  try {
    const transactions = await TransactionsV2.findOne({
      include: [
        {
          model: Member,
          as: "members",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        type_option: "ถอน",
        ref: ref,
      },
      order: [["id", "desc"]],
    });

    const dataall = await Bank.findByPk(transactions.members.bankId);
    //

    return {
      ...transactions.toJSON(),
      bank: dataall ? dataall.toJSON() : null,
    };
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
}

const scan_barcodeurl = async function (item) {
  const axios = require("axios");
  let data = JSON.stringify({
    barcodeurl: item.barcodeurl,
    api_auth: item.auth,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint + "/scbeasy/payments/bill/scan/barcodeurl",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  let respon = await axios.request(config);

  //  console.log(respon)

  return respon;
};

const confirm_withdraws = async function (req, res) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "storage/qr");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  var upload = multer({ storage: storage }).fields([
    { name: "img_url", maxCount: 1 },
  ]);

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    const body = req.body;
    var files = req.files;
    let contactSupportImgePath = "";

    if (files.img_url) {
      contactSupportImgePath = files.img_url[0].filename;
    }

    if (!body.ref) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_email_require",
          message: "กรุณากรอก userId ของคุณ....",
        },
        422
      );
    } else if (!files.img_url) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_password_require",
          message: "ไม่มีข้อมูลรูป",
        },
        422
      );
    }

    if (contactSupportImgePath) {
      const data_url = await qr(config.bucketBaseURL + contactSupportImgePath);
      // console.log(data_url)
      if (!data_url) {
        return ReE(
          res,
          {
            data: data_url,
            static_key: "List of this slip has already been processed",
            message: "List of this slip has already been processed",
          },
          422
        );
      }
      const user = await getWithdrawalTransactions_confirm_withdraws(body.ref);
      if (!user) {
        return ReE(res, {
          data: null,
          code: 404, // not found
          message: "ไม่พบผู้ใช้",
        });
      }
      //

      let databank = {
        deviceId: "973b06e8-8103-45e8-a6f9-b1eab1fc9b23",
      };

      const verify_user = await Apiscb_helper.posy_verifyusers(
        databank.deviceId
      );

      let auths = verify_user.data.headers["api-auth"];
      let datachacks = {
        barcodeurl: data_url,
        auth: auths,
      };

      let datachack = await scan_barcodeurl(datachacks);

      if (datachack.data.status.code == 1000) {
        let Namemember = user.members.bankAccountName;
        let Namememberslib = datachack.data.data.pullSlip.receiver.name;

        let TransactionModel = datachack.data.data.pullSlip;

        let datasaves = {
          transaction_id: user.id,
          recipientName: TransactionModel.receiver.name,
          recipientAccount: TransactionModel.receiver.accountNumber,
          amount: datachack.data.data.amount,
          remark: "",
          recipientBank: TransactionModel.sender.name,
          senderAccount: TransactionModel.sender.accountNumber,
          qrString: data_url,
          transactionId: "",
          transactionDateTime: TransactionModel.dateTime,
          status: "success",
          description: "",
          reqby_admin_id: 4,
          ref: "",
          member_id: user.members.id,
        };

        // 5. บันทึก transaction
        let saveTransaction_withdraw = await saveTransaction(datasaves);

        if (
          Namemember.trim()
            .toLowerCase()
            .includes(Namememberslib.trim().toLowerCase())
        ) {
          let gore = await TransactionsV2.update(
            {
              status: "success",
              nodere: "ยืนยันการถอนเงิน",
            },
            {
              where: { ref: body.ref },
            }
          );

          return ReS(res, {
            data: datachack.data,
            code: 200,
            message: "ทำรายการสำเร็จ",
          });
        } else {
          let gore = await TransactionsV2.update(
            {
              status: "cancel",
              nodere: "ชื่อผู้รับเงินไม่ตรงกับข้อมูล",
            },
            {
              where: { ref: body.ref },
            }
          );

          return ReS(res, {
            data: datachack.data,
            code: 400,
            message: "ชื่อผู้รับเงินไม่ตรงกับข้อมูล",
          });
        }
      } else {
        return ReE(res, {
          data: datachack.data,
          code: 400,
          message: "เกิดข้อผิดพลาด สลิปหมดอายุ หรือ รูปสลิปไม่ถูกต้อง",
        });
      }
    }
  });
};

const chack_tranchackwitdows = async function (req, res) {
  var axios = require("axios");

  // let chack = await TransactionsV2.findOne({
  //   include: [
  //     {
  //       model: Member,
  //       as: "members",
  //       attributes: {
  //         exclude: ["deleted_at", "created_at", "updated_at"],
  //       },
  //       required: true,
  //     },
  //   ],
  //   where: {
  //     type_option: "ถอน",
  //     nodere: "PayoneX",
  //   },
  // });
  // let Customerss = await Customers.findOne({
  //   where: {
  //     account_no: chack.members.bankAccountNumber,
  //   },
  // });

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

  // var config = {
  //   method: "get",
  //   maxBodyLength: Infinity,
  //   url: `https://api.payonex.asia/transactions/?uuid=${chack.ref}`,
  //   headers: {
  //     Accept: "application/json",
  //     Authorization: chackauth.data.data.token,
  //   },
  // };

  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.payonex.asia/transactions?page=${req.body.page}&size=${req.body.size}`,
    headers: {
      Accept: "application/json",
      Authorization: chackauth.data.data.token,
    },
  };

  let datachackplay = await axios(config);

  return ReS(res, {
    data: datachackplay.data,
    code: 200,
    // message: "เกิดข้อผิดพลาด สลิปหมดอายุ หรือ รูปสลิปไม่ถูกต้อง",
  });
};
const transferconfirmationsby = async function (
  da,
  TransactionModel, // Assuming this is a Sequelize model
  accountFroms,
  auth
) {
  //console.log(TransactionModel);
  try {
    let chack_auth = await Apiscb_helper.chack_auth(accountFroms.auth);
    if (chack_auth.data.status.code == "1002") {
      let datalogin = {
        deviceId: accountFroms.deviceId,
        pin: accountFroms.pin,
        id: accountFroms.id,
        accountNo: accountFroms.accountNumber,
      };
      let gologin = await Apiscb_helper.Loginbank_auth(datalogin);

      let users2 = await BankAccount.findOne({
        where: {
          id: accountFroms.id,
        },
      });

      auth = users2.auth;
      //
    }
    // 1.  สร้าง data สำหรับ request
    const data = JSON.stringify({
      accountTo: TransactionModel.members.bankAccountNumber,
      accountNo: accountFroms.accountNumber,
      api_auth: auth,
      amount: TransactionModel.amount,
      accountToBankCode: TransactionModel.bank.scb_code,
    });

    //console.log(data);
    // 2. กำหนด config สำหรับ axios
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/transfer/verificationv2",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };
    // 3. ส่ง request ด้วย axios
    // const response = await
    let response, err;

    [err, response] = await to(axios.request(config));

    if (err) {
      let gore = await TransactionsV2.update(
        {
          status: "cancel",
        },
        {
          where: { id: TransactionModel.id },
        }
      );

      // console.log(err);
      //console.log(response);

      return {
        status: false,
        msg: "เกิดข้อผิดพลาด จากธนาคาร โปรทำรายการใหม่อีกครั้ง",
        data: TransactionModel,
      };
    }

    //console.log(response);

    if (response.data.status.code == 1000) {
      // 4.  สร้าง data สำหรับบันทึก transaction (datasaves)
      //     (ควรดึงข้อมูลที่จำเป็นจาก response)
      //     (ตัวอย่างนี้ใช้ data จากตัวแปร body, dataposts ซึ่งไม่ได้กำหนดไว้
      //      ควรแก้ไขให้ถูกต้อง)
      let datasaves = {
        transaction_id: TransactionModel.id,
        recipientName: TransactionModel.members.bankAccountName,
        recipientAccount: TransactionModel.members.bankAccountNumber,
        amount: TransactionModel.amount,
        remark: "",
        recipientBank: accountFroms.accountFromName,
        senderAccount: accountFroms.accountFromName,
        qrString: response.data.data.additionalMetaData.paymentInfo[0].QRstring,
        transactionId: response.data.data.transactionId,
        transactionDateTime: response.data.data.transactionDateTime,
        status: "success",
        description: "",
        reqby_admin_id: 4,
        ref: "",
        member_id: TransactionModel.members.id,
      };

      // 5. บันทึก transaction
      let saveTransaction_withdraw = await saveTransaction(datasaves);

      // 6. อัพเดท status ของ transaction เดิม
      let go = await TransactionsV2.update(
        {
          status: "success",
        },
        {
          where: { id: TransactionModel.id },
        }
      );

      let datausers = await Transaction_withdraw.findOne({
        include: [
          {
            as: "members",
            model: Member, // Assuming this is a Sequelize model
            attributes: {
              include: [],
              exclude: ["deleted_at", "created_at", "updated_at"],
            },
            required: true,
          },
          {
            model: TransactionsV2,
            as: "Transactions",
            attributes: {
              include: [],
              exclude: ["deleted_at", "created_at", "updated_at"],
            },
          },
        ],

        where: {
          id: saveTransaction_withdraw.id,
        },
      });
      //  let auth_info, err, user, goapi;

      //[err, goapi] = await to(Apicllback.submitwithdrawTransaction(datausers));

      // let goapi = await Apicllback.submitwithdrawTransaction(datausers);

      return { status: true, data: datausers };
    } else if (response.data.status.code == 9003) {
      return { status: false, data: response.data };
    }

    // ... (โค้ดส่วนอื่นๆ) ...
  } catch (error) {
    console.error("Error in Transferconfirmationsby:", error);
    // Handle the error appropriately, e.g., send an error response
  }
};
const confirm_withdrawsauto = async function (req, res) {
  let body = req.body;

  if (!body.transactionsId || !body.ref) {
    return ReE(res, {
      results: null,
      code: 402,
      message: "ข้อมูลไม่ครบถ้วน",
    });
  }
  // ตรวจสอบ type_withdraw  (สมมติว่ามีค่าเป็น "auto" หรือ "manual")
  let chackauth = await getWithdrawalTransactions_by(body.transactionsId);

  if (chackauth.status !== "confirm") {
    return ReE(res, {
      results: chackauth,
      code: 402,
      message: "รายการนี้ถูกดำเนินการแล้ว",
    });
  }

  let accountFroms = await BankAccount.findOne({
    where: {
      merchantId: req.user.id,
      accountType: "withdrawal",
      status_bank: "Active",
    },

    order: [["updated_at", "desc"]],
  });
  let status = "";

  let cahack_inq = await TransactionsV2.findOne({
    where: {
      status: "inq",
      type_option: "ถอน",
    },
  });
  //console.log(cahack_inq)
  if (!cahack_inq) {
    status = "inq";
  } else {
    status = "processing";
  }

  const [updateCount] = await TransactionsV2.update(
    {
      status: status,
      nodere: "อนุมัติถอน รอดำเนินการ", // Also update nodere to indicate PayoneX processing
    },
    {
      where: {
        id: chackauth.id, // Target the specific transaction by its ID
      },
    }
  );

  const chackv2 = await getWithdrawalTransactions_by(chackauth.id);
  let dataacc = {
    accfrom: {
      accountNumber: accountFroms.accountNumber,
      name: accountFroms.accountName,
      bankId: accountFroms.bankId,
      merchantId: req.user.id,
      channel: accountFroms.channel,
    },
  };
  return ReS(
    res,
    {
      data: chackv2,
      ...dataacc,
      message: "success",
    },
    200
  );

  //   if (accountFroms.channel == "PayoneX") {
  //     let data_Gatway_setting = await Gatway_setting.findOne({
  //       where: {
  //         name: "PayoneX",
  //       },
  //     });

  //     let ataitem_post = {
  //       accessKey: data_Gatway_setting.accessKey,
  //       secretKey: data_Gatway_setting.secretKey,
  //     };

  //     let chackauths = await Apipaynoex.authenticate(ataitem_post);

  //     var axios = require("axios");

  //     var config = {
  //       method: "get",
  //       maxBodyLength: Infinity,
  //       url: "https://api.payonex.asia/profile/balance",
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: chackauths.data.data.token,
  //       },
  //     };

  //     try {
  //       // เชื่อมต่อกับฐานข้อมูล (สมมติว่าคุณใช้ Sequelize)
  //       let datachackplay = await axios(config);

  //       if (datachackplay.data.data.balance < chackauth.amount) {
  //         let msg = `
  // <b>⚠️ แจ้งเตือน: ยอดเงินไม่เพียงพอ ⚠️</b>
  // <pre><code style="background-color: #f44336; color: white; padding: 10px; border-radius: 5px;">
  // <b>หมายเลขอ้างอิง (Ref):</b> ${body.ref}
  // <b>ชื่อสมาชิก:</b> ${chackauth.members.bankAccountName}
  // <b>จำนวนเงินที่ต้องการถอน:</b> ${chackauth.amount}
  // <b>ประเภทธุรกรรม:</b> ยืนยันการถอนออโต้
  // <b>จำนวนเงินคงเหลือ:</b> ${datachackplay.data.data.balance}
  // <b>จำนวนเงินที่ขาด:</b> ${chackauth.amount - datachackplay.data.data.balance}
  // <b>บัญชีที่ทำรายการ:</b> ${accountFroms.accountNumber}
  // </code></pre>
  // <i><b>หมายเหตุ:</b> ยอดเงินในบัญชีไม่เพียงพอสำหรับการทำรายการถอน กรุณาเติมเงินเข้าระบบ</i>`;
  //         let datanoti = {
  //           msg: msg,
  //           tpye: "worning",
  //           data: {
  //             ref: body.ref,
  //             name_member: chackauth.members.bankAccountName,
  //             amount: chackauth.amount,
  //             type_option: chackauth.type_option,
  //             nodere: "ยอดเงินในบัญชีไม่เพียงพอสำหรับการทำรายการถอน",
  //             balance: datachackplay.data.data.balance,
  //           },
  //         };
  //         await Notify.sendTelegram(datanoti);

  //         return ReE(res, {
  //           results: accountFroms.accountNumber,
  //           code: 402,
  //           message: "ยอดเงินไม่เพียงพอ กรุณาเติมเงินเข้าระบบ",
  //         });
  //         //  return res.status(400).json({ error: "ยอดเงินไม่เพียงพอ" });
  //       } else if (chackauth.amount < 100) {
  //         return ReE(res, {
  //           // results: accountFroms.accountNumber,
  //           code: 402,
  //           message: "ถอนขั่นต่ำ 100 บาท",
  //         });
  //       }

  //       let Customerss = await Customers.findOne({
  //         where: {
  //           account_no: chackauth.members.bankAccountNumber,
  //         },
  //       });
  //       let create_uuid = body.ref;

  //       var data2 = JSON.stringify({
  //         customerUuid: Customerss.customer_uuid,
  //         amount: chackauth.amount,
  //         referenceId: create_uuid,
  //         note: "ถอนออโต้ payonex",
  //         remark: "ถอนออโต้ payonex",
  //       });

  //       var config2 = {
  //         method: "post",
  //         maxBodyLength: Infinity,
  //         url: "https://api.payonex.asia/transactions/withdraw/request",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Accept: "application/json",
  //           Authorization: chackauths.data.data.token,
  //         },
  //         data: data2,
  //       };
  //       let datachackplay2 = await axios(config2);

  //       if (datachackplay2.data.success == true) {
  //         const datassave = {
  //           amount: body.amount,
  //           name_member: chackauth.members.bankAccountName,
  //           reqby_admin_id: 4,
  //           ref: create_uuid,

  //           uuid: datachackplay2.data.data.uuid,
  //           type_option: "ถอน",
  //           status: "pending",
  //           member_id: chackauth.members.id,
  //           nodere: "PayoneX",
  //         };

  //         const [updateCount] = await TransactionsV2.update(
  //           {
  //             status: "pending",
  //             nodere: "PayoneX", // Also update nodere to indicate PayoneX processing
  //             uuid: datachackplay2.data.data.uuid, // Store the PayoneX transaction UUID
  //             ref: create_uuid, // Ensure the reference ID is updated/set correctly
  //           },
  //           {
  //             where: {
  //               id: chackauth.id, // Target the specific transaction by its ID
  //             },
  //           }
  //         );
  //         const chackv2 = await getWithdrawalTransactions_by(chackauth.id);
  //         let dataacc = {
  //           accfrom: {
  //             accountNumber: accountFroms.accountNumber,
  //             name: accountFroms.accountName,
  //             bankId: accountFroms.bankId,
  //             merchantId: req.user.id,
  //             channel: accountFroms.channel,
  //           },
  //         };

  //         let msg = `
  // <b>✅ แจ้งเตือน: อนุมัติถอนเงินสำเร็จ รอโอนจาก PayoneX ✅</b>
  // <pre><code style="background-color: #f44336; color: white; padding: 10px; border-radius: 5px;">
  // <b>หมายเลขอ้างอิง (Ref):</b> ${create_uuid}
  // <b>ชื่อสมาชิก:</b> ${chackauth.members.bankAccountName}
  // <b>จำนวนเงินที่ต้องการถอน:</b> ${chackauth.amount}
  // <b>ประเภทธุรกรรม:</b> อนุมัติถอน รอดำเนินการ
  // <b>บัญชีที่ทำรายการ:</b> ${accountFroms.accountNumber}

  // </code></pre>
  // <i><b>หมายเหตุ:</b> ${"✅ ทำรายการถอนสำเร็จ รอโอนจาก PayoneX"}</i>`;

  //         let datanoti = {
  //           msg: msg,
  //           tpye: "success",
  //           type_option: "withdraw",
  //           data: {
  //             // ref: create_ref,
  //             name_member: chackauth.members.bankAccountName,
  //             amount: chackauth.amount,
  //             type_option: "ถอน",
  //             nodere: `ทำรายการถอนสำเร็จ`,
  //           },
  //         };

  //         await Notify.sendTelegram(datanoti);

  //         return ReS(
  //           res,
  //           {
  //             data: chackv2,
  //             ...dataacc,
  //             message: "success",
  //           },
  //           200
  //         );
  //       }
  //     } catch (error) {
  //       // console.error('Error saving transaction:', error);
  //       console.log(error);

  //       return ReE(res, {
  //         //results: accountFroms.accountNumber,
  //         code: 402,
  //         message: "เกิดข้อผิดพลาด ไม่สามารถใช้ ธนาคาร นี้ได้ กรุณาใช้ธนาคารอื่น",
  //       });
  //     }
  //   } else if (accountFroms.channel == "scb-easy") {
  //     let data = await chack_balance(accountFroms);

  //     if (data.balance < chackauth.amount) {
  //       let msg = `
  // <b>⚠️ แจ้งเตือน: ยอดเงินไม่เพียงพอ ⚠️</b>
  // <pre><code style="background-color: #f44336; color: white; padding: 10px; border-radius: 5px;">
  // <b>หมายเลขอ้างอิง (Ref):</b> ${chackauth.ref}
  // <b>ชื่อสมาชิก:</b> ${chackauth.members.bankAccountName}
  // <b>จำนวนเงินที่ต้องการถอน:</b> ${chackauth.amount}
  // <b>ประเภทธุรกรรม:</b> ${chackauth.type_option}
  // <b>จำนวนเงินคงเหลือ:</b> ${data.balance}
  // <b>จำนวนเงินที่ขาด:</b> ${chackauth.amount - data.balance}
  // <b>บัญชีที่ทำรายการ:</b> ${accountFroms.accountNumber}
  // </code></pre>
  // <i><b>หมายเหตุ:</b> ยอดเงินในบัญชีไม่เพียงพอสำหรับการทำรายการถอน กรุณาเติมเงินเข้าระบบ</i>
  // `;

  //       let datanoti = {
  //         msg: msg,
  //         tpye: "warning",
  //         type_option: "withdraw",
  //         data: {
  //           ref: chackauth.ref,
  //           name_member: chackauth.members.bankAccountName,
  //           amount: chackauth.amount,
  //           type_option: chackauth.type_option,
  //           balance: data.balance,
  //           nodere: "ยอดเงินในบัญชีไม่เพียงพอสำหรับการทำรายการถอน",
  //         },
  //       };
  //       await Notify.sendTelegram(datanoti);

  //       return ReE(res, {
  //         data: chackauth,
  //         code: 402,
  //         message: `มียอดเงินไม่เพียงพอ กรุณาเติมเงินเข้าระบบอีก ${
  //           chackauth.amount - data.balance
  //         }`,
  //       });

  //       //let chack_auth = await Apiscb_helper.chack_auth(accountFroms.auth);
  //     } else {
  //       const req_con = await transferconfirmationsby(
  //         accountFroms.auth,
  //         chackauth,
  //         accountFroms,
  //         accountFroms.auth
  //       );

  //       if (req_con?.status == true) {
  //         let dataacc = {
  //           accfrom: {
  //             accountNumber: accountFroms.accountNumber,
  //             name: accountFroms.accountName,
  //             bankId: accountFroms.bankId,
  //             merchantId: req.user.id,
  //             channel: accountFroms.channel,
  //           },
  //         };

  //         let msg = `
  // <b>Notification: Withdraw (Manual) Done ✅</b>
  // <pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
  // <b>หมายเลขอ้างอิง (Ref):</b> ${chackauth.ref}
  // <b>ชื่อสมาชิก:</b> ${chackauth.members.bankAccountName}
  // <b>จำนวนเงินที่ถอน:</b> ${chackauth.amount}
  // <b>ประเภทธุรกรรม:</b> ถอน (manual)
  // <b>บัญชีที่ทำรายการ:</b> ${accountFroms.accountNumber}
  // <b>Chanal:</b> scb-easy
  // <b>เวลาทำรายการ:</b> ${moment().format("YYYY-MM-DD HH:mm:ss")}
  // </code></pre>
  // <i><b>หมายเหตุ:</b>  ยืนยันการถอนแบบระบบ (manual) สำเร็จ</i>
  //         `;

  //         let datanoti = {
  //           msg: msg,
  //           tpye: "success", // Change to success for approved
  //           type_option: "withdraw",
  //           data: {
  //             ref: chackauth.ref,
  //             name_member: chackauth.members.bankAccountName,
  //             amount: chackauth.amount,
  //             type_option: chackauth.type_option,
  //             nodere: ` อนุมัติ โอนเงิน เงินสำเร็จ  scb-easy`,
  //           },
  //         };

  //         await Notify.sendTelegram(datanoti);

  //         return ReS(
  //           res,
  //           {
  //             data: req_con.data,
  //             ...dataacc,
  //             message: "success",
  //           },
  //           200
  //         );
  //       } else {
  //         return ReE(res, {
  //           data: null,
  //           code: 402,
  //           message:
  //             "เกิดข้อผิดพลาดจากธนาคาร ยอดเงินอาจ ไม่พอในการโอน หรือ อยู่ในช่วงเวลา ปิดปรับปรุง",
  //         });
  //       }
  //     }
  //   } else if (accountFroms.channel == "krungsribizonline") {
  //     //     const datachack =
  //     //       await Apikrungsribizonline_helper.krungsribizonline_authenticate(
  //     //         accountFroms
  //     //       );
  //     //     let datapost = {
  //     //       accountTo: chackauth.members.bankAccountNumber,
  //     //       accountNo: accountFroms.accountNumber,

  //     //       amount: chackauth.amount,
  //     //       accountToBankCode: chackauth.bank.scb_code,
  //     //     };

  //     //     //  console.log(datapost)
  //     //     let datachackotp =
  //     //       await Apikrungsribizonline_helper.krungsri_tranfer_getotp(datapost);
  //     //     //  console.log(datachackotp)

  //     //     if (datachackotp.ref) {
  //     //       let otpFound = false;
  //     //       let startTime = Date.now();
  //     //       const timeout = 60000; // 1 minute in milliseconds

  //     //       while (!otpFound && Date.now() - startTime < timeout) {
  //     //         try {
  //     //           let chackotpnow = await Apikrungsribizonline_helper.getotp({
  //     //             otp: datachackotp.ref,
  //     //           });

  //     //           // console.log("Checking OTP:", chackotpnow.data);

  //     //           if (chackotpnow.data.code == 1000) {
  //     //             // OTP found, proceed to the next step
  //     //             otpFound = true;
  //     //             //console.log("OTP found:", chackotpnow.data.data.otp);

  //     //             let data3 = {
  //     //               ctl00$smMain:
  //     //                 "ctl00$cphSectionData$OTPBox1$udpOTPBox|ctl00$cphSectionData$OTPBox1$btnConfirm",
  //     //               __EVENTTARGET: "ctl00$cphSectionData$OTPBox1$btnConfirm",
  //     //               __EVENTARGUMENT: "",
  //     //               __VIEWSTATE: datachackotp.data.body.__VIEWSTATE,
  //     //               __VIEWSTATEGENERATOR: datachackotp.data.body.__VIEWSTATEGENERATOR,
  //     //               __VIEWSTATEENCRYPTED: "",
  //     //               __PREVIOUSPAGE: datachackotp.data.body.__PREVIOUSPAGE,
  //     //               __EVENTVALIDATION: datachackotp.data.body.__EVENTVALIDATION,
  //     //               ctl00$hddNoAcc: "",
  //     //               ctl00$hddMainAccIsCreditCard: "",
  //     //               ctl00$bannerTop$hdTransactionType: "",
  //     //               ctl00$bannerTop$hdCampaignCode: "",
  //     //               ctl00$bannerTop$hdCampaignTxnType: "",
  //     //               ctl00$bannerTop$hdCampaignMutualFundType: "",
  //     //               ctl00$bannerTop$hdCampaignTransferType: "",
  //     //               ctl00$bannerTop$hdAccNo: "",
  //     //               ctl00$bannerTop$hdBillerId: "",
  //     //               ctl00$bannerTop$hdUrlRedirect: "",
  //     //               ctl00$bannerTop$hdAmount: "",
  //     //               ctl00$bannerTop$hdTxnIsSuccess: "",
  //     //               ctl00$bannerTop$hdBillerCategory: "",
  //     //               ctl00$bannerTop$hdBillerName: "",
  //     //               ctl00$bannerTop$hdAJAXData: "",
  //     //               ctl00$hddIsLoadComplete: "false",
  //     //               ctl00$hdnCurrentPageQuickMenu: "",
  //     //               ctl00$hdnPageIndexQuickMenuLoaded: "",
  //     //               ctl00$cphSectionData$OTPBox1$Password2:
  //     //                 datachackotp.data.body.ctl00$cphSectionData$OTPBox1$Password2,
  //     //               ctl00$cphSectionData$OTPBox1$txtTemp:
  //     //                 datachackotp.data.body.ctl00$cphSectionData$OTPBox1$txtTemp,
  //     //               ctl00$cphSectionData$OTPBox1$hddOTPPassword:
  //     //                 chackotpnow.data.data.otp,
  //     //               ctl00$cphSectionData$OTPBox1$txtOTPPassword: "",
  //     //               ctl00$hddHasSess: "",
  //     //               __ASYNCPOST: "true",
  //     //             };

  //     //             let datapost2 = {
  //     //               body: data3,
  //     //               url: datachackotp.data.url,
  //     //             };

  //     //             //
  //     //             //console.log(data3)
  //     //             let datachack_tranfer =
  //     //               await Apikrungsribizonline_helper.krungsri_tranfer_con(datapost2);

  //     //             let datasaves = {
  //     //               transaction_id: chackauth.id,
  //     //               recipientName: chackauth.members.bankAccountName,
  //     //               recipientAccount: chackauth.members.bankAccountNumber,
  //     //               amount: chackauth.amount,
  //     //               remark: datachack_tranfer,
  //     //               recipientBank: accountFroms.accountFromName,
  //     //               senderAccount: accountFroms.accountFromName,
  //     //               qrString: "",
  //     //               transactionId: "",
  //     //               transactionDateTime: "",
  //     //               status: "success",
  //     //               description: "",
  //     //               reqby_admin_id: 4,
  //     //               ref: "",
  //     //               member_id: chackauth.members.id,
  //     //             };

  //     //             // 5. บันทึก transaction
  //     //             let saveTransaction_withdraw = await saveTransaction(datasaves);

  //     //             // 6. อัพเดท status ของ transaction เดิม
  //     //             let go = await TransactionsV2.update(
  //     //               {
  //     //                 status: "success",
  //     //               },
  //     //               {
  //     //                 where: { id: chackauth.id },
  //     //               }
  //     //             );

  //     //             let msg = `
  //     // <b>✅ แจ้งเตือน: krungsri อนุมัติถอนเงินสำเร็จ ✅</b>
  //     // <pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
  //     // <b>หมายเลขอ้างอิง (Ref):</b> ${chackauth.ref}
  //     // <b>ชื่อสมาชิก:</b> ${chackauth.members.bankAccountName}
  //     // <b>จำนวนเงินที่ถอน:</b> ${chackauth.amount}
  //     // <b>ประเภทธุรกรรม:</b> ${chackauth.type_option}
  //     // <b>บัญชีที่ทำรายการ:</b> ${accountFroms.accountNumber}
  //     // </code></pre>
  //     // <i><b>หมายเหตุ:</b> อนุมัติถอนเงินสำเร็จ krungsri</i>
  //     //         `;

  //     //             let datanoti = {
  //     //               msg: msg,
  //     //               tpye: "success", // Change to success for approved
  //     //               type_option: "withdraw",
  //     //               data: {
  //     //                 ref: chackauth.ref,
  //     //                 name_member: chackauth.members.bankAccountName,
  //     //                 amount: chackauth.amount,
  //     //                 type_option: chackauth.type_option,
  //     //                 nodere: `อนุมัติถอนเงินสำเร็จ krungsri`,
  //     //               },
  //     //             };

  //     //             await Notify.sendTelegram(datanoti);

  //     //             return ReS(res, {
  //     //               data: datanoti,
  //     //               success: true, // Add a success flag
  //     //               message: "success",
  //     //             });

  //     //             // **Next Step:**
  //     //             // Add your code here to perform the next step after OTP verification.
  //     //             // For example, you might want to:
  //     //             // 1. Complete the transfer transaction.
  //     //             // 2. Update the database.
  //     //             // 3. Send a success message.

  //     //             // let datasave = {
  //     //             //   amount: body.amount,
  //     //             //   remark: body.remark,
  //     //             //   QrScanner: datachackotp,
  //     //             //   status: "success",
  //     //             //   bankAccounttoid: ToAccountIds.id,
  //     //             //   bankAccountfromid: FormAccount.id,
  //     //             //   nodere: "โอนเงินสำเร็จ",
  //     //             //   reqby_admin_id: req.user.id,
  //     //             // };

  //     //             // let sa = await Transaction_tranfer.create(datasave);

  //     //             // return ReS(res, {
  //     //             //   data: sa,
  //     //             //   success: true, // Add a success flag
  //     //             //   message: "success",
  //     //             // });
  //     //           } else {
  //     //             // OTP not found yet, wait for a short period before retrying
  //     //             console.log("OTP not found yet. Retrying...");
  //     //             await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
  //     //           }
  //     //         } catch (error) {
  //     //           console.error("Error checking OTP:", error);
  //     //           // Handle error appropriately, e.g., log it, retry, or return an error response
  //     //           return ReE(res, { message: "Error checking OTP" }, 500);
  //     //         }
  //     //       }

  //     //       if (!otpFound) {
  //     //         // OTP not found within the timeout period
  //     //         console.log("OTP not found within 1 minute.");
  //     //         return ReE(res, { message: "OTP not found within 1 minute." }, 408); // 408 Request Timeout
  //     //       }
  //     //     }
  //     return ReS(res, {
  //       data: "",
  //       code: 401,
  //       message: "เกิดข้อผิดพลาด ไม่สามารถใช้ ธนาคาร นี้ได้",
  //     });
  //   }

  //console.log(accountFroms);

  // return ReS(res, {
  //   data: chackauth,
  //   data2: datachack,
  //   code: 200,
  //   // message: "เกิดข้อผิดพลาด สลิปหมดอายุ หรือ รูปสลิปไม่ถูกต้อง",
  // });
};

module.exports = {
  withdraw,
  confirm_withdraws,
  chack_tranchackwitdows,
  confirm_withdrawsauto,
};
