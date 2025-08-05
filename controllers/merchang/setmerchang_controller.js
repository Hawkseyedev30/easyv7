var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  KayApi,
  Member,
  Transaction_manual,
  TransactionsV2,
  TransactionsV2,
  TransactionFeeSetting
} = require("../../models");
const { ReE, ReS, to } = require("../../services/util.service");
const { Op, where } = require("sequelize");
var fs = require("fs");
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
const multer = require("multer");
const Jimp = require("jimp");
const jsQr = require("jsqr");
var md5 = require("md5");
var moment = require("moment");
require("moment/locale/th");
moment.locale("th");
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
function generateQrExpireTime(minutes = 15) {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + minutes * 60000); // แปลงนาทีเป็น milliseconds
  return expiryDate.getTime();
}

const genared_keyapi = async function (req, res) {
  try {
    let user_main = req.user;
    const qrExpireTimew = generateQrExpireTime(720);
    let v1 = generateUuid();
    let v2 = generateUuid();

    let datasave = {
      merchantId: user_main.merchantId,
      userTpye: "merchang",
      expdate: qrExpireTimew,
      accessKey: v1,
      secretKey: v2,
      updated_at: new Date(),
    };
    let getdatakey = await KayApi.create(datasave);

    return ReS(res, { data: getdatakey, message: "successfully" }, 200);
  } catch (error) {
    console.error("Failed to get transactions:", error);
    // แก้ไข typo: error.respornse.data -> error.response.data
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
    );
  }
};

const gettoken = async function (req, res) {
  try {
    let body = req.body;

    let chack = await KayApi.findOne({
      include: [
        {
          as: "Merchants",
          model: Merchant,
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        accessKey: body.accessKey,
        secretKey: body.secretKey,
      },
    });

    if (chack) {
      let token = "";

      token = await jwt.sign(
        {
          user_id: chack.merchantId,
          user_type: "merchang",
        },
        CONFIG.jwt_encryption,
        { expiresIn: "1d" }
      );

      let upnew = await Merchant.update(
        {
          token_auth: token,
        },
        {
          where: {
            id: chack.merchantId,
          },
        }
      );
      let chack2 = await KayApi.findOne({
        include: [
          {
            as: "Merchants",
            model: Merchant,
            attributes: {
              include: [],
              exclude: ["deleted_at", "created_at", "updated_at"],
            },
            required: true,
          },
        ],
        where: {
          accessKey: body.accessKey,
          secretKey: body.secretKey,
        },
      });
      return ReS(
        res,
        { data: chack2, token: token, message: "successfully" },
        200
      );
    } else {
      return ReE(
        res,
        { data: chack, message: "error ไม่เจอข้อมูล token นี้" },
        200
      );
    }
  } catch (error) {
    console.error("Failed to get transactions:", error);
    // แก้ไข typo: error.respornse.data -> error.response.data
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
    );
  }
};
const getdata_keyapi = async function (req, res) {
  try {

    //console.log(req.user.id)



    let chack = await KayApi.findAll({

      where: {
        merchantId: req.user.merchantId

      },
    });

    // console.log(chack)


    return ReS(
      res,
      { data: chack, message: "successfully" },
      200
    );
  } catch (err) {
    console.log(err)
  }


};
const getdata_memerchang = async function (req, res) {

  try {



//console.log(req.user)

    let chack = await Merchant.findOne({

      where: {
        id: req.user.Active_merchantId

      },
    });
    let TransactionFeeSettings = await TransactionFeeSetting.findOne({

      where: {
        merchant_id: chack.id

      },
    });
    // console.log(chack)


    return ReS(
      res,
      { data: chack, datasetting: TransactionFeeSettings, message: "successfully" },
      200
    );
  } catch (err) {

    return ReE(
      res,
      { data: '', message: "Error not found" },
      200
    );

    console.log(err)
  }


};

const getalldata_memerchang = async function (req, res) {

  try {

    if (req.user.role == "Subowner" || req.user.role == "SuperOwner") {

      let chack = await Merchant.findAll({


      });

      let dataput = []




      for (const element of chack) {


        let TransactionFeeSettings = await TransactionFeeSetting.findOne({

          where: {
            merchant_id: element.id

          },
        });

        if (TransactionFeeSettings) {
          dataput.push(TransactionFeeSettings)

        }



      }

      // console.log(chack)


      return ReS(
        res,
        { data: chack, datasetting: dataput, message: "successfully" },
        200
      );

    } else {



      let chack = await Merchant.findOne({

        where: {
          id: req.user.merchantId

        },
      });
      let TransactionFeeSettings = await TransactionFeeSetting.findOne({

        where: {
          merchant_id: chack.id

        },
      });
      // console.log(chack)


      return ReS(
        res,
        { data: chack, datasetting: TransactionFeeSettings, message: "successfully" },
        200
      );
      // if (!user) return ReE(res, { static_key: 'Active_merchantId is', message: "Please select Active_merchantId" }, 401);

    }


  } catch (err) {

    return ReE(
      res,
      { data: '', message: "Error not found" },
      200
    );

    console.log(err)
  }


};


// const searchTransactions = async function (req, res) {};
// const updateTransaction = async function (req, res) {};
// const editTransaction = async function (req, res) {};

//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}
//const createRecordContactSupport = async function (req, res) {}

module.exports = {
  genared_keyapi,
  gettoken,
  getdata_keyapi,
  getdata_memerchang,
  getalldata_memerchang
  //   findTransactionById,
  //   searchTransactions,
  //   updateTransaction,
  //   editTransaction,
  //   upload_Manual,
  //   upload_Manual,
  //   upload_Manual,
};

//-----------
// module.exports = {
//   upload_Manual,
//   createRecordContactSupport,
//   sendlogo,
//   createqr,
// };

//const createRecordContactSupport = async function (req, res) {}

// async function qr(url) {
//   try {

//   }catch(err){
//     console.log(err)
//   }
// }

//  try {
// } catch (error) {
//     console.error("Failed to decode QR code:", error);
//     return null;
//   }
