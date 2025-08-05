var {
  Admin,
  Activity_system,
  Role,
  Getdata_permissionsv1,
  RolePermission,
  BankAccount,
  Bank,
  Member,
  Transaction_tranfer,
  Transaction_withdraw,
  TransactionsV2,
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
//const Apiscb_helper = require("../../helpers/login.helpers");
var moment = require("moment");
require("moment/locale/th");
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
const { v4: uuidv4 } = require("uuid");
const { permission } = require("process");
function conRes(res) {
  return Object.values(JSON.parse(JSON.stringify(res)));
}
function generateUuid() {
  return uuidv4();
}
async function getWithdrawalTransactions_by(id) {
  try {
    const transactions = await TransactionsV2.findOne({
      include: [
        {
          model: Member,
          as: "members",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        type_option: "ถอน",
        id: id,
      },
      order: [["id", "desc"]],
    });

    //console.log(transactions)

    const dataall = await Transaction_withdraw.findOne({
      include: [
        {
          as: "accfrom",
          model: BankAccount,
          attributes: ["accountNumber", "name", "merchantId", "bankId"],
          required: true,
          // where: { to_user_id: user_id, request_status: "Requested" },
        },
      ],
      attributes: {
        exclude: ["deleted_at", "created_at", "updated_at", "ref"],
      },
      where: {
        transaction_id: id,
      },
    });
    //
    // console.log(dataall)

    let datare = dataall
      ? dataall
      : {
          id: 9164,
          request_All_id: null,
          status_showadmin: 2,
          status_showmember: 2,
          amount: 200,
          remark: null,
          bank_from: null,
          acc_from: null,
          name_member: null,
          txn_type: null,
          datamember: null,
          bank_to: null,
          add_from: null,
          ref: "",
          c_before: null,
          c_after: null,
          description: null,
          datw_new: null,
          type_option: null,
          status: null,
          longtext_res: null,
          uuid: null,
          member_id: null,
          reqby_admin_id: 4,
          nodere: null,
          date_new1: null,
          created_at: null,
          updated_at: null,
          accfrom: {
            accountNumber: "PayoneX",
            name: "PayoneX",
            merchantId: 6,
            bankId: "PayoneX",
            channel: "PayoneX"
          },
        };

    return {
      ...(transactions?.toJSON()
        ? transactions?.toJSON()
        : {
            id: 1500,
            transaction_id: 9164,
            recipientName: null,
            recipientAccount: null,
            amount: null,
            remark: "",
            recipientBank: null,
            senderAccount: null,
            qrString:
            null,
            transactionId: null,
            transactionDateTime: null,
            status: null,
            ref: "",
            description: "",
            member_id: null,
            senderAccountId: null,
            reqby_admin_id: null,
            created_at: null,
            updated_at: null,
            accfrom: {
              accountNumber: "PayoneX",
              name: "PayoneX",
              merchantId: 6,
              bankId: "PayoneX",
              channel: "PayoneX"
            },
          }),
      transactions: datare,
    };
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
}
const getdata_transaction = async function (req, res) {
  try {
    const body = req.body;

    if (!body.ref) {
      return ReE(res, {
        results: null,
        code: 402,
        message: "ข้อมูลไม่ครบถ้วน",
      });
    }

    let chack = await TransactionsV2.findOne({
      include: [
        {
          model: Member,
          as: "members", // Use the correct alias from your model definition
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
          where: {
            merchantId: req.user.id,
          },
        },
      ],
      exclude: [
        "deleted_at",
        "created_at",
        "updated_at",
        "status_showadmin",
        "status_showmember",
        "bank_from",
        "acc_from",
      ],
      where: {
        ref: body.ref,
      },
    });

    let data_tranfer = await getWithdrawalTransactions_by(chack.id);

    return ReS(res, {
      data: data_tranfer,
      code: 200,
      message: "success",
    });
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};
async function getBank(params) {
  let b = await Bank.findOne({ where: { bank_id: params } });
  return b;
}
const getdata_transactionall = async function (req, res) {
  try {
    //
    const body = req.body;
    const whereClause = {}; // สร้าง where clause แบบ dynamic
    if (body.bank) {
      const bank = await getBank(body.bank);
      const members = await Member.findAll({ where: { bankId: bank?.id } });
      if (members.length > 0) {
        whereClause["member_id"] = members.map((member) => member.id);
      } else {
        return ReS(res, {
          data: [],
          message:
            "ไม่พบสมาชิกสำหรับธนาคารที่ระบุ. No members found for the specified bank.",
        });
      }
    }
    if (body.accnum) {
      let acc = await Member.findOne({
        where: { bankAccountNumber: body.accnum },
      });
      whereClause.member_id = acc.id;
    }
    if (body.member_id) {
      whereClause.member_id = body.member_id;
    }
    if (body.ref) {
      whereClause.ref = body.ref;
    }
    if (body.created_at) {
      whereClause.created_at = new Date(body.created_at);
    }
    if (body.type_option) {
      whereClause.type_option = body.type_option;
    }



    let { member_id, ref, created_at, type_option } = whereClause;


    let chack = await TransactionsV2.findAll({
      include: [
        {
          model: Member,
          as: "members", // Use the correct alias from your model definition
          include: [
            {
              as: "banks",
              model: Bank,
              attributes: {
                include: [],
                exclude: ["deleted_at", "created_at", "updated_at"],
              },
              required: true,
            },
          ],
          where: {
            merchantId: req.user.id,
          },
        },
      ],
      exclude: [
        "status_showadmin",
        "status_showmember",
        "bank_from",
        "acc_from",
      ],
      where: whereClause,
      //   offset: body.offset,
      //   limit: body.limit,
      order: [["id", "desc"]],
    });
    let check_req = member_id || ref || created_at || type_option;



    
    let reqtxt_no = "ไม่พบข้อมูล กรุณาตรวจสอบข้อมูลให้ถูกต้อง";
    let reqtxt_yes = `!!สำเร็จ รายการที่ค้นหา ${chack.length} รายการ`;
    if (check_req) {
      return ReS(res, {
        data: chack,
        message: chack.length > 0 ? reqtxt_yes : reqtxt_no,
      });
    }
    return ReS(res, {
      data: chack,
      message: `success`,
    });
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};
// const getdata_transactionall = async function (req, res) {
//   try {
//     //
//     const body = req.body;
//     let chack = await TransactionsV2.findAll({
//       include: [
//         {
//           model: Member,
//           as: "members", // Use the correct alias from your model definition
//           include: [
//             {
//               as: "banks",
//               model: Bank,
//               attributes: {
//                 include: [],
//                 exclude: ["deleted_at", "created_at", "updated_at"],
//               },
//               required: true,
//               // where: { to_user_id: user_id, request_status: "Requested" },
//             },
//           ],
//           where: {
//             merchantId: req.user.id,
//           },
//         },
//       ],
//       exclude: [
//         "status_showadmin",
//         "status_showmember",
//         "bank_from",
//         "acc_from",
//       ],
//     //   offset: body.offset,
//     //   limit: body.limit,
//       order: [["id", "desc"]],
//     });
//     return ReS(res, {
//       data: chack,
//       message: "success",
//     });
//   } catch (error) {
//     console.error(error);
//     return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
//   }
// };

module.exports = {
  getdata_transaction,
  getdata_transactionall,
};
