var axios = require("axios");

const krungsribizonline_authenticate = async function (params) {
  const axios = require("axios");
  let data = JSON.stringify({
    deviceId: params.deviceId,
    pin: params.pin,
    accountNumber: params.accountNumber,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://botserver.payment-888.com/api/v1/auth/chack_loginkrungsribizonline",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6Imhhd2tzZXllIiwibWVyY2hhbnRJZCI6NiwidXNlcl90eXBlIjoiYWRtaW4iLCJ1c2VyX2RldmljZV9pZCI6IjI1MDEwMDY0NjQ1MzczNjEzMzAwMDUzNzM2NTEwODAxOTIwMjQiLCJpYXQiOjE3NDE2ODEwMTYsImV4cCI6MTc0MTg1MzgxNn0.8l-jt5uxTwza5zvGI0rykx-FMwGUz3EX6BcFKGK1ViY",
    },
    data: data,
  };

  const dataresut = await axios.request(config);
  return dataresut.data;
};

async function krungsri_tranfer_getotp(params) {
  const axios = require("axios");
  let data = JSON.stringify(params);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://botserver.payment-888.com/api/v1/auth/krungsri_tranfer_getotp",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6Imhhd2tzZXllIiwibWVyY2hhbnRJZCI6NiwidXNlcl90eXBlIjoiYWRtaW4iLCJ1c2VyX2RldmljZV9pZCI6IjI1MDEwMDY0NjQ1MzczNjEzMzAwMDUzNzM2NTEwODAxOTIwMjQiLCJpYXQiOjE3NDI4MTQ4OTYsImV4cCI6MTc0Mjk4NzY5Nn0.ocVEKgJqTqzF-5EVJU90UOIEUAxU-7ar3D0yTKCjArA",
    },
    data: data,
  };

  const dataresut = await axios.request(config);
  return dataresut.data;
}

async function create_customers(items, gettoken) {
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









async function getotp(items) {


  const axios = require('axios');
  let data = JSON.stringify({
    "otp": items.otp
  });
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://botserver.payment-888.com/api/v1/auth/chackotp',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6Imhhd2tzZXllIiwibWVyY2hhbnRJZCI6NiwidXNlcl90eXBlIjoiYWRtaW4iLCJ1c2VyX2RldmljZV9pZCI6IjI1MDEwMDY0NjQ1MzczNjEzMzAwMDUzNzM2NTEwODAxOTIwMjQiLCJpYXQiOjE3NDI4MTQ4OTYsImV4cCI6MTc0Mjk4NzY5Nn0.ocVEKgJqTqzF-5EVJU90UOIEUAxU-7ar3D0yTKCjArA'
    },
    data : data
  };
  
  return await axios.request(config);
}








async function krungsri_tranfer_con(items) {


  const axios = require('axios');
  let data = JSON.stringify(items);
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://botserver.payment-888.com/api/v1/auth/krungsri_tranfer_confram',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6Imhhd2tzZXllIiwibWVyY2hhbnRJZCI6NiwidXNlcl90eXBlIjoiYWRtaW4iLCJ1c2VyX2RldmljZV9pZCI6IjI1MDEwMDY0NjQ1MzczNjEzMzAwMDUzNzM2NTEwODAxOTIwMjQiLCJpYXQiOjE3NDI4MTQ4OTYsImV4cCI6MTc0Mjk4NzY5Nn0.ocVEKgJqTqzF-5EVJU90UOIEUAxU-7ar3D0yTKCjArA'
    },
    data : data
  };
  
  
  const dataresut = await axios.request(config);
  return dataresut.data;




}

module.exports = {
  krungsribizonline_authenticate,
  krungsri_tranfer_getotp,
  krungsri_tranfer_con,
  create_customers,
  get_bankbname,
  getotp
};
