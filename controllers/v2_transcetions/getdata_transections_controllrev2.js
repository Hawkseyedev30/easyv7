var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  Transaction_manual,
  Customers,
  TransactionFeeSetting,
  TransactionsV2,
} = require("../../models");
const { ReE, ReS, to } = require("../../services/util.service");
const { Op, where } = require("sequelize");
var fs = require("fs");
const multer = require("multer");
const Jimp = require("jimp");
const jsQr = require("jsqr");
var md5 = require("md5");
var moment = require("moment");
require("moment/locale/th");
moment.locale("th");
//const Apikrungthaibizon = require("./krungthai");
const Apikrungthaibizon = require("../../helpers/krungthai_bus");
const Apikrungthaibizonv2 = require("../../controllers/deprosit/deprosit_controller");
const Apikrunthai_businessy = require("../../helpers/Apikrunthai_businessy");
const Apicllback = require("../deprosit/api");



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage/qr");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var Uploadall = multer({ storage: storage }).fields([
  { name: "img_url", maxCount: 1 },
]);
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");

function generateUuid() {
  return uuidv4();
}
const getTransactions = async function (req, res) {
  try {
    // TODO: Implement logic to fetch transactions from a database or service
    // For example:
    // const transactions = await TransactionService.getAllTransactions(req.query); // Assuming req.query might contain pagination or filter parameters

    // Placeholder data for now
    const mockTransactions = [
      { id: 1, amount: 100, description: "TransactionsV2 1", date: new Date() },
      { id: 2, amount: 200, description: "TransactionsV2 2", date: new Date() },
    ];

    // Successfully return the fetched transactions
    return ReS(
      res,
      {
        data: mockTransactions,
        message: "Transactions retrieved successfully",
      },
      200
    );
  } catch (error) {
    console.error("Failed to get transactions:", error);

    // It's good practice to check if error.response and error.response.data exist
    // to avoid further errors if the error object structure is unexpected.
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred while fetching transactions.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;

    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    ); // Use error.status or a default like 500
  }
};

const listTransactions = async function (req, res) {
  try {
    // Similar to getTransactions, but this might imply a more specific listing,
    // perhaps with more robust pagination, filtering, and sorting.
    // const { page = 1, limit = 10, sortBy = 'date', order = 'desc', filter = {} } = req.query;

    // TODO: Implement logic to list transactions based on query parameters
    // const transactions = await TransactionService.list({ page, limit, sortBy, order, filter });

    const mockTransactions = [
      {
        id: 3,
        amount: 50,
        description: "Listed TransactionsV2 A",
        date: new Date(),
      },
      {
        id: 4,
        amount: 150,
        description: "Listed TransactionsV2 B",
        date: new Date(),
      },
    ];
    const totalCount = mockTransactions.length; // In a real scenario, this would be the total count from the database

    return ReS(
      res,
      {
        data: mockTransactions,
        total: totalCount,
        message: "Transactions listed successfully",
      },
      200
    );
  } catch (error) {
    console.error("Failed to list transactions:", error);
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred while listing transactions.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;
    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    );
  }
};


async function chack_inq_grop(params) {

  let cahack_banktranfer2 = await BankAccount.findOne({
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
        model: TransactionsV2,
        as: "Transactions_by", // Use the correct alias from your model definition

        where: {
          status: "PROCESSING",
        },
        order: [["created_at", "ASC"]],
        limit: 1,
      },
    ],
    where: {
      accountType: "withdrawal",
      status_bank: "Solve_problems",

      //balance: { [Op.gte]: cahack_inq.amount },
      // id: { [Op.ne]: cahack_banktranfer.id }, // ไม่เอาบัญชีแรก
    },
    // order: [["updated_at", "ASC"]],
  });


  return cahack_banktranfer2.Transactions_by[0]
  //console.log(cahack_banktranfer2.Transactions_by[0])


}


async function decodebank(params) {

  const databankcode = await Bank.findOne({
    where: {
      bankCode: params
    }
  })

  return databankcode.scb_code

}


async function decodebank2(params) {

  const databankcode = await Bank.findOne({
    where: {
      bankCode: params
    }
  })

  return databankcode

}


