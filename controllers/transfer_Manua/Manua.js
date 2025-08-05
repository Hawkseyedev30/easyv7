var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Admin,
  Member,
  Transaction_manual,
  Transaction_withdraw,
  TransactionsV2,
} = require("../../models");
const { ReE, ReS, to } = require("../../services/util.service");
//const config = require("../../services/app.service");
const app = require("../../services/app.service");
//const { to, ReE, ReS, TE } = require("../../services/util.service");
const config = require("../../config/app.json")[app["env"]];
const Apiscb_helper = require("../../helpers/login.helpers");
const ApiKrungthaibus_helper = require("../../helpers/krungthai_bus");
const api_dis = require("../merchang/deposit_controller");
const scbeasys = require("../scb/classscb");
const scb = new scbeasys();
const { Op } = require("sequelize");
var fs = require("fs");
const multer = require("multer");
const Jimp = require("jimp");
const jsQr = require("jsqr");
var md5 = require("md5");
var moment = require("moment");
require("moment/locale/th");
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
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");
const saveTransaction = async (transactionData) => {
  try {
    // เชื่อมต่อกับฐานข้อมูล (สมมติว่าคุณใช้ Sequelize)
    const transaction = await Transaction_withdraw.create(transactionData);

    console.log(transaction);
    // console.log('TransactionsV2 saved:', transaction.id);
    return { id: transaction.id }; // คืนค่า true ถ้าบันทึกสำเร็จ
  } catch (error) {
    // console.error('Error saving transaction:', error);
    return false; // คืนค่า false ถ้าบันทึกไม่สำเร็จ
  }
};
function generateUuid() {
  return uuidv4();
}
async function fetchWrapper(...args) {
  const { default: fetch } = await import("node-fetch");
  return fetch(...args);
}
async function qr(url) {
  try {
    const response = await fetchWrapper(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const image = await Jimp.read(buffer);
      const { width, height, data } = image.bitmap;
      const qrCodeImageData = new Uint8ClampedArray(data.buffer);
      const qrCode = jsQr(qrCodeImageData, width, height);

      if (qrCode) {
        return qrCode.data;
      } else {
        console.log("No QR code found in the image.");
        return null; // Or perhaps a specific error object
      }
    } catch (jimpError) {
      console.error("Error processing image with Jimp:", jimpError);
      return null; // Or a specific error object
    }
  } catch (fetchError) {
    console.error("Failed to fetch or process the image:", fetchError);
    return null; // Or a specific error object
  }
}

// async function qr(url) {
//   try {

//     //ถ้า เป็๋นไฟล์ ประเภท jpg  ให้แปลงเป็น Png
//     // Use the fetchWrapper
//     const response = await fetchWrapper(url);
//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Load the image with Jimp
//     const image = await Jimp.read(buffer);
//     const { width, height, data } = image.bitmap;

//     // Convert image data to a format jsQR can understand
//     const qrCodeImageData = new Uint8ClampedArray(data.buffer);

//     // Decode the QR code
//     const qrCode = jsQr(qrCodeImageData, width, height);

//     if (qrCode) {
//       return qrCode.data;
//     } else {
//       console.log("No QR code found.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Failed to decode QR code:", error);
//     return null;
//   }
// }
const upload_transfer_Manua = async function (req, res) {
  try {
    const { body } = req;

    const { file } = req;

    if (!file) {
      return ReE(res, { message: "Please upload a file." }, 200);
    }

    const filePath = file.path;
    const fileName = file.filename;
    const fileType = file.mimetype;

    const Transaction_data = await TransactionsV2.findOne({
      where: {
        id: body.transaction_id,
      },
    });

    // Process the uploaded file as needed
    // For example, you can save the file information to the database

    return ReS(
      res,
      { message: "File uploaded successfully", filePath, fileName, fileType },
      200
    );
  } catch (error) {
    console.error("Error during file upload:", error);
    return ReE(res, { message: "Internal server error" }, 500);
  }
};

async function chackslip(newManual, url, userId) {
  try {
    //  const data_url = await qr(url);
    const axios = require("axios");
    let data = JSON.stringify({
      img_url: url,
      api_auth: auth,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://sbc.promplayvip.com/scbeasy/payments/bill/scan/url",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "{{token}}",
      },
      data: data,
    };
    const response = await axios.request(config);
    return { data: response.data, headers: response.headers };
  } catch (error) {
    return error;
  }
}

