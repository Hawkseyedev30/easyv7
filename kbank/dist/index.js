// "use strict";

// var { Playload,Datauser ,User_account,BankAccount} = require("../../models");

// Object.defineProperty(exports, "__esModule", { value: true });
// const kbankAccount_1 = require("./kbankAccount");

// var transferData;
// (async (data) => {
//   // Token : https://2captcha.com/ | 1,000 Captcha / 1 USD

//     console.log(data)

//   let mybank = new kbankAccount_1.kbankAccount(
//     "PrasertChoosook2519",
//     `Choosook!@#2519`,
//     ``
//   );
//   let login = await mybank.login();

//   console.log("Logged in:", login);

//   if (login) {
//     await sleep(1000);
//     //Login
//     console.log("0 getSession...");
//     await mybank.getSession(login);

//     await sleep(1000);

//     console.log("1 getRefresh...");

//     await mybank.refreshSession(
//       `https://kbiz.kasikornbankgroup.com/login?dataRsso=${login}`
//     );

//     await sleep(1000);

//     console.log("2 getBankAccount...");

//     let account = await mybank.getBankAccount();

//     console.log(account);
//     //Using profile 1
//     let acc = account.ownAccountList[0];
//     await sleep(1000);
//     console.log("3 getRefresh...");
//     await mybank.refreshSession(
//       "https://kbiz.kasikornbankgroup.com/menu/account/account-summary"
//     );

//     await sleep(1000);

//     // Load statement
//     // decode base64
//     // console.log('4 getStatement...')
//     // let yesterdayDate = new Date(Date.now() - 86400 * 1000);
//     // let statement: any = await mybank.getStatement(acc, `${yesterdayDate.toLocaleDateString('pt-PT')}`, `${yesterdayDate.toLocaleDateString('pt-PT')}`);
//     // fs.writeFileSync(`./${(yesterdayDate.toLocaleDateString('pt-PT').replace(/\//g,"-"))}.${statement.reqDocType}`, Buffer.from(statement.accountStatement, "base64").toString("utf-8"))
//     // Load statement ดึง trasaction ของธนาคารแออกมา
//     console.log("4 getTransactionList...");
//     let thisDate = new Date();
//     let yesterdayDate = new Date(Date.now() - 86400 * 1000);
//     // console.log(acc);
//     let statement = await mybank.getTransactionList(
//       acc,
//       `${yesterdayDate.toLocaleDateString("pt-PT")}`,
//       `${thisDate.toLocaleDateString("pt-PT")}`
//     );

//     let datasave = {
//       statement: statement,
//       statement_actionList: statement.recentTransactionList,
//     };
//     // console.log("\nStatement", statement, statement.recentTransactionList);
//     //let dsas = await updates_acc(datasave)

//     await sleep(1000);
//     // console.log("getTransactionDetails...");
//     //Get latest transaction from account no (Not support PromptPay and K-Bank)
//     // console.log("datacheck: ", statement.recentTransactionList[5]);
//     let details = await statement.recentTransactionList.map(async (e) =>
//       mybank.getTransactionDetail(e, acc)
//     );
//     // console.log(details);

//     for (const trans of statement.recentTransactionList) {
//       let details = await mybank.getTransactionDetail(trans, acc);

//       const combinedData = { ...trans, ...details };

