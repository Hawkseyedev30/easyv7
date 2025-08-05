var {
  Admin,
  User_account,
  Bank,
  TransactionsV2,
  Member,
  BankAccount,
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];
const Apiscb_helper = require("../../helpers/login.helpers");
const Apiscbbiz_helper = require("../../helpers/scb_buisnet");
//const Apiscb_helper = require("../../helpers/login.helpers");
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
function conRes(res) {
  return Object.values(JSON.parse(JSON.stringify(res)));
}

const verrify_tranfer_withdrowinq = async function (req, res) {
  try {
    let body = req.body;

    if (!body.transaction_id) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_accountNo_require",
          message: {
            th: "กรุณากรอก accountNo ของคุณ....",
            en: "Please input your accountNo.",
          },
        },
        422
      );
    }

    let chack_datatranfer = await TransactionsV2.findOne({
      include: [
        {
          model: Member,
          as: "members",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
          include: [
            {
              as: "banks",
              model: Bank,
              attributes: {
                include: [],
                exclude: ["deleted_at", "created_at", "updated_at"],
              },
              required: true,
              // where: { to_user_id: user_id, request_status: "Requested" },
            },
          ],
        },
      ],
      where: {
        id: body.transaction_id,
      },
    });

    if (!chack_datatranfer) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_accountNo_require",
          message: {
            th: "กรุณากรอก accountNo ของคุณ....",
            en: "Please input your accountNo.",
          },
        },
        422
      );
    }

    let auth_info, err, BankAccounts;

    [err, BankAccounts] = await to(
      BankAccount.findOne({
        where: {
          accountType: "verifying_account",
          status_bank: "Active",
        },
        //   order: [["id", "ASC"]],
        //limit: 3,
      })
    );

    if (!BankAccounts) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_accountNo_require",
          message: {
            th: "กรุณากรอก accountNo ของคุณ....",
            en: "Please input your accountNo.",
          },
        },
        422
      );
    }

    let chack_authv1 = await Apiscbbiz_helper.ckack_authscb(BankAccounts.auth);

   //console.log(chack_authv1)

    if (chack_authv1.data.success == false) {
      let datapost = {
        deviceId: BankAccounts.deviceId,
        pin: BankAccounts.pin,
      };

      let chack_auth = await Apiscbbiz_helper.login_scbkrungthai(datapost);
     //  console.log(chack_auth.data);

      BankAccounts.auth = chack_auth.data.data.sessionId;

      if (chack_auth.data.success == true) {
        let upnew = BankAccount.update(
          {
            // auth: params.auth,
            //  isActive: 1,

            auth: chack_auth.data.data.sessionId,
          },
          {
            where: {
              id: BankAccounts.id,
            },
          }
        );
      }
    }

    let datapostckack = {
      sessionId: BankAccounts.auth,
      accountNumber: chack_datatranfer.members.bankAccountNumber,
      bankCode: chack_datatranfer.members.banks.scb_code,
    };
    const cahack_processing = await TransactionsV2.findOne({
      where: {
        status: "processing",
        type_option: "ถอน",
      },
      order: [["created_at", "ASC"]],
    });

    let chack_verrify = await Apiscbbiz_helper.verrifyscb(datapostckack);


   // console.log(chack_verrify)

    if (chack_verrify.data.data.validationResult == "PASSED") {


      
      if (chack_datatranfer.status == "inq") {
        let update_stats_goinq = await TransactionsV2.update(
          {
            status: "processing",
            //longtext_res:jss
          },
          {
            where: { id: chack_datatranfer.id },
          }
        );

        if (cahack_processing) {
          let update_stats_goinq = await TransactionsV2.update(
            {
              status: "inq",
              //longtext_res:jss
            },
            {
              where: { id: cahack_processing.id },
            }
          );
        }
      }

      let update_stats_goinq = await TransactionsV2.update(
        {
          status: "rejected",
          //longtext_res:jss
        },
        {
          where: { id: chack_datatranfer.id },
        }
      );

      return ReS(
        res,
        {
          data: chack_verrify.data,
          message:
            "บัญชีลูกค้า ถูกต้อง อาจจะเกิดปัญหาที่ธนาคารปลายทาง สลับ ลูกค้าไปรอคิวใหม่ สำเร็จ",
        },
        200
      );
    } else if (
      chack_verrify.data.data.validationResult == "BLOCK_NOT_FOUND_ACCT" || chack_verrify.data.data.validationResult == "NOT_FOUND_ACCOUNT"
    ) {
      let update_member = Member.update(
        {
          // auth: params.auth,
          //  isActive: 1,

          userStatus: 0,
        },
        {
          where: {
            id: chack_datatranfer.member_id,
          },
        }
      );
      let update_tran = TransactionsV2.update(
        {
          status: "rejected",
          remark: chack_verrify.data.data.validationResultDescription,
        },
        {
          where: {
            id: chack_datatranfer.id,
          },
        }
      );

      let update_stats_goinq = await TransactionsV2.update(
        {
          status: "inq",
          //longtext_res:jss
        },
        {
          where: { id: cahack_processing.id },
        }
      );
      return ReE(
        res,
        {
          //data: chack_verrify.data,
          message: chack_verrify.data.data.validationResultDescription,
        },
        200
      );
    }else {
        let update_member = Member.update(
            {
              userStatus: 0,
            },
            {
              where: {
                id: chack_datatranfer.member_id,
              },
            }
          );
          let update_tran = TransactionsV2.update(
            {
              status: "rejected",
              remark: "บัญชีลูกค้าไม่ ถูกต้อง อาจจะเกิดปัญหาที่ธนาคารปลายทาง หรือ ธนาคารไม่ถูก",
            },
            {
              where: {
                id: chack_datatranfer.id,
              },
            }
          );
    
          let update_stats_goinq = await TransactionsV2.update(
            {
              status: "inq",
              //longtext_res:jss
            },
            {
              where: { id: cahack_processing.id },
            }
          );
          return ReE(
            res,
            {
              //data: chack_verrify.data,
              message: "",
            },
            200
          );


    }

    //
  } catch (error) {

   return ReS(
        res,
        {
          data:error,
          message:
            "บัญชีลูกค้า ถูกต้อง อาจจะเกิดปัญหาที่ธนาคารปลายทาง สลับ ลูกค้าไปรอคิวใหม่ สำเร็จ",
        },
        200
      );
  }
};
module.exports = {
  verrify_tranfer_withdrowinq,
};
