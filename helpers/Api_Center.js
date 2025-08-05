const axios = require("axios");
const urlendpoint = "https://apidev.payment-backend88.com";

const regtser_member_gatway = async function (item) {
  let data = JSON.stringify({
    data: item,
  });

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: urlendpoint + "/api/v1/payonex/create_customers",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await axios(config);
  return { data: response.data, headers: response.headers };
};


const login_auth = async function (item) {
  let data = JSON.stringify({
    deviceId: item.deviceId,
    pin: item.pin,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint + "/scbeasy/login_auth",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);

  return response.data;
};

const summary = async function (auth, accountNo) {
  let data = JSON.stringify({
    auth: auth,
    accountNo: accountNo,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint + "/scbeasy/summary",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);

  return response.data;
};

module.exports = {
  regtser_member_gatway,
  login_auth,
  summary,
};
