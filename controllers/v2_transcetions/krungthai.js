const axios = require("axios");

const krungthai_verrifyuser = async function (req, acc_from) {
  let data = JSON.stringify({
    accnumber: req.accnumber,
    bankcode: req.bankcode,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/krungthai_verrifyuser`,
    headers: {
      apiToken: acc_from.auth,
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);

  return response.data;
};

const krungthai_overview = async function (req) {
  try {
    // Correctly construct the directory path

    let data = JSON.stringify({
      access_token: "cEXmCorC5C5GYwcda6zq66kAUcEwjQO2",
    });

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/krungthai_overview",
      headers: {
        apiToken: req.auth,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    return 0;

    console.error("Error backing up data:", error);
  }
};

const krungthai_create_tranferoder = async function (req, access_token) {
  try {
    // Correctly construct the directory path

    const axios = require("axios");
    let data = JSON.stringify(req);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/create_tranferoder",
      headers: {
        apiToken: access_token.auth,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    return 0;

    console.error("Error backing up data:", error);
  }
};

const krungthai_krungthai_verification = async function (req) {
  try {
    // Correctly construct the directory path

    const axios = require("axios");
    let data = "";

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/krungthai_verification",
      headers: {
        apiToken: req.auth,
      },
      data: data,
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.error("Error backing up data:", error);
  }

  return 0;
};

const create_tranferodergrops = async function (req, access_token) {
  try {
    // Correctly construct the directory path

    const axios = require("axios");
    let data = JSON.stringify(req);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/create_tranferodergrops",
      headers: {
        apiToken: access_token.auth,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    return 0;

    console.error("Error backing up data:", error);
  }
};

const set_create_tranferodergrops = async function (req, access_token) {
  try {
    const axios = require("axios");
    let data = JSON.stringify(req);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/set_create_tranferodergrops",
      headers: {
        apiToken: access_token.auth,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    return 0;

    console.error("Error backing up data:", error);
  }
};

const transfer_verification_grops = async function (req, access_token) {
  try {
    const axios = require("axios");
    let data = JSON.stringify(req);
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/transfer_verification_grops',
      headers: { 
        'apiToken': access_token.auth, 
        'Content-Type': 'application/json'
      },
      data : data
    };
    

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    return 0;

    console.error("Error backing up data:", error);
  }
};


const krungthai_pre_confirmations = async function (req, access_token) {
  try {

    let data = JSON.stringify(req);
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/krungthai_pre_confirmations',
      headers: { 
        'apiToken': access_token.auth, 
        'Content-Type': 'application/json'
      },
      data : data
    };
      

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    return 0;

    console.error("Error backing up data:", error);
  }
};




const getdata_odertranfer = async function (datapost, req) {
  try {
    // Correctly construct the directory path

    const axios = require("axios");
    let data = datapost;

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://krungthai-news1.scdeasy.com/api/v3/krungthai_business/getdata_odertranfer",
      headers: {
        apiToken: req.auth,
      },
      data: data,
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.error("Error backing up data:", error);
  }

  return 0;
};


module.exports = {
  krungthai_verrifyuser,
  krungthai_create_tranferoder,
  krungthai_overview,
  krungthai_krungthai_verification,
  create_tranferodergrops,
  set_create_tranferodergrops,
  transfer_verification_grops,
  krungthai_pre_confirmations,
  getdata_odertranfer
};