async function tranfer_one(data_tranfer, data_bank) {
  const chackinq_datatran = JSON.parse(data_tranfer.bank)

  const bank2 = await decodebank2(chackinq_datatran.bankCode);


  const dataTransactionModel = {
    accnumber: chackinq_datatran.accountNo,
    bankcode: bank2.scb_code
    //url:cahack_banktranfers.apiendpoint
  };

  let verrify = await Apikrungthaibizon.krungthai_verrifyuser(
    dataTransactionModel,
    data_bank
  );

  if (verrify.success != true) {
    let krungthai_krungthai_verification = await Apikrungthaibizon.krungthai_krungthai_verification(data_bank);
    verrify = await Apikrungthaibizon.krungthai_verrifyuser(
      dataTransactionModel,
      data_bank
    );
  }

  let datatran2 = {
    amount: data_tranfer.amount,
    newPayeeNameEn: verrify.data.nameTh,
    newPayeeNameTh: verrify.data.nameTh,
    newPayeeBankName: bank2.bank_name,
    newPayeeBankCode: bank2.scb_code,
    newPayeeAccountNo: chackinq_datatran.accountNo,
  };

  let response = await Apikrungthaibizon.krungthai_create_tranferoder(datatran2, data_bank)
  if (response.success == true) {

    let responses_all = response.data.content[0];

    let updatedatatrans = await TransactionsV2.update(
      {
        // transferOrderId: create_tranferodergropss.data2.transferOrderId,
        //transferItemId: transferverification.data2.transferItemId,
        settleSlip: JSON.stringify(responses_all),
        status: "SUCCESS",
      },
      {
        where: {
          id: data_tranfer.id,
        },
      }
    );
    // let updatedatatran = await BankAccount.update(
    //   {
    //     // bankAccount_id: cahack_banktranfers.id,
    //     status_bank: "Active",
    //   },
    //   {
    //     where: {
    //       id: data_bank.id,
    //     },
    //   }
    // );
    return true
  } else {
    return false


  }
}




