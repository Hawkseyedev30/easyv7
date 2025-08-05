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
  // let data_Merchant = await Merchant.findOne({
  //   where: {
  //     id: auth.members.merchantId,
  //   },
  // });
  console.log(mem)

  //console.log(auth)
  // const axios = require('axios');
 
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${mem.depositCallbackUrl}`,
    headers: {
      "Content-Type": "application/json",
    //  "Authorization" : `Bearer 1|7IsKW1CWIMQZ5jznwkjgVhgkmhPx9uwvowwheXH460fb70c4` 
    },
    data: auth,
  };

  const response = await axios.request(config);


  
 // console.log(status_pay)
   
//

  return { data: response, headers: response.headers };
};

const submitwithdrawTransaction = async (auth, mem) => {

  // let data_Merchant= await Merchant.findOne({
  //   where: {
  //     id: auth.members.merchantId,
  //   },
  // });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${mem.withdrawalCallbackUrl}`,
    headers: {
      "Content-Type": "application/json",
     // "Authorization" : `Bearer 1|7IsKW1CWIMQZ5jznwkjgVhgkmhPx9uwvowwheXH460fb70c4` 
    },
    data: auth,
  };

  const response = await axios.request(config);

  return { data: response.data, headers: response.headers };

};
module.exports = {
  submitDepositTransaction,
  submitwithdrawTransaction,
};
