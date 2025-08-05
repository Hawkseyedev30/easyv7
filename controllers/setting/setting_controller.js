var {
    Admin,
    Activity_system,
    Role,
    Getdata_permissionsv1,
    RolePermission,
    BankAccount,
    Bank,
    Req_qrcode,
    Payments,
    Member,
    Transaction_tranfer,
    Transaction_withdraw,
    TransactionsV2,
    TransactionKrungthai,
    TransactionFeeSetting
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
const generatePayload = require("promptpay-qr");
const { v4: uuidv4 } = require("uuid");
const { permission } = require("process");
function conRes(res) {
    return Object.values(JSON.parse(JSON.stringify(res)));
}
function generateUuid() {
    return uuidv4();
}



/**
 * @fileoverview Controller function to update transaction fee settings.
 * This function handles PUT requests to update an existing transaction fee setting
 * based on the provided FeeSetting_id in the request body.
 * It updates the deposit fee percentage, withdrawal fee percentage, and active status.
 */

/**
 * Handles the update of a transaction fee setting.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the response is sent.
 */
const editsetting_transaction_fee_setting = async function (req, res) {
  // Destructure the request body to get necessary fields.
  // This makes the code cleaner and explicitly shows what is expected.
  const { FeeSetting_id, depositFeePercentage, withdrawalFeePercentage, isActive } = req.body;

  try {
    // 1. Input Validation: Check if FeeSetting_id is provided.
    // It's crucial to validate required inputs early.
    if (!FeeSetting_id) {
      // Return a 400 Bad Request if a required field is missing.
      // Using 400 is more semantically correct for client-side input errors than 500.
      return ReE(res, { message: "FeeSetting_id is required for updating the setting." }, 400);
    }

    // 2. Find the existing transaction fee setting.
    // Use a more descriptive variable name than 'bankfrom'.
    let feeSettingToUpdate = await TransactionFeeSetting.findOne({
      where: {
        id: FeeSetting_id,
      },
    });

    // 3. Check if the setting exists.
    if (!feeSettingToUpdate) {
      // If no setting is found with the given ID, return a 404 Not Found.
      // This provides a more specific error message to the client.
      return ReE(res, { message: `Transaction fee setting with ID ${FeeSetting_id} not found.` }, 404);
    }

    // 4. Update the transaction fee setting.
    // Only update the fields that are provided in the request body.
    // This prevents overwriting with 'undefined' if a field isn't sent.
    const updateData = {};
    if (depositFeePercentage !== undefined) {
      updateData.depositFeePercentage = depositFeePercentage;
    }
    if (withdrawalFeePercentage !== undefined) {
      updateData.withdrawalFeePercentage = withdrawalFeePercentage;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }


    console.log(updateData)

    // Perform the update operation.
    const [numberOfAffectedRows] = await TransactionFeeSetting.update(
      updateData,
      {
        where: {
          id: FeeSetting_id,
        },
      }
    );

    // 5. Check if the update was successful (i.e., if any rows were affected).
    if (numberOfAffectedRows === 0) {
        // This case might happen if the ID exists but no actual data changed,
        // or if there was an internal issue preventing the update despite finding the record.
        // Returning 200 with a specific message is good here.
        return ReS(res, { message: `No changes applied to transaction fee setting with ID ${FeeSetting_id}.` }, 200);
    }

    // 6. Send success response.
    return ReS(res, { message: `Transaction fee setting with ID ${FeeSetting_id} updated successfully.` }, 200);

  } catch (error) {
    // 7. Error Handling: Catch any unexpected errors during the process.
    console.error("Error updating transaction fee setting:", error);
    // Return a 500 Internal Server Error for unhandled exceptions.
    return ReE(res, { message: "An internal server error occurred while updating the transaction fee setting." }, 500);
  }
};


module.exports = {
    editsetting_transaction_fee_setting,

};