const chack_upload_Manual = async function (req, res) {

  
  var dir = `${__dirname}/../../storage/qr/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // console.log("body", req.body);

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

    if (!body.transaction_id) {
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
      const user = await TransactionsV2.findOne({
        include: [
          {
            model: Member,
            as: "members",
            attributes: {
              exclude: ["deleted_at", "created_at", "updated_at"],
            },
            required: true,
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
          id: body.transaction_id,
        },
      }); // สมมติว่ามีฟังก์ชัน  findUserById
      if (!user) {
        return ReE(res, {
          data: null,
          code: 404, // not found
          message: "ไม่พบผู้ใช้",
        });
      }
      const data_url = await qr(config.bucketBaseURL + contactSupportImgePath);

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

      let databank = {
        deviceId: "7eeabffb-2de9-491c-86c0-a33e1cf91ef3",
      };

      const verify_user = await Apiscb_helper.posy_verifyusers(
        databank.deviceId
      );
      if (verify_user.data.data.status.code === 1000) {
        let err, success;

        [err, success] = await to(
          Apiscb_helper.upload_verifyusers(
            data_url,
            verify_user.data.headers["api-auth"]
          )
        );

        if (err || !success || success.data.status.code !== 1000) {
          console.error(
            "Error verifying slip:",
            err || success?.data?.status?.description
          );
          //   await TransactionsV2.update(
          //     {
          //       status: 'failed', // Or 'error'
          //       slip_check_status: 'error',
          //       slip_check_details: JSON.stringify(err || success?.data || 'API Error'),
          //       slip_image_url: config.bucketBaseURL + contactSupportImgePath
          //     },
          //     { where: { id: user.id } }
          //   );
          return ReE(
            res,
            {
              message: "เกิดข้อผิดพลาดในการตรวจสอบสลิปกับ SCB",
              error: err || success?.data,
            },
            500
          );
        }

        let dataslip = success.data.data.pullSlip;

        // --- เปรียบเทียบชื่อ ---
        let slipReceiverNameRaw = dataslip.receiver.name;
        let time_up = moment(body.time_slib).format("YYYY-MM-DD HH:mm");
        let timeslip = moment(dataslip.dateTime).format("YYYY-MM-DD HH:mm");
        let transactionNameMemberRaw = user.name_member; // ตรวจสอบให้แน่ใจว่า property นี้ถูกต้อง

        // ฟังก์ชันสำหรับ normalize ชื่อ (ลบคำนำหน้า, ตัดช่องว่าง, ทำให้เป็นตัวพิมพ์เล็ก)
        const normalizeName = (name) => {
          if (!name) return "";
          let lowerCaseName = name.trim().toLowerCase();
          // ลบคำนำหน้าชื่อภาษาไทยและอังกฤษที่พบบ่อย
          return lowerCaseName.replace(
            /^(mrs\.|miss|ms\.|mr\.|dr\.|นางสาว|น\.ส\.|นาง|นาย|ด\.ช\.|ด\.ญ\.)\s+/i,
            ""
          );
        };

        let normalizedSlipName = normalizeName(slipReceiverNameRaw);
        let normalizedTransactionName = normalizeName(transactionNameMemberRaw);

        console.log("Slip Receiver Name (Raw):", slipReceiverNameRaw);
        console.log("TransactionsV2 Name Member (Raw):", transactionNameMemberRaw);
        console.log("Normalized Slip Name:", normalizedSlipName);
        console.log("Normalized TransactionsV2 Name:", normalizedTransactionName);

        console.log(normalizedSlipName);
        console.log(normalizedTransactionName);

        if (
          normalizedSlipName === normalizedTransactionName &&
          time_up == timeslip
        ) {
          const cahack_inq = await TransactionsV2.findOne({
            include: [
              {
                model: Member,
                as: "members",
                attributes: {
                  exclude: ["deleted_at", "created_at", "updated_at"],
                },
                required: true,
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
              },
            ],
            where: {
              id: body.transaction_id,
            },
          }); // สมมติว่ามีฟังก์ชัน  findUserById

          if (success.data.data.amount !== cahack_inq.amount) {
            return ReE(
              res,
              {
                message: "ยอดเงินไม่ตรง กับในสลิป",
                slip_data: dataslip,
                transaction_data: user,
              },
              400
            ); // ใช้ HTTP status code ที่เหมาะสม
          }
          let datasaves = {
            transaction_id: cahack_inq.id,
            recipientName: cahack_inq.members.bankAccountName,
            recipientAccount: cahack_inq.members.bankAccountNumber,
            amount: cahack_inq.amount,
            remark: "ถอนโดย Uploadslip",
            recipientBank: "",
            qrString: data_url,
            transactionId: dataslip.transRef,
            transactionDateTime: dataslip.dateTime,
            status: "success",
            description: "",
            reqby_admin_id: req.user.id,
            ref: cahack_inq.ref,
            // senderAccountId: cahack_banktranfer.id,
            member_id: cahack_inq.members.id,
          };


          let Transaction_withdraws = await Transaction_withdraw.findOne({
            where: {
              transaction_id:cahack_inq.id
            }
          })

          if(!Transaction_withdraws) {
            let saveTransaction_withdraws = await saveTransaction(datasaves);
          }else {

            let Transactions_v = await Transaction_withdraw.update(
              datasaves,
              { where: { id: Transaction_withdraws.id } }
            );

          }

          //
          //       // 5. บันทึก transaction
         
          //   console.log(success.data.data.amount)
          // console.log("ชื่อผู้รับตรงกัน (หลังจาก normalize)");
          // เพิ่ม logic กรณีชื่อตรงกัน เช่น อัปเดตสถานะ transaction
          await TransactionsV2.update(
            {
              status: "success", // หรือสถานะที่เหมาะสม
              slip_check_status: "verified",
              nodere: `ถอนโดย แอดมิน ${req.user.name}`,
              uuid: dataslip.transRef,

              longtext_res: JSON.stringify(dataslip),
              slip_image_url: config.bucketBaseURL + contactSupportImgePath,
            },
            { where: { id: user.id } }
          );
          return ReS(
            res,
            {
              message: "ตรวจสอบสลิปสำเร็จ ชื่อตรงกัน",
              slip_data: dataslip,
              transaction_data: cahack_inq,
            },
            200
          );
        } else {
          let rem = "";
          if (timeslip != time_up) {
            rem = `เวลาไม่ตรงกัน  เวลาใน สลิประบุ ${timeslip} แต่ ที่แจ้งมา ${time_up}`;
          } else {
            rem = `ชื่อผู้รับในสลิป (${slipReceiverNameRaw}) ไม่ตรงกับชื่อในระบบ (${transactionNameMemberRaw})`;
          }

          console.log("ชื่อผู้รับไม่ตรงกัน");
          // เพิ่ม logic กรณีชื่อไม่ตรงกัน
          //   await TransactionsV2.update(
          //     {
          //       status: 'failed', // หรือ 'mismatch'
          //       slip_check_status: 'mismatch',
          //       slip_check_details: JSON.stringify(dataslip),
          //       slip_image_url: config.bucketBaseURL + contactSupportImgePath
          //     },
          //     { where: { id: user.id } }
          //   );
          return ReE(
            res,
            {
              message: rem,
              slip_data: dataslip,
              transaction_data: user,
            },
            400
          ); // ใช้ HTTP status code ที่เหมาะสม
        }
        // --- สิ้นสุดการเปรียบเทียบชื่อ ---

        // console.log(success.data.data);
      }
    }
  });
};
const update_autokbank = async function (req, res) {
  try {
    let body = req.body;

    let cahack_banktranfers = await BankAccount.findOne({
      where: {
        accountType: "withdrawal",
        status_bank: "Active",
        channel:"k-biz"
        // balance: { [Op.gte]: cahack_inq.amount },
      },
      order: [["updated_at", "ASC"]],
    });


  if(!cahack_banktranfers) {
    return ReE(
      res,
      {
        message: "กรุงณาเปิดใช้งาน บัญชีธนาคาร กสิกร",
      },
      200
    );

  }

    const cahack_inq = await TransactionsV2.findOne({
      include: [
        {
          model: Member,
          as: "members",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
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
        },
      ],
      where: {
        id: body.transaction_id,
      },
    }); // สมมติว่ามีฟังก์ชัน  findUserById

    if (cahack_inq.status == "inq_manual") {
      return ReE(
        res,
        {
          message: cahack_inq.nodere,
        },
        200
      );
    }

    let Transactions_v = await TransactionsV2.update(
      {
        status: "inq_manual", // หรือสถานะที่เหมาะสม

        nodere: `รอถอน manual โดย แอดมิน ${req.user.name}`,
        //  uuid: dataslip.transRef,
        reqby_admin_id: req.user.id,
        // longtext_res: JSON.stringify(dataslip),
        // slip_image_url: config.bucketBaseURL + contactSupportImgePath,
      },
      { where: { id: cahack_inq.id } }
    );

    if (Transactions_v) {
      const cahack_inq2 = await TransactionsV2.findOne({
        include: [
          {
            model: Member,
            as: "members",
            attributes: {
              exclude: ["deleted_at", "created_at", "updated_at"],
            },
            required: true,
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
          },
        ],
        where: {
          id: body.transaction_id,
        },
      }); // สมมติว่ามีฟังก์ชัน  findUserById

   

      Object.defineProperty(exports, "__esModule", { value: true });
      const kbankAccount_1 = require("../../kbank/dist/kbankAccount");
      //  let transferData
      // bank: { username: 'Nattha3113', pin: 'Nat200**' }
      let mybank = new kbankAccount_1.kbankAccount(
        `${cahack_banktranfers.deviceId}`,
        `${cahack_banktranfers.pin}`,
        ``
      );

      let login = await mybank.login();

      //await sleep(1000);
      //Login
      //console.log("0 getSession...");
      await mybank.getSession(login);
      //await sleep(1000);
      //console.log("1 getRefresh...");
      await mybank.refreshSession(
        `https://kbiz.kasikornbankgroup.com/login?dataRsso=${login}`
      );

      let Transactions_vcahack_banktranfers = await BankAccount.update(
        {
          auth: login,
          // longtext_res: JSON.stringify(dataslip),
          // slip_image_url: config.bucketBaseURL + contactSupportImgePath,
        },
        { where: { id: cahack_banktranfers.id } }
      );
      //await sleep(1000);
      //console.log("2 getBankAccount...");
      let account = await mybank.getBankAccount();
      // console.log(account);
      //Using profile 1
      let acc = account.ownAccountList[0];
      //console.log(acc);
      await mybank.refreshSession(
        "https://kbiz.kasikornbankgroup.com/menu/fundtranfer/fundtranfer"
      );
      //  await sleep(1500);
      // transferData = await mybank.bankTransferOrft(Banks.scb_code, req.body.accountNo, '1.00', acc); //For kbank
      let errr, transferData;

      let databank = cahack_inq2.members.banks;
      //   where: {
      //     bank_id: cahack_banktranfers.bankId,
      //   },
      // });
      //const data_uuid = response.data.data;
      if (databank.scb_code == "004") {
        [errr, transferData] = await to(
          mybank.bankTransferOther(
            databank.scb_code,
            cahack_inq2.members.bankAccountNumber,
            cahack_inq2.amount,
            acc,
            "th"
          )
        );
      } else {
        //   let errr, transferData;

        [errr, transferData] = await to(
          mybank.bankTransferOrft(
            databank.scb_code,
            cahack_inq2.members.bankAccountNumber,
            cahack_inq2.amount,
            acc,
            "th"
          )
        );
      }
      console.log(transferData)

      if (errr) {
        return ReE(res, {
          data: req.body,
          code: 102,
          message: "Error ไม่สามารถ login ได้",
        });
      }

      let Transactions_v = await TransactionsV2.update(
        {
          status: "inq_manual", // หรือสถานะที่เหมาะสม

          nodere: `รอถอน manual โดย แอดมิน ${req.user.name}`,
          //  uuid: dataslip.transRef,
          reqby_admin_id: req.user.id,
          description: transferData.data.rqUID,
          uuid: transferData.data.reqRefNo,
          remark: transferData.data.transType,
          // longtext_res: JSON.stringify(dataslip),
          // slip_image_url: config.bucketBaseURL + contactSupportImgePath,
        },
        { where: { id: cahack_inq.id } }
      );

      //console.log(transferData)

      let datasaves = {
        transaction_id: cahack_inq2.id,
        recipientName: transferData.data.beneficiaryName,
        recipientAccount: transferData.data.beneficiaryNo,
        amount: transferData.data.amount,
        remark: "",
        recipientBank: transferData.data.bankAbv,
        senderAccount: transferData.data.fromAccountNo,
        qrString: transferData.data.link,
        transactionId: transferData.data.tokenId,
        transactionDateTime: transferData.data.createDate,
        status: "pending",
        description: transferData.data.rqUID,
        reqby_admin_id: 4,
        X_SESSION_IBID: transferData.hreader["X-SESSION-IBID"],
        X_REQUEST_ID: transferData.hreader["X-REQUEST-ID"],
        Authorization: transferData.hreader["Authorization"],
        senderAccountId: cahack_banktranfers.id,
        member_id: cahack_inq2.members.id,
      };

      // 5. บันทึก transaction
      let saveTransaction_withdraw = await saveTransaction(datasaves);

      return ReS(
        res,
        {
          message: cahack_inq2.nodere,
          data_tranfer: cahack_inq2,
          data: transferData,
        },
        200
      );
    }
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    return ReE(
      res,
      { message: "Failed to fetch members", error: error.message },
      500
    );
  }
};