const apiwithdorw_level_20 = async function (req, res) {

  const axios = require('axios');

  // let chackinq = await chack_inq_grop();

  const databankcode = await TransactionsV2.findOne({
    where: {
      status: "PENDING",
      type: "withdraw"
    },
    order: [["created_at", "ASC"]],

  })
  const cahack_banktranfer2 = await BankAccount.findOne({

    where: {
      accountType: "withdrawal",
      status_bank: "Active",
    },
    // order: [["updated_at", "ASC"]],
  });



  if (databankcode) {
    let chackinq_datatran = JSON.parse(databankcode.bank)
    let chackauth = await Apikrungthaibizonv2.chack_auth(cahack_banktranfer2.auth)
    console.log(chackauth)
    const bank2 = await decodebank2(chackinq_datatran.bankCode);

    if (chackauth.status != 200) {
      let login = await Apikrunthai_businessy.authenticateBankData(cahack_banktranfer2)


    }
    const cahack_banktranfer2s = await BankAccount.findOne({

      where: {
        id: cahack_banktranfer2.id
      },
      // order: [["updated_at", "ASC"]],
    });

    let datapost = {
      amount: databankcode.amount,
      accnumber: chackinq_datatran.accountNo,
      bankcode: await decodebank(chackinq_datatran.bankCode),
      accessToken: cahack_banktranfer2s.auth
    };

    let ver = await Apikrungthaibizonv2.krungthai_verrifyusers(datapost)
    //console.log(ver)
    if (ver.status == 200) {


      if (chackauth.data.totalLedgerBalance < databankcode.amount) {

        let updatedatatrans = await TransactionsV2.update(
          {
            // transferOrderId: create_tranferodergropss.data2.transferOrderId,
            //transferItemId: transferverification.data2.transferItemId,
            note: "ยอดเงินไม่เพียงพอ",
            status: "REJECTED",
          },
          {
            where: {
              id: databankcode.id,
            },
          }
        );
        return ReS(res, {
          // data: cahack_banktranfer2,

          code: 1000,
          message: "ไม่มี รายการถอน",
        });
      }

      let datatran = {
        "accessToken": cahack_banktranfer2s.auth,
        "newPayeeNameEn": ver.data.data.nameTh,
        "newPayeeNickname": "",
        "newPayeeNameTh": ver.data.data.nameTh,
        newPayeeBankName: bank2.bank_name,
        newPayeeBankCode: bank2.scb_code,
        "amount": databankcode.amount,

        "devicesid": cahack_banktranfer2s.deviceId,
        "password": cahack_banktranfer2s.password,
        "Device_Model": "samsung-SM-A065F",
        "Device_Version": cahack_banktranfer2s.Device_Version,
        "Device_Platform": "android/15",
        "pin": cahack_banktranfer2s.pin,
        "newPayeeAccountNo": chackinq_datatran.accountNo
      }


      const response = await Apikrungthaibizonv2.create_tranferOder(datatran)
      let updatedatatran = await BankAccount.update(
        {
          // bankAccount_id: cahack_banktranfers.id,
          balance: chackauth.data.totalLedgerBalance,
        },
        {
          where: {
            id: cahack_banktranfer2s.id,
          },
        }
      );

     // console.log(databankcodev222)

      if (response.status == 200) {

        let updatedatatrans = await TransactionsV2.update(
          {
            // transferOrderId: create_tranferodergropss.data2.transferOrderId,
            //transferItemId: transferverification.data2.transferItemId,
            settleSlip: JSON.stringify(response.data),
            status: "SUCCESS",
          },
          {
            where: {
              id: databankcode.id,
            },
          }
        );

      } else {

        let updatedatatrans = await TransactionsV2.update(
          {
            // transferOrderId: create_tranferodergropss.data2.transferOrderId,
            //transferItemId: transferverification.data2.transferItemId,
            settleSlip: JSON.stringify(response.data),
            status: "REJECTED",
          },
          {
            where: {
              id: databankcode.id,
            },
          }
        );
      }


    const merchant = await Merchant.findOne({ where: { id: databankcode.merchantId } });


      const databankcodev222 = await TransactionsV2.findOne({
        where: {
          id: databankcode.id,
       //   type: "withdraw"
        },
       // order: [["created_at", "ASC"]],

      })

     let data_member = await Apicllback.submitwithdrawTransaction(databankcodev222,merchant)


      return ReS(res, {
         data: databankcodev222,

        code: 1000,
        message: "ถอนเงินสำเร็จ",
      });


    }





  };

 return ReS(res, {
      //   data: databankcodev222,

        code: 1000,
        message: "",
      });
  //Apikrungthaibizonv2
  //   let chack_gateway_balances = await Apikrungthaibizon.loginbababalancekrungthai(cahack_banktranfer2);


  //   if (!chack_gateway_balances.data.success == true) {
  //     let krungthai_krungthai_verification = await Apikrungthaibizon.login_auth(cahack_banktranfer2)
  //   }
  //    let create_tranferodergropss = await Apikrungthaibizon.create_tranferodergrops(datapost, cahack_banktranfer2);
  // let updatedatatransv1 = await TransactionsV2.update(
  //   {
  //     transferOrderId: create_tranferodergropss.data2.transferOrderId,
  //     status: "CREATE_ODER",
  //   },
  //   {
  //     where: {
  //       id: chackinq.id,
  //     },
  //   }
  // );



  //   const cahack_banktranfer1 = await BankAccount.findOne({
  //     include: [
  //       {
  //         as: "bank",
  //         model: Bank,
  //         attributes: {
  //           include: [],
  //           exclude: ["deleted_at", "created_at", "updated_at"],
  //         },
  //         required: true,
  //         // where: { to_user_id: user_id, request_status: "Requested" },
  //       },
  //       {
  //         model: TransactionsV2,
  //         as: "Transactions_by", // Use the correct alias from your model definition

  //         where: {
  //           status: "PROCESSING",
  //         },
  //         order: [["created_at", "ASC"]],
  //         limit: 5,
  //       },
  //     ],
  //     where: {
  //       accountType: "withdrawal",
  //       status_bank: "Solve_problems",
  //       id: cahack_banktranfer2.id
  //     },
  //     // order: [["updated_at", "ASC"]],
  //   });

  //   if (create_tranferodergropss.success == true) {
  //     let updatedatatran = await TransactionsV2.update(
  //       {
  //         transferItemId: create_tranferodergropss.data2.transferItemId,
  //         transferOrderId: create_tranferodergropss.data2.transferOrderId,
  //         status: "CREATE_ODER",
  //       },
  //       {
  //         where: {
  //           id: chackinq.id,
  //         },
  //       }
  //     );

  //     if (cahack_banktranfer1.Transactions_by) {
  //       let datapust = [];
  //       let lastChackinqResult = ""
  //       for (const element of cahack_banktranfer1.Transactions_by) {


  //         let chackinq_datatran11 = JSON.parse(element.bank)
  //         let datapost2 = {
  //           amount: element.amount, // จำนวนเงิน
  //           accnumber: chackinq_datatran11.accountNo, // เลขที่บัญชีธนาคาร
  //           bankcode: await decodebank(chackinq_datatran11.bankCode), // รหัสธนาคาร SCB
  //           transferOrderId: create_tranferodergropss.data2.transferOrderId, // ID คำสั่งโอนเงินหลัก
  //         };

  //         let chackset_create_tranferodergrops = await Apikrungthaibizon.set_create_tranferodergrops(datapost2, cahack_banktranfer1);






  //         let dataver = {
  //           transferOrderId: create_tranferodergropss.data2.transferOrderId,
  //         };

  //         let transferverification = await Apikrungthaibizon.transfer_verification_grops(dataver, cahack_banktranfer1)


  //         if (transferverification == 0) {

  //           let updatedatatrans = await TransactionsV2.update(
  //             {
  //             //  transferOrderId: create_tranferodergropss.data2.transferOrderId,
  //              // transferItemId: chackset_create_tranferodergrops.data2.transferItemId,
  //               status: "REJECTED",
  //             },
  //             {
  //               where: {
  //                 id: element.id,
  //               },
  //             }
  //           );


  //         }


  //         let updatedatatrans = await TransactionsV2.update(
  //           {
  //             transferOrderId: create_tranferodergropss.data2.transferOrderId,
  //             transferItemId: chackset_create_tranferodergrops.data2.transferItemId,
  //             status: "INQ_TRANFERGROP",
  //           },
  //           {
  //             where: {
  //               id: element.id,
  //             },
  //           }
  //         );

  //         datapust.push(transferverification);

  //         lastChackinqResult = transferverification;

  //       }


  //       let datapost3 = {
  //         // กำหนดค่า otpRefNo จากผลลัพธ์ chackinq ครั้งสุดท้าย
  //         otpRefNo: lastChackinqResult && lastChackinqResult.otp ? lastChackinqResult.otp.otpRefNo : null,
  //         // กำหนดค่า token_sms จากผลลัพธ์ chackinq ครั้งสุดท้าย
  //         token_sms: lastChackinqResult && lastChackinqResult.otp ? lastChackinqResult.otp.token_sms : null,
  //         // กำหนดค่า mfaRefId จากผลลัพธ์ chackinq ครั้งสุดท้าย
  //         mfaRefId: lastChackinqResult && lastChackinqResult.ref ? lastChackinqResult.ref.mfaRefId : null,
  //         // transferOrderId ยังคงใช้ค่าเดิมตามที่คุณระบุในตัวอย่างก่อนหน้า
  //         transferOrderId: create_tranferodergropss.data2.transferOrderId,
  //       };

  //       let confrom = await Apikrungthaibizon.krungthai_pre_confirmations(
  //         datapost3,
  //         cahack_banktranfer1
  //       );

  //       for (const element_create_tranferodergropss of confrom.data.content) {


  //         let updatedatatrans = await TransactionsV2.update(
  //           {
  //            // transferOrderId: create_tranferodergropss.data2.transferOrderId,
  //             //transferItemId: transferverification.data2.transferItemId,
  //             settleSlip:JSON.stringify(element_create_tranferodergropss),
  //             status: "SUCCESS",
  //           },
  //           {
  //             where: {
  //               transferItemId: element_create_tranferodergropss.transferItemId,
  //             },
  //           }
  //         );


  //       }
  //       let updatedatatran = await BankAccount.update(
  //         {
  //           // bankAccount_id: cahack_banktranfers.id,
  //           status_bank: "Active",
  //         },
  //         {
  //           where: {
  //             id: cahack_banktranfer1.id,
  //           },
  //         }
  //       );

  //     }

  //   }

  // }

  // return ReS(res, {
  //   // data: cahack_banktranfer2,

  //   code: 1000,
  //   message: "ไม่มี รายการถอน",
  // });
};
const autowithdrow = async function (req, res) {
  try {
    //let body = req.body
    let TransactionsV2s = await TransactionsV2.findAll({
      where: {
        status: "PENDING",

        //balance: { [Op.gte]: cahack_inq.amount },
      },
      order: [["updated_at", "ASC"]],
      limit: 5,
    });
    let cahack_banktranfers = await BankAccount.findOne({
      where: {
        accountType: "withdrawal",
        status_bank: "Active",
        //balance: { [Op.gte]: cahack_inq.amount },
      },
      order: [["updated_at", "ASC"]],
    });

    if (TransactionsV2s.length >= 5 && cahack_banktranfers) {
      // let chackinq = JSON.parse(TransactionsV2s[0].bank)

      // let create_tranferodergropss = await Apikrungthaibizon.create_tranferodergrops(datapost,cahack_banktranfers);

      for (const element of TransactionsV2s) {






        let updatedatatran = await TransactionsV2.update(
          {
            bankAccount_id: cahack_banktranfers.id,
            status: "PROCESSING",
          },
          {
            where: {
              id: element.id,
            },
          }
        );

      }
      let updatedatatran = await BankAccount.update(
        {
          // bankAccount_id: cahack_banktranfers.id,
          status_bank: "Solve_problems",
        },
        {
          where: {
            id: cahack_banktranfers.id,
          },
        }
      );


      let updatedatatrans = await apiwithdorw_level_20(req, res)

      return true

    } else if (TransactionsV2s.length > 1 && cahack_banktranfers) {
      let cahack_banktranfers = await BankAccount.findOne({
        where: {
          accountType: "withdrawal",
          status_bank: "Active",
          //balance: { [Op.gte]: cahack_inq.amount },
        },
        order: [["updated_at", "ASC"]],
      });

      for (const element of TransactionsV2s) {




        let updatedatatran = await TransactionsV2.update(
          {
            bankAccount_id: cahack_banktranfers.id,
            status: "PROCESSING",
          },
          {
            where: {
              id: element.id,
            },
          }
        );

        // let datatran = JSON.parse(element.bank)

        //  console.log(datatran);
      }
      let updatedatatran = await BankAccount.update(
        {
          // bankAccount_id: cahack_banktranfers.id,
          status_bank: "Solve_problems",
        },
        {
          where: {
            id: cahack_banktranfers.id,
          },
        }
      );


      let updatedatatrans = await apiwithdorw_level_20(req, res)

      return true
      // let updatedatatran = await TransactionsV2.update(
      //   {

      //   }
      // )
    } else if (TransactionsV2s.length == 1 && cahack_banktranfers) {



      let updatedatatran = await TransactionsV2.update(
        {
          bankAccount_id: cahack_banktranfers.id,
          status: "INQ_TRANFER",
        },
        {
          where: {
            id: TransactionsV2s[0].id,
          },
        }
      );
      // let updatedatatran23 = await BankAccount.update(
      //   {
      //     // bankAccount_id: cahack_banktranfers.id,
      //     status_bank: "Solve_problems",
      //   },
      //   {
      //     where: {
      //       id: cahack_banktranfers.id,
      //     },
      //   }
      // );


      let datatest = await tranfer_one(TransactionsV2s[0], cahack_banktranfers)


      return ReE(res, { message: "มี 1" }, 404);


    } else {

      return ReE(res, { message: "TransactionsV2 not found" }, 404);

    }

    return true
  } catch (error) {
    console.error("Failed to fetch all transactions:", error);
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred while fetching all transactions.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;
    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    );
  }
};

