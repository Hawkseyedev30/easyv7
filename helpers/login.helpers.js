var { Playload, Datauser, User_account, BankAccount,BankAccount_swet } = require("../models");
const axios = require("axios");
const simapi = "";
const link = "https://fasteasy.scbeasy.com";
const urls = simapi + link;
const ame2ee = require("./ame2ee");
const Apiurl_scb = require("./apiurl_scb");
const Apiurlscb = require("./apiurl_scb");
const session = require("express-session");
const host = "fasteasy.scbeasy.com";
const signature = "DEVTEAM";
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
const util = require("util");
//const parseString = util.promisify(require("xml2js").parseString);
const crypto = require("crypto");
var http = require("http");
//const date = require("date-and-time");
//const helper = require("../../helpers/custom.helper");
const jwt = require("jsonwebtoken");
const app = require("../services/app.service");
const urlendpoint = require("../config/app.json")[app["env"]];
const { logApiRequest } = require("../services/apiLogService"); //
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IjRiZDIwM2Q4LTZkY2QtNGE4MC1iYjdlLTg2NDVlNzM2Y2NjNyIsInVzZXJfdHlwZSI6Ik1lcmNoYW50IiwiaWF0IjoxNzQwNjE2NDgxLCJleHAiOjE3NzIxNTI0ODF9.Ty61wohypWK4tcXIWJow7uK-SmKOALAoQ8vz_9uHQxk";

var moment = require("moment");
require("moment/locale/th");
async function updates_acc(params) {
  // console.log(params)

  let upnew = BankAccount.update(
    {
      auth: params.auth,
      isActive: 1,
      telephoneNumber: params.data.mobileNo,
      sameBankLimit: params.limit.data.data.remainingAmount,
      balance: params.balance.totalAvailableBalance
    },
    {
      where: {
        id: params.id
      }
    }
  );

  return upnew;
}

async function save_history(params) {
  for (const data_for of conRes(params.data.data)) {
    //let chack = await chackbank(data_for);
    // console.log(chack);
  }

  // return upnew;
}
async function payload(params) {
  // const axios = require('axios');

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "http://www.api-scb-preload.com/scbpreload/?deviceId=" + params,
    headers: {
      // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6Im1heEBnbWFpbC5jb20iLCJhcGlrZXkiOiIxZjFraWFhdzZvc2Vja3FxbXIxdCIsInVzZXJfdHlwZSI6ImVuZHVzZXIiLCJpYXQiOjE3MjI1ODc1OTIsImV4cCI6MTc1NDEyMzU5Mn0.jZ1nkNeYAEb9H3HMNPFFGKpIbx5O5pbg6xyYEjM9QlM'
    }
  };

  const response = await axios.request(config);

  return response.data.data;
}