const update_stust_Manual = async function (req, res) {


  // try {
  //   let body = req.body;

  //   console.log(body);
  //   const cahack_inq = await TransactionsV2.findOne({
  //     include: [
  //       {
  //         model: Member,
  //         as: "members",
  //         attributes: {
  //           exclude: ["deleted_at", "created_at", "updated_at"],
  //         },
  //         required: true,
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
  //       },
  //     ],
  //     where: {
  //       id: body.transaction_id,
  //     },
  //   }); // สมมติว่ามีฟังก์ชัน  findUserById

  //   if (cahack_inq.status == "inq_manual") {
  //     return ReE(
  //       res,
  //       {
  //         message: cahack_inq.nodere,
  //       },
  //       200
  //     );
  //   }

  //   let Transactions_v = await TransactionsV2.update(
  //     {
  //       status: "inq_manual", // หรือสถานะที่เหมาะสม

  //       nodere: `รอถอน manual โดย แอดมิน ${req.user.name}`,
  //       //  uuid: dataslip.transRef,
  //       reqby_admin_id: req.user.id,
  //       // longtext_res: JSON.stringify(dataslip),
  //       // slip_image_url: config.bucketBaseURL + contactSupportImgePath,
  //     },
  //     { where: { id: cahack_inq.id } }
  //   );

  //   if (Transactions_v) {
  //     const cahack_inq2 = await TransactionsV2.findOne({
  //       include: [
  //         {
  //           model: Member,
  //           as: "members",
  //           attributes: {
  //             exclude: ["deleted_at", "created_at", "updated_at"],
  //           },
  //           required: true,
  //           include: [
  //             {
  //               as: "banks",
  //               model: Bank,
  //               attributes: {
  //                 include: [],
  //                 exclude: ["deleted_at", "created_at", "updated_at"],
  //               },
  //               required: true,
  //               // where: { to_user_id: user_id, request_status: "Requested" },
  //             },
  //           ],
  //         },
  //       ],
  //       where: {
  //         id: body.transaction_id,
  //       },
  //     }); // สมมติว่ามีฟังก์ชัน  findUserById

  //     return ReS(
  //       res,
  //       {
  //         message: cahack_inq2.nodere,
  //       },
  //       200
  //     );
  //   }
  // } catch (error) {
  //   console.error("Error fetching withdrawal transactions:", error);
    return ReE(
      res,
      { message: "Failed to WTF", error: error.message },
      200
    );
  // }
};

