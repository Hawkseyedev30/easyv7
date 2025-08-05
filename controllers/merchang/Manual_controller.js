var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  Transaction_manual,
  Systemsettings,
  TransactionsV2,
} = require("../../models");
var md5 = require("md5");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const { v4: uuidv4 } = require("uuid");
var moment = require("moment");
require("moment/locale/th");
const CountTrans = require("../../helpers/count_number_of_times.helpers");

const Notify = require("../../helpers/notify");
function generateUuid() {
  return uuidv4();
}

async function sreat(str) {
  let d = await TransactionsV2.findOne({
    where: {
      double_check: str,
    },
  });
  return d;
}
const confirm_transaction_manual = async function (req, res) {
  const body = req.body;

  if (!body.ref) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "กรุณากรอก ref เข้ามาทุกครั้ง",
      },
      422
    );
  }
  const existingManual = await Transaction_manual.findOne({
    include: [
      {
        as: "members",
        model: Member,
        attributes: {
          include: [],
          exclude: ["deleted_at", "created_at", "updated_at"],
        },
        required: true,
      },
    ],
    where: { ref: body.ref },
  });

//console.log(existingManual)
  if(!existingManual){

   return ReE(res, {
    //  data:existingManual,
     
      message: "ไม่มีรายการ ของสมาชิกคนนี้  โปรตรวจสอบ",
    });

  }


  let double_checks = md5(
    existingManual.amount + moment(existingManual.time_create).format()
  );

  let uuid = generateUuid();

  let datassaves = {
    request_All_id: null,
    amount: existingManual.amount,
    remark: existingManual.remark,
    reqby_admin_id: 4,
    name_member: existingManual.members.bankAccountName,
    txn_type: "",
    ref: uuid,
    description: uuid,
    type_option: "ฝาก",
    status: "success",
    member_id: existingManual.members.id,
    nodere: "ฝากเงินแบบ Manual มีสลิป",
    double_check: double_checks,
  };

  let chack_level2 = await sreat(double_checks);

  if (chack_level2) {


    return ReE(res, {
      data:chack_level2,
     
      message: "มีรายการ คล้ายๆกันของสมาชิกคนนี้ ได้ทำรายการไปแล้ว โปรตรวจสอบ",
    });
  }

  let Transactions = await TransactionsV2.create(datassaves);

  let updateslib = await Transaction_manual.update(
    {
      status: "success",
    },
    {
      where: {
        ref: body.ref,
      },
    }
  );

  if (updateslib) {
    return ReS(res, {
      code: 200, // conflict
      message: "ทำรายการสำเร็จ",
      data:Transactions
    });
  }
};

