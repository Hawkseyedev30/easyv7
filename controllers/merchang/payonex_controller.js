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
  Transaction_payonex,
  Gatway_setting
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
const Apipaynoex = require("../../apis/PayoneX");



async function gettoken_playonex_v2() {

    let data_Gatway_setting = await Gatway_setting.findOne({
        where: {
          name: "PayoneX",
        },
      });
    
    let ataitem_post = {
        accessKey: data_Gatway_setting.accessKey,
        secretKey: data_Gatway_setting.secretKey,
      };
  
      let chackauth = await Apipaynoex.authenticate(ataitem_post);
    
        

      return chackauth.data.data.token;
    
}

async function gettransaction_byuuid(uuid) {

    var configs = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.payonex.asia/transactions/${uuid}`,
        headers: {
          Accept: "application/json",
          Authorization: await gettoken_playonex_v2(),
        },
      };
      let datachackplays = await axios(configs);


     // return ReS(res, { data: datachackplays.data });
        

      return datachackplays.data;
    
}
const transaction_byuuid = async function (req, res) {


    let body = req.body


    let datauuid = await gettransaction_byuuid(body.uuid)

   
    return ReS(res, { data: datauuid, message: "success" }, 200);
}

module.exports = {
    transaction_byuuid
  };
  