
const app = require("../services/app.service");
const urlendpoint = require("../config/app.json")[app["env"]];


const get_balance_summery = async function (items) {
  try {
    // const axios = require('axios');
    //  let data = JSON.stringify({
    const axios = require("axios");
    let data = JSON.stringify({
      "sessionId": items
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urlendpoint["API_SCB_BUS"] + "/api/v3/scb_business/get_balance_summery",
      headers: {
        'Content-Type': 'application/json',
        'apiToken': 'e5a7dc7b-c703-426f-aa3f-79916ef0a553'
      },
      data: data,
    };

    return await axios.request(config);
  } catch (error) {
    return error;
  }
};


const login_scbkrungthai = async function (items) {
  try {
    // const axios = require('axios');
    //  let data = JSON.stringify({
    const axios = require("axios");
    let data = JSON.stringify(items);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urlendpoint["API_SCB_BUS"] + "/api/v3/scb_business/loginscbbiznet",
      headers: {
        apiToken: "7c31fe0a-60cf-4877-98c2-c34d75bb6875",
        "Content-Type": "application/json",
      },
      data: data,
    };

    return await axios.request(config);
  } catch (error) {
    return error;
  }
};


const ckack_authscb = async function (auth) {
  try {
    // const axios = require('axios');
    //  let data = JSON.stringify({
    const axios = require('axios');
    let data = JSON.stringify({
      "sessionId": auth,

    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: urlendpoint["API_SCB_BUS"] + '/api/v3/scb_business/chack_auths',
      headers: {
        'apiToken': '63c94c9f-2c02-4779-9844-8307333dcb83',
        'Content-Type': 'application/json'
      },
      data: data
    };



    return await axios.request(config);
  } catch (error) {
    return error;
  }
};

const verrifyscb = async function (auth) {
  try {
    // const axios = require('axios');
    //  let data = JSON.stringify({
    const axios = require('axios');
    let data = JSON.stringify(auth);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: urlendpoint["API_SCB_BUS"] + '/api/v3/scb_business/verify_accnumber',
      headers: {
        'apiToken': '63c94c9f-2c02-4779-9844-8307333dcb83',
        'Content-Type': 'application/json'
      },
      data: data
    };




    return await axios.request(config);
  } catch (error) {
    return error;
  }
};

module.exports = {
  login_scbkrungthai,
  ckack_authscb,
  verrifyscb,
  get_balance_summery
};
