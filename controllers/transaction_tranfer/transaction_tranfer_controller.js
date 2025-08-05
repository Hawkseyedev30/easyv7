var {
  Admin,
  Activity_system,
  Role,
  Getdata_permissionsv1,
  RolePermission,
  BankAccount,
  Bank,
  Transaction_tranfer,
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
const Apikrungsribizonline_helper = require("../../apis/krungsribizonline");
var moment = require("moment");
require("moment/locale/th");
//const app = require("../services/app.service");
const urlendpoint = require("../../config/app.json")[app["env"]];


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
const getdata_transaction_tranfer = async function (req, res) {
  try {
    const body = req.body;

    const startDate = new Date(
      moment(body.startDate).startOf("day").format("YYYY-MM-DD HH:mm")
    );
    const endDate = new Date(
      moment(body.endDate).endOf("day").format("YYYY-MM-DD HH:mm")
    );
    const dataall = await Transaction_tranfer.findAndCountAll({
      include: [
        {
          model: BankAccount,
          as: "FormAccount",
          attributes: {
            exclude: ["deviceId", "pin", "auth"],
          },
          required: true,
        },
        {
          model: BankAccount,
          as: "TOAccount",
          attributes: {
            exclude: ["deviceId", "pin", "auth"],
          },
          required: true,
        },
        {
          model: Admin,
          as: "admin",
          attributes: {
            exclude: [],
          },
          required: true,
        },
      ],
      
      // offset: body.offset,
      // limit: body.limit,
      order: [["id", "desc"]],
    });
    const dataToday = await Transaction_tranfer.findAndCountAll({
      include: [
        {
          model: BankAccount,
          as: "FormAccount",
          attributes: {
            exclude: ["deviceId", "pin", "auth"],
          },
          required: true,
        },
        {
          model: BankAccount,
          as: "TOAccount",
          attributes: {
            exclude: ["deviceId", "pin", "auth"],
          },
          required: true,
        },
        {
          model: Admin,
          as: "admin",
          attributes: {
            exclude: [],
          },
          required: true,
        },
      ],
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      // offset: body.offset,
     //  limit: body.limit,
      order: [["id", "desc"]],
    });

    return ReS(res, {
      data: 
      dataall,
      dataToday,
      message: "success",
    });
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};
const create_transaction_tranfer = async function (req, res) {
  try {
    const body = req.body;

    if (!body.FormAccountId || !body.ToAccountId || !body.amount) {
      return ReE(res, { message: "Invalid role data" }, 400); // Use 400 Bad Request
    }
    const ToAccountIds = await BankAccount.findOne({
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
      ],

      where: {
        id: body.ToAccountId,
      },
    });

    const FormAccount = await BankAccount.findOne({
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
      ],

      where: {
        id: body.FormAccountId,
      },
    });

    if (FormAccount.channel == "scb-easy") {
      let chack_auth = await Apiscb_helper.chack_auth(FormAccount.auth);

      if (chack_auth.data.status.code === "1002") {
        let datalogin = {
          deviceId: FormAccount.deviceId,
          pin: FormAccount.pin,
          id: FormAccount.id,
          accountNo: FormAccount.accountNumber,
        };
        let gologin = await Apiscb_helper.Loginbank_auth(datalogin);

        console.log(gologin);
        if (gologin.message == "Success") {
          FormAccount.auth = gologin.auth;
        }
      }

      if (ToAccountIds.bank.scb_code == "014") {
        transferType = "3RD";
      } else {
        transferType = "ORFT";
      }

      const data = JSON.stringify({
        accountTo: ToAccountIds.accountNumber,
        amount: body.amount,
        transferType: transferType,
        accountNo: FormAccount.accountNumber,
        accountToBankCode: ToAccountIds.bank.scb_code,
        api_auth: FormAccount.auth,
      });

      // 2. กำหนด config สำหรับ axios
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: urlendpoint["WALLET_BASE_URL"] + "/scbeasy/transfer/verificationv2",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IjRiZDIwM2Q4LTZkY2QtNGE4MC1iYjdlLTg2NDVlNzM2Y2NjNyIsInVzZXJfdHlwZSI6Ik1lcmNoYW50IiwiaWF0IjoxNzQwNjE2NDgxLCJleHAiOjE3NzIxNTI0ODF9.Ty61wohypWK4tcXIWJow7uK-SmKOALAoQ8vz_9uHQxk",
        },
        data: data,
      };

      let respones = await axios.request(config);

      if (respones.data.status.code == 1000) {
        const oldData = respones.data;

        let datasave = {
          amount: body.amount,
          remark: body.remark,
          QrScanner: oldData,
          status: "success",
          bankAccounttoid: ToAccountIds.id,
          bankAccountfromid: FormAccount.id,
          nodere: "",
          reqby_admin_id: req.user.id,
        };

        let sa = await Transaction_tranfer.create(datasave);

        return ReS(res, {
          data: sa,
          success: true, // Add a success flag
          message: "success",
        });
      } else {
        //console.log(respones.data.status.description)
        return ReE(res, {
          message: respones.data.status.description,
        });
      }
      //
    } else if (FormAccount.channel == "kbiz") {
      return ReE(res, { message: "ไม่สามารถ โยกเงินได้" }, 500);
    } else if (FormAccount.channel == "krungsribizonline") {
      let datachack =
        await Apikrungsribizonline_helper.krungsribizonline_authenticate(
          FormAccount
        );

      //console.log(datachack)

      if (datachack.Balance >= body.amount) {



        let datapost = {
          accountTo: ToAccountIds.accountNumber,
          amount: body.amount,
         
          accountNo: FormAccount.accountNumber,
          accountToBankCode: ToAccountIds.bank.scb_code,
        };
        let datachackotp = await Apikrungsribizonline_helper.krungsri_tranfer_getotp(datapost)

        if (datachackotp.ref) {
          let otpFound = false;
          let startTime = Date.now();
          const timeout = 60000; // 1 minute in milliseconds

          while (!otpFound && Date.now() - startTime < timeout) {
            try {
              let chackotpnow = await Apikrungsribizonline_helper.getotp({
                otp: datachackotp.ref,
              });

             // console.log("Checking OTP:", chackotpnow.data);

              if (chackotpnow.data.code == 1000) {
                // OTP found, proceed to the next step
                otpFound = true;
                //console.log("OTP found:", chackotpnow.data.data.otp);


                let data3 = {
                  ctl00$smMain:
                    "ctl00$cphSectionData$OTPBox1$udpOTPBox|ctl00$cphSectionData$OTPBox1$btnConfirm",
                  __EVENTTARGET: "ctl00$cphSectionData$OTPBox1$btnConfirm",
                  __EVENTARGUMENT: "",
                  __VIEWSTATE: datachackotp.data.body.__VIEWSTATE,
                  __VIEWSTATEGENERATOR: datachackotp.data.body.__VIEWSTATEGENERATOR,
                  __VIEWSTATEENCRYPTED: "",
                  __PREVIOUSPAGE: datachackotp.data.body.__PREVIOUSPAGE,
                  __EVENTVALIDATION: datachackotp.data.body.__EVENTVALIDATION,
                  ctl00$hddNoAcc: "",
                  ctl00$hddMainAccIsCreditCard: "",
                  ctl00$bannerTop$hdTransactionType: "",
                  ctl00$bannerTop$hdCampaignCode: "",
                  ctl00$bannerTop$hdCampaignTxnType: "",
                  ctl00$bannerTop$hdCampaignMutualFundType: "",
                  ctl00$bannerTop$hdCampaignTransferType: "",
                  ctl00$bannerTop$hdAccNo: "",
                  ctl00$bannerTop$hdBillerId: "",
                  ctl00$bannerTop$hdUrlRedirect: "",
                  ctl00$bannerTop$hdAmount: "",
                  ctl00$bannerTop$hdTxnIsSuccess: "",
                  ctl00$bannerTop$hdBillerCategory: "",
                  ctl00$bannerTop$hdBillerName: "",
                  ctl00$bannerTop$hdAJAXData: "",
                  ctl00$hddIsLoadComplete: "false",
                  ctl00$hdnCurrentPageQuickMenu: "",
                  ctl00$hdnPageIndexQuickMenuLoaded: "",
                  ctl00$cphSectionData$OTPBox1$Password2: datachackotp.data.body.ctl00$cphSectionData$OTPBox1$Password2,
                  ctl00$cphSectionData$OTPBox1$txtTemp: datachackotp.data.body.ctl00$cphSectionData$OTPBox1$txtTemp,
                  ctl00$cphSectionData$OTPBox1$hddOTPPassword: chackotpnow.data.data.otp,
                  ctl00$cphSectionData$OTPBox1$txtOTPPassword: "",
                  ctl00$hddHasSess: "",
                  __ASYNCPOST: "true",
                };

                let datapost2 = {
                  body: data3,
                  url: datachackotp.data.url,
                };


               // 
                //console.log(data3)
                let datachack_tranfer = await Apikrungsribizonline_helper.krungsri_tranfer_con(datapost2)
                

                let datasave = {
                  amount: body.amount,
                  remark: body.remark,
                  QrScanner: "",
                  status: "success",
                  bankAccounttoid: ToAccountIds.id,
                  bankAccountfromid: FormAccount.id,
                  nodere: "",
                  reqby_admin_id: req.user.id,
                };
        
                let sa = await Transaction_tranfer.create(datasave);
        
                return ReS(res, {
                  data: sa,
                  success: true, // Add a success flag
                  message: "success",
                });

                // **Next Step:**
                // Add your code here to perform the next step after OTP verification.
                // For example, you might want to:
                // 1. Complete the transfer transaction.
                // 2. Update the database.
                // 3. Send a success message.

                // let datasave = {
                //   amount: body.amount,
                //   remark: body.remark,
                //   QrScanner: datachackotp,
                //   status: "success",
                //   bankAccounttoid: ToAccountIds.id,
                //   bankAccountfromid: FormAccount.id,
                //   nodere: "โอนเงินสำเร็จ",
                //   reqby_admin_id: req.user.id,
                // };

                // let sa = await Transaction_tranfer.create(datasave);

                // return ReS(res, {
                //   data: sa,
                //   success: true, // Add a success flag
                //   message: "success",
                // });
              } else {
                // OTP not found yet, wait for a short period before retrying
                console.log("OTP not found yet. Retrying...");
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
              }
            } catch (error) {
              console.error("Error checking OTP:", error);
              // Handle error appropriately, e.g., log it, retry, or return an error response
              return ReE(res, { message: "Error checking OTP" }, 500);
            }
          }

          if (!otpFound) {
            // OTP not found within the timeout period
            console.log("OTP not found within 1 minute.");
            return ReE(res, { message: "OTP not found within 1 minute." }, 408); // 408 Request Timeout
          }
        }


       // console.log(datachackotp)

      }

      return ReE(res, { message: "ไม่สามารถ โยกเงินได้" }, 500);
    } else {
      return ReE(res, { message: "ไม่สามารถ โยกเงินได้" }, 500);
    }
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};

module.exports = {
  create_transaction_tranfer,
  getdata_transaction_tranfer,
};
