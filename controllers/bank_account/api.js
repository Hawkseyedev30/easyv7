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

const submitDepositTransaction = async (auth, mem) => {
  let data_Merchant = await Merchant.findOne({
    where: {
      id: auth.members.merchantId,
    },
  });

  //console.log(auth)
  // const axios = require('axios');

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${data_Merchant.depositCallbackUrl}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer 1|7IsKW1CWIMQZ5jznwkjgVhgkmhPx9uwvowwheXH460fb70c4`,
    },
    data: auth,
  };

  const response = await axios.request(config);

  if (response.data.status == false) {
    const status_pay = await TransactionsV2.update(
      {
        status: "rejected",
        nodere: response.data.errorMsg,
      },
      {
        where: {
          id: auth.id,
        },
      }
    );
  }
  //console.log(status_pay)

  //

  return { data: response, headers: response.headers };
};

const submitEditTransaction = async (auth, mem) => {

  
  let data_Merchant = await Merchant.findOne({
    where: {
      id: auth.merchantId,
    },
  });

  let datapost = {
    merchantId: auth.merchantId,
    status_bank: auth.status_bank,
  };

  //console.log(datapost)

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${data_Merchant.urlendpoint}/webhook/gateway/pb88/sync-account`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer 1|7IsKW1CWIMQZ5jznwkjgVhgkmhPx9uwvowwheXH460fb70c4`,
    },
    data: datapost,
  };

  const response = await axios.request(config);
  // console.log(response.data)
  return response.data;
};
module.exports = {
  submitDepositTransaction,
  submitEditTransaction,
};
