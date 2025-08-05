var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  Transaction_manual,
  TransactionsV2,
  TransactionsV2,
} = require("../../models");
const { ReE, ReS, to } = require("../../services/util.service");
const { Op } = require("sequelize");
var fs = require("fs");
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




// async function qr(url) {
//   try {

//   }catch(err){
//     console.log(err)
//   }
// }
  