const chack_stuaus_kbank = async function (req, res) {


  // try {
  //   let body = req.body;
  //   let cahack_banktranfers = await BankAccount.findOne({
  //     where: {
  //       accountType: "withdrawal",
  //       status_bank: "Active",
  //       // balance: { [Op.gte]: cahack_inq.amount },
  //     },
  //     order: [["updated_at", "ASC"]],
  //   });

  //   const cahack_inq2 = await TransactionsV2.findOne({
  //     include: [
  //       {
  //         model: Member,
  //         as: "members",
  //         attributes: {
  //           exclude: ["deleted_at", "created_at", "updated_at"],
  //         },
  //         required: true,
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
  //       },
  //     ],
  //     where: {
  //       id: body.transaction_id,
  //     },
  //   });

  //   if (!cahack_inq2) {
  //     return ReE(
  //       res,
  //       { message: `Failed transaction_id ${body.transaction_id}` },
  //       500
  //     );
  //   }
  //   const Transaction_withdraws = await Transaction_withdraw.findOne({
  //     include: [
  //       {
  //         model: TransactionsV2,
  //         as: "Transactions",
  //         attributes: {
  //           exclude: ["deleted_at", "created_at", "updated_at"],
  //         },
  //         required: true,
  //         include: [
  //           {
  //             model: Member,
  //             as: "members",
  //             attributes: {
  //               exclude: ["deleted_at", "created_at", "updated_at"],
  //             },
  //             required: true,
  //             include: [
  //               {
  //                 as: "banks",
  //                 model: Bank,
  //                 attributes: {
  //                   include: [],
  //                   exclude: ["deleted_at", "created_at", "updated_at"],
  //                 },
  //                 required: true,
  //                 // where: { to_user_id: user_id, request_status: "Requested" },
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     ],
  //     where: {
  //       transaction_id: cahack_inq2.id,
  //     },
  //     order: [["updated_at", "DESC"]],
  //   });

  //   //console.log(Transaction_withdraws)

  //   const Apiscb_Kbankz = require("../../kbank/dist/index");
  //   //  // let chack = await Apiscb_Kbankz.Loginkbank_auth(cahack_banktranfers);

  //   let bodypost = {
  //     reqRefNo: Transaction_withdraws.Transactions.uuid,
  //     tokenId: Transaction_withdraws.Transactions.description,
  //     nonFinFlag: "N",
  //   };

  //   let chacktutus = await Apiscb_Kbankz.checkStatusApprove(
  //     cahack_banktranfers,
  //     bodypost
  //   );

  //   if (!chacktutus.tranStatus) {


  //     return ReE(res, { message: "success" }, 200);
   


  //   }

  //   if (chacktutus.tranStatus == "Success") {
  //     let Transactions_v = await TransactionsV2.update(
  //       {
  //         status: "success", // หรือสถานะที่เหมาะสม
  //         longtext_res: JSON.stringify(chacktutus),
  //       },
  //       { where: { id: cahack_inq2.id } }
  //     );
  //     let Transactions_vm = await Transaction_withdraw.update(
  //       {
  //         status: "success", // หรือสถานะที่เหมาะสม
  //         // longtext_res:JSON.stringify(chacktutus)
  //       },
  //       { where: { id: Transaction_withdraws.id } }
  //     );

  //     return ReS(res, { data: chacktutus, message: "success" }, 200);
  //   }
  // } catch (error) {
  //   console.error("Error fetching withdrawal transactions:", error);
  //   return ReE(
  //     res,
  //     { message: "Failed to fetch members", error: error.message },
  //     500
  //   );
  // }
};

