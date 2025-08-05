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

const transferconfirmationsby = async function (item) {
  const data = JSON.stringify(item.accounttranfer);

  // 2. กำหนด config สำหรับ axios
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://scb.promplayvip.com/scbeasy/transfer/verificationv2",
    headers: {
      "Content-Type": "application/json",
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IjRiZDIwM2Q4LTZkY2QtNGE4MC1iYjdlLTg2NDVlNzM2Y2NjNyIsInVzZXJfdHlwZSI6Ik1lcmNoYW50IiwiaWF0IjoxNzQwNjE2NDgxLCJleHAiOjE3NzIxNTI0ODF9.Ty61wohypWK4tcXIWJow7uK-SmKOALAoQ8vz_9uHQxk'
      
    },
    data: data,
  };

  let response, err, user;

  [err, response] = await to(axios.request(config));

  

  return response.data;
};

module.exports = {
  //  withdraw,
  transferconfirmationsby,
};