const transaction_manual = async function (req, res) {

  const { userId, amount, remark } = req.body;

  // 1. ตรวจสอบว่า  userId  อยู่ในฐานข้อมูลหรือไม่
  const user = await Member.findOne({
    where: {
      userId: userId,
      userStatus:1
    },
  }); // สมมติว่ามีฟังก์ชัน  findUserById
  if (!user) {
    return ReE(res, {
      data: null,
      code: 404, // not found
      message: "ไม่พบ Member หรือสมาชิกยังไม่ยืนยันตัวตน",
    });
  }
  // console.log(user)
  // 2. สร้าง  manual object
  const uuid = generateUuid();
  const manualData = {
    member_id: user.id, //  อ้างอิง  user  ในฐานข้อมูล
    amount: amount,
    remark: remark,
    type_option: "ฝาก",
    // transaction_time: transaction_time,
    status: "success",
    ref: uuid,
    //  description:description
    // ... property อื่นๆ ของ  Manual
  };


  // console.log(manualData)
  // const existingManual = await Transaction_manual.findOne({
  //   where: { member_id: user.id, status: "pending" },
  // });


  // if (existingManual) {
  //   return ReE(res, {
  //     data: existingManual,
  //     code: 409, // conflict
  //     message: "มี manual ที่มี ref นี้แล้ว",
  //   });
  // }

  const newManual = await Transaction_manual.create(manualData);

  let d = generateUuid();
  let datassaves = {
    request_All_id: null,
    amount: amount,
    remark: remark,
    reqby_admin_id: 4,
    name_member: user.bankAccountName,
    txn_type: "",
    ref: uuid,
    description: uuid,
    type_option: "ฝาก",
    status: "success",
    member_id: user.id,
    nodere: "ฝากเงินแบบ Manual ไม่มีสลิป",
    // time_creat:"",
  };

let count = 0;
let Transactions = await TransactionsV2.create(datassaves);
  let countTrans = await CountTrans.count_the_number_of_times_deposited_Manual(Transactions?.member_id); 
  if (countTrans?.status) {
    count = countTrans?.count
  }

  
let msg = `
<b>Notification: Deposit GBPVEGAS (Manual)</b>
<pre><code style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
<b>หมายเลขอ้างอิง (Ref):</b> ${datassaves.ref}
<b>ชื่อสมาชิก:</b> ${user.bankAccountName}
<b>เลขที่บัญชีสมาชิก:</b> ${user.bankAccountNumber}
<b>จำนวนเงินที่ฝาก:</b> ${datassaves.amount} บาท
<b>จำนวนที่ฝากวันนี้:</b> ${count} ครั้ง (Manual)
<b>ประเภทธุรกรรม:</b> ฝากเงิน (มือ)"
<b>วันที่/เวลา:</b> ${moment(Transactions?.created_at).format("YYYY-MM-DD HH:mm:ss")}
</code></pre>
<i><b>หมายเหตุ:</b> ฝากเงินแบบ Manual ไม่มีสลิป : ${moment().fromNow()}  </i>
  `;

  let datanoti = {
    msg: msg,
    tpye: "success",
    type_option: "deposit",
    data: {
      ref: d,
      name_member: user.bankAccountName, // Use member's name
      amount: datassaves.amount, // Use deposit amount
      type_option: "ฝากเงิน",
      nodere: `ฝากเงินแบบ Manual ไม่มีสลิป`,
    },
  };

  await Notify.sendTelegram(datanoti);

  // 4. ส่ง response  แบบ  success
  return ReS(res, {
    data: Transactions,
    code: 201,
    message: "สร้าง manual เรียบร้อยแล้ว",
  });
};

const create_Manual = async function (req, res) {
  try {
    const { userId, amount, transaction_time, remark } = req.body;

    // 1. ตรวจสอบว่า  userId  อยู่ในฐานข้อมูลหรือไม่
    const user = await Member.findOne({
      where: {
        userId: userId,
      },
    }); // สมมติว่ามีฟังก์ชัน  findUserById
    if (!user) {
      return ReE(res, {
        data: null,
        code: 404, // not found
        message: "ไม่พบผู้ใช้",
      });
    }
    // console.log(user)
    // 2. สร้าง  manual object
    const uuid = generateUuid();
    const manualData = {
      member_id: user.id, //  อ้างอิง  user  ในฐานข้อมูล
      amount: amount,
      remark: remark,
      type_option: "ฝาก",
      transaction_time: transaction_time,
      status: "pending",
      ref: uuid,
      //  description:description
      // ... property อื่นๆ ของ  Manual
    };
    //  console.log(manualData)
    const existingManual = await Transaction_manual.findOne({
      where: { member_id: user.id, status: "pending" },
    });
    if (existingManual) {
      return ReE(res, {
        data: manualData,
        code: 409, // conflict
        message: "มี manual ที่มี ref นี้แล้ว",
      });
    }

    // 3. สร้าง  manual  ใหม่
    const newManual = await Transaction_manual.create(manualData);

    // 4. ส่ง response  แบบ  success
    return ReS(res, {
      data: newManual,
      code: 201,
      message: "สร้าง manual เรียบร้อยแล้ว กรุณาอัพโหลดสลิป ยืนยัน",
    });
  } catch (error) {
    // 5. จัดการ error
    console.error(error);
    return ReE(res, {
      data: null,
      code: 500,
      message: "เกิดข้อผิดพลาดในการสร้าง manual",
    });
  }
};

module.exports = {
  create_Manual,
  transaction_manual,
  confirm_transaction_manual,
};
