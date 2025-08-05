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
const Notify = require("../../helpers/notify");
const Apichack_history_by = require("../auth/auth_controller");
const Apicllback = require("./api");

const config = require("../../config/app.json")[app["env"]];
//const date = require("date-and-time");
//const now = new Date();
const scbeasy = require("../scb/classgendevice");
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
function conRes(res) {
  return Object.values(JSON.parse(JSON.stringify(res)));
}

const edit_mechang = async function (req, res) {
  let body = req.body;

  let chack = await Systemsettings.findOne({
    where: {
      merchantId: req.user.id,
    },
  });

  let chackup = await Systemsettings.update(
    body,
    {
      where: {
        merchantId: req.user.id,
      },
    }
  );

  return ReS(res, {
    data: body,
    code: 200,
    message: "ดำเนินการสำเร็จ",
  });
};

module.exports = {
  edit_mechang,
};
