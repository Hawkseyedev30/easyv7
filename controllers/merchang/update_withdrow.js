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
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const Apiscb_helper = require("../../helpers/login.helpers");
const jwt = require("jsonwebtoken");

const update_withdrow = async function (req, res) {
  let body = req.body;

  if (!body.ref || !body.status) {
    return ReE(res, {
      code: 402,
      message:
        "error กรุณาส่งเลข ref มาอ้างอิง หรือ status เป็น success หรือ cancel",
    });
  } else if (!body.status == "success" || !body.status == "cancel") {
    return ReE(res, {
      code: 402,
      message: "error กรุณาณา ส่ง status เป็น success หรือ cancel",
    });
  }

  const chack_ref = await TransactionsV2.findOne({
    where: {
      ref: body.ref,
    },
  });

  if (!chack_ref) {
    return ReE(res, {
      code: 402,
      message: "error ไม่มี ref นี้ในระบบ",
    });
  }

  let user_Transaction = await TransactionsV2.update(
    {
      status: body.status,
    },
    {
      where: {
        ref: body.ref,
      },
    }
  );

  return ReS(res, {
    code: 200,
    message: "Success",
  });
};

module.exports = {
  update_withdrow,
};
