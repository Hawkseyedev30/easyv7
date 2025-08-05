const axios = require("axios");
const { json } = require("stream/consumers");
const util = require("util");
const parseString = util.promisify(require("xml2js").parseString);

module.exports = class device {
  constructor() {
    this.useragent = "Android/14;FastEasy/3.86.0/8940";
    this.host = "fasteasy.scbeasy.com";
    this.tilesVersion = "82";
    this.cosScb = "https://corsx-c9b37f75ddd6.herokuapp.com/";
  }

  async load() {
    const url = "https://enc.sbceasy.com/api/v1/encrypt";
    const data = {
      deviceId: "95e724db-1517-433a-a6c1-281a93d9c4ad",
      key: "DEVTEST",
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  async preloadandresumecheck(payload, dtag, tag, dsig) {
    const data = JSON.stringify({
      jailbreak: "0",
      isLoadGeneralConsent: "1",
      payload: payload,
      dtag: dtag,
      mobileNo: "",
      userMode: "INDIVIDUAL",
      tag: tag,
      tilesVersion: this.tilesVersion,
    });
    const config = {
      method: "post",
      url: "https://fasteasy.scbeasy.com/v3/login/preloadandresumecheck",
      headers: {
        "user-agent": this.useragent,
        tilesVersion: this.tilesVersion,
        "scb-channel": "APP",
        "Accept-Language": "th-TH",
        "content-type": "application/json",
        dsig: dsig,
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }
  
  async verifyuser(idcard, date) {
    const data = JSON.stringify({
      cardType: "P1",
      dateOfBirth: date,
      cardId: idcard,
    });
    const config = {
      method: "post",
      url: "https://fasteasy.scbeasy.com/v1/registration/verifyuser",
      headers: {
        "user-agent": this.useragent,
        tilesVersion: this.tilesVersion,
        "scb-channel": "APP",
        "Accept-Language": "th-TH",
        "content-type": "application/json",
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async mobilelist(auth) {
    const data = JSON.stringify({
      flag: "all",
      mobileNo: "",
    });
    const config = {
      method: "post",
      url: "https://fasteasy.scbeasy.com/v1/profiles/mobilelist",
      headers: {
        "user-agent": this.useragent,
        tilesVersion: this.tilesVersion,
        "scb-channel": "APP",
        "Accept-Language": "th-TH",
        "content-type": "application/json",
        "Api-Auth": auth,
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async generateOTP(auth, phone) {
    const data = JSON.stringify({
      Amount: "",
      eventNotificationPolicyId: "FastEasyRegisteration_TH",
      realActorId: "FastEasyApp",
      MobilePhoneNo: phone,
      storeId: "SystemTokenStore",
      policyId: "SCB_FastEasy_OTPPolicy",
      AccountNumber: "",
      AccountName: "",
      DestinationBank: "",
    });
    const config = {
      method: "post",
      url: "https://fasteasy.scbeasy.com/v1/profiles/generateOTP",
      headers: {
        "user-agent": this.useragent,
        tilesVersion: this.tilesVersion,
        "scb-channel": "APP",
        "Accept-Language": "th-TH",
        "content-type": "application/json",
        "Api-Auth": auth,
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async allowadddevice(auth, otp, tokenUUID) {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://fasteasy.scbeasy.com/v2/profiles/allowadddevice",
      headers: {
        "user-agent": this.useragent,
        "scb-channel": "APP",
        "content-type": "application/json",
        "Api-Auth": auth,
        otp: otp,
        tokenUUID: tokenUUID,
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async preAuth(auth) {
    const data = JSON.stringify({
      loginModuleId: "MovingPseudo",
    });
    const config = {
      method: "post",
      url: "https://fasteasy.scbeasy.com/isprint/soap/preAuth",
      headers: {
        "user-agent": this.useragent,
        "scb-channel": "APP",
        "Accept-Language": "th-TH",
        "content-type": "application/json",
        "Api-Auth": auth,
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async fasteasylogin(auth, pseudoPin, payload, pseudoSid, tag, dsig, dtag) {
    const data = JSON.stringify({
      pseudoPin: pseudoPin,
      payload: payload,
      tag: tag,
      dtag: dtag,
      tilesVersion: this.tilesVersion,
      pseudoSid: pseudoSid,
    });
    const config = {
      method: "post",
      url: "https://fasteasy.scbeasy.com/v1/fasteasy-login",
      headers: {
        "user-agent": this.useragent,
        tilesVersion: this.tilesVersion,
        "scb-channel": "APP",
        "Accept-Language": "th-TH",
        "content-type": "application/json",
        "Api-Auth": auth,
        dsig: dsig,
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async getdevice(auth) {
    const config = {
      method: "get",
      url: "https://fasteasy.scbeasy.com/v1/profiles/devices/",
      headers: {
        "user-agent": this.useragent,
        tilesVersion: this.tilesVersion,
        "scb-channel": "APP",
        "Accept-Language": "th-TH",
        "content-type": "application/json",
        "Api-Auth": auth,
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }
};
