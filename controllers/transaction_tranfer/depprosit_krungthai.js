var {
  Admin,
  Activity_system,
  Role,
  Getdata_permissionsv1,
  RolePermission,
  BankAccount,
  Bank,
  Req_qrcode,
  Payments,
  Member,
  Transaction_tranfer,
  Transaction_withdraw,
  TransactionsV2,
  TransactionKrungthai,
  Create_deposits,
  Customers,
  Merchant
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];
const Apiscb_helper = require("../../helpers/login.helpers");
const ApiKtb_helper = require("../../helpers/krungthai_bus");
//const Apiscb_helper = require("../../helpers/login.helpers");
var moment = require("moment");
require("moment/locale/th");
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
const generatePayload = require("promptpay-qr");
const { v4: uuidv4 } = require("uuid");
const { permission } = require("process");
function conRes(res) {
  return Object.values(JSON.parse(JSON.stringify(res)));
}
function generateUuid() {
  return uuidv4();
}


const Apikrunthai_businessy = require("../../helpers/Apikrunthai_businessy");


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

const create_depprosit_krungthais = async function (req, res) {
  try {
    const body = req.body;

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
        id: body.bankAccountId,
      },
    });

    if (!databanlacc) {
      return ReE(res, { message: "ไม่พบธนาคาร" }, 200); // Use 500 Internal Server Error
    }


    // let user_member = await Customers.findOne({
    //   where: {
    //     userId: req.body.userId,
    //   },
    // });


    const decimal = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");

    // นำเศษสตางค์ไปต่อท้าย amount
    let amounts = parseFloat(req.body.amount) + "." + decimal;

    const accountNumber = databanlacc.telephoneNumber;

    const qrCode = await generatePaymentQRCode(amounts, accountNumber);


    const uuid = generateUuid();
    function generateQrExpireTime(minutes = 15) {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + minutes * 60000); // แปลงนาทีเป็น milliseconds
      return expiryDate.getTime();
    }

    const qrExpireTime = generateQrExpireTime(30);
    const paymentDataToSave = {
      platform_order_id: uuid,
      merchant_order_id: body.merchant_order_id, // ควรใช้ค่าที่ได้จาก API response เพื่อความถูกต้อง
      order_datetime: moment().toDate(), // แปลง string เป็น Date object
      expire_datetime: qrExpireTime, // แปลง string เป็น Date object
      amount: body.amount, // API ควรคืนค่า amount ที่ถูกต้อง
      transfer_amount: body.amount * 0.95 || null, // ถ้ามี หรือ null
      qrcode: qrCode || null,
      qrbase64: qrCode || null,
      type_pay: "deposit",
      status: "PANDING",
      bankAccountSenderId: body.bankAccountId,
    };

    // Deduct 5% from the deposit amount
    console.log(paymentDataToSave)
    //let Payments_save = await Payments.create(paymentDataToSave);

    //  return ReS(res, { data: Payments_save, message: "Success" }, 200); // Use 500 Internal Server Error
    // let user_Req_qrcode = await Req_qrcode.findOne({
    //   where: {
    //     status: "PENDING",
    //     userId: user_member.userId,
    //     // referenceId:req.body.referenceId
    //   },
    // });



    //console.log(databanlacc);

    // if (databanlacc.channel == "Wealth") {
    //   const uuid = generateUuid();
    //   function generateQrExpireTime(minutes = 15) {
    //     const now = new Date();
    //     const expiryDate = new Date(now.getTime() + minutes * 60000); // แปลงนาทีเป็น milliseconds
    //     return expiryDate.getTime();
    //   }

    //   const qrExpireTimew = generateQrExpireTime(30);

    //   let datasavee = {
    //     merchant_order_id: "ORDER" + Date.now(),
    //     amount: body.amount,
    //     bank: body.bank,
    //     account_name: body.account_name,
    //     account_no: body.accountNumber,
    //     notify_url: "https://merchant.com/callback/payment",
    //   };

    //   let datacreate = await ApiGateway_helper.get_create_deposits(datasavee);

    //   console.log(datacreate);

    //   return ReS(res, { data: datacreate, message: "An error occurred" }, 200); // Use 500 Internal Server Error
    // }
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};

