const axios = require("axios");

const app = require("../services/app.service");
const urlendpoint = require("../config/app.json")[app["env"]];
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IjRiZDIwM2Q4LTZkY2QtNGE4MC1iYjdlLTg2NDVlNzM2Y2NjNyIsInVzZXJfdHlwZSI6Ik1lcmNoYW50IiwiaWF0IjoxNzQwNjE2NDgxLCJleHAiOjE3NzIxNTI0ODF9.Ty61wohypWK4tcXIWJow7uK-SmKOALAoQ8vz_9uHQxk";

const transactions = async function (item) {
  let data = JSON.stringify({
    accountNo: item.accountNo,
    startdate: item.startdate,
    enddate: item.enddate,
    nextPageNumber: item.nextPageNumber,
    api_auth: item.auth,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/transactions",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  const response = await axios(config);
  return { data: response.data, headers: response.headers };
};

const transactionsoffset = async function (item) {
  let data = JSON.stringify({
    pagingOffset: item.pagingOffset,

    auth: item.auth,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/transferhistory2",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
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
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/login_auth",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
    url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/summary",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  const response = await axios.request(config);

  return response.data;
};

module.exports = {
  transactions,
  login_auth,
  summary,
  transactionsoffset,
};
