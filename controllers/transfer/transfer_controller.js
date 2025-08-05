var { Admin, User_account, Bank } = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];
const Apiscb_helper = require("../../helpers/login.helpers");
const Jwtdecode = require("jwt-decode");


//const Apiscb_helper = require("../../helpers/login.helpers");
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
function conRes(res) {
  return Object.values(JSON.parse(JSON.stringify(res)));
}
const verification = async function (req, res) {
  let auth_info, err, Banks, users, user;

  const body = req.body;
  if (!body.accountNo) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_accountNo_require",
        message: {
          th: "กรุณากรอก accountNo ของคุณ....",
          en: "Please input your accountNo.",
        },
      },
      422
    );
  } else if (!body.accountTo) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_accountTo_require",
        message: {
          th: "กรุณากรอก accountTo",
          en: "Please input your accountTo.",
        },
      },
      422
    );
  }

  [err, user] = await to(
    User_account.findOne({
      where: {
        accountNo: req.body.accountNo,
      },
    })
  );

  if (user) {
    const data_chack = await Apiscb_helper.chack_auth(user.auth);

    if (data_chack.data.status.code !== "1000") {
      let datalogin = {
        deviceId: user.deviceId,
        pin: user.pin,
        id: user.id,
      };
      let gologin = await Apiscb_helper.Loginbank_auth(datalogin);
    } else {
      [err, users] = await to(
        User_account.findOne({
          where: {
            accountNo: req.body.accountNo,
          },
        })
      );

      [err, Banks] = await to(
        Bank.findOne({
          where: {
            bank_id: req.body.accountToBankCode,
          },
        })
      );

      let transferType = "";

      if (Banks.scb_code == "014") {
        transferType = "3RD";
      } else {
        transferType = "ORFT";
      }

      let datapost = {
        accountTo: req.body.accountTo,
        amount: req.body.amount,
        transferType: transferType,
        accountNo: req.body.accountNo,
        accountToBankCode: Banks.scb_code,
        api_auth: users.auth,
      };
      const data =
        '{"accountTo": "' +
        datapost.accountTo +
        '","amount": "' +
        datapost.amount +
        '","transferType": "' +
        transferType +
        '","annotation": null,"accountFromType": "2","accountFrom": "' +
        datapost.accountNo +
        '","accountToBankCode": "' +
        datapost.accountToBankCode +
        '","tilesVersion": "' +
        tilesVersions +
        '"}';
      const response = await request(
        "post",
        "https://fasteasy.scbeasy.com/v2/transfer/verification",
        data,
        datapost.api_auth
      );

      if (response.data.status.code === 1000) {
        return ReS(res, {
          data: response.data,
          code: 1000,
          message: "success",
        });
      } else {
        return ReE(res, {
          msg: response.data,
          code: 102,
          message: "Error",
        });
      }

      // console.log(response.data);
    }
  }
};

const transferconfirmation = async function (req, res) {
  let auth_info, err, Banks, users, user;

  const body = req.body;
  if (!body.accountNo) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_accountNo_require",
        message: {
          th: "กรุณากรอก accountNo ของคุณ....",
          en: "Please input your accountNo.",
        },
      },
      422
    );
  } else if (!body.accountTo) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_accountTo_require",
        message: {
          th: "กรุณากรอก accountTo",
          en: "Please input your accountTo.",
        },
      },
      422
    );
  }

  [err, user] = await to(
    User_account.findOne({
      where: {
        accountNo: req.body.accountNo,
      },
    })
  );

  if (user) {
    const data_chack = await Apiscb_helper.chack_auth(user.auth);

    if (data_chack.data.status.code !== "1000") {
      let datalogin = {
        deviceId: user.deviceId,
        pin: user.pin,
        id: user.id,
      };
      let gologin = await Apiscb_helper.Loginbank_auth(datalogin);
    } else {
      [err, users] = await to(
        User_account.findOne({
          where: {
            accountNo: req.body.accountNo,
          },
        })
      );

      [err, Banks] = await to(
        Bank.findOne({
          where: {
            bank_id: req.body.accountToBankCode,
          },
        })
      );

      let transferType = "";

      if (Banks.scb_code == "014") {
        transferType = "3RD";
      } else {
        transferType = "ORFT";
      }

      let datapost = {
        accountTo: req.body.accountTo,
        amount: req.body.amount,
        transferType: transferType,
        accountNo: req.body.accountNo,
        accountToBankCode: Banks.scb_code,
        api_auth: users.auth,
      };
      const data =
        '{"accountTo": "' +
        datapost.accountTo +
        '","amount": "' +
        datapost.amount +
        '","transferType": "' +
        transferType +
        '","annotation": null,"accountFromType": "2","accountFrom": "' +
        datapost.accountNo +
        '","accountToBankCode": "' +
        datapost.accountToBankCode +
        '","tilesVersion": "' +
        tilesVersions +
        '"}';
      const response = await request(
        "post",
        "https://fasteasy.scbeasy.com/v2/transfer/verification",
        data,
        datapost.api_auth
      );

      if (response.data.status.code === 1000) {
        return ReS(res, {
          data: response.data,
          code: 1000,
          message: "success",
        });
      } else {
        return ReE(res, {
          msg: response.data,
          code: 102,
          message: "Error",
        });
      }

      // console.log(response.data);
    }
  }
};
const request = async function (
  method,
  uri,
  data = null,
  auth = "",
  host = ""
) {
  const config = {
    method: "" + method + "",
    url: "" + uri + "",
    headers: {
      // "origin": "aaaa",
      // "accept-encoding": "gzip",
      // "accept-language": "th",
      // "content-type": "application/json; charset=UTF-8",
      // "scb-channel": "APP",
      // "user-agent": "" + this.useragent + "",
      // "th.co.scb-easy-rquid": "fdbe576e-0e23-422c-a31b-f38cdfacf350",
      // "th.co.scb-easy-sessionid": "a55f83a9-ca84-454c-99d6-8b911139f62c",
      // "authority": "scbeasy.co",
      // "accept": "application/json, text/plain, /",
      // "api-auth": "" + auth + "",
      // "host": "" + this.host + "",

      "user-agent": "" + agent + "",
      "scb-channel": "APP",
      "accept-language": "th",
      "content-type": "application/json; charset=UTF-8",
      "api-auth": "" + auth + "",
      origin: "" + Math.floor(Math.random() * 1000) + "",
    },
    // proxy: false,
    // httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://192.168.1.18:8000`),
    data: data,
  };
  const response = await axios(config)
    .then((r) => r)
    .catch((e) => e.response);
  return response;
};