const create_depprositgateway = async function (req, res) {
  try {
    const body = req.body;

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
        id: body.bankAccountSenderId,
      },
    });

    if (!databanlacc) {
      return ReE(res, { message: "ไม่พบธนาคาร" }, 200); // Use 500 Internal Server Error
    }

    // console.log(databanlacc)

    if (databanlacc.channel == "Wealth") {
      const uuid = generateUuid();
      function generateQrExpireTime(minutes = 15) {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + minutes * 60000); // แปลงนาทีเป็น milliseconds
        return expiryDate.getTime();
      }

      const qrExpireTimew = generateQrExpireTime(30);

      let datasavee = {
        merchant_order_id: "ORDER" + Date.now(),
        amount: body.amount,
        bank: body.bank,
        account_name: body.account_name,
        account_no: body.accountNumber,
        notify_url: "https://merchant.com/callback/payment",
      };

      let datacreate = await ApiGateway_helper.get_create_deposits(datasavee);

      if (datacreate.data.success == true) {
        let apiResponseData = datacreate.data.payment_details;

        const paymentDataToSave = {
          platform_order_id: apiResponseData.platform_order_id,
          merchant_order_id: apiResponseData.merchant_order_id, // ควรใช้ค่าที่ได้จาก API response เพื่อความถูกต้อง
          order_datetime: moment(apiResponseData.order_datetime).toDate(), // แปลง string เป็น Date object
          expire_datetime: moment(apiResponseData.expire_datetime).toDate(), // แปลง string เป็น Date object
          amount: apiResponseData.amount, // API ควรคืนค่า amount ที่ถูกต้อง
          transfer_amount: apiResponseData.transfer_amount || null, // ถ้ามี หรือ null
          qrcode: apiResponseData.qrcode || null,
          qrbase64: apiResponseData.qrbase64 || null,
          type_pay: "deposit",
          status: "PANDING",
          bankAccountSenderId: body.bankAccountSenderId,
        };
        let Payments_save = await Payments.create(paymentDataToSave);

        return ReS(res, { data: Payments_save, message: "Success" }, 200); // Use 500 Internal Server Error
      }

      return ReS(res, { data: null, message: "An error occurred" }, 200); // Use 500 Internal Server Error

      //console.log(datacreate)
    }
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};


// const update_depprosit_krungthais = async function (req, res) {



//   let dataqr = await Create_deposits.findOne({
//     where: {
//       status: "PENDING",
//     },
//   });

//   const currentTime = new Date().getTime();


//   if (!dataqr) {

//     return ReS(res, { message: "ไม่พบรายการ" }, 200); // Use 500 Internal Server Error
//   }

//   if (currentTime > dataqr.qrExpireTime) {
//     await Create_deposits.update(
//       { status: "expired", remark: "QR code expired" },
//       {
//         where: { id: dataqr.id },
//       }
//     );


//   }

//   let bankfrom = await BankAccount.findOne({
//     where: {
//       id: dataqr.bankAccount_id,
//     },
//   });


//   const startDate1 = moment(new Date()).add(-1, 'days').startOf("day").format("YYYY-MM-DD")
//   const endDate1 = moment(new Date()).endOf("day").format("YYYY-MM-DD");
//   let datapost = {
//     transactionType: "Deposit",
//     maxAmount: dataqr.amount,
//     accountNumber: dataqr.customerAccountNo,
//     startDate: startDate1,
//     endDate: endDate1,
//     pageSize: 0,

//   }

//   let trans = []
//   let dataqrs = ""

//   dataqrs = await ApiKtb_helper.get_transaction_history(bankfrom, datapost);

//   if (dataqrs == null) {
//     //  let dataqrs_login = await ApiKtb_helper.login_auth(bankfrom);
//     return ReS(
//       res,
//       {
//         //  data: savedTransactionData,
//         message: "ไม่สามารถทำรายการต่อได้ โปรลองอีกครั้ง",
//       },
//       200
//     );

//   }

//   if (!dataqrs.data.success == true) {

//     let dataqrs_login = await ApiKtb_helper.login_auth(bankfrom);

//     dataqrs = await ApiKtb_helper.get_transaction_history(bankfrom, datapost);
//   }

//   let transactionSaved = false;
//   let savedTransactionData = null;

//   for (const tran2 of dataqrs.data.data) {

//     for (const tran of tran2) {


