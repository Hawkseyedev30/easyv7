var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  Transaction_manual,
  Systemsettings,
  TransactionsV2,
  Transaction_payonex
} = require("../../models");
var md5 = require("md5");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const { v4: uuidv4 } = require("uuid");
var moment = require("moment");
require("moment/locale/th");
const Notify = require("../../helpers/notify");
function generateUuid() {
  return uuidv4();
}
const multer = require("multer");
const Jimp = require("jimp");
const jsQr = require("jsqr");
const Apikrungthai_Service = require("../../services/apikrungthai_buis.class");
const Apikrunthai_businessy = require("../../helpers/Apikrunthai_businessy");

const paymentsbillscan = async function (req, res) {


  let bankfroms = await BankAccount.findOne({
    where: {
      // status_bank: "Active",
      // accountType: "deposit",
      channel: "ktb-business",
      merchantId: req.user.merchantId
    },
  });



  const upload = multer().single("image");
  upload(req, res, async function (err) {
    const jimp = await Jimp.read(req.file.buffer);
    const qr = await jsQr(
      jimp.bitmap.data,
      jimp.bitmap.width,
      jimp.bitmap.height
    );
    if (qr) {


      const scbService = new Apikrungthai_Service({
        accessToken: bankfroms.auth,
        Device_Version: bankfroms.Device_Version,
        Device_Model: bankfroms.Device_Model,
        Device_Platform: bankfroms.Device_Platform,
      });



      const loginResultsba = await scbService.overview_app(
        bankfroms.auth
      );


      if (loginResultsba == 500) {

        let login = await Apikrunthai_businessy.authenticateBankData(bankfroms)



        //console.log(login)

      } else {


        let datapost = {
          qrData: qr.data,
          auth: bankfroms.auth
        }



        const loginResultsbas = await scbService.qr_scan(datapost)

        return ReS(res, {
          data: loginResultsbas,
          message: "Error",
        });


      }



    } else {
      return res.status(400).json(qr);
    }
  });




}


module.exports = {
  paymentsbillscan,

};
