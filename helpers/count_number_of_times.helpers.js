var {
  User_account,
  Datauser,
  Transaction_manual,
  BankAccount,
  Merchant,
  Bank,
  Member,
  TransactionsV2,
} = require("../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
var moment = require("moment");
require("moment/locale/th");


const startDate = new Date(moment().startOf("day").format("YYYY-MM-DD HH:mm"));
const endDate = new Date(moment().endOf("day").format("YYYY-MM-DD HH:mm"));


async function count_the_number_of_times_deposited(id) {
  try {
    let err, count;
    [err, count] = await to(
      TransactionsV2.count({
        where: {
          [Op.or]: [
            {
              created_at: {
                [Op.between]: [startDate, endDate],
              },
            },
          ],
          member_id: id,
          type_option: "ฝาก",
        },
      })
    );
    if (err) {
      return {
        count: 0,
        status: false,
      };
    }
    return {
      status: true,
      count: count,
    };
  } catch (error) {
    return {
      count: 0,
      status: false,
    };
  }
}

async function count_the_number_of_times_withdrawals(id) {
  try {
    let err, count;
    [err, count] = await to(
      TransactionsV2.count({
        where: {
          [Op.or]: [
            {
              created_at: {
                [Op.between]: [startDate, endDate],
              },
            },
          ],
          member_id: id,
          type_option: "ถอน",
        },
      })
    );
    if (err) {
      return {
        status: false,
      };
    }
    return {
      status: true,
      count: count,
    };
  } catch (error) {
    return {
      status: false,
    };
  }
}
async function count_the_number_of_times_deposited_Manual(id) {
  try {
    let err, count;
    [err, count] = await to(
      Transaction_manual.count({
        where: {
          [Op.or]: [
            {
              created_at: {
                [Op.between]: [startDate, endDate],
              },
            },
          ],
          member_id: id,
          type_option: "ฝาก",
        },
      })
    );
    if (err) {
      return {
        status: false,
      };
    }
    return {
      status: true,
      count: count,
    };
  } catch (error) {
    return {
      status: false,
    };
  }
}
module.exports = {
  count_the_number_of_times_deposited,
  count_the_number_of_times_withdrawals,
  count_the_number_of_times_deposited_Manual
};