//       let existingTran = await TransactionKrungthai.findOne({
//         where: { transactionRefId: tran.transactionRefId },
//       });
//       if (!existingTran) {
//         const transactionData = {
//           transactionIndex: tran.transactionIndex,
//           transactionRefId: tran.transactionRefId,
//           transactionDateTime: tran.transactionDateTime,
//           transactionCode: tran.transactionCode,
//           descriptionTransactionInfo: tran.descriptionTransactionInfo,
//           descriptionName: tran.descriptionName,
//           descriptionChannel: tran.descriptionChannel,
//           transactionComment: tran.transactionComment,
//           withdraw: tran.withdraw,
//           deposit: tran.deposit,
//           ledgerBalance: tran.ledgerBalance,
//           currency: tran.currency,
//           transactionType: tran.transactionType,
//           paymentRef: tran.paymentRef,
//         };

//         const [errCreate, createdTran] = await to(
//           TransactionKrungthai.create(transactionData)
//         );
//         const comment = tran.transactionComment;
//         const regex = /TR fr (\d{3})-(\d+)/; // Regex เพื่อจับรหัสธนาคาร (3 หลัก) และเลขบัญชี
//         const match = comment.match(regex);

//         if (match) {
//           const bankCode = match[1]; // รหัสธนาคาร (เช่น "014")
//           const accountNumber = match[2]; // เลขบัญชี (เช่น "6522427352")

//           let data_cus = await Customers.findOne({ where: { customer_uuid: dataqr.customerUuid } });
//           let merchantIds = await Merchant.findOne({ where: { id: dataqr.merchantId } });






//           if (!data_cus) {
//             return ReE(res, { message: "customer_uuid is required." }, 400);
//           }

//           const newTransactionData = {
//             logUuid: generateUuid(),
//             clientCode: "",
//             qrcode: dataqr.qrCode,
//             slip_url: "",
//             partnerCode: req.user.id,
//             referenceId: dataqr.referenceId,
//             merchantOrderId: dataqr.referenceId,
//             platformOrderId: generateUuid(),
//             customer: dataqr.customerUuid,
//             amount: dataqr.amount,
//             transferAmount: dataqr.transferAmount,
//             currency: "THB",
//             settleCurrency: "THB",
//             type: "deposit", // Changed from "withdraw" to "deposit"
//             status: "SUCCESS",
//             note: dataqr.note || dataqr.remark || "Deposit request",
//             eventCreatedAt: Date.now(),
//             eventUpdatedAt: Date.now(),
//             bank: {
//               accountNo: data_cus.account_no,
//               accountName: data_cus.name,
//               bankCode: data_cus.bank_code,
//             },
//             rate: 1,
//             channelName: req.user.name || "DEFAULT_CHANNEL",
//             fee: dataqr.amount-dataqr.transferAmount,
//             feePlatform: 0,
//             feeSale: 0,
//             feePartner: 0,
//             settleAmount: dataqr.transferAmount,
//             settleRate: 1,
//             rateDisplay: 1,
//             refUuid: dataqr.referenceId,
//             feePayment: 0,
//             profit: 0,
//             balance: merchantIds.balance + dataqr.transferAmount,
//             updatedBy: req.user ? req.user.username : "system",
//           };

//           // Update merchant balance
//           await Merchant.update(
//             { balance: merchantIds.balance + dataqr.transferAmount },
//             { where: { id: merchantIds.id } }
//           );
//           const [err, transaction] = await to(TransactionsV2.create(newTransactionData));

//         savedTransactionData = createdTran;
//         const [errUpdate, updateResult] = await to(
//           Create_deposits.update(
//             {
//               status: "SUCCESS",
//               remark: `Payment confirmed via transaction ${createdTran.transactionRefId}`,
//               referenceId: createdTran.transactionRefId, // Store the transaction ref
//             },
//             {
//               where: { id: dataqr.id },
//             }
//           )
//         );

//           // คุณสามารถนำ bankCode และ accountNumber ไปใช้งานต่อได้ที่นี่
//           // เช่น บันทึกลงฐานข้อมูล, ใช้ในการตรวจสอบ, หรือส่งไปยังฟังก์ชันอื่น
//         } else {
//           console.log("Could not extract bank code and account number from transactionComment.");
//         }

//       }


//     }

//   }

//   return ReS(
//     res,
//     {
//       data: savedTransactionData,
//       message: "ตรวจสอบและยืนยันการชำระเงินเรียบร้อย",
//     },
//     200
//   );

