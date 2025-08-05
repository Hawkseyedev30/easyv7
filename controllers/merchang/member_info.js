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
  Gatway_setting,
  Customers,
  MemberEditLog,
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const Apiscb_helper = require("../../helpers/login.helpers");
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");

const Apichack_history_by = require("../auth/auth_controller");
const Apichack_transferconfirmation = require("./transferconfirmation");
const Apicllback = require("./api");

const config = require("../../config/app.json")[app["env"]];
//const date = require("date-and-time");
//const now = new Date();
const scbeasy = require("../scb/classscb");
const Notify = require("../../helpers/notify");
const scb = new scbeasy();
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
const io = require("socket.io-client");
var socket = io.connect(config["BASE_URL"], { reconnect: true });
const Apipaynoex = require("../../apis/PayoneX");
var md5 = require("md5");
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");

function generateUuid() {
  return uuidv4();
}

var moment = require("moment");
require("moment/locale/th");
const fs = require("fs");
async function getWithdrawalTransactions_byv12(merchantIds) {
  try {
    const Members = await Member.findAll({
      include: [
        {
          model: Bank,
          as: "banks",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        merchantId: merchantIds,
        userStatus: 0,
      },
      // order: [["id", "desc"]],
    });

    return {
      Members,
    };
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
}
async function getWithdrawalTransactions_byv1(merchantIds) {
  try {
    const Members = await Member.findAll({
      include: [
        {
          model: Bank,
          as: "banks",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: {
        merchantId: merchantIds,
        //  id: id,
      },
      // order: [["id", "desc"]],
    });

    return {
      Members,
    };
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
}

const getalldatamember_merchang = async function (req, res) {
  let datagetall = await getWithdrawalTransactions_byv1(req.user.id);

  return ReS(res, { data: datagetall, message: "success" }, 200);
};

const getalldatamember_merchang2 = async function (req, res) {
  let datagetall = await getWithdrawalTransactions_byv12(req.user.id);

  return ReS(res, { data: datagetall, message: "success" }, 200);
};
async function getWithdrawalTransactions(infoData) {
  try {
    let Members = {};
    const MembersInfo = await Member.findOne({
      include: [
        {
          model: Bank,
          as: "banks",
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
      ],
      where: infoData,
      // order: [["id", "desc"]],
    });
    if (MembersInfo) {
      Members = MembersInfo.toJSON();
      const transactions = await TransactionsV2.findAndCountAll({
        where: {
          member_id: Members.id,
        },
      });
      const customerInfo = await Customers.findOne({
        where: {
          account_no: Members.bankAccountNumber,
        },
      });
      Members.customer_uuid = customerInfo ? customerInfo.customer_uuid : null;
      return {
        Members,
        transactions,
      };
    }
    return {
      Members,
    };
  } catch (error) {
    console.error("Error fetching withdrawal transactions:", error);
    throw error;
  }
}
const memberinfo = async function (req, res) {
  try {
    let body = req.body;
    let infoData = {};
    if (!body.memberid && !body.userId) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_email_require",
          message: "กรุณากรอก memberid ของคุณ....",
        },
        422
      );
    }
    if (!req.user.id) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_email_require",
          message: "ไม่พบข้อมูล merchant Id",
        },
        422
      );
    }
    if (req.user.id) {
      infoData.merchantId = req.user.id;
    }
    if (body.memberid) {
      infoData.id = body.memberid;
    }
    if (body.userId) {
      infoData.userId = body.userId;
    }
    let datagetall = await getWithdrawalTransactions(infoData);
    if (!datagetall.Members) {
      return ReE(res, { data: [], message: "ไม่พบข้อมูลในระบบ" }, 200);
    }
    return ReS(res, { data: datagetall, message: "success" }, 200);
  } catch (error) {
    return ReE(res, { data: [], message: "Error fetching Member Info" }, 200);
    // console.error("Error fetching Member Info:", error);
    // throw error;
  }
};

