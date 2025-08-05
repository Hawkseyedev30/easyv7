var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
} = require("../../models");

const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");

const Apiscb_helper = require("../../helpers/login.helpers");
const jwt = require("jsonwebtoken");

var moment = require("moment");
require("moment/locale/th");
async function updates_acc(params) {
  let upnew = User_account.update(
    {
      auth: params.auth,
    },
    {
      where: {
        id: params.id,
      },
    }
  );

  return upnew;
}

const api_callback_true = async function (req, res) {
  
  let body = req.body.message;

  if (!body) {
    return res.render("/view/index.ejs");
  }

  var decoded = jwt_decode(body);

  if (members) {
    let datade = {
      event_type: decoded.event_type,
      amount: decoded.amount / 100,

      received_time: decoded.received_time,
      sender_mobile: decoded.sender_mobile,
      message: decoded.message,
      iat: decoded.iat,
    };//   let formatDatex = await formatDate(decoded.received_time);

    //   let datapost = {
    //     accnum: datade.sender_mobile,
    //     amount: datade.amount,
    //     description: datade.iat,
    //     fron_bank: "0932541497",
    //     to_bank: datade.sender_mobile,
    //     date_creat: formatDatex.date,
    //   };

    //   let postsave = await createtopup(datapost);

    //   // console.log(formatDatex)

    //   let message = `แจ้งเตือนมีเงินเข้าทรูวอเลท \n เบอร์โทร : ${decoded.sender_mobile} \n  จำนวนเงิน : ${datade.amount}  \n  เวลา : ${decoded.received_time}  \n  เลขอางอิง : ${decoded.iat} \n สถานะ : รอตรวจสอบเติมเงิน`;
    //   // // let message = decoded;
    //   let notify = await Walllet.notify(message);

    return ReS(res, { msg: datade });
  } else {
    let datade = {
      event_type: decoded.event_type,
      amount: decoded.amount / 100,
      received_time: decoded.received_time,
      sender_mobile: decoded.sender_mobile,
      message: decoded.message,
      iat: decoded.iat,
    };
    
    return ReS(res, { msg: datade });
  }
};
const chack_authdevice = async function (req, res) {
  let body = req.body;

  // const data_url = body.qr_sting;

  const payloads = await Apiscb_helper.payload(req.body.deviceId);

  const verifyuserssss = await Apiscb_helper.verifyusers(
    req.body.deviceId,
    payloads.payload,
    payloads.tag,
    payloads.dtag,
    payloads.dsig
  );
  console.log(verifyuserssss);
  return ReS(res, { data: verifyuserssss.data });
};
module.exports = {
  api_callback_true,
  chack_authdevice,
};