// };
const update_depprosit_krungthais = async function (req, res) {
  try {




    //  console.log(req.body)


    if (!req.body.deposits_id) {
      return ReS(res, { message: "ไม่พบรายการฝากเงิน deposits_id" }, 200);
    }

    // 1. ค้นหารายการฝากเงินที่สถานะ PENDING
    let objects = await Create_deposits.findAll({
      where: {
        status: "PENDING",
      //  id: req.body.deposits_id
      },
    });
    // console.log(objects)


    if (objects.length <= 0) {
      return ReE(res, { message: "ไม่พบรายการฝากเงิน deposits_id" }, 200);
    }
    for (const dataqr of objects) {

      if (!dataqr) {
        return ReS(res, { message: "ไม่พบรายการฝากเงินที่รอการยืนยัน" }, 200);
      }
      const currentTime = new Date().getTime();

      if (currentTime > dataqr.qrExpireTime) {
        await Create_deposits.update(
          { status: "expired", remark: "QR code expired" },
          {
            where: { id: dataqr.id },
          }
        );
        return ReS(res, { message: "QR code หมดอายุแล้ว" }, 200);
      }

      // 3. ค้นหาข้อมูลบัญชีธนาคารต้นทาง (ของระบบ)
      let bankfrom = await BankAccount.findOne({
        where: {
          id: dataqr.bankAccount_id,
        },
      });

      if (!bankfrom) {
        return ReE(res, { message: "ไม่พบบัญชีธนาคารสำหรับรายการนี้" }, 404);
      }

      // 4. เตรียมข้อมูลสำหรับเรียกดูประวัติการทำธุรกรรมจาก API Krungthai
      const startDate1 = moment(new Date()).add(-5, 'days').startOf("day").format("YYYY-MM-DD");
      const endDate1 = moment(new Date()).endOf("day").format("YYYY-MM-DD");
      let datapost = {
        transactionType: "Deposit",
        maxAmount: dataqr.amount, // ใช้ amount ที่สร้าง QR
        accountNumber: dataqr.customerAccountNo, // เลขบัญชีลูกค้าที่ผูกกับ QR
        startDate: startDate1,
        endDate: endDate1,
        pageSize: 0, // ควรระบุ pageSize ที่เหมาะสม
      };

      let dataqrs = null;
      let transactionHistoryAttempts = 0;
      const maxAttempts = 2; // ลองดึงประวัติ 2 ครั้ง (ครั้งแรก, และหลัง login ถ้าจำเป็น)

      while (transactionHistoryAttempts < maxAttempts) {



        dataqrs = await ApiKtb_helper.get_transaction_history(bankfrom, datapost);


        console.log(dataqrs)


        // ถ้าได้ข้อมูลและสำเร็จ ให้ break loop
        if (dataqrs && dataqrs.data && dataqrs.data.success === true) {
          break;
        }

        // ถ้าไม่สำเร็จ หรือไม่มีข้อมูล และยังไม่เกิน maxAttempts ให้ลอง login แล้วดึงใหม่
        // if (!dataqrs || dataqrs.data.success === false) {
        //   console.log("Failed to get transaction history, attempting re-login...");
        //   await ApiKtb_helper.login_auth(bankfrom); // พยายาม login ใหม่
        // }
        transactionHistoryAttempts++;
      }

      console.log(dataqrs)

      if (dataqrs == null || dataqrs.data.success == false) {
        let login = await Apikrunthai_businessy.authenticateBankData(bankfrom)


         let bankfrom2= await BankAccount.findOne({
        where: {
          id: bankfrom.id,
        },
         });
        // dataqrs = await ApiKtb_helper.get_transaction_history(bankfrom, datapost);

           dataqrs = await ApiKtb_helper.get_transaction_history(bankfrom2, datapost);
      }


      // ถ้ายังไม่สามารถดึงข้อมูลประวัติการทำธุรกรรมได้หลังจากพยายามแล้ว
      if (!dataqrs || dataqrs.data.success !== true) {
        return ReS(
          res,
          { message: "ไม่สามารถดึงข้อมูลประวัติการทำธุรกรรมได้ โปรดลองอีกครั้ง" },
          200
        );
      }

      let transactionSaved = false;
      let savedTransactionData = null;

      // 5. วนลูปตรวจสอบรายการธุรกรรมที่ได้รับจาก API
      for (const tran2 of dataqrs.data.data) {
        for (const tran of tran2) {
          // 5.1 ตรวจสอบว่ารายการธุรกรรมนี้เคยถูกบันทึกแล้วหรือไม่
          let existingTran = await TransactionKrungthai.findOne({
            where: { transactionRefId: tran.transactionRefId },
          });

          if (!existingTran) {
            // 5.2 สร้างข้อมูลสำหรับบันทึกธุรกรรมใหม่
            const transactionData = {
              transactionIndex: tran.transactionIndex,
              transactionRefId: tran.transactionRefId,
              transactionDateTime: tran.transactionDateTime,
              transactionCode: tran.transactionCode,
              descriptionTransactionInfo: tran.descriptionTransactionInfo,
              descriptionName: tran.descriptionName,
              descriptionChannel: tran.descriptionChannel,
              transactionComment: tran.transactionComment,
              withdraw: tran.withdraw,
              deposit: tran.deposit,

              ledgerBalance: tran.ledgerBalance,
              currency: tran.currency,
              transactionType: tran.transactionType,
              paymentRef: tran.paymentRef,
            };

            const [errCreate, createdTran] = await to(
              TransactionKrungthai.create(transactionData)
            );

            if (errCreate) {
              console.error("Error creating TransactionKrungthai:", errCreate);
              continue; // ข้ามรายการนี้ไป
            }

            // 5.3 ดึงข้อมูลเลขบัญชีและรหัสธนาคารจาก transactionComment
            let extractedBankCode = null;
            let extractedAccountNumber = null;
            if (tran.transactionComment) {
              const comment = tran.transactionComment;
              const regex = /TR fr (\d{3})-(\d+)/; // Regex เพื่อจับรหัสธนาคาร (3 หลัก) และเลขบัญชี
              const match = comment.match(regex);

              if (match) {
                extractedBankCode = match[1]; // รหัสธนาคาร (เช่น "014")
                extractedAccountNumber = match[2]; // เลขบัญชี (เช่น "6522427352")
                console.log(`Extracted Bank Code: ${extractedBankCode}`);
                console.log(`Extracted Account Number: ${extractedAccountNumber}`);
              } else {
                console.log("Could not extract bank code and account number from transactionComment.");
              }
            }

            // 5.4 ค้นหาข้อมูลลูกค้าและร้านค้า
            let data_cus = await Customers.findOne({ where: { customer_uuid: dataqr.customerUuid } });
            let merchantIds = await Merchant.findOne({ where: { id: dataqr.merchantId } });

            if (!data_cus) {
              console.error("Customer not found for customer_uuid:", dataqr.customerUuid);
              // ควรมี logic ที่เหมาะสมกว่านี้ เช่น บันทึก error หรือข้ามไป
              continue;
            }
            if (!merchantIds) {
              console.error("Merchant not found for id:", dataqr.merchantId);
              continue;
            }

            // 5.5 สร้างข้อมูลสำหรับบันทึกธุรกรรมใน TransactionsV2
            const newTransactionData = {
              logUuid: generateUuid(),
              clientCode: "",
              qrcode: dataqr.qrCode,
              slip_url: "",
              partnerCode: req.user.id,
              referenceId: dataqr.referenceId,
              merchantOrderId: dataqr.referenceId,
              platformOrderId: generateUuid(),
              CustomersId: data_cus.id,
              customer: dataqr.customerUuid,
              amount: dataqr.amount,
              transferAmount: dataqr.transferAmount,
              currency: "THB",
              settleCurrency: "THB",
              type: "deposit",
              status: "SUCCESS",
              note: dataqr.note || dataqr.remark || "Deposit request",
              eventCreatedAt: Date.now(),
              eventUpdatedAt: Date.now(),
              bank: {
                accountNo: data_cus.account_no, // ใช้จากข้อมูลลูกค้า
                accountName: data_cus.name,     // ใช้จากข้อมูลลูกค้า
                bankCode: data_cus.bank_code,   // ใช้จากข้อมูลลูกค้า
                // หากต้องการใช้ extractedBankCode/accountNumber ให้พิจารณาว่าข้อมูลใดควรมีความสำคัญกว่า
                // extractedBankCode: extractedBankCode,
                // extractedAccountNumber: extractedAccountNumber,
              },
              rate: 1,
              channelName: req.user.name || "DEFAULT_CHANNEL",
              fee: dataqr.amount - dataqr.transferAmount,
              feePlatform: 0,
              feeSale: 0,
              feePartner: 0,
              settleAmount: dataqr.transferAmount,
              settleRate: 1,
              rateDisplay: 1,
              refUuid: dataqr.referenceId,
              create_deposits_id: dataqr.id,
              feePayment: 0,
              profit: 0,
              balance: merchantIds.balance + dataqr.transferAmount,
              updatedBy: req.user ? req.user.username : "system",
            };

            // 5.6 อัปเดตยอดคงเหลือของร้านค้า
            await Merchant.update(
              { balance: parseFloat(merchantIds.balance) + parseFloat(dataqr.transferAmount) },
              { where: { id: merchantIds.id } }
            );

            // 5.7 สร้างรายการใน TransactionsV2
            const [err, transaction] = await to(TransactionsV2.create(newTransactionData));
            if (err) {
              console.error("Error creating TransactionsV2:", err);
              // ควรมี logic การ rollback หรือการจัดการข้อผิดพลาดที่เหมาะสม
              continue;
            }

            savedTransactionData = createdTran; // เก็บข้อมูลธุรกรรมที่สร้าง
            transactionSaved = true; // ตั้งค่าสถานะว่ามีธุรกรรมที่บันทึกแล้ว

            // 5.8 อัปเดตสถานะของรายการฝากเงินใน Create_deposits
            const [errUpdate, updateResult] = await to(
              Create_deposits.update(
                {
                  status: "SUCCESS",
                  remark: `Payment confirmed via transaction ${createdTran.transactionRefId}`,
                  referenceId: createdTran.transactionRefId,
                },
                {
                  where: { id: dataqr.id },
                }
              )
            );

            if (errUpdate) {
              console.error("Error updating Create_deposits status:", errUpdate);
              // ควรมี logic การจัดการข้อผิดพลาดที่เหมาะสม
              continue;
            }

            // ถ้ามีธุรกรรมที่สำเร็จแล้ว ควรหยุดการวนลูปเพื่อป้องกันการประมวลผลซ้ำ
            // หรือถ้าต้องการประมวลผลทุกรายการที่ตรงเงื่อนไข ก็สามารถเอา break ออกได้
            break; // หยุดการวนลูปเมื่อพบและประมวลผลรายการที่ตรงกัน
          }
        }
        if (transactionSaved) {
          break; // หยุดลูปภายนอกถ้ามีธุรกรรมที่บันทึกแล้ว
        }
      }

      // 6. ส่งคืนผลลัพธ์
      if (transactionSaved) {
        return ReS(
          res,
          {
            data: savedTransactionData,
            message: "ตรวจสอบและยืนยันการชำระเงินเรียบร้อย",
          },
          200
        );
      } else {
        return ReS(
          res,
          {
            message: "ไม่พบรายการธุรกรรมที่ตรงกัน หรือยังไม่สามารถยืนยันการชำระเงินได้",
          },
          200
        );
      }
    }

    // 2. ตรวจสอบว่าไม่พบรายการ หรือ QR code หมดอายุ



  } catch (error) {
    console.error("Error in update_depprosit_krungthais:", error);
    return ReE(res, { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", error: error.message }, 500);
  }
};
async function chack_callbacks(params) {
  try {
    const axios = require("axios");
    let data = JSON.stringify({
      platform_order_id: params.platform_order_id,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://way1.krungthaipay.com/api/v3/gateway/callbacks",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    return await axios.request(config);
  } catch (error) {
    console.error(error);

    return false;
    // return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
}

async function chack_callbacks_withdrows(params) {
  try {
    const axios = require("axios");
    let data = JSON.stringify({
      platform_order_id: params.platform_order_id,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://way1.krungthaipay.com/api/v3/gateway/callbacks",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    return await axios.request(config);
  } catch (error) {
    console.error(error);

    return false;
    // return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
}


const chack_depprositgateway = async function (req, res) {
  try {
    let body = req.body;

    let bankfrom = await Payments.findOne({
      where: {
        platform_order_id: body.platform_order_id,
      },
    });

    if (!bankfrom) {
      return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
    }

    let datasave = await chack_callbacks(bankfrom);

    if (datasave != false) {

      //  console.error(datasave);
      if (datasave.data.data.status == "SUCCESS") {
        const [errUpdate, updateResult] = await to(
          Payments.update(
            {
              status: "SUCCESS",
              //  remark: `Payment confirmed via transaction ${createdTran.transactionRefId}`,
              // referenceId: createdTran.transactionRefId, // Store the transaction ref
            },
            {
              where: { id: bankfrom.id },
            }
          )
        );

        return ReS(res, { status: "SUCCESS", message: "SUCCESS" }, 500); // Use 500 Internal Server Error
      } else {

        return ReE(res, { status: "PENDING", message: "PENDING" }, 500); // Use 500 Internal Server Error

      }
    }
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};

module.exports = {
  create_depprosit_krungthais,
  update_depprosit_krungthais,
  getWithdrawalTransactions_by,
  create_depprositgateway,
  chack_depprositgateway,
};