async function editpayoneinfo(praram) {
  let data_Gatway_setting = await Gatway_setting.findOne({
    where: {
      name: "PayoneX",
    },
  });

  let ataitem_post = {
    accessKey: data_Gatway_setting.accessKey,
    secretKey: data_Gatway_setting.secretKey,
  };

  let chackauth = await Apipaynoex.authenticate(ataitem_post);

  const axios = require("axios");
  let data = JSON.stringify({
    name: praram.name,
    bankCode: praram.bankCode,
    accountNo: praram.accountNo,
  });

  let config = {
    method: "put",
    maxBodyLength: Infinity,
    url: `https://api.payonex.asia/v2/customers/${praram.customerUuid}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: chackauth.data.data.token,
    },
    data: data,
  };

  const respon = await axios.request(config);

  return respon.data;
}

const editMember = async function (req, res) {
  const memberId = req.params.memberId; // รับ memberId จาก parameter
  const body = req.body;

  // ตรวจสอบว่ามีการส่ง memberId มาหรือไม่
  if (!memberId) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "กรุณากรอก memberId",
      },
      422
    );
  }

  // ตรวจสอบว่ามีการส่งข้อมูลมาอัปเดตหรือไม่
  if (Object.keys(body).length === 0) {
    return ReE(
      res,
      {
        static_key: "api_response_no_data_provided",
        message: "กรุณาส่งข้อมูลสำหรับอัปเดต",
      },
      422
    );
  }

  try {
    // ค้นหา Member ที่ต้องการแก้ไข โดยใช้ merchantId ของผู้ใช้ที่ login อยู่
    const member = await Member.findOne({
      include: [
        {
          model: Bank,
          as: "banks", // Use the correct alias from your model definition
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
        },
      ],
      where: { id: memberId, merchantId: req.user.id },
    });

    // ถ้าไม่พบ Member หรือ Member ไม่ได้อยู่ใน Merchant ของผู้ใช้ปัจจุบัน
    if (!member) {
      return ReE(
        res,
        {
          static_key: "api_response_not_found",
          message: "ไม่พบ Member หรือไม่มีสิทธิ์แก้ไข",
        },
        404
      );
    }
    console.log(member.banks.bank_id);
    // เก็บข้อมูลเก่าไว้สำหรับบันทึก log ก่อนทำการเปลี่ยนแปลงใดๆ
    const oldData = member.toJSON();

    let newBankId = member.bankId; // กำหนดค่าเริ่มต้นเป็น bankId เดิม
    let newBankIdcode = member.bankId; // กำหนดค่าเริ่มต้นเป็น bankId เดิม

    // ตรวจสอบว่ามีการส่ง bankId (รหัสย่อธนาคาร เช่น 'SCB', 'KBANK') มาใน body หรือไม่
    if (body.bankId) {
      const foundBank = await Bank.findOne({
        where: {
          bank_id: body.bankId, // ค้นหา Bank ด้วยรหัสย่อ
        },
      });

      // ถ้าพบ Bank ที่ตรงกับรหัสย่อที่ส่งมา
      if (foundBank) {
        newBankId = foundBank.id; // ใช้ id (primary key) ของ Bank ที่พบเป็น newBankId
        // newBankId = foundBank.id; // ใช้ id (primary key) ของ Bank ที่พบเป็น newBankId
      }
      // ถ้าไม่พบ Bank ที่ตรงกัน newBankId จะยังคงเป็นค่าเดิม (member.bankId)
    }

    // เตรียมข้อมูลสำหรับอัปเดต ใช้ค่าใหม่จาก body หากมี หรือใช้ค่าเดิมจาก member หากไม่มี
    let dataToUpdate = {
      bankAccountNumber: body.bankAccountNumber || member.bankAccountNumber,
      bankAccountName: body.bankAccountName || member.bankAccountName,
      bankAccountName_En: body.bankAccountName_En || member.bankAccountName_En,
      bankId: newBankId, // ใช้ bankId ที่หามาได้ (อาจจะเป็นอันใหม่หรืออันเดิม)
      // สามารถเพิ่ม field อื่นๆ ที่อนุญาตให้อัปเดตได้ที่นี่ เช่น:
      // userStatus: body.userStatus !== undefined ? body.userStatus : member.userStatus,
    };

    // ทำการอัปเดตข้อมูล Member ในฐานข้อมูล
    // Member.update คืนค่า array ที่มีจำนวนแถวที่ได้รับผลกระทบเป็น element แรก
    const [numberOfAffectedRows] = await Member.update(dataToUpdate, {
      where: { id: memberId, merchantId: req.user.id }, // อัปเดตเฉพาะ memberId และ merchantId ที่ตรงกัน
    });

    // ตรวจสอบว่าการอัปเดตสำเร็จหรือไม่ (มีแถวได้รับผลกระทบ > 0)
    if (numberOfAffectedRows > 0) {
      // ดึงข้อมูล Member ล่าสุดหลังจากอัปเดต เพื่อใช้ในการตอบกลับและบันทึก log
      const updatedMember = await Member.findOne({
        where: { id: memberId },
        include: [
          // ดึงข้อมูล Bank ที่เกี่ยวข้องมาด้วย (ถ้าต้องการ)
          {
            model: Bank,
            as: "banks",
            attributes: {
              exclude: ["deleted_at", "created_at", "updated_at"], // ไม่เอา field เหล่านี้
            },
          },
        ],
      });

      // ตรวจสอบว่าดึงข้อมูลล่าสุดได้หรือไม่ (ป้องกันกรณีข้อมูลหายไประหว่าง update กับ findOne)
      if (!updatedMember) {
        console.error(
          `[Edit Member] Failed to refetch member with id ${memberId} after successful update.`
        );
        // อาจจะคืนค่าสำเร็จแต่แจ้งว่าดึงข้อมูลล่าสุดไม่ได้ หรือคืนค่า error ไปเลย
        return ReE(
          res,
          {
            message:
              "แก้ไข Member สำเร็จ แต่เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุด",
          },
          500
        );
      }

      // บันทึกการแก้ไขข้อมูลลงใน MemberEditLog

      const existingMemberCustomers = await Customers.findOne({
        where: {
          account_no: member.bankAccountNumber,
        },
      });

      // console.log(existingMemberCustomers)

       //banknameff

       if(member.banks.bank_id == ""){

       }


      let dataupdatecos = {
        name: member.bankAccountName || member.bankAccountName,
        bankCode: member.banks.bank_id
          ? member.banks.bank_id.toUpperCase()
          : member.bankId,
        accountNo: body.bankAccountNumber || member.bankAccountNumber,
        customerUuid: existingMemberCustomers.customer_uuid,
      };

      let dataCustomers = await Customers.update(dataupdatecos, {
        where: {
          account_no: member.bankAccountNumber,
        },
      });

      let gotoup = await editpayoneinfo(dataupdatecos);

     // console.log(gotoup);

      try {
        await MemberEditLog.create({
          member_id: memberId,
          old_data: oldData, // ข้อมูลก่อนการอัปเดต
          new_data: updatedMember.toJSON(), // ข้อมูลหลังการอัปเดต
          updated_by: req.user.id, // ID ของผู้ใช้ที่ทำการแก้ไข (admin/merchant)
          updated_at: new Date(), // เวลาที่ทำการแก้ไข
        });
      } catch (logError) {
        // หากการบันทึก log ผิดพลาด ให้แสดง error ใน console แต่ยังคงคืนค่าสำเร็จของการแก้ไข Member
        console.error("[Edit Member] Error creating MemberEditLog:", logError);
        // ไม่ควรทำให้ request หลักล่มเพราะ log ไม่ได้
      }

      // คืนค่าสำเร็จพร้อมข้อมูล Member ที่อัปเดตแล้ว
      return ReS(
        res,
        {
          data: updatedMember.toJSON(), // ส่งข้อมูล Member ล่าสุดกลับไป
          static_key: "api_response_success",
          message: "แก้ไข Member สำเร็จ",
        },
        200
      );
    } else {
      // กรณีที่ numberOfAffectedRows == 0 อาจเกิดจาก:
      // 1. ไม่พบ Member ที่ตรงเงื่อนไข (ซึ่งไม่ควรเกิดเพราะมีการ findOne ก่อนหน้าแล้ว)
      // 2. ข้อมูลที่ส่งมาเหมือนกับข้อมูลเดิมทุกประการ ทำให้ไม่มีการเปลี่ยนแปลงในฐานข้อมูล
      const currentMember = await Member.findOne({
        where: { id: memberId, merchantId: req.user.id },
      });
      if (!currentMember) {
        // กรณีที่ไม่พบ Member ตอนพยายามตรวจสอบ (อาจถูกลบไป?)
        console.error(
          `[Edit Member] Member with id ${memberId} not found during no-change check.`
        );
        return ReE(
          res,
          {
            static_key: "api_response_not_found",
            message: "ไม่พบ Member ระหว่างการตรวจสอบการอัปเดต",
          },
          404
        );
      } else {
        // กรณีที่ข้อมูลเหมือนเดิม
        return ReS(
          res,
          {
            data: currentMember.toJSON(),
            static_key: "api_response_no_change",
            message: "ข้อมูลไม่มีการเปลี่ยนแปลง",
          },
          200
        );
      }
    }
  } catch (error) {
    // จัดการกับ error ที่อาจเกิดขึ้นระหว่างการทำงาน
    console.error("[Edit Member] Error editing member:", error);
    return ReE(
      res,
      {
        static_key: "api_response_error",
        message: "เกิดข้อผิดพลาดในการแก้ไข Member: " + error.message, // แสดง message ของ error เพื่อช่วยในการ debug
      },
      500
    );
  }
};

const createMember = async function (req, res) {
  const requestBody = req.body;

  // ตรวจสอบ req.body
  if (
    !requestBody.bank_id ||
    !requestBody.bankAccountNumber ||
    !requestBody.bankAccountName
  ) {
    return ReE(
      res,
      {
        static_key: "",
        message: "ข้อมูลไม่ครบถ้วน",
      },
      400
    );
  }

  let bank, error;
  [error, bank] = await to(
    Bank.findOne({
      where: {
        bank_id: requestBody.bank_id,
      },
    })
  );

  if (error) {
    return ReE(
      res,
      {
        static_key: "",
        message: "เกิดข้อผิดพลาดในการค้นหาธนาคาร",
      },
      500
    );
  }

  if (!bank) {
    return ReE(
      res,
      {
        static_key: "",
        message: "ไม่พบธนาคาร",
      },
      404
    );
  }

  const memberId = generateUuid();
  const memberData = {
    userId: memberId,
    userStatus: 0,
    bankAccountNumber: requestBody.bankAccountNumber,
    bankAccountName: requestBody.bankAccountName,
    bankId: bank.id,
    merchantId: req.user.id,
  };
  const existingMember = await Member.findOne({
    where: {
      [Op.or]: [
        { bankAccountNumber: memberData.bankAccountNumber },
        { bankAccountName: memberData.bankAccountName },
      ],
    },
  });

  if (existingMember) {
    return ReE(
      res,
      {
        static_key: "",
        message: "หมายเลขบัญชีหรือชื่อบัญชีซ้ำ",
      },
      400
    );
  }
  // บันทึกข้อมูลสมาชิก (สมมติว่าคุณมีฟังก์ชัน saveMember)
  const isSaved = await Member.create(memberData);

  if (isSaved) {
    return ReS(
      res,
      {
        static_key: "",
        message: "สร้างสมาชิกสำเร็จ",
        data: isSaved, // หรือ data ที่ต้องการ return
      },
      201
    );
  } else {
    return ReE(
      res,
      {
        static_key: "",
        message: "เกิดข้อผิดพลาดในการสร้างสมาชิก",
      },
      500
    );
  }
};
module.exports = {
  getalldatamember_merchang,
  getalldatamember_merchang2,
  memberinfo,
  editMember,
  createMember,
};
