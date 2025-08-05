var axios = require('axios');

const authenticate = async function (item) {
    var axios = require('axios');
    var data = JSON.stringify({
      "accessKey": item.accessKey,
      "secretKey": item.secretKey
    });
    
    var config = {
      method: 'post',
    maxBodyLength: Infinity,
      url: 'https://api.payonex.asia/authenticate',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json'
      },
      data : data
    };
    
       
  const response = await axios(config);
  return { data: response.data, headers: response.headers };
};

async function bank_codes() {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://api.payonex.asia/customers/options/bank-codes",
    headers: {},
  };

  return await axios.request(config);
}

async function create_customers(items,gettoken) {

 // let gettoken = await get_Authenticate()

 

  // const axios = require("axios");
  let data = JSON.stringify({
    name: items.name,
    bankCode: items.bankCode,
    accountNo: items.accountNo,
  });

  // console.log(tokens)

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.payonex.asia/v2/customers",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: gettoken,
    },
    data: data,
  };

  //axios.request(config);

  return await axios.request(config);
}

async function get_bankbname(items) {



  var axios = require("axios");
  var data = JSON.stringify();

  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.payonex.asia/banks/get-name",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "<API Key>",
    },
    data: data,
  };
  return await axios.request(config);

}
module.exports = {
    authenticate,
    bank_codes,
  create_customers,
  get_bankbname,
  };
  