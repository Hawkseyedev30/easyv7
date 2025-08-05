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

const Apichack_history_by = require("../auth/auth_controller");
const Apicllback = require("./api");

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

var md5 = require("md5");
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");

function generateUuid() {
  return uuidv4();
}

var moment = require("moment");
require("moment/locale/th");
const fs = require("fs");

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
      console.log("QR Code content:", qrCode.data);
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

// const withdraw = async function (req, res) {
//   let body = req.body;

//   if (!body.type_withdraw) {
//     return ReE(
//       res,
//       {
//         static_key: "api_response_auth_login_email_require",
//         message: "กรุณากรอก type_withdraw ของคุณ....",
//       },
//       422
//     );
//   }

//   if (!body.userId) {
//     return ReE(
//       res,
//       {
//         static_key: "api_response_auth_login_accountNo_require",
//         message: {
//           th: "กรุณากรอก accountNo ของคุณ....",
//           en: "Please input your accountNo.",
//         },
//       },
//       422
//     );
//   } else if (!body.amount) {
//     return ReE(
//       res,
//       {
//         static_key: "api_response_auth_login_accountNo_require",
//         message: {
//           th: "กรุณากรอก accountNo ของคุณ....",
//           en: "Please input your accountNo.",
//         },
//       },
//       422
//     );
//   }

//   let datauser = await Member.findOne({
//     where: {
//       userId: body.userId,
//     },
//   });

//   if (!datauser) {
//     return ReE(
//       res,
//       {
//         static_key: "api_response_auth_login_accountNo_require",
//         message: {
//           th: "ไม่มี สมาชิกนี้ ....",
//           //en: "Please input your accountNo.",
//         },
//       },
//       422
//     );
//   }

//   let chack = await TransactionsV2.findOne({
//     where: {
//       type_option: "ถอน",
//       member_id: datauser.id,
//       status: "pending",
//     },
//   });

//   // if (chack) {
//   //   return ReE(
//   //     res,
//   //     {
//   //       //static_key: "api_response_auth_login_accountNo_require",
//   //       message: "มีรายการถอนรอดำเนินการอยู่",
//   //     },
//   //     422
//   //   );
//   // }

//   // TransactionsV2
//   let f = generateUuid();
//   let datassave = {
//     // request_All_id: user.id,
//     amount: body.amount,
//     // remark: user.type_status,
//     //bank_from: user.fron_bank,
//     //acc_from: user.acc_from,
//     name_member: datauser.bankAccountName,
//     reqby_admin_id: 4,
//     ref: f,
//     //  description: f,
//     type_option: "ถอน",
//     status: "pending",
//     member_id: datauser.id,
//     nodere: "",
//     // time_creat:"",
//   }; //

//   let creates = await TransactionsV2.create(datassave);
//   if (body.type_withdraw == "auto") {
//     let chack = await getWithdrawalTransactions_by(creates.id);

//     let req_ver = await verify_withdrawsby(chack);

//     if (req_ver.message == "success") {
//       let req_con = await transferconfirmationsby(req_ver.data, chack);
//       return ReS(
//         res,
//         {
//           //static_key: "api_response_auth_login_accountNo_require",
//           data: req_con,
//           message: "success",
//         },
//         200
//       );
//     } else {
//       return ReE(
//         res,
//         {
//           //static_key: "api_response_auth_login_accountNo_require",
//           data: req_ver,
//           message: "error",
//         },
//         200
//       );
//     }
//   } else if (body.type_withdraw == "manual") {

//     return ReS(
//       res,
//       {
//         //static_key: "api_response_auth_login_accountNo_require",
//         data: creates,
//         message: "success",
//       },
//       200
//     );
//   }

//   socket.emit("send_notification", {
//     to: "Allroom",
//     data: creates,
//     message: "มีรายการแจ้งถอนเข้ามา",
//   });
//   // console.log(creates);
// };

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