//       console.log(combinedData);
//     }
//     //Bank Transfer
//     // await sleep(1000)
//     // console.log('3 getRefresh...')
//     // await mybank.refreshSession("https://kbiz.kasikornbankgroup.com/menu/fundtranfer/fundtranfer");
//     // await sleep(1500)
//     // console.log('4 bankTransfer...')
//     // // //BankCode, AccountNo, Amount (All bank codes: https://th.wikipedia.org/wiki/%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%98%E0%B8%99%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3%E0%B9%83%E0%B8%99%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%97%E0%B8%A8%E0%B9%84%E0%B8%97%E0%B8%A2)
//     // // transferData = await mybank.bankTransferOther('014', '4121347363', '1.54', acc); //For other banks
//     // transferData = await mybank.bankTransferOrft('004', '1341537351', '1', acc); //For kbank
//     // console.log(transferData)
//     //Transfer function
//     //Confirm transfer with pushbullet
//     // console.log('pushbulletConfirmTransfer...')
//     // let pb = new pushBullet('accessToken');
//     // let otp_data = await pb.getKBankOTPByRef('deviceIdentity', transferData.pac);
//     // console.log('OTP Data:',otp_data);
//     // let resp = await mybank.bankTransferSubmitOTP(transferData, otp_data.otp_code);
//     // console.log('Push OTP Result:', resp);
//     // Confirm transfer (OTP) (Prompt[cli] version)
//     // console.log('3 getRefresh...')
//     // console.log(await mybank.refreshSession("https://kbiz.kasikornbankgroup.com/menu/account/account-summary"));
//     // await sleep(1000)
//     // prompt.start();
//     // console.log(`[Bank] Please enter OTP (Ref: ${transferData.pac}):`)
//     // prompt.get(['otp'], async (err: any, result: any) => {
//     //     if (err) { return onErr(err); }
//     //     console.log('bankSubmitOTP...')
//     //     // let resp = await mybank.bankTransferOtherOTP(transferData, result.otp); // Othor Bank
//     //     let resp = await mybank.bankTransferOrftOTP(transferData, result.otp); // KBank
//     //     console.log(resp)
//     //     await sleep(1000)
//     //     console.log('5 getRefresh...')
//     //     await mybank.refreshSession("https://kbiz.kasikornbankgroup.com/menu/account/account-summary");
//     //     await sleep(1000)
//     //     // Load statement
//     //     console.log('6 getTransactionList...')
//     //     let thisDate = new Date();
//     //     let yesterdayDate = new Date(Date.now() - 86400 * 1000);
//     //     console.log(acc)
//     //     let statement: any = await mybank.getTransactionList(acc, `${yesterdayDate.toLocaleDateString('pt-PT')}`, `${thisDate.toLocaleDateString('pt-PT')}`);
//     //     console.log('\nStatement', statement, (statement as any).recentTransactionList);
//     // });
//     // await sleep(1000)
//     // console.log('getTransactionDetails...')
//     // //Get latest transaction from account no (Not support PromptPay and K-Bank)
//     // console.log("datacheck: ", statement.recentTransactionList[5])
//     //PromptPay Transfer
//     // console.log('promptpayTransfer...')
//     // // transferData = await mybank.promptpayIDTransfer('', '1', acc); //For ID
//     // // transferData = await mybank.promptpayPhoneTransfer('', '1', acc); //For Phone
//     // // console.log(transferData)
//     // //Confirm transfer (OTP (Prompt[cli] version)
//     // console.log(`[Bank] Please enter OTP (Ref: ${transferData.pac}):`)
//     // prompt.get(['otp'], async (err: any, result: any) => {
//     //     if (err) { return onErr(err); }
//     //     console.log('promptpaySubmitOTP...')
//     //     let resp = await mybank.promptpaySubmitOTP(transferData, result.otp);
//     //     console.log(resp)
//     // });
//   }
// })();

var { Playload, Datauser, User_account, BankAccount } = require("../../models");
let transferData;
Object.defineProperty(exports, "__esModule", { value: true });
const kbankAccount_1 = require("./kbankAccount");

async function updates_accs(params) {
  console.log(params);

  // let max = "555555555555555555555"

  // return params;
}

async function updates_acc(params, id, login) {
  let datasave = params;

  let dataup = {
    //sameBankLimit: "0.00",
    // otherBankLimit: "0.00",
    balance: params.availableBalance,
    auth: login,
    latestPollingStatus: null,
    settings: null,
  };

  let max = await BankAccount.update(dataup, {
    where: {
      id: id,
    },
  });

  return max;
}

async function Loginkbank_auth(body) {
  function onErr(err) {
    console.log(err);
    return 1;
  }

  function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });
  }

  let mybank = new kbankAccount_1.kbankAccount(
    `${body.deviceId}`,
    `${body.pin}`,
    ``
  );
  let login = body.auth;


