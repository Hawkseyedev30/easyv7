var {
  User_account,
  Server_api,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  TransactionsV2,
} = require("../models");

var moment = require("moment");
require("moment/locale/th");
var md5 = require("md5");
const axios = require("axios"); // Import axios once at the top
const qs = require("qs"); // Import qs once at the top
const ame2ee = require("./ame2ee");

const ScbService = require("../services/apikrungthai_buis.class");
const { balance } = require("./login.helpers");
async function pinEncrypt(Sid, ServerRandom, pin, hashType, pubKey) {
  let e2Module, e2RsaExponent;
  const regex = /([^,]+),([^,]+)/;
  if ((m = regex.exec(pubKey)) !== null) {
    m.forEach((match, groupIndex) => {
      if (match !== "undefined" && groupIndex == 1) {
        e2Module = match;
      }
      if (match !== "undefined" && groupIndex == 2) {
        e2RsaExponent = match;
      }
    });
  }
  return await ame2ee.encryptPinForAM(
    Sid,
    e2Module + "," + e2RsaExponent,
    ServerRandom,
    pin,
    hashType
  );
}




async function getbalance(accountData, verification_passwords) {



  try {
    const scbService = new ScbService({
      accessToken: accountData.auth,
      Device_Version: accountData.Device_Version,
      Device_Model: accountData.Device_Model,
      Device_Platform: accountData.Device_Platform,
    });
    const loginResultsba = await scbService.overview_app(
      verification_passwords
    );


    return { staust: true, data: loginResultsba }
  }

  catch (error) {

    console.error("Error during bank authentication:", error);

    return { staust: false, data: null }

    // return null; // Or throw the error, depending on your error handling strategy
  }


}







/**
 * Authenticates with the bank API and retrieves an access token.
 * @param {object} accountData - Object containing bank account details for authentication.
 * @param {string} accountData.auth - Access token for the bank service.
 * @param {string} accountData.Device_Version - Device version.
 * @param {string} accountData.Device_Model - Device model.
 * @param {string} accountData.Device_Platform - Device platform.
 * @param {string} accountData.deviceId - Device ID.
 * @returns {string|null} The access token if successful, otherwise null.
 */
const authenticateBankData = async function (accountData) {
  const scbService = new ScbService({
    accessToken: accountData.auth,
    Device_Version: accountData.Device_Version,
    Device_Model: accountData.Device_Model,
    Device_Platform: accountData.Device_Platform,
  });

  try {




    const preloadResponse = await scbService.getClientCredentialsToken(
      accountData.deviceId,
      accountData.Device_Platform,
      accountData.Device_Version,
      accountData.Device_Model
    );



    const loginResults = await scbService.generatePinKey(
      accountData.deviceId,
      accountData.Device_Platform,
      accountData.Device_Version,
      accountData.Device_Model
    );

    const access_tokens = preloadResponse.access_token;



    const pinEncrypts = await pinEncrypt(
      loginResults.e2eeSid,
      loginResults.serverRandom,
      accountData.pin,
      loginResults.oaepHashAlgo,
      loginResults.pubKey
    );

    let datapostv2 = JSON.stringify({
      // companyId: loginResult.profile.companyId,
      // userId: loginResult.profile.userId,
      encryptedPassword: pinEncrypts,
      e2eeSid: loginResults.e2eeSid,
    });

    const verification_passwords = await scbService.authenticatePin(
      datapostv2,
      access_tokens,
      accountData.deviceId
    );




   // console.log(verification_passwords)


    const loginResultsba = await getbalance(accountData, verification_passwords.access_token)


    await BankAccount.update(
      {
        auth: verification_passwords.access_token,
        balance: loginResultsba.data.totalLedgerBalance,
        //limit_Left: totalLlimit,
      },
      {
        where: {
          id: accountData.id,
        },
      }
    );



    // Assuming loginResult is defined and contains access_token from a previous step or the preloadResponse
    // If loginResult is meant to be derived from preloadResponse, you'll need to adjust this line.
    // For now, I'm keeping the original variable name `loginResult` as it appeared in your snippet,
    // but typically preloadResponse would contain the necessary data.

    return { staust: true, data: loginResultsba.data }

  } catch (error) {
    console.error("Error during bank authentication:", error);
    return null; // Or throw the error, depending on your error handling strategy
  }
};






// const balance = async function (accountData) {





// }

module.exports = {
  authenticateBankData,
  getbalance
};