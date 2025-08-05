
var {
    User_account,
    Datauser,
    Request_All,
    BankAccount,
  } = require("../../models");
  
  const { to, ReE, ReS, TE } = require("../../services/util.service");
  const Sequelize = require("sequelize");
  const Op = Sequelize.Op;
  const bcrypt = require("bcrypt");
  //const Apiscb_helper = require("../../helpers/login.helpers");
  const jwt = require("jsonwebtoken");
  const CONFIG = require("../../config/config.json");
  const Api_pay = require("./api");
  var url = require("url");
 // const app = require("../../services/app.service");
  //const config = require("../../config/app.json")[app["env"]];
  //const date = require("date-and-time");
  //const now = new Date();
  var md5 = require("md5");
  //const value = date.format(now, "HH:mm:ss");
  
  var moment = require("moment");
  require("moment/locale/th");







const get_Token_generate = async function (req, res) {


    const getdata = await Api_pay.get_Token_generate()


    console.log(getdata.data)


};




module.exports = {
    get_Token_generate,
    
  };
  