if(!body.auth){

  login = await mybank.login();
}

  // let login = await mybank.login();
  let mybank_datalogin = await mybank.getSession(login);

  if (mybank_datalogin.status == false) {
    login = await mybank.login();
    await sleep(1000);
    mybank_datalogin = await mybank.getSession(login);
  }

  await sleep(1000);

  let account = await mybank.getBankAccount();
  let acc = account.ownAccountList[0];

  // // console.log("1 getRefresh...");

  await mybank.refreshSession(
    `https://kbiz.kasikornbankgroup.com/login?dataRsso=${login}`
  );

  await sleep(1000);

  // console.log("2 getBankAccount...");

  // let account = await mybank.getBankAccount();
  // let acc = account.ownAccountList[0];
  let thisDate = new Date();
  let yesterdayDate = new Date(Date.now() - 86400 * 1000);
  let dsas = await updates_acc(acc, body.id, login);

  return login;
}

async function getTransactionList(body) {
  function onErr(err) {
    console.log(err);
    return 1;
  }

  function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });
  }

  let mybank = new kbankAccount_1.kbankAccount(
    `${body.deviceId}`,
    `${body.pin}`,
    ``
  );
  let login = body.auth;
  // let login = await mybank.login();
  let mybank_datalogin = await mybank.getSession(login);

  if (mybank_datalogin.status == false) {
    login = await mybank.login();
    await sleep(1000);
    mybank_datalogin = await mybank.getSession(login);
  }

  await sleep(1000);

  let account = await mybank.getBankAccount();
  let acc = account.ownAccountList[0];

  // // console.log("1 getRefresh...");

  await mybank.refreshSession(
    `https://kbiz.kasikornbankgroup.com/login?dataRsso=${login}`
  );

  await sleep(1000);

  // console.log("2 getBankAccount...");

  // let account = await mybank.getBankAccount();
  // let acc = account.ownAccountList[0];
  let enddate = new Date();
  let start = new Date(Date.now() - 86400 * 1000);
  let yesterdayDate = new Date(Date.now() - 86400 * 1000);
  let dsas = await updates_acc(acc, body.id, login);

  // // //transferData = await mybank.bankTransferOrft('014', '4086782145', '1', acc)

  let statement = await mybank.getTransactionList(
    acc,
    `${start.toLocaleDateString("pt-PT")}`,
    `${enddate.toLocaleDateString("pt-PT")}`
  );
 // console.log(statement);
    const bubbles = [];

  for (const trans of statement.recentTransactionList) {
    let details = await mybank.getTransactionDetail(trans, acc,body.telephoneNumber);

    //console.log(details);

    const combinedData = { ...trans, ...details };

    let datasave = {
      statement: statement,
      statement_actionList: statement.recentTransactionList,
    };
    // console.log("\nStatement", statement, statement.recentTransactionList);

    await sleep(1000);

    const dataretun = {
      aAccountcc: acc,
      statement: combinedData,
    };
    bubbles.push(dataretun);
    //  console.log(dataretun);
  }

  return bubbles;
}

async function inquiryFundTransferAccount(body, prarams) {
  function onErr(err) {
    console.log(err);
    return 1;
  }

  function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });
  }

  let mybank = new kbankAccount_1.kbankAccount(
    `${body.deviceId}`,
    `${body.pin}`,
    ``
  );
  let login = body.auth;
  // let login = await mybank.login();
  let mybank_datalogin = await mybank.getSession(login);

  if (mybank_datalogin.status == false) {
    login = await mybank.login();
    await sleep(1000);
    mybank_datalogin = await mybank.getSession(login);
  }

  await sleep(1000);

  let account = await mybank.getBankAccount();
  let acc = account.ownAccountList[0];

  // // console.log("1 getRefresh...");

  let chack = await mybank.refreshSession(
    `https://kbiz.kasikornbankgroup.com/login?dataRsso=${login}`
  );

  await sleep(1000);

  if (chack.data.status == "S") {
    let bodypost = {
      bankId: prarams.bankAbv == "kbank" ? 0 : 1,
      bankCode: prarams.bankCode,
      bankAbv: prarams.bankAbv == "kbank" ? "KBNK" : prarams.bankAbv,
      beneficiaryNo: prarams.accountNo,
      fromAccountNo: body.accountNumber,
      transType: prarams.bankAbv == "kbank" ? "FTOT" : "FTOB",
    };

    let details = await mybank.getinquiryFundTransferAccount(bodypost);

    //console.log(details);
    return details;

    // console.log(details);
  }
}

module.exports = {
  updates_acc,
  //transferData,
  Loginkbank_auth,
  getTransactionList,
  inquiryFundTransferAccount,
};

//# sourceMappingURL=index.js.map
