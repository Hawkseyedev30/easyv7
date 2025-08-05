//http://localhost:1341/api/v1/admin/getdeposit_callback
var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  TransactionsV2,
} = require("../../models");
const axios = require("axios");

const get_Token_generate = async (auth, mem) => {
  var data = JSON.stringify({
    accessKey: "f73d1623-51ef-4b70-a4dd-c636aebc2456",
    secretKey: "8936353e-b0b8-4733-afe7-33c1e4727eee",
  });

  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.payonex.asia/authenticate",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  return { data: response.data, headers: response.headers };
};

const submitwithdrawTransaction = async (auth, mem) => {
  let datamem = await Merchant.findOne({
    where: {
      id: auth.members.merchantId,
    },
  });

  //console.log(datamem)
  // const axios = require('axios');
  let data = JSON.stringify({
    username: "555555555555555",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${datamem.withdrawalCallbackUrl}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: auth,
  };

  const response = await axios.request(config);
  return { data: response.data, headers: response.headers };
};
module.exports = {
  get_Token_generate,
  submitwithdrawTransaction,
};
