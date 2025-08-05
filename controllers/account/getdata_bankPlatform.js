var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Admin,
  Member,
  TransactionsV2,
  Transaction_withdraw,
  Systemsettings,
  BankAccountGroup,
  Gatway_setting,
  Customers,
  BankPlatform,
  Transaction_payonex
} = require("../../models");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Apipaynoex = require("../../apis/PayoneX");
const { v4: uuidv4 } = require("uuid");
const Notify = require("../../helpers/notify");
const urlendpoint = "https://scb.promplayvip.com";
const CountTrans = require("../../helpers/count_number_of_times.helpers");
var moment = require("moment");
require("moment/locale/th");
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IjRiZDIwM2Q4LTZkY2QtNGE4MC1iYjdlLTg2NDVlNzM2Y2NjNyIsInVzZXJfdHlwZSI6Ik1lcmNoYW50IiwiaWF0IjoxNzQwNjE2NDgxLCJleHAiOjE3NzIxNTI0ODF9.Ty61wohypWK4tcXIWJow7uK-SmKOALAoQ8vz_9uHQxk";

function generateUuid() {
  return uuidv4();
}

const getdata_bankPlatform = async function (req, res) {
  let dataplat = await BankPlatform.findAll({
    include: [
      {
        as: "banks",
        model: Bank,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"]
        },
        required: true
        // where: { to_user_id: user_id, request_status: "Requested" },
      }
    ]
  });

  return ReS(res, { data: dataplat });
};

