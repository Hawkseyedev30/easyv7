var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Req_qrcode,
  Create_deposits
} = require("../../models");

const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");

const Apiscb_helper = require("../../helpers/login.helpers");
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];
//const date = require("date-and-time");
//const now = new Date();
var md5 = require("md5");
//const value = date.format(now, "HH:mm:ss");

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

async function viewqrcode(req, res) {
  if (!req.body.uuid) {
    return ReE(
      res,
      {
        results: null,
        code: 422,
        message: "มีรายการรอดำเนินการ ",
      },
      422
    );
  }

  // ... (โค้ดอื่นๆ) ...
  let user_Req_qrcode = await Create_deposits.findOne({
    where: {
      uuid: req.body.uuid,
    },
  });

  if (user_Req_qrcode) {
    return ReS(
      res,
      {
        data: user_Req_qrcode,
        code: 200,
        message: "SUCCESS",
      },
      200
    );
  } else {
    return ReE(
      res,
      {
        data: null,
        code: 422,
        message: "ไม่มี uuid",
      },
      422
    );
  }
}

module.exports = {
  viewqrcode,
};
