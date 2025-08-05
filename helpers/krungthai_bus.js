var {
  User_account,
  Server_api,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  TransactionsV2,
} = require("../models");

var moment = require("moment");
require("moment/locale/th");
var md5 = require("md5");
const axios = require("axios"); // Import axios once at the top
const qs = require("qs"); // Import qs once at the top
const app = require("../services/app.service");
const Notify = require("../helpers/notify");
const config = require("../config/app.json")[app["env"]];



const urlendpoint = require("../config/app.json")[app["env"]];








async function chack_instructionViewType(bank, params) {
  let data = JSON.stringify({
    instructionRefNo: params,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["API_KRUNGTHAI_BUS"] + "/api/app/v3/krungthai_business/instructionViewType",
    headers: {
      apiToken: bank.auth,
      "Content-Type": "application/json",
    },
    data: data,
  };

  return await axios.request(config);
}




async function get_transaction_history(params, datatran) {
  try {
    const axios = require('axios');

    let data = JSON.stringify({
      "accessToken": params.auth,
      "maxAmount": datatran.maxAmount,
      "transactionType": "deposit",
      "accountNumber": datatran.accountNumber,
      "startDate": datatran.startDate,
      "endDate": datatran.endDate,
      "pageSize": 0
    });

    // console.log(data)

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: urlendpoint["API_KRUNGTHAI_BUS"] + '/api/app/v3/krungthai_business/get_transaction_historyv2',
      headers: {
        'apiToken': '7c31fe0a-60cf-4877-98c2-c34d75bb6875',
        'Content-Type': 'application/json'
      },
      data: data
    };


    const autths = await axios.request(config);
 //console.log(autths)
    return autths


  } catch (error) {
   // console.error("Failed to decode QR code:", error);
    return null;
  }



}


async function login_auth(params) {

  const axios = require('axios');
  let data = JSON.stringify({
    "devicesid": params.deviceId,
    "password": params.password,
    "Device_Model": params.Device_Model,
    "Device_Version": params.Device_Version,
    "Device_Platform": params.Device_Platform,
    "pin": params.pin
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: urlendpoint["API_KRUNGTHAI_BUS"] + '/api/app/v3/krungthai_business/login_auth',
    headers: {
      'apiToken': '7c31fe0a-60cf-4877-98c2-c34d75bb6875',
      'Content-Type': 'application/json'
    },
    data: data
  };

  // const axios = require("axios");
  // let data = JSON.stringify({
  //   access_token: "cEXmCorC5C5GYwcda6zq66kAUcEwjQO2",
  // });

  // let config = {
  //   method: "get",
  //   maxBodyLength: Infinity,
  //   url: urlendpoint["API_KRUNGTHAI_BUS"] + "/api/v3/krungthai_business/krungthai_overview",
  //   headers: {
  //     apiToken: params.auth,
  //     "Content-Type": "application/json",
  //   },
  //   data: data,
  // };


  const autths = await axios.request(config);
  await BankAccount.update(
    {
      //  balance: balanceSummary.totalAvailableBalance,
      auth: autths.data.data.access_token,
    },
    {
      where: {
        id: params.id,
      },
    }
  );
  return autths



}

async function loginbababalancekrungthai(params) {


  const axios = require('axios');
  let data = JSON.stringify({
    "accessToken": params.auth
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: urlendpoint["API_KRUNGTHAI_BUS"] + '/api/app/v3/krungthai_business/summary',
    headers: {
      'apiToken': '7c31fe0a-60cf-4877-98c2-c34d75bb6875',
      'Content-Type': 'application/json'
    },
    data: data
  };
  const autths = await axios.request(config);




  if (autths.data.success == true) {
    await BankAccount.update(
      {
        //  balance: balanceSummary.totalAvailableBalance,
        balance: autths.data.data.totalLedgerBalance,
      },
      {
        where: {
          id: params.id,
        },
      }
    );

  }

  return autths

  //return await axios.request(config);
}


async function balancekrungthai(params) {
  const axios = require("axios");
  let data = JSON.stringify({
    access_token: "cEXmCorC5C5GYwcda6zq66kAUcEwjQO2",
  });

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/krungthai_overview",
    headers: {
      apiToken: params.auth,
      "Content-Type": "application/json",
    },
    data: data,
  };

  return await axios.request(config);
}
module.exports = {
  balancekrungthai,
  chack_instructionViewType,
  loginbababalancekrungthai,
  login_auth,
  get_transaction_history
};
