var {
    Admin,
    User_account,
    Bank,
    BankAccount,
    Request_All,
    BankAccountGroup,
    Transactions_limit,
  } = require("../../models");
  
  const { to, ReE, ReS, TE } = require("../../services/util.service");
  const Sequelize = require("sequelize");
  const Op = Sequelize.Op;
  const jwt = require("jsonwebtoken");
  const CONFIG = require("../../config/config.json");
  var url = require("url");
  const app = require("../../services/app.service");
  const config = require("../../config/app.json")[app["env"]];
  const fs = require("fs");
  const scbeasy = require("../scb/classscb");
  const Apiurlscb = require("../../helpers/apiurl_scb");
  var md5 = require("md5");
  const Scbapi = new scbeasy();
  var moment = require("moment");
  require("moment/locale/th");




  async function getbankinfo(params) {

    let err, bankAccounts;

    [err, bankAccounts] = await to(
      BankAccountGroup.findAll({
        include: [
          {
            model: BankAccount,
            as: "bankAccounts",
            include: [
              {
                as: "bank",
                model: Bank,
                attributes: {
                  include: [],
                  exclude: ["deleted_at", "created_at", "updated_at"],
                },
                required: true,
                // where: { to_user_id: user_id, request_status: "Requested" },
              },
            //   {
            //     model: Request_All,
            //     as: "Request_Alls", // Use the correct alias from your model definition
            //     attributes: {
            //       include: [],
            //       exclude: ["deleted_at", "created_at", "updated_at"],
            //     },
            //     order: [["id", "DESC"]],
            //     limit: 10,
            //   },
            ],
            attributes: {
              exclude: ["deviceId", "pin"],
            },
            required: true,
          },
        ],
  
        // order: [["id", "ASC"]],
      })
    );


    return bankAccounts

    
  }
  function randomString(len, charSet) {
    charSet = charSet || "0123456789";
    var randomString = "";
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  }

//chack Bank
  async function chack_bankhave(data_req,res,req) {
    try {
      //  Find all BankAccountGroups and set isActive to false
     let chack =  await BankAccount.findOne({ where: {accountNumber :data_req.accountNo,merchantId:req.user.id,accountType:data_req.accountType} });


     console.log(chack)
     if(chack){
        return ReE(
            res,
            {
              static_key: "api_response_auth_login_device_id_require",
              message: {
                th: "มีบัญชีนี้แล้วในระบบ....",
                en: "Please input your device id.",
              },
            },
            422
          );

     }
      return null
    } catch (error) {
    return { msg: "Error " };
    //  console.error('Error updating isActive for BankAccountGroup:', error);
    }
  }



async function create_bank(body,Banks,req) {


  let data = {
    name: body.accountName,
    prefix: randomString(15),
    accountNumber: body.accountNo,
    accountName: body.accountName,
    telephoneNumber: body.telephoneNumber,
    isActive: false,
    sameBankLimit: 0,
    otherBankLimit: 0,
    balance: 0,
    accountType: body.accountType,
    totalWithdrawalTxns: 0,
    totalWithdrawalVolume: 0,
    merchantId: req.user.id,
    bankId: Banks.id,
    pin: body.pin,
    deviceId: body.deviceId,
    status_bank: "Active",
    bankAccountGroupId: body.bankAccountGroupId,
    channel: body.channel,
  };

  let creates = await BankAccount.create(data);

  return creates
    
}

  function validateRequestBody(body,res) {
    if (!body.deviceId) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_device_id_require",
          message: {
            th: "กรุณากรอก device id ของคุณ....",
            en: "Please input your device id.",
          },
        },
        422
      );
    }
    if (!body.pin) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_pin_require",
          message: {
            th: "กรุณากรอก pin ของคุณ....",
            en: "Please input your pin.",
          },
        },
        422
      );
    }
    if (!body.accountNo) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_account_no_require",
          message: {
            th: "กรุณากรอก account no ของคุณ....",
            en: "Please input your account no.",
          },
        },
        422
      );
    }
    if (!body.accountType) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_account_type_require",
          message: {
            th: "กรุณากรอก account type ของคุณ....",
            en: "Please input your account type.",
          },
        },
        422
      );
    }
    if (!body.merchantId) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_merchant_id_require",
          message: {
            th: "กรุณากรอก merchant id ของคุณ....",
            en: "Please input your merchant id.",
          },
        },
        422
      );
    }
    if (!body.bank) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_bank_require",
          message: {
            th: "กรุณากรอก bank ของคุณ....",
            en: "Please input your bank.",
          },
        },
        422
      );
    }
    if (!body.channel) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_channel_require",
          message: {
            th: "กรุณากรอก channel ของคุณ....",
            en: "Please input your channel.",
          },
        },
        422
      );
    }
    if (!body.bankAccountGroupId) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_bank_account_group_id_require",
          message: {
            th: "กรุณากรอก bank account group id ของคุณ....",
            en: "Please input your bank account group id.",
          },
        },
        422
      );
    }
    if (!body.telephoneNumber) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_telephone_number_require",
          message: {
            th: "กรุณากรอก telephone number ของคุณ....",
            en: "Please input your telephone number.",
          },
        },
        422
      );
    }
    if (!body.accountName) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_account_name_require",
          message: {
            th: "กรุณากรอก account name ของคุณ....",
            en: "Please input your account name.",
          },
        },
        422
      );
    }
  
    // หากไม่มี field ใดว่าง return null
    return null; 
  }
  const addbank_Depositall = async function (req, res) {
    let body = req.body;

    

    const validationError = validateRequestBody(req.body,res);

   
    if (validationError) {
     // return validationError; // return error response
    }

  const chack_step1  = await chack_bankhave(body,res,req)
  //console.log(chack_step1)
 //
  if (chack_step1) {
    return chack_step1; // return error response
  }


  let auth_info, err, Banks, user;
  [err, Banks] = await to(
    Bank.findOne({
      where: {
        bank_id: req.body.bank,
      },
    })
  );


  const getbankinfos  = await create_bank(body,Banks,req)

 // console.log(getbankinfos)
  


  
 
  
    return ReS(
      res,
      {
        // static_key: "api_response_auth_login_accountNo_already_exists",
        message: "success",
       // data: dataall,
      },
      200
    );
  };
  const getdata_deposit_pay = async function (req, res) {

    let dataall = await getbankinfo()
  

    return ReS(
        res,
        {
          // static_key: "api_response_auth_login_accountNo_already_exists",
          message: "success",
          data: dataall,
        },
        200
    );

  }
  const getall_BankGrop = async function (req, res) {

    let dataall = await BankAccountGroup.findAll({})
  

    return ReS(
        res,
        {
          // static_key: "api_response_auth_login_accountNo_already_exists",
          message: "success",
          data: dataall,
        },
        200
    );

  }
  


  module.exports = {
    addbank_Depositall,
    getdata_deposit_pay,
    getall_BankGrop
    
  };
  