const chack_stuaus_tranferrefkrungthai = async function (req, res) {


  try {
    let body = req.body;

    if(!body.instructionRefNo){
      return ReE(
        res,
        { message: "Failed to instructionRefNo"},
        500
      );
    }



    let cahack_banktranfers = await BankAccount.findOne({
      where: {
        accountType: "withdrawal",
        status_bank: "Active",
        // balance: { [Op.gte]: cahack_inq.amount },
      },
      order: [["updated_at", "ASC"]],
    });

    const cahack_inq2 = await TransactionsV2.findOne({
      include: [
        {
          model: Member,
          as: "members",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
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
        },
      ],
      where: {
        uuid: body.instructionRefNo,
      },
    });

    if (!cahack_inq2) {
      return ReE(
        res,
        { message: `Failed transaction_id ${body.transaction_id}` },
        500
      );
    }
    
    
    const chackauth = await ApiKrungthaibus_helper.balancekrungthai(cahack_banktranfers)


    if(!chackauth.data)  {

      
    }

    let chackref = await ApiKrungthaibus_helper.chack_instructionViewType(cahack_banktranfers,body.instructionRefNo)


    if(chackref.data.success == true)  {

      return ReS(res, { data: chackref.data, datatranfer:cahack_inq2,message: "success" }, 200);

    }

  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    return ReE(
      res,
      { message: "Failed to fetch members", error: error.message },
      500
    );
  }


}

module.exports = {
  upload_transfer_Manua,
  chack_upload_Manual,
  update_stust_Manual,
  chack_stuaus_kbank,
  update_autokbank,
  chack_stuaus_tranferrefkrungthai
};
