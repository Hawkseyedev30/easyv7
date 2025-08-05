async function get_balance_gateWay(praram) {
  try {
    // const axios = require('axios');
    //  let data = JSON.stringify({
    const axios = require("axios");
    let data = JSON.stringify({
      merchant_id: "TH51458855",
      token:
        "44b57ea873123e6749ccbf86218538bca0d6b25db199a56038d162ff15016da49d022cc716e259a4abde4fa7545a8fca",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://way1.krungthaipay.com/api/v3/gateway/balance",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    // axios.request(config)

    return await axios.request(config);
  } catch (error) {
    return error;
  }
}

async function get_create_deposits(praram) {
  try {
    // const axios = require('axios');
    //  let data = JSON.stringify({

    const axios = require("axios");
    let data = JSON.stringify({
      merchant_id: "TH51458855",
      token:
        "44b57ea873123e6749ccbf86218538bca0d6b25db199a56038d162ff15016da49d022cc716e259a4abde4fa7545a8fca",
      merchant_order_id:praram.merchant_order_id,
      amount: praram.amount,
      bank: praram.bank,
      account_name: praram.account_name,
      account_no: praram.account_no,
      notify_url: "https://way1.krungthaipay.com/api/v3/gateway/callbackpayment",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://way1.krungthaipay.com/api/v3/gateway/create_deposits",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    return await axios.request(config);
  } catch (error) {
    return error;
  }
}

module.exports = {
  get_balance_gateWay,
  get_create_deposits
};
