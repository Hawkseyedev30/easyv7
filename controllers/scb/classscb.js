const axios = require("axios");
module.exports = class SCB {
  constructor() {
    this.useragent = "Android/14;FastEasy/3.86.0/8940";
    this.host = "fasteasy.scbeasy.com";
    this.tilesVersion = "82";
    this.signature = "DEVTEAM";
  }
  async checkAuthorized(auth) {
    const response = await this.#request(
      "GET",
      "https://fasteasy.scbeasy.com/v3/profiles/accounts/registered?tilesVersion=" +
        this.tilesVersion,
      null,
      auth
    );
    return response;
  }

  async playload(deviceid) {
    const axios = require("axios");

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "http://www.api-scb-preload.com/scbpreload/?deviceId=" + deviceid,
      headers: {
        "content-type": "application/json; charset=UTF-8",
      },
      // data: data
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response.data.data;
  }

  async loginpath(deviceid, pin) {
    const axios = require("axios");
    let data = '{"deviceId" : "' + deviceid + '","pin":"' + pin + '"}';
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://apiscb.devteam.sc/login",
      headers: {
        "content-type": "application/json; charset=UTF-8",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    // console.log(response);
    return response.data.auth;
  }
  // async verifyuser(deviceId, payload, tag) {
  //     const data = JSON.stringify({
  //         jailbreak: "0",
  //         deviceId: "" + deviceId + "",
  //         userMode: "INDIVIDUAL",
  //         tilesVersion: "" + this.tilesVersion + "",
  //         payload: "" + payload + "",
  //         tag: "" + tag + "",
  //         isLoadGeneralConsent: "0"
  //     });
  //     const response = await this.#request("post", "https://fasteasy.scbeasy.com/v3/login/preloadandresumecheck", data);
  //     return response;
  // }

  async paymentsbillscanurl(url, auth) {
    try {
      //  const data_url = await qr(url);
      const axios = require("axios");
      let data = JSON.stringify({
        img_url:url,
        api_auth: auth,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://sbc.promplayvip.com/scbeasy/payments/bill/scan/url",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "{{token}}",
        },
        data: data,
      };
      const response = await axios.request(config);
      return { data: response.data, headers: response.headers };
    } catch (error) {
      return error;
    }
  }
  async verifyuser(deviceId, payload, tag, dtag, dsig) {
    try {
      let data = {
        awarenessNextQuestionDate: "",
        dtag: dtag,
        jailbreak: "0",
        isLoadGeneralConsent: "0",
        tilesVersion: this.tilesVersion,
        userMode: "INDIVIDUAL",
        payload: payload,
        tag: tag,
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://fasteasy.scbeasy.com:8443/v3/login/preloadandresumecheck",
        headers: {
          "x-signature": "DEVTEAM-@" + this.signature,
          "accept-encoding": "gzip",
          "accept-language": "th",
          accuracy: "100.0",
          connection: "Keep-Alive",
          "content-type": "application/json; charset=UTF-8",
          dsig: dsig,
          host: "fasteasy.scbeasy.com:8443",
          latitude: "11.8898337",
          longitude: "102.7917671",
          "scb-channel": "APP",
          "th.co.scb-easy-rquid": "e4cd799f-bb1d-4c1b-8ee0-cb5e9471f39f",
          "th.co.scb-easy-sessionid": "9d8625b0-9bf6-42a1-b91d-e061f71a932e",
          "user-agent": this.useragent,
          Cookie:
            "TS0130295e=01339ac568d1f4be0ebc26db3bf0218c01eb9d12dd0dc9c481ab9283ebba67743e129c94f557bf49847323752574ecc1b23bc9bf0d; TS01700433=012a0826e3718d038a254c9a7a035e7845038984208d94619996ddc3258d8861082a1dc483dbf5ff5f1e3f206f5a235b31268437f5",
        },
        data: data,
      };
      const response = await axios.request(config);
      return { data: response.data, headers: response.headers };
    } catch (error) {
      return error;
    }
  }

  async transferhistory(pagingOffset, auth) {
    const data = "";
    const config = {
      method: "get",
      url:
        "https://fasteasy.scbeasy.com/v1/transfer/history?pagingOffset=" +
        pagingOffset,
      headers: {
        "accept-encoding": "gzip",
        "accept-language": "th",
        "api-auth": "" + auth + "",
        connection: "Keep-Alive",
        "content-type": "application/json",
        host: "" + this.host + "",
        "scb-channel": "APP",
        "th.co.scb-easy-rquid": "fdbe576e-0e23-422c-a31b-f38cdfacf350",
        "th.co.scb-easy-sessionid": "a55f83a9-ca84-454c-99d6-8b911139f62c",
        tilesversion: "" + this.tilesVersion + "",
        "user-agent": "" + this.useragent + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);

    return response;
  }
  async banner(auth) {
    const data = "";
    const config = {
      method: "get",
      url: "https://fasteasy.scbeasy.com/v1/tiles/banner",
      headers: {
        "accept-encoding": "gzip",
        "accept-language": "th",
        "api-auth": "" + auth + "",
        connection: "Keep-Alive",
        "content-type": "application/json",
        host: "" + this.host + "",
        "scb-channel": "APP",
        "th.co.scb-easy-rquid": "fdbe576e-0e23-422c-a31b-f38cdfacf350",
        "th.co.scb-easy-sessionid": "a55f83a9-ca84-454c-99d6-8b911139f62c",
        tilesversion: "" + this.tilesVersion + "",
        "user-agent": "" + this.useragent + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);

    return response;
  }
  async preAuth(auth) {
    try {
      let data = {
        loginModuleId: "PseudoFE",
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://fasteasy.scbeasy.com/v1/isprint/preAuth",
        headers: {
          "x-signature": "DEVTEAM-@" + this.signature,
          "Accept-Language": "th",
          "scb-channel": "APP",
          "Api-Auth": auth,
          "user-agent": this.useragent,
          "th.co.scb-easy-sessionid": "693efaac-f826-4227-814c-802035737ec4",
          "th.co.scb-easy-rquid": "585e6acb-c2c3-43fd-8eea-60267da2989b",
          "Content-Type": "application/json; charset=UTF-8",
          Host: "fasteasy.scbeasy.com:8443",
          Connection: "Keep-Alive",
          "Accept-Encoding": "gzip",
          Cookie:
            "TS01700433=012a0826e3718d038a254c9a7a035e7845038984208d94619996ddc3258d8861082a1dc483dbf5ff5f1e3f206f5a235b31268437f5",
        },
        data: data,
      };
      const response = await axios.request(config);
      return { data: response.data, headers: response.headers };
    } catch (error) {
      return error;
    }
  }
  async fasteasylogin(deviceId, pseudoSid, pseudoPin, auth) {
    // console.log(auth)
    // let dg = await this.playloads(deviceId);

    try {
      let data = {
        dtag: deviceId.dtag,
        tilesVersion: this.tilesVersion,
        pseudoSid: pseudoSid,
        pseudoPin: pseudoPin,
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://fasteasy.scbeasy.com:8443/v1/fasteasy-login",
        headers: {
          "x-signature": "DEVTEAM-@" + this.signature,
          "accept-encoding": "gzip",
          "accept-language": "th",
          accuracy: "100.0",
          "api-auth": auth,
          connection: "Keep-Alive",
          "content-type": "application/json; charset=UTF-8",
          dsig: deviceId.dsig,
          host: "fasteasy.scbeasy.com:8443",
          latitude: "11.8898337",
          longitude: "102.7917671",
          "scb-channel": "APP",
          "th.co.scb-easy-rquid": "37b3e6c0-8029-4f61-9951-1d461a9b6156",
          "th.co.scb-easy-sessionid": "aecf47c3-c19d-438f-91c1-dfedd862e196",
          "user-agent": this.useragent,
          Cookie:
            "TS01700433=012a0826e339c5fe730b65d7a8ef99b76e750138b7ecd14f2b8e689549ac975e044288c5ddfe4c0903c182de0e203c017d74bb5a67",
        },
        data: data,
      };
      const response = await axios.request(config);
      return { data: response.data, headers: response.headers };
    } catch (error) {
      return error;
    }
  }

  async summary(accountNo, auth) {
    const data =
      '{"numberRecentTxn": 2,"tilesVersion": "' +
      this.tilesVersion +
      '","latestTransactionFlag": "false","depositList": [{"accountNo": "' +
      accountNo +
      '"}]}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v2/deposits/summary",
      data,
      auth
    );
    return response;
  }
  async transactions(accountNo, startdate, enddate, auth, pageNumber = "1") {
    const data =
      '{"productType": "2","pageNumber": ' +
      pageNumber +
      ',"startDate": "' +
      startdate +
      '","pageSize": 20,"accountNo": "' +
      accountNo +
      '","endDate": "' +
      enddate +
      '"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v2/deposits/casa/transactions",
      data,
      auth
    );
    return response;
  }
  async paymentsbillscan(barcode, auth) {
    const data =
      '{"tilesVersion": "' +
      this.tilesVersion +
      '","barcode": "' +
      barcode +
      '"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v7/payments/bill/scan",
      data,
      auth
    );
    return response;
  }
  async transferverification(
    accountTo,
    amount,
    transferType,
    accountFrom,
    accountToBankCode,
    auth
  ) {
    const data =
      '{"accountTo": "' +
      accountTo +
      '","amount": "' +
      amount +
      '","transferType": "' +
      transferType +
      '","annotation": null,"accountFromType": "2","accountFrom": "' +
      accountFrom +
      '","accountToBankCode": "' +
      accountToBankCode +
      '","tilesVersion": "' +
      this.tilesVersion +
      '"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v2/transfer/verification",
      data,
      auth
    );
    return response;
  }
  async transferconfirmation(datas) {
    let {
      accountFrom,
      accountTo,
      accountToName,
      pccTraceNo,
      amount,
      feeType,
      sequence,
      transactionToken,
      accountToBankCode,
      terminalNo,
      transferType,
      accountFromName,
      auth,
    } = datas;
    const data =
      '{"accountFrom": "' +
      accountFrom +
      '","accountTo": "' +
      accountTo +
      '","accountToName": "' +
      accountToName +
      '","botFee": 0,"pccTraceNo": "' +
      pccTraceNo +
      '","amount": "' +
      amount +
      '","feeType": "' +
      feeType +
      '","fee": 0,"scbFee": 0,"sequence": "' +
      sequence +
      '","transactionToken": "' +
      transactionToken +
      '","channelFee": 0,"accountToBankCode": "' +
      accountToBankCode +
      '","terminalNo": "' +
      terminalNo +
      '","transferType": "' +
      transferType +
      '","accountFromType": "2","accountFromName": "' +
      accountFromName +
      '"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v3/transfer/confirmation",
      data,
      auth
    );
    return response;
  }

  //   async chack_limit(auth) {

  //     const response = await this.#request(
  //       "get",
  //       "https://fasteasy.scbeasy.com/v1/limit-transfer/limits/usage?limitType=PER_CUSTOMER_PER_DAY&function=TRANSFER&subFunction=PROMPTPAY",

  //       auth
  //     );
  //     return response;

  //   }

  async cardlessatmverification(accountNo, amount, auth) {
    const data =
      '{"amount": "' +
      amount +
      '","tileVersion": "' +
      this.tilesVersion +
      '","paymentType": "CCW_CASA","sourceOfFundNo": "' +
      accountNo +
      '"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v3/cardlessatm/verification",
      data,
      auth
    );
    return response;
  }

  async cardlessatmconfirmation(
    transactionToken,
    maskedMobileNo,
    mobileNoReference,
    auth
  ) {
    const data =
      '{"transactionToken": "' +
      transactionToken +
      '","maskedMobileNo": "' +
      maskedMobileNo +
      '","mobileNoReference": "' +
      mobileNoReference +
      '"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v2/cardlessatm/confirmation",
      data,
      auth
    );
    return response;
  }
  async transferrequestqr(amount, proxyId, auth) {
    const data =
      '{"amount": "' +
      amount +
      '","proxyId": "' +
      proxyId +
      '","proxyType": "MOB"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v1/transfer/request/qr",
      data,
      auth
    );
    return response;
  }
  async transferpromtpay(amount, accountFrom, promptPayID, auth) {
    const data =
      '{"amount": "' +
      amount +
      '","accountFrom": "' +
      accountFrom +
      '","promptPayType": "MOB","promptPayID": "' +
      promptPayID +
      '","transferType": "PP","annotation": null,"accountFromType": "2","tilesVersion": "' +
      this.tilesVersion +
      '"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v2/transfer/verification",
      data,
      auth
    );
    return response;
  }
  async confirmpromtpay(
    amount,
    accountFrom,
    accountTo,
    accountToName,
    pccTraceNo,
    accountToDisplayName,
    promptPayID,
    sequence,
    transactionToken,
    accountToBankCode,
    terminalNo,
    accountFromName,
    auth
  ) {
    const data =
      '{"promptPayType": "MOB","accountFrom": "' +
      accountFrom +
      '","accountTo": "' +
      accountTo +
      '","accountToName": "' +
      accountToName +
      '","botFee": 0,"accountToType": "00","pccTraceNo": "' +
      pccTraceNo +
      '","amount": "' +
      amount +
      '","accountToDisplayName": "' +
      accountToDisplayName +
      '","feeType": "","fee": 0,"promptPayID": "' +
      promptPayID +
      '","scbFee": 0,"sequence": "' +
      sequence +
      '","transactionToken": "' +
      transactionToken +
      '","channelFee": 0,"accountToBankCode": "' +
      accountToBankCode +
      '","terminalNo": "' +
      terminalNo +
      '","transferType": "PP_OTHER","accountFromType": "2","accountFromName": "' +
      accountFromName +
      '"}';
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v3/transfer/confirmation",
      data,
      auth
    );
    return response;
  }
  async topupbillersadditionalinfo(billerId, amount, phone, accountNo, auth) {
    // const data = '{"pmtAmt": "' + amount + '","note": "TOPUP","serviceNumber": "' + phone + '","annotation": null,"depAcctIdFrom": "' + accountNo + '","billerId": ' + billerId + "}';
    const data = JSON.stringify({
      depAcctIdFrom: accountNo,
      billerId: billerId,
      pmtAmt: amount,
      annotation: null,
      note: "TOPUP",
      serviceNumber: phone,
      tilesVersion: this.tilesVersion,
    });
    console.log(data);
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v2/topup/billers/" +
        billerId +
        "/additionalinfo",
      data,
      auth
    );
    return response;
  }
  async topupadditionalinfo(
    billRef3,
    billerId,
    phone,
    amount,
    transactionToken,
    billRef1,
    billRef2,
    depAcctIdFrom,
    auth
  ) {
    const data =
      '{"billRef3": "' +
      billRef3 +
      '","billerId": "' +
      billerId +
      '","mobileNumber": "' +
      phone +
      '","feeAmt": 0,"note": "","misc1": "","misc2": "","pmtAmt": "' +
      amount +
      '","serviceNumber": "' +
      phone +
      '","transactionToken": "' +
      transactionToken +
      '","billRef1": "' +
      billRef1 +
      '","billRef2": "' +
      billRef2 +
      '","depAcctIdFrom": "' +
      depAcctIdFrom +
      '"}';
    console.log(data);
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v2/topup",
      data,
      auth
    );
    return response;
  }

  async generateslip(tranId, auth) {
    const data = JSON.stringify({
      function: "TRANSFER",
      transactionId: tranId,
    });
    const config = {
      method: "post",
      url: "https://fasteasy.scbeasy.com/v1/slip/generate",
      headers: {
        "user-agent": "" + this.useragent + "",
        host: "" + this.host + "",
        "scb-channel": "APP",
        "accept-language": "th",
        "accept-encoding": "gzip",
        "content-type": "application/json; charset=UTF-8",
        "th.co.scb-easy-rquid": "fdbe576e-0e23-422c-a31b-f38cdfacf350",
        "th.co.scb-easy-sessionid": "a55f83a9-ca84-454c-99d6-8b911139f62c",
        "api-auth": "" + auth + "",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async bulktransferprofiles(groupName, auth) {
    const data = JSON.stringify({ groupName: groupName });
    const response = await this.#request(
      "post",
      "https://fasteasy.scbeasy.com/v1/bulktransferprofiles/group",
      data,
      auth
    );
    return response;
  }

  async bulktransferprofilesget(auth) {
    const response = await this.#request(
      "get",
      "https://fasteasy.scbeasy.com/v1/bulktransferprofiles/group",
      null,
      auth
    );
    return response;
  }

  async bulktransferprofilesrecipient(
    groupId,
    accountTo,
    amount,
    bankCode,
    nickname,
    auth
  ) {
    let sub = "";
    if (bankCode == "014") {
      sub = "SCB";
    } else {
      sub = "OTHER";
    }

    const data = JSON.stringify({
      groupId: groupId,
      recipientList: [
        {
          accountTo: accountTo,
          amount: amount,
          bankCode: bankCode,
          nickname: nickname,
          subFunction: sub,
        },
      ],
    });
    const response = await this.#request(
      "POST",
      "https://fasteasy.scbeasy.com/v1/bulktransferprofiles/group/recipient",
      data,
      auth
    );
    return response;
  }

  async bulktransferprofilesrecipientgroupId(groupId, auth) {
    const response = await this.#request(
      "GET",
      "https://fasteasy.scbeasy.com/v1/bulktransferprofiles/group/recipient?groupId=" +
        groupId,
      null,
      auth
    );
    return response;
  }

  async transferbulkverification_scb(
    accountFrom,
    groupId,
    amount,
    recipientId,
    auth
  ) {
    const data = JSON.stringify({
      accountFrom: accountFrom,
      groupId: groupId,
      otherList: [],
      ownList: [],
      scbList: [
        {
          amount: amount,
          recipientId: recipientId,
        },
      ],
    });
    const response = await this.#request(
      "POST",
      "https://fasteasy.scbeasy.com/v1/transfer/bulk/verification",
      data,
      auth
    );
    return response;
  }

  async transferbulkverification_other(
    accountFrom,
    groupId,
    amount,
    recipientId,
    auth
  ) {
    const data = JSON.stringify({
      accountFrom: accountFrom,
      groupId: groupId,
      otherList: [
        {
          amount: amount,
          recipientId: recipientId,
        },
      ],
      ownList: [],
      scbList: [],
    });
    const response = await this.#request(
      "POST",
      "https://fasteasy.scbeasy.com/v1/transfer/bulk/verification",
      data,
      auth
    );
    return response;
  }

  async transferbulkconfirmation(transactionToken, auth) {
    const data = JSON.stringify({ transactionToken: transactionToken });
    const response = await this.#request(
      "POST",
      "https://fasteasy.scbeasy.com/v1/transfer/bulk/confirmation",
      data,
      auth
    );
    return response;
  }

  async bulktransferprofilesdel(groupId, recipientId, auth) {
    const data = JSON.stringify({ groupId: groupId, recipientId: recipientId });
    const response = await this.#request(
      "DELETE",
      "https://fasteasy.scbeasy.com/v1/bulktransferprofiles/group/recipient",
      data,
      auth
    );
    return response;
  }

  async bulktransferprofilesout(groupId, auth) {
    const data = JSON.stringify({ groupId: groupId });
    const response = await this.#request(
      "DELETE",
      "https://fasteasy.scbeasy.com/v1/bulktransferprofiles/group",
      data,
      auth
    );
    return response;
  }

  async topupbillers2denominations(id, auth) {
    const config = {
      method: "get",
      url:
        "https://fasteasy.scbeasy.com/v1/topup/billers/" +
        id +
        "/denominations",
      headers: {
        "api-auth": "" + auth + "",
        "user-agent": "" + this.useragent + "",
        host: "" + this.host + "",
        "scb-channel": "APP",
        "accept-language": "th",
        "content-type": "application/json; charset=UTF-8",
      },
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async topupbillers(auth) {
    const data = JSON.stringify({ auth: auth });
    const config = {
      method: "get",
      url: "https://fasteasy.scbeasy.com/v1/topup/billers",
      headers: {
        "api-auth": "" + auth + "",
        "user-agent": "" + this.useragent + "",
        host: "" + this.host + "",
        "scb-channel": "APP",
        "accept-language": "th",
        "content-type": "application/json; charset=UTF-8",
      },
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async eligiblebanks(auth) {
    const config = {
      method: "get",
      url: "https://fasteasy.scbeasy.com/v1/transfer/eligiblebanks",
      headers: {
        "api-auth": "" + auth + "",
        "user-agent": "" + this.useragent + "",
        host: "" + this.host + "",
        "scb-channel": "APP",
        "accept-language": "th",
        "content-type": "application/json; charset=UTF-8",
      },
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  async #request(method, uri, data = null, auth = "", host = "") {
    const config = {
      method: "" + method + "",
      url: "" + uri + "",
      headers: {
        // "origin": "aaaa",
        // "accept-encoding": "gzip",
        // "accept-language": "th",
        // "content-type": "application/json; charset=UTF-8",
        // "scb-channel": "APP",
        // "user-agent": "" + this.useragent + "",
        // "th.co.scb-easy-rquid": "fdbe576e-0e23-422c-a31b-f38cdfacf350",
        // "th.co.scb-easy-sessionid": "a55f83a9-ca84-454c-99d6-8b911139f62c",
        // "authority": "scbeasy.co",
        // "accept": "application/json, text/plain, /",
        // "api-auth": "" + auth + "",
        // "host": "" + this.host + "",
        "user-agent": "" + this.useragent + "",
        "scb-channel": "APP",
        "accept-language": "th",
        "content-type": "application/json; charset=UTF-8",
        "api-auth": "" + auth + "",
        origin: "" + Math.floor(Math.random() * 1000) + "",
      },
      // proxy: false,
      // httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://192.168.1.18:8000`),
      data: data,
    };
    const response = await axios(config)
      .then((r) => r)
      .catch((e) => e.response);
    return response;
  }

  #makeid(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
};