const withdraw = async function (req, res) {
  try {
    let creates = "";
    const body = req.body;
    const f = generateUuid();
    // console.log(body);

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.userId) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_accountNo_require",
          message: {
            th: "กรุณากรอก userId ของคุณ....",
            en: "Please input your userId.",
          },
        },
        422
      );
    }

    if (!body.amount) {
      return ReE(
        res,
        {
          static_key: "api_response_amount_require",
          message: {
            th: "กรุณากรอก amount ของคุณ....",
            en: "Please input your amount.",
          },
        },
        422
      );
    }

    const datamerchan = await getdatamerchang(req.user.id);

    // ค้นหาสมาชิก
    const datauser = await Member.findOne({
      where: {
        userId: body.userId,
      },
    });

    if (!datauser) {
      return ReE(
        res,
        {
          static_key: "api_response_member_require",
          message: {
            th: "ไม่มี สมาชิกนี้ ....",
            //en: "Please input your accountNo.",
          },
        },
        422
      );
    }
    if (body.type_withdraw == "auto") {
      let accountFroms = "";

      let BankAccountGroups = await BankAccountGroup.findOne({
        where: {
          isActive: true,
        },
      });

      if (BankAccountGroups) {
        if (BankAccountGroups) {
          accountFroms = await BankAccount.findOne({
            where: {
              merchantId: req.user.id,
              accountType: "withdrawal",
              status_bank: "Active",
              bankAccountGroupId: BankAccountGroups.id,
            },
            order: [["limit_Left", "DESC"]], // เรียงลำดับตาม limit_Left จากมากไปน้อย
          });

          // ... โค้ดส่วนที่เหลือ ...
        }

        console.log(accountFroms);
      }

      // //  console.log(accountFroms);
      // if (!accountFroms) {
      //   const datassave = {
      //     amount: body.amount,
      //     name_member: datauser.bankAccountName,
      //     reqby_admin_id: 4,
      //     ref: f,
      //     type_option: "ถอน",
      //     status: "pending",
      //     member_id: datauser.id,
      //     nodere: "",
      //   };

      //   const createss = await TransactionsV2.create(datassave);
      //   creates = createss;
      //   const chack = await getWithdrawalTransactions_by(createss.id);

      //   let dataamsg =
      //     "ไม่มี บัญชี ถอนในระบบ \n ที่พร้อมใช้งาน หรือ เปิดใช้งาน  \n  ";

      //   const req_con = await Notify.sendTelegram(dataamsg);

      //   return ReS(
      //     res,
      //     {
      //       //  static_key: "api_response_member_require",
      //       data: chack,
      //       message: dataamsg,
      //     },
      //     422
      //   );
      // }

      // const datassave = {
      //   amount: body.amount,
      //   name_member: datauser.bankAccountName,
      //   reqby_admin_id: 4,
      //   ref: f,
      //   type_option: "ถอน",
      //   status: "pending",
      //   member_id: datauser.id,
      //   nodere: "",
      // };

      // const creates = await TransactionsV2.create(datassave);

      // const chackv2 = await getWithdrawalTransactions_by(creates.id);

      // let chack_auth = await Apiscb_helper.chack_auth(accountFroms.auth);
      // // console.log(chack_auth.data)
      // if (chack_auth.data.status.code === "1002") {
      //   let datalogin = {
      //     deviceId: accountFroms.deviceId,
      //     pin: accountFroms.pin,
      //     id: accountFroms.id,
      //     accountNo: accountFroms.accountNumber,
      //   };
      //   let auth_info, err, user, gologin;

      //   [err, gologin] = await to(Apiscb_helper.Loginbank_auth(datalogin));

      //   //  console.log(gologin.data)

      //   if (gologin.data.data.status.code == 1000) {
      //     accountFroms.auth = gologin.data.auth;

      //     await BankAccount.update(
      //       {
      //         auth: gologin.data.auth,
      //         //
      //       },
      //       {
      //         where: { id: accountFroms.id },
      //       }
      //     );

      //     // console.log(gologin.data)
      //   } else if (gologin.data.data.status.code == 1019) {
      //     await BankAccount.update(
      //       {
      //         status_bank: "Banned",
      //         //
      //       },
      //       {
      //         where: { id: accountFroms.id },
      //       }
      //     );
      //     //console.log("Eoor ไม่สามารถทำรายการได้ กรุณาติดต่อ 02-777-7777")

      //     if (err) {
      //       return {
      //         // data: gologin.data,
      //         message: "Eoor ไม่สามารถทำรายการได้ กรุณาติดต่อ 02-777-7777",
      //       };

      //       //accountFroms.auth = gologin.auth;
      //     }
      //   }

      //   //let gologin = await ;

      //   // if (gologin.message == "Success") {
      //   //   accountFroms.auth = gologin.auth;
      //   // }
      // } else {
      //   if (
      //     body.amount >= results.setting_Merchant.minimumWithdrawalAmount &&
      //     body.amount <= results.setting_Merchant.maximumWithdrawalAmount
      //   ) {
      //     const req_con = await transferconfirmationsby(
      //       chack_auth.data,
      //       chackv2,
      //       accountFroms,
      //       accountFroms.auth
      //     );

      //     if (req_con.status == true) {
      //       let dataacc = {
      //         accfrom: {
      //           accountNumber: accountFroms.accountNumber,
      //           name: accountFroms.accountName,
      //           merchantId: req.user.id,
      //         },
      //       };

      //       return ReS(
      //         res,
      //         {
      //           data: req_con.data,
      //           ...dataacc,
      //           message: "success",
      //         },
      //         200
      //       );
      //     } else {
      //       return ReE(
      //         res,
      //         { message: "เกิดข้อผิดพลาดในการดำเนินการ", data: req_con.data },
      //         400
      //       );
      //     }
      //   } else {
      //     return ReE(
      //       res,
      //       { message: "จำนวนเงินไม่ถูกต้อง", data: creates },
      //       400
      //     );
      //     // แสดงข้อความแจ้งเตือน หรือส่ง error response
      //     // console.error("");
      //   }
      // }

      //  let chackv2 = await getWithdrawalTransactions_by(creates.id);
    } else if (body.type_withdraw == "manual") {
      return ReS(
        res,
        {
          data: creates,
          message: "success",
        },
        200
      );
    }

    //console.log(chack_auth)

    // //  ตรวจสอบรายการถอนที่รอดำเนินการ (ปิดการใช้งาน)

    // // สร้างรายการ TransactionsV2

    // // ดำเนินการถอนเงินแบบอัตโนมัติ
    // if (body.type_withdraw == "auto") {

    //
    //   const req_ver = await verify_withdrawsby(chack);

    //   if (req_ver.message == "success") {
    //     const req_con = await transferconfirmationsby(req_ver.data, chack);
    //     return ReS(
    //       res,
    //       {
    //         data: req_con,
    //         message: "success",
    //       },
    //       200
    //     );
    //   } else {
    //     return ReE(
    //       res,
    //       {
    //         data: req_ver,
    //         message: "error",
    //       },
    //       200
    //     ); // ควรใช้ status code ที่เหมาะสม เช่น 500 สำหรับ error
    //   }
    // }

    // // ดำเนินการถอนเงินแบบ manual
    // else if (body.type_withdraw == "manual") {
    //   return ReS(
    //     res,
    //     {
    //       data: creates,
    //       message: "success",
    //     },
    //     200
    //   );
    //

    // ส่ง notification
  } catch (error) {
    // จัดการข้อผิดพลาด
    console.error(error);
    return ReE(res, { message: "เกิดข้อผิดพลาดในการดำเนินการ" }, 500);
  }
};
async function getWithdrawalTransactions() {
  try {
    const transactions = await TransactionsV2.findAll({
      include: [
        {
          model: Member,
          as: "members",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
        {
          model: Transaction_withdraw,
          as: "Transaction_withdraws",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
        {
          model: Admin,
          as: "Admins",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        type_option: "ถอน",
      },
      order: [["id", "desc"]],
    });

    const dataall = await Promise.all(
      transactions.map(async (transaction) => {
        const bank = await Bank.findByPk(transaction.members.bankId);
        return { ...transaction.toJSON(), bank: bank ? bank.toJSON() : null };
      })
    );

    return dataall;
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
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

const gtdata_withdraw = async function (req, res) {
  try {
    let body = req.body;
    // const startDate = new Date(
    //   // moment().startOf("day").format("YYYY-MM-DD HH:mm")
    // );
    // const endDate = new Date(moment().endOf("day").format("YYYY-MM-DD HH:mm"));
    const startDate = new Date(
      moment(body.startDate ? body.startDate : '')
        .subtract(1, "day")
        .set({ hour: 22, minute: 0, second: 0, millisecond: 0 })
        .format("YYYY-MM-DD HH:mm:ss")
    );
    const endDate = new Date(
      moment(body.endDate ? body.endDate : '')
        .endOf("day")
        .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
        .format("YYYY-MM-DD HH:mm:ss.SSS")
    );

    const page = parseInt(body.offset) || 1; //  หน้าปัจจุบัน, เริ่มต้นที่ 1
    const limit = body.limit ? parseInt(body.limit) : 10; // จำนวนรายการต่อหน้า
    const offset = (page - 1) * limit; // คำนวณ offset


    // const transactions = await TransactionsV2.findAndCountAll({
      
    //   where: {
       
    //     created_at: {
    //       [Op.between]: [startDate, endDate],
    //     },
    //   },
    //   offset: body.offset,
    //   limit: body.limit,
    //   order: [["id", "desc"]],
    // });


    console.log(req.user)
    const transactionsv2 = await TransactionsV2.findAndCountAll({
      
      where: {
        type: "withdraw",
        merchantId:req.user.merchantId
      //  merchantId:req.user.merchantId
      },
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });
    return ReS(res, {
      data: transactionsv2,
      //datapanding: transactionsv2,
      code: 1000,
      startDate: startDate,
      endDate: endDate,
      message: "success",
    });
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    return ReE(
      res,
      { message: "Failed to fetch members", error: error.message },
      500
    );
  }
 
};

const verify_withdraws = async function (req, res) {
  let body = req.body;

  let accountFroms = await BankAccount.findOne({
    where: {
      merchantId: body.members.merchantId,
      accountType: "withdrawal",
      status_bank: "Active",
    },
  });
  // console.log(body);
  if (!accountFroms) {
    return ReE(res, {
      // data: body,
      message: "success",
    });
  }

  let chack_auth = await Apiscb_helper.chack_auth(accountFroms.auth);

  if (chack_auth.data.status.code === "1002") {
    let datalogin = {
      deviceId: accountFroms.deviceId,
      pin: accountFroms.pin,
      id: accountFroms.id,
      accountNo: accountFroms.accountNumber,
    };

    let gologin = await Apiscb_helper.Loginbank_auth(datalogin);

    if (gologin.message == "Success") {
      accountFroms.auth = gologin.auth;
    }
  }

  //console.log(chack_auth.data)

  let transferType = "";
  let bank = await Bank.findOne({
    where: {
      id: body.members.bankId,
    },
  });

  if (bank.scb_code == "014") {
    transferType = "3RD";
  } else {
    transferType = "ORFT";
  }

  let datapost = await scb.transferverification(
    body.members.bankAccountNumber,
    body.amount,
    transferType,
    accountFroms.accountNumber,
    bank.scb_code,
    accountFroms.auth
  );

  if (datapost.data.status.code === 1000) {
    let bank_f = await Bank.findOne({
      where: {
        id: accountFroms.bankId,
      },
    });

    let dataall = {
      dataapi: datapost.data,
      accfrom: {
        accountNumber: accountFroms.accountNumber,
        name: accountFroms.accountName,
        bank: bank_f,
      },
      accto: {
        accountNumber: body.members.bankAccountNumber,
        name: body.members.bankAccountName,
        bank: bank,
      },
    };

    return ReS(
      res,
      {
        data: dataall,
        message: "success",
      },
      200
    );
  } else {
    return ReE(res, {
      data: datapost.data,
      message: "Error เกิดข้อผิดพลาด",
    });
  }
  //   let datasace = {
  //     accountTo: body.members.bankAccountNumber,
  //     amount: body.amount,
  //     transferType: transferType,
  //     accountFrom: accountFroms.accountNumber,
  //     accountToBankCode: bankss.scb_code,
  //     auth: accountFroms.auth,
  //   };
  // console.log(datasace)
};

const verify_withdrawsby = async function (bodys) {
  let body = bodys;

  let accountFroms = await BankAccount.findOne({
    where: {
      merchantId: body.members.merchantId,
      accountType: "withdrawal",
      status_bank: "Active",
    },
  });

  if (!accountFroms) {
    return {
      // data: dataall,
      message: "ไม่มี บัญชี ถอนในระบบ ที่พร้อมใช้งาน หรือ เปิดใช้งาน",
    };
  }
  let chack_auth = await Apiscb_helper.chack_auth(accountFroms.auth);

  if (chack_auth.data.status.code === "1002") {
    let datalogin = {
      deviceId: accountFroms.deviceId,
      pin: accountFroms.pin,
      id: accountFroms.id,
      accountNo: accountFroms.accountNumber,
    };
    let auth_info, err, user, gologin;

    [err, gologin] = await to(Apiscb_helper.Loginbank_auth(datalogin));

    if (gologin.data.status.code == 1019) {
      await BankAccount.update(
        {
          status_bank: "Banned",
          //
        },
        {
          where: { id: accountFroms.id },
        }
      );
      //console.log("Eoor ไม่สามารถทำรายการได้ กรุณาติดต่อ 02-777-7777")

      if (err) {
        return {
          // data: gologin.data,
          message: "Eoor ไม่สามารถทำรายการได้ กรุณาติดต่อ 02-777-7777",
        };

        //accountFroms.auth = gologin.auth;
      }
    }
    //let gologin = await ;

    if (gologin.message == "Success") {
      accountFroms.auth = gologin.auth;
    }
  }

  // let transferType = "";
  // let bank = await Bank.findOne({
  //   where: {
  //     id: body.members.bankId,
  //   },
  // });

  // if (bank.scb_code == "014") {
  //   transferType = "3RD";
  // } else {
  //   transferType = "ORFT";
  // }

  // let datapost = await scb.transferverification(
  //   body.members.bankAccountNumber,
  //   body.amount,
  //   transferType,
  //   accountFroms.accountNumber,
  //   bank.scb_code,
  //   accountFroms.auth
  // );

  // if (datapost.data.status.code === 1000) {
  //   let bank_f = await Bank.findOne({
  //     where: {
  //       id: accountFroms.bankId,
  //     },
  //   });

  //   let dataall = {
  //     dataapi: datapost.data,
  //     accfrom: {
  //       accountNumber: accountFroms.accountNumber,
  //       name: accountFroms.accountName,
  //       bank: bank_f,
  //     },
  //     accto: {
  //       accountNumber: body.members.bankAccountNumber,
  //       name: body.members.bankAccountName,
  //       bank: bank,
  //     },
  //   };

  //   return {
  //     data: dataall,
  //     message: "success",
  //   };
  // } else {
  //   return {
  //     data: datapost.data,
  //     message: "Error เกิดข้อผิดพลาด",
  //   };
  // }
  //   let datasace = {
  //     accountTo: body.members.bankAccountNumber,
  //     amount: body.amount,
  //     transferType: transferType,
  //     accountFrom: accountFroms.accountNumber,
  //     accountToBankCode: bankss.scb_code,
  //     auth: accountFroms.auth,
  //   };
  // console.log(datasace)
};

const transferconfirmations = async function (req, res) {
  let body = req.body;

  let accountFroms = await BankAccount.findOne({
    where: {
      accountNumber: body.data_api.accfrom.accountNumber,
    },
  });

  //

  if (!accountFroms) {
    return ReE(res, {
      //  data: datapost.data,
      message: "Error เกิดข้อผิดพลาด",
    });
  }

  let chack_auth = await Apiscb_helper.chack_auth(accountFroms.auth);

  if (chack_auth.data.status.code === "1002") {
    let datalogin = {
      deviceId: accountFroms.deviceId,
      pin: accountFroms.pin,
      id: accountFroms.id,
      accountNo: accountFroms.accountNumber,
    };
    let gologin = await Apiscb_helper.Loginbank_auth(datalogin);
    if (gologin.message == "Success") {
      accountFroms.auth = gologin.auth;
    }
  }
  const data = {
    accountFrom: accountFroms.accountNumber,
    accountTo: body.data_api.accto.accountNumber,
    accountToName: body.data_api.accto.name,
    botFee: 0,
    pccTraceNo: body.data_api.dataapi.data.pccTraceNo,
    amount: body.data_req.amount,
    feeType: body.data_api.dataapi.data.feeType,
    fee: 0,
    scbFee: 0,
    sequence: body.data_api.dataapi.data.sequence,
    transactionToken: body.data_api.dataapi.data.transactionToken,
    channelFee: 0,
    accountToBankCode: body.data_api.dataapi.data.accountToBankCode,
    terminalNo: body.data_api.dataapi.data.terminalNo,
    transferType: body.data_api.dataapi.data.transferType,
    accountFromType: 2,
    accountFromName: body.data_api.dataapi.data.accountFromName,
    auth: accountFroms.auth,
  };

  let dataposts = await scb.transferconfirmation(data);

  if (dataposts.data.status.code == 1000) {
    let datasave = {
      transaction_id: body.data_req.id,
      recipientName: body.data_req.members.bankAccountName,
      recipientAccount: body.data_req.members.bankAccountNumber,
      amount: body.data_req.amount,
      remark: "",
      recipientBank: body.data_api.dataapi.data.accountFromName,
      senderAccount: body.data_api.dataapi.data.accountFromName,
      qrString: dataposts.data.data.additionalMetaData.paymentInfo[0].QRstring,
      transactionId: dataposts.data.data.transactionId,
      transactionDateTime: dataposts.data.data.transactionDateTime,
      status: "success",
      description: "",
      reqby_admin_id: req.user.id,
      ref: "",
      member_id: body.data_req.members.id,
    };
    let saveTransaction_withdraw = await Transaction_withdraw.create(datasave);

    await TransactionsV2.update(
      {
        status: "success",
        //
      },
      {
        where: { id: body.data_req.id },
      }
    );

    let datausers = await Transaction_withdraw.findOne({
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
          model: TransactionsV2,
          as: "Transactions", // Use the correct alias from your model definition
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

    let goapi = await Apicllback.submitwithdrawTransaction(datausers);
    // order: [["id", "DESC"]],
    //           limit: 10,
    // console.log(saveTransaction_withdraw)

    return ReS(res, {
      data: goapi.data,
      message: "Success",
    });
  }

  //สร้างตัวแปร ชื่อผู้รับ เลขบัญชีผู้รับ ธนาคารผู้รับ โอนจาดเลขบัญชี จำนวนเงิน QRstring transactionId transactionDateTime status

  //console.log(dataposts.data)
};

const transferconfirmationsby = async function (
  da,
  TransactionModel, // Assuming this is a Sequelize model
  accountFroms,
  auth
) {
  try {
    // 1.  สร้าง data สำหรับ request
    const data = JSON.stringify({
      accountTo: TransactionModel.members.bankAccountNumber,
      accountNo: accountFroms.accountNumber,
      api_auth: auth,
      amount: TransactionModel.amount,
      accountToBankCode: TransactionModel.bank.scb_code,
    });

    // 2. กำหนด config สำหรับ axios
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://scb.promplayvip.com/scbeasy/transfer/verificationv2",

      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IjRiZDIwM2Q4LTZkY2QtNGE4MC1iYjdlLTg2NDVlNzM2Y2NjNyIsInVzZXJfdHlwZSI6Ik1lcmNoYW50IiwiaWF0IjoxNzQwNjE2NDgxLCJleHAiOjE3NzIxNTI0ODF9.Ty61wohypWK4tcXIWJow7uK-SmKOALAoQ8vz_9uHQxk",
      },
      data: data,
    };

    // 3. ส่ง request ด้วย axios
    // const response = await
    let response, err, user;

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
    console.error("Error in transferconfirmationsby:", error);
    // Handle the error appropriately, e.g., send an error response
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

module.exports = {
  withdraw,
  gtdata_withdraw,
  verify_withdraws,
  transferconfirmations,
};