const fetchAllTransactions = async function (req, res) {
  try {
    //let body = req.body

    const [err, transaction] = await to(
      TransactionsV2.findOne({
        status: "PENDING",
      })
    );

    console.log(transaction);
  } catch (error) {
    console.error("Failed to fetch all transactions:", error);
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred while fetching all transactions.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;
    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    );
  }
};

const findTransactionById = async function (req, res) {
  try {
    const { transactionId } = req.params; // Assuming ID comes from URL parameters like /transactions/:transactionId

    if (!transactionId) {
      return ReE(res, { message: "TransactionsV2 ID is required" }, 400);
    }

    // TODO: Implement logic to find a single transaction by its ID
    // const transaction = await TransactionService.findById(transactionId);

    // Placeholder data
    const mockTransaction = {
      id: transactionId,
      amount: 120,
      description: `Details for transaction ${transactionId}`,
      date: new Date(),
    };

    if (!mockTransaction) {
      // In a real scenario, check if the service returned a transaction
      return ReE(res, { message: "TransactionsV2 not found" }, 404);
    }

    return ReS(
      res,
      { data: mockTransaction, message: "TransactionsV2 found successfully" },
      200
    );
  } catch (error) {
    console.error("Failed to find transaction by ID:", error);
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred while finding the transaction.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;
    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    );
  }
};