async function eligiblebanks(auth) {
  const config = {
    method: "get",
    url: "https://fasteasy.scbeasy.com/v1/transfer/eligiblebanks",
    headers: {
      "api-auth": "" + auth + "",
      "user-agent": "" + agent + "",
      host: "fasteasy.scbeasy.com",
      "scb-channel": "APP",
      "accept-language": "th",
      "content-type": "application/json; charset=UTF-8",
    },
  };
  const response = await axios(config)
    .then((r) => r)
    .catch((e) => e.response);
  return response;
}

const chackbank = async function (data) {
  let databank = await Bank.findOne({
    where: {
      scb_code: data.bankCode,
    },
  });

  if (!databank) {
    let save = {
      bank_id: data.bankAbbrevEn,
      bankNameEn: data.bankNameEn,
      bankNameTh: data.bankNameTh,
      bank_name: data.bankNameTh,
      accountLength: parseFloat(data.accountLength),
      kbank_code: data.bankCode,
      scb_code: data.bankCode,
      url_pic: data.bankLogo,
      sts: 1,
    };

    let saves = await Bank.create(save);

    //console.log(save)
  }

  return databank;
};

const update_eligiblebanks = async function (req, res) {
  let auth_info, err, Banks, users, user;

  const body = req.body;

  [err, user] = await to(
    User_account.findOne({
      where: {
        accountNo: req.body.accountNo,
      },
    })
  );

  const data_chack = await Apiscb_helper.chack_auth(user.auth);

  if (data_chack.data.status.code !== "1000") {
    let datalogin = {
      deviceId: user.deviceId,
      pin: user.pin,
      id: user.id,
    };
    let gologin = await Apiscb_helper.Loginbank_auth(datalogin);
  } else {
    let databanbk = await eligiblebanks(user.auth);

    for (const data_for of conRes(databanbk.data.data)) {
      let chack = await chackbank(data_for);

      // console.log(chack);
    }

    // let datasave = [
    //   {
    //     bankCode: "000",
    //     bankName: "บัญชีตนเอง \nไทยพาณิชย์",
    //     bankLogo: "/transfer/bank-logo/014.png?",
    //     accountLength: "10",
    //     tempDisable: "0",
    //     bankAbbrevEn: null,
    //     bankAbbrevTh: null,
    //     bankNameEn: "Siam Commercial Bank PUBLIC COMPANY LTD.",
    //     bankNameTh: "ธนาคารไทยพาณิชย์ จำกัด (มหาชน)",
    //     active: null,
    //   },
    //   {
    //     bankCode: "014",
    //     bankName: "บัญชีอื่น \nไทยพาณิชย์",
    //     bankLogo: "/transfer/bank-logo/014.png?",
    //     accountLength: "10",
    //     tempDisable: "0",
    //     bankAbbrevEn: null,
    //     bankAbbrevTh: null,
    //     bankNameEn: "Siam Commercial Bank PUBLIC COMPANY LTD.",
    //     bankNameTh: "ธนาคารไทยพาณิชย์ จำกัด (มหาชน)",
    //     active: null,
    //   },
    // ];

    // [err, Banks] = await to(
    //   Bank.findOne({
    //     where: {
    //       bank_id: req.body.accountToBankCode,
    //     },
    //   })
    // );
  }

  return ReS(res, {
    //  data: response.data,
    code: 1000,
    message: "success",
  });
};


const apitrue = async function (req, res) {

 
  const token = req.body.message


  if(token){

    
  }
  const decoded = Jwtdecode(token);
  


  let amount = decoded.amount / 100 




  let dataretun = {
    event_type: decoded.event_type,
    received_time: decoded.received_time,
    sender_mobile: decoded.sender_mobile,
    message: '',
    amount: amount,
    channel: '',
    sender_name: decoded.sender_name,
    transaction_id: decoded.transaction_id,
    iat: decoded.iat
  }
  console.log(dataretun)






  return ReS(res, {
     data: dataretun,
    code: 1000,
    message: "success",
  });

}

module.exports = {
  verification,
  transferconfirmation,
  update_eligiblebanks,
  apitrue
};