async function chack_fetchAndProcessPageuuid(params) {
  var axios = require("axios");

  let data_Gatway_setting = await Gatway_setting.findOne({
    where: {
      name: "PayoneX"
    }
  });

  let ataitem_post = {
    accessKey: data_Gatway_setting.accessKey,
    secretKey: data_Gatway_setting.secretKey
  };

  let chackauth = await Apipaynoex.authenticate(ataitem_post);

  try {
    var configs = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.payonex.asia/transactions/${params}`,
      headers: {
        Accept: "application/json",
        Authorization: chackauth.data.data.token
      }
    };
    let datachackplays = await axios(configs);

    // console.log(datachackplays.data)

    return { data: datachackplays.data, status: 200 };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      data: error.response.data
    };
  }
}
const update_transactions_PayoneX = async function (req, res) {
  try {
    async function fetchAndProcessPage(page) {

      for (const element of page) {


        let chack = await chack_fetchAndProcessPageuuid(element.uuid);

        if (chack.data.success == true) {
          let members = await Member.findOne({
            where: {
              id: element.member_id
            }
          });

          if (chack.data.data.status == "ERROR") {
            await TransactionsV2.update(
              {
                status: "rejected",
                remark: " เกิดข้อผิดพลาดจาก GateWay PAYONEX กรุณาทำรายการเข้ามาใหม่",
                // amount: element.settleAmount
              },
              {
                where: { id: element.id }
              }
            );
            let datasaves = {
              transaction_id: element.id,
              recipientName: members.bankAccountName,
              recipientAccount: members.bankAccountNumber,
              amount: element.amount,
              remark: "ERROR PAYONEX",
              recipientBank: "PayoneX",
              senderAccount: "PayoneX",
              qrString: "",
              transactionId: "",
              transactionDateTime: "",
              status: "rejected",
              description: "",
              reqby_admin_id: 4,
              ref: element.uuid,
              member_id: members.id
            };


            let chack33 = await Transaction_withdraw.findOne({
              where: {
                ref: element.uuid
              }
            });
            if (!chack33) {
              await Transaction_withdraw.create(datasaves);
            }

            let msg = `
<b>Notification: 🚫 ERROR Approve GateWay</b>
<pre><code style="background-color: #f44336; color: white; padding: 10px; border-radius: 5px;">
<b>หมายเลขอ้างอิง (Ref):</b> ${element.uuid}
<b>ชื่อสมาชิก:</b> ${members.bankAccountName}
<b>จำนวนเงินที่ต้องการถอน:</b> ${element.amount}
<b>ประเภทธุรกรรม:</b> ${element.type_option}
<b>บัญชีที่ทำรายการ:</b> ${members.bankAccountNumber}
<b>สถานะรายการ:</b> rejected
<b>เวลาทำรายการ:</b> ${moment().format("YYYY-MM-DD HH:mm:ss")}
</code></pre>
<i><b>หมายเหตุ:</b> ${" เกิดข้อผิดพลาดจาก GateWay PAYONEX กรุณาทำรายการเข้ามาใหม่"}</i> `;

            let datanoti = {
              msg: msg,
              tpye: "worning",
              type_option: "withdraw",
              data: {
                ref: element.uuid,
                name_member: members.bankAccountName,
                amount: element.amount,
                type_option: element.type_option,
                nodere:
                  "เกิดข้อผิดพลาดจาก GateWay PAYONEX กรุณาทำรายการเข้ามาใหม่"
              }
            };

            await Notify.sendTelegram(datanoti);
          } else if (chack.data.data.status == "SUCCESS") {
            await TransactionsV2.update(
              {
                status: "success"
                // amount: element.settleAmount
              },
              {
                where: { id: element.id }
              }
            );
            let datasaves = {
              transaction_id: element.id,
              recipientName: members.bankAccountName,
              recipientAccount: members.bankAccountNumber,
              amount: element.amount,
              remark: "SUCCESS PAYONEX",
              recipientBank: "PayoneX",
              senderAccount: "PayoneX",
              qrString: "",
              transactionId: "",
              transactionDateTime: "",
              status: "success",
              description: "",
              reqby_admin_id: 4,
              ref: element.uuid,
              member_id: members.id
            };

            //  console.log(datasaves)

            let chack33 = await Transaction_withdraw.findOne({
              where: {
                ref: element.uuid
              }
            });
            if (!chack33) {
              await Transaction_withdraw.create(datasaves);
            }
            let count = 0;
            let countTrans = await CountTrans.count_the_number_of_times_withdrawals(members.id);
            if (countTrans?.status) {
              count = countTrans?.count
            }
            // console.log(datasaves)

            let msg = `
<b>Notification: Approve GateWay ✅</b>
<pre><code style="background-color: #f44336; color: white; padding: 10px; border-radius: 5px;">
<b>หมายเลขอ้างอิง (Ref):</b> ${element.uuid}
<b>ชื่อสมาชิก:</b> ${members.bankAccountName}
<b>เลขบัญชีสมาชิก:</b> ${members.bankAccountNumber}
<b>จำนวนเงิน:</b> ${element.amount}
<b>จำนวนที่ถอนวันนี้:</b> ${count} 
<b>ประเภทธุรกรรม:</b> ถอนเงิน GateWay
<b>สถานะรายการ:</b> Success
<b>เวลาทำรายการ:</b> ${moment().format("YYYY-MM-DD HH:mm:ss")}
</code></pre><i><b>หมายเหตุ:</b> ${"Withdraw GateWay Transfer completed by PayoneX"}</i>`;

            let datanoti = {
              msg: msg,
              tpye: "success",
              type_option: "withdraw",
              data: {
                ref: element.uuid,
                name_member: members.bankAccountName,
                amount: element.amount,
                type_option: element.type_option,
                nodere: "ทำรายการถอนเงินสำเร็จ"
              }
            };

            await Notify.sendTelegram(datanoti);
          }
        }

      }

    }

    let tranchacl = await TransactionsV2.findAll({
      where: {
        status: "pending",
        nodere: "PayoneX"
      }
    });

    let totalPages = await fetchAndProcessPage(tranchacl);

    // ดึงข้อมูลหน้าถัดไป

    return ReS(res, { data: "Data updated successfully" });
  } catch (error) {
    console.log(error);
    return ReE(res, {
      code: 402
    });
  }
};

const deposit_PayoneX = async function (req, res) {
  let body = req.body;
  if (!body.userId || !body.amount) {
    return ReE(res, {
      results: null,
      code: 402,
      message: "ข้อมูลไม่ครบถ้วน"
    });
  }
  var axios = require("axios");

  let data_userId = await Member.findOne({
    where: {
      userId: body.userId
    }
  });

  if (!data_userId) {
    return ReE(res, {
      results: null,
      code: 402,
      message: "ไม่พบผู้ใช้"
    });
  }

  let Customerss = await Customers.findOne({
    where: {
      account_no: data_userId.bankAccountNumber
    }
  });

  let data_Gatway_setting = await Gatway_setting.findOne({
    where: {
      name: "PayoneX"
    }
  });

  let ataitem_post = {
    accessKey: data_Gatway_setting.accessKey,
    secretKey: data_Gatway_setting.secretKey
  };

  let chackauth = await Apipaynoex.authenticate(ataitem_post);

  let uuid = generateUuid();

  var data = JSON.stringify({
    customerUuid: Customerss.customer_uuid,
    amount: req.body.amount,
    referenceId: uuid,
    note: uuid,
    remark: uuid
  });

  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.payonex.asia/transactions/deposit/request",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: chackauth.data.data.token
    },
    data: data
  };
  let datachackplays = await axios(config);

  return ReS(res, { data: datachackplays.data });
};

module.exports = {
  getdata_bankPlatform,
  update_transactions_PayoneX,
  deposit_PayoneX
};