async function posy_verifyusers(items) {
  try {
    // const axios = require('axios');
    let data = JSON.stringify({
      deviceId: items
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/posy_verifyusers",
      headers: {
        "content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`
      },
      data: data
    };
    const response = await axios.request(config);

    return response;
  } catch (error) {
    return error;
  }
}
async function upload_verifyusers(url,auth) {
  try {
    // const axios = require('axios');
    let data = JSON.stringify({
      barcodeurl: url,
      api_auth: auth,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/payments/bill/scan/barcodeurl",
      headers: {
        "Content-Type": "application/json",
      //  "X-API-Key": "{{token}}",
      },
      data: data,
    };
    const response = await axios.request(config);

    return response;
  } catch (error) {
    return error;
  }
}

async function verifyusers(items) {
  let data = JSON.stringify({
    accountTo: items.accountTo,
    accountNo: items.accountNo,
    api_auth: items.api_auth,
    amount: items.amount,
    accountToBankCode: items.accountToBankCode
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/transfer/verification",
    headers: {
      "Content-Type": "application/json"
    },
    data: data
  };

  const response = await axios.request(config);

  //console.log(response.data)
  return { data: response.data, headers: response.headers };
}

const preAuth = async (auth) => {
  try {
    let data = {
      loginModuleId: "PseudoFE"
    };

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urls + "/v1/isprint/preAuth",
      headers: {
        "x-signature": "DEVTEAM-@" + signature,
        "Accept-Language": "th",
        "scb-channel": "APP",
        "Api-Auth": auth,
        "user-agent": agent,
        "th.co.scb-easy-sessionid": "693efaac-f826-4227-814c-802035737ec4",
        "th.co.scb-easy-rquid": "585e6acb-c2c3-43fd-8eea-60267da2989b",
        "Content-Type": "application/json; charset=UTF-8",
        Host: "fasteasy.scbeasy.com:8443",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip",
        Cookie:
          "TS01700433=012a0826e3718d038a254c9a7a035e7845038984208d94619996ddc3258d8861082a1dc483dbf5ff5f1e3f206f5a235b31268437f5"
      },
      data: data
    };
    const response = await axios.request(config);
    return { data: response.data, headers: response.headers };
  } catch (error) {
    return error;
  }
};

const loginapiscb_auth = async (deviceId, pin) => {};

const chackdevie_auth = async (deviceId) => {
  const payloads = await payload(deviceId);
  const verifyuserssss = await verifyusers(
    deviceId,
    payloads.payload,
    payloads.tag,
    payloads.dtag,
    payloads.dsig
  );

  // console.log(verifyuserssss.data)

  return verifyuserssss.data;
};
async function pinEncrypt(Sid, ServerRandom, pin, hashType, pubKey) {
  let e2Module, e2RsaExponent;
  const regex = /([^,]+),([^,]+)/;
  if ((m = regex.exec(pubKey)) !== null) {
    m.forEach((match, groupIndex) => {
      if (match !== "undefined" && groupIndex == 1) {
        e2Module = match;
      }
      if (match !== "undefined" && groupIndex == 2) {
        e2RsaExponent = match;
      }
    });
  }
  return await ame2ee.encryptPinForAM(
    Sid,
    e2Module + "," + e2RsaExponent,
    ServerRandom,
    pin,
    hashType
  );
}

async function fasteasylogin(deviceId, pseudoSid, pseudoPin, auth) {
  let dg = await payload(deviceId);

  try {
    let data = {
      dtag: dg.dtag,
      tilesVersion: tilesVersions,
      pseudoSid: pseudoSid,
      pseudoPin: pseudoPin
    };

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urls + ":8443/v1/fasteasy-login",
      headers: {
        "x-signature": "DEVTEAM-@" + signature,
        "accept-encoding": "gzip",
        "accept-language": "th",
        accuracy: "100.0",
        "api-auth": auth,
        connection: "Keep-Alive",
        "content-type": "application/json; charset=UTF-8",
        dsig: dg.dsig,
        host: "fasteasy.scbeasy.com:8443",
        latitude: "11.8898337",
        longitude: "102.7917671",
        "scb-channel": "APP",
        "th.co.scb-easy-rquid": "37b3e6c0-8029-4f61-9951-1d461a9b6156",
        "th.co.scb-easy-sessionid": "aecf47c3-c19d-438f-91c1-dfedd862e196",
        "user-agent": agent,
        Cookie:
          "TS01700433=012a0826e339c5fe730b65d7a8ef99b76e750138b7ecd14f2b8e689549ac975e044288c5ddfe4c0903c182de0e203c017d74bb5a67"
      },
      data: data
    };
    const response = await axios.request(config);
    return { data: response.data, headers: response.headers };
  } catch (error) {
    return error;
  }
}

async function history(items) {
  let data = JSON.stringify({
    accountNo: items.accountNo,
    startdate: items.startdate,
    enddate: items.enddate,
    api_auth: items.auth
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/transactions",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    data: data
  };

  const response = await axios.request(config);
  return { data: response.data, headers: response.headers };
}

async function balance(accountNo, auth) {
  try {
    // const axios = require('axios');
    let data = JSON.stringify({
      auth: auth,
      accountNo: accountNo
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/summary",
      headers: {
        "content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`
      },
      data: data
    };
    const response = await axios.request(config);
    return { data: response.data, headers: response.headers };
  } catch (error) {
    return error;
  }
}

async function chk_limit(auth) {
  let data = JSON.stringify({
    auth: auth
    //  accountNo: accountNo,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/chack_limitprompay",
    headers: {
      "content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${token}`
    },
    data: data
  };
  const response = await axios.request(config);
  return { data: response.data, headers: response.headers };
}
async function chack_auth(auth) {
  //
  let data = JSON.stringify({
    api_auth: auth
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/checkAuthorized",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    data: data
  };

  const response = await axios.request(config);
  let chackdat_BankAccounts = await chackdat_BankAccount(auth);
  const logData = {
    log_type: "bank_api",
    api_name: `login_auth`,
    request_method: "POST",
    request_url: "test", // Add url
    response_headers:response.data.status.description,
    status: response.data.status.code == '1000' ? "success" : "failed",
    latestPollingStatus: JSON.stringify(response.data), // Use response.data.data directly
    bankAccount_id: chackdat_BankAccounts.id // Add bank_account_id
  };


  await logApiRequest(logData);
  // await BankAccount.update(
  //   { auth: response.data.data.auth },
  //   { where: { id: body.id } }
  // );
  return { data: response.data, headers: response.headers };
}
async function chack_authswet(auth) {
  //
  let data = JSON.stringify({
    api_auth: auth
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/checkAuthorized",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    data: data
  };

  const response = await axios.request(config);
  let chackdat_BankAccounts = await chackdat_BankAccountswet(auth);
  const logData = {
    log_type: "bank_api",
    api_name: `login_auth`,
    request_method: "POST",
    request_url: "test", // Add url
    response_headers:response.data.status.description,
    status: response.data.status.code == '1000' ? "success" : "failed",
    latestPollingStatus: JSON.stringify(response.data), // Use response.data.data directly
    bankAccount_id: chackdat_BankAccounts.id // Add bank_account_id
  };


  await logApiRequest(logData);
  // await BankAccount.update(
  //   { auth: response.data.data.auth },
  //   { where: { id: body.id } }
  // );
  return { data: response.data, headers: response.headers };
}
async function Loginbank_auth(body) {
  let data = JSON.stringify({
    deviceId: body.deviceId,
    pin: body.pin
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/login_auth",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    data: data
  };

  const response = await axios.request(config);

  if (response.data.data.status?.code === 1019) {
    // console.log(response.data.data.status.)
   
    const logData = {
      log_type: "bank_api",
      api_name: `login_auth`,
      request_method: "POST",
      request_url: "test", // Add url
      response_headers:response.data.data.status.description,
      status: response.data.data.status.code === 1019 ? "failed" : "success",
      latestPollingStatus: JSON.stringify(response.data.data), // Use response.data.data directly
      bankAccount_id: body.id
    };

    await logApiRequest(logData);

    await BankAccount.update(
      { status_bank: "Banned" },
      { where: { id: body.id } }
    );
    return logData;
  } else if (response.data.data.data.status.code === 1000) {
  //  let chackdat_BankAccounts = await chackdat_BankAccount(body.deviceId);

    const logData = {
      log_type: "bank_api",
      api_name: `login_auth`,
      request_method: "POST",
      request_url: "test", // Add url
      response_headers:response.data.data.data.status.description,
      status: "success",
      latestPollingStatus: JSON.stringify(response.data.data), // Use response.data.data directly
      bankAccount_id: body.id // Add bank_account_id
    };


    await logApiRequest(logData);
    await BankAccount.update(
      { auth: response.data.data.auth },
      { where: { id: body.id } }
    );
    return response.data;
  }


}


async function Loginbank_authswet(body) {
  let data = JSON.stringify({
    deviceId: body.deviceId,
    pin: body.pin
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/login_auth",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    data: data
  };

  const response = await axios.request(config);

  if (response.data.data.status?.code === 1019) {
    // console.log(response.data.data.status.)
   
    const logData = {
      log_type: "bank_api",
      api_name: `login_auth`,
      request_method: "POST",
      request_url: "test", // Add url
      response_headers:response.data.data.status.description,
      status: response.data.data.status.code === 1019 ? "failed" : "success",
      latestPollingStatus: JSON.stringify(response.data.data), // Use response.data.data directly
      bankAccount_id: body.id
    };

    await logApiRequest(logData);

    await BankAccount_swet.update(
      { status_bank: "Banned" },
      { where: { id: body.id } }
    );
    return logData;
  } else if (response.data.data.data.status.code === 1000) {
  //  let chackdat_BankAccounts = await chackdat_BankAccount(body.deviceId);

    const logData = {
      log_type: "bank_api",
      api_name: `login_auth`,
      request_method: "POST",
      request_url: "test", // Add url
      response_headers:response.data.data.data.status.description,
      status: "success",
      latestPollingStatus: JSON.stringify(response.data.data), // Use response.data.data directly
      bankAccount_id: body.id // Add bank_account_id
    };


    await logApiRequest(logData);
    await BankAccount_swet.update(
      { auth: response.data.data.auth },
      { where: { id: body.id } }
    );
    return response.data;
  }


}
async function chackdat_BankAccount(params) {
  let databank = await BankAccount.findOne({
    where: {
      auth: params
    }
  });

  return databank;
}
async function chackdat_BankAccountswet(params) {
  let databank = await BankAccount_swet.findOne({
    where: {
      auth: params
    }
  });

  return databank;
}
async function PostLoginbank_auth(body) {
  let data = JSON.stringify({
    deviceId: body.deviceId,
    pin: body.pin
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/login_auth",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    data: data
  };

  const response = await axios.request(config);

  if (response.data.data.data.status.code === 1000) {
    await BankAccount.update(
      { auth: response.data.data.auth },
      { where: { id: body.id } }
    );
  }

  return {
    static_key: "1000",
    message: "Success",
    data: {
      data: response.data,
      auth: response.headers["api-auth"]
    }
  };
}
module.exports = {
  loginapiscb_auth,
  chackdevie_auth,
  payload,
  verifyusers,
  preAuth,
  pinEncrypt,
  fasteasylogin,
  balance,
  history,
  chk_limit,
  chack_auth,
  chack_authswet,
  Loginbank_auth,
  Loginbank_authswet,
  PostLoginbank_auth,
  posy_verifyusers,
  upload_verifyusers
};