const searchTransactions = async function (req, res) {
  try {
    const { query } = req.query; // Assuming search query comes from query parameters like /transactions/search?query=keyword

    if (!query) {
      return ReE(res, { message: "Search query is required" }, 400);
    }

    // TODO: Implement logic to search transactions based on the query
    // This could involve searching multiple fields like description, category, etc.
    // const searchResults = await TransactionService.search(query);

    const mockSearchResults = [
      {
        id: 6,
        amount: 250,
        description: `Search result matching '${query}' 1`,
        date: new Date(),
      },
      {
        id: 7,
        amount: 350,
        description: `Search result matching '${query}' 2`,
        date: new Date(),
      },
    ];

    return ReS(
      res,
      {
        data: mockSearchResults,
        message: `Transactions matching '${query}' found successfully`,
      },
      200
    );
  } catch (error) {
    console.error("Failed to search transactions:", error);
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred while searching transactions.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;
    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    );
  }
};

const editTransaction = async function (req, res) {
  try {
    const { transactionId } = req.params; // Assuming ID from URL parameters
    const updateData = req.body; // Assuming update data comes from the request body

    if (!transactionId) {
      return ReE(
        res,
        { message: "TransactionsV2 ID is required for editing" },
        400
      );
    }

    if (Object.keys(updateData).length === 0) {
      return ReE(res, { message: "No update data provided" }, 400);
    }

    // TODO: Implement logic to update the transaction by ID with updateData
    // const updatedTransaction = await TransactionService.update(transactionId, updateData);

    // Placeholder: Simulate fetching the old transaction and applying updates
    let mockTransactionToUpdate = {
      id: transactionId,
      amount: 120,
      description: `Old details for transaction ${transactionId}`,
      date: new Date(),
      version: 1,
    };

    if (!mockTransactionToUpdate) {
      // In a real scenario, check if the transaction exists
      return ReE(res, { message: "TransactionsV2 not found for editing" }, 404);
    }

    const updatedTransaction = {
      ...mockTransactionToUpdate,
      ...updateData,
      updatedAt: new Date(),
      version: mockTransactionToUpdate.version + 1,
    };

    if (!updatedTransaction) {
      // Check if the update was successful
      // This condition might be more nuanced depending on how your service layer indicates a failed update (e.g., not found, optimistic locking failure)
      return ReE(
        res,
        { message: "Failed to update transaction or transaction not found" },
        404
      ); // Or 500 if it's an internal error
    }

    return ReS(
      res,
      { data: updatedTransaction, message: "TransactionsV2 updated successfully" },
      200
    );
  } catch (error) {
    console.error("Failed to edit transaction:", error);
    // Specific error handling, e.g., for validation errors or optimistic locking conflicts
    if (error.name === "ValidationError") {
      return ReE(
        res,
        { data: error.errors, message: "Validation failed" },
        422
      );
    }
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred while editing the transaction.";
    const errorData =
      error.response && error.response.data
        ? error.response.data
        : error.message;
    return ReE(
      res,
      { data: errorData, message: errorMessage },
      error.status || 500
    );
  }
};
const chack_oder = async function (req, res) {

  let body = req.body
  let cahack_banktranfers = await BankAccount.findOne({
    where: {
      accountType: "withdrawal",
      status_bank: "Solve_problems",
      //balance: { [Op.gte]: cahack_inq.amount },
    },
    order: [["updated_at", "ASC"]],
  });


  let datatran = {
    transferOrderId: body.transferOrderId
  }

  let chack = await Apikrungthaibizon.getdata_odertranfer(datatran, cahack_banktranfers)

  return ReS(
    res,
    { data: chack.data },
    // error.status || 500
  );

}
// Export the functions if this is a module
module.exports = {
  getTransactions,
  listTransactions,
  fetchAllTransactions,
  findTransactionById,
  searchTransactions,
  editTransaction,
  autowithdrow,
  apiwithdorw_level_20,
  chack_oder
};
