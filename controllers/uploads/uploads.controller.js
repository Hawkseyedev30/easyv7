var {
  User_account,
  Datauser,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  Transaction_manual,

  TransactionsV2,
} = require("../../models");
const { ReE, ReS, to } = require("../../services/util.service");
//const config = require("../../services/app.service");
const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];

const Apiscb_helper = require("../../helpers/login.helpers");
const api_dis = require("../merchang/deposit_controller");
const scbeasys = require("../scb/classscb");
const scb = new scbeasys();
const { Op } = require("sequelize");
var fs = require("fs");
const multer = require("multer");
const Jimp = require("jimp");
const jsQr = require("jsqr");
var md5 = require("md5");
var moment = require("moment");
require("moment/locale/th");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage/qr");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage }).fields([
  { name: "img_url", maxCount: 1 },
]);
//const value = date.format(now, "HH:mm:ss");
const { v4: uuidv4 } = require("uuid");

function generateUuid() {
  return uuidv4();
}

//const upload = multer({ storage }).array('file');

// const createContactSupport = async function (req, res) {

//   var dir = `${__dirname}/../../storage/qr/`;

//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }

//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(500).json(err)
//     }
//     const user_id = req.user.id;
//     let body = req.body;
//     let files = req.files;
//     let contactSupportImgePath = 'storage/qr/' + files[0].filename;

//     await ContactSupport.create({
//         user_id: user_id,
//         contact_reason_id: body.contact_reason_id,
//         description_en: body.description_en,
//         description_th: 'description',
//         img_url: contactSupportImgePath,
//         status: 'Pending'
//     });

//     return ReS(res, { message: "Thank you for contacting  us, our support team will get back to you." }, 200 );
//   });
// };

async function fetchWrapper(...args) {
  const { default: fetch } = await import("node-fetch");
  return fetch(...args);
}

async function qr(url) {
  try {
    // Use the fetchWrapper
    const response = await fetchWrapper(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Load the image with Jimp
    const image = await Jimp.read(buffer);
    const { width, height, data } = image.bitmap;

    // Convert image data to a format jsQR can understand
    const qrCodeImageData = new Uint8ClampedArray(data.buffer);

    // Decode the QR code
    const qrCode = jsQr(qrCodeImageData, width, height);

    if (qrCode) {
      return qrCode.data;
    } else {
      console.log("No QR code found.");
      return null;
    }
  } catch (error) {
    console.error("Failed to decode QR code:", error);
    return null;
  }
}

async function upcancen(params) {
  const status_pays = await Transaction_manual.update(
    {
      status: "cancel",
    },

    {
      where: {
        ref: params,
      },
    }
  );
  return 1;
}

async function chackslip(edit_id, url_slip, admin) {
  // console.log(url_slip);

  const data_From_M = await Transaction_manual.findOne({
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
    where: {
      id: edit_id.id,
    },
  });

  let databank = {
    deviceId: "973b06e8-8103-45e8-a6f9-b1eab1fc9b23",
  };

  const verify_user = await Apiscb_helper.posy_verifyusers(databank.deviceId);

  if (verify_user.data.data.status.code === 1000) {
    // let data_Slip = await scb.paymentsbillscanurl(

    // );
    let err, success;

    [err, success] = await to(
      scb.paymentsbillscanurl(url_slip, verify_user.data.headers["api-auth"])
    );
    console.log(err);

    if (err) {
      return {
        status: false,
        // data: success.data,
        message: "เซิฟเวอร์ Error ไม่สามารถทำรายกานได้",
      };
    }

    console.log(success.data.data.pullSlip);

    if (success.data.data.function != "PULLSLIP") {
      await upcancen(edit_id.ref);
      return {
        status: false,
        // data: success.data,
        message: "ไม่สามารถทำรายกานได้ ข้อมูลไม่ใช้ PULLSLIP",
      };
    } else if (success.data.status.code !== 1000) {
      await upcancen(edit_id.ref);
      //  await upcancen(edit_id);
      return {
        status: false,
        data: success.data,
        message: "เซิฟเวอร์ Error ไม่สามารถทำรายการได้",
      };
    }

    // Extract names from slip and transaction data
    let slipSenderName = success.data.data.pullSlip.sender.name;

    let slipReceiverName = success.data.data.pullSlip.receiver.name;

    let transactionSenderName = data_From_M.members.bankAccountName;
    let data_From_amun = data_From_M.amount;
    // let transactionReceiverName = acc_froms.accountName; // Assuming acc_froms is the receiver account
    let Slip_amount = success.data.data.amount;
    // Check if either sender or receiver name matches (ignoring case and leading/trailing spaces)
    if (
      data_From_M.members.bankAccountName
        .trim()
        .toLowerCase()
        .includes(slipSenderName.trim().toLowerCase()) &&
      data_From_amun == Slip_amount
    ) {
      let acc = slipReceiverName.trim().toLowerCase();


      let acc_name_re = acc.replace(/^(mrs\.|miss|ms\.|mr\.|dr\.|นางสาว|น\.ส\.|นาง|นาย|ด\.ช\.|ด\.ญ\.)\s+/i, "");

     // let acc_name_re = acc.replace(/^(miss|mr\.|น\.ส\.|นาย)\s+/i, "");

    //  console.log("acc", acc);

      let acc_fromss = await BankAccount.findOne({
        where: {
          // accountType: "deposit",
          accountName: {
            [Op.like]: `%${acc_name_re}%`,
          },
        },
        attributes: {
          include: [],
          exclude: ["deviceId", "pin"],
        },
      });
     // console.log("acc_fromss", acc_fromss);

      const status_pays = await Transaction_manual.update(
        {
          time_creat: success.data.data.pullSlip.dateTime,
        },

        {
          where: {
            id: data_From_M.id,
          },
        }
      );
      //dateTime
      // console.log(acc_fromss);
      return {
        status: true,
        message: "Name matches!",
        datasli: success.data,
        data_BankAccount: acc_fromss,
        datamember: data_From_M,
      };
    } else {
      console.log("Name doesn't match!");
      await upcancen(edit_id.ref);
      return {
        status: false,
        data: success.data,
        message: "Name && amount && bankAccountName  doesn't match!  ",
      };
    }
  }
}
const upload_Manual = async function (req, res) {
  var dir = `${__dirname}/../../storage/qr/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // console.log("body", req.body);

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    const body = req.body;
    var files = req.files;
    let contactSupportImgePath = "";

    if (files.img_url) {
      contactSupportImgePath = files.img_url[0].filename;
    }

    if (!body.userId) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_email_require",
          message: "กรุณากรอก userId ของคุณ....",
        },
        422
      );
    } else if (!files.img_url) {
      return ReE(
        res,
        {
          static_key: "api_response_auth_login_password_require",
          message: "ไม่มีข้อมูลรูป",
        },
        422
      );
    }

    if (contactSupportImgePath) {
      const user = await Member.findOne({
        where: {
          userId: body.userId,
        },
      }); // สมมติว่ามีฟังก์ชัน  findUserById
      if (!user) {
        return ReE(res, {
          data: null,
          code: 404, // not found
          message: "ไม่พบผู้ใช้",
        });
      }
      const data_url = await qr(config.bucketBaseURL + contactSupportImgePath);

      if (!data_url) {
        return ReE(
          res,
          {
            data: data_url,
            static_key: "List of this slip has already been processed",
            message: "List of this slip has already been processed",
          },
          422
        );
      }

      const Transaction_manual_chack = await Transaction_manual.findOne({
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

        where: {
          qrString: data_url,
          // member_id: body.userId,
        },
      }); // สมมติว่ามีฟังก์ชัน  findUserById

      if (Transaction_manual_chack) {
        return ReE(
          res,
          {
            data: Transaction_manual_chack,
            static_key: "List of this slip has already been processed",
            message: "List of this slip has already been processed",
          },
          422
        );
      }
      // 2. สร้าง  manual object
      const uuid = generateUuid();
      const manualData = {
        member_id: user.id, //  อ้างอิง  user  ในฐานข้อมูล
        amount: body.amount,
        remark: body.remark,
        type_option: "ฝาก",
        transaction_time: "",
        time_creat: "",
        status: "pending",
        ref: uuid,
        nodere: config.bucketBaseURL + contactSupportImgePath,
        qrString: data_url,
        //  description:description
        // ... property อื่นๆ ของ  Manual
      };

      const newManual = await Transaction_manual.create(manualData);

      let gotochack = await chackslip(
        newManual,
        config.bucketBaseURL + contactSupportImgePath,
        req.user.id
      );
      return ReS(
        res,
        {
          data: gotochack,
        },
        200
      );
      // console.log(gotochack);
    }

    // await Transaction_manual.update(
    //   {
    //     nodere: config.bucketBaseURL + attachmentFileName,
    //   },
    //   {
    //     where: {
    //       id: body.id,
    //     },
    //   }
    // );

    // let gotochack = await chackslip(
    //   body.id,
    //   config.bucketBaseURL + attachmentFileName,
    //   req.user.id
    // );

    // if (gotochack.status == true) {
    //   return ReS(
    //     res,
    //     {
    //       data: gotochack.data,
    //       message: "success",
    //     },
    //     200
    //   );
    // }else {

    //  // console.log(gotochack)
    //     return ReE(
    //         res,
    //         {
    //           data: gotochack.data,
    //           message: gotochack.msg,
    //         },
    //         200
    //       );
    // }
  });
};

const createRecordContactSupport = async function (req, res) {
  var dir = `${__dirname}/../../storage/qr/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    let body = req.body;
    let files = req.files;
    let contactSupportImgePath = "";

    if (files.img_url) {
      contactSupportImgePath = "storage/qr/" + files.img_url[0].filename;
    }

    await ContactSupport.create({
      reason_en: body.reason_en,
      //user_id: req.user_id,
      contact_reason_id: body.contact_reason_id,
      description_en: body.description_en,
      description_th: "description_th",
      img_url: contactSupportImgePath ? contactSupportImgePath : "dummy_Image",
      status: "Pending",
      created_at: new Date(),
    });

    return ReS(
      res,
      { message: "ContactSupport has been added successfully." },
      200
    );
  });
};
const sendlogo = async function (req, res) {
  try {
    const files = req.files;
    const body = req.body;
    let filename = "";

    if (files.img_url.length > 0) {
      files.img_url.forEach(async (file) => {
        const mimeType = file.mimetype;
        const base64data = Buffer.from(file.buffer, "binary");
        const fileExt = file.originalname.split(".")[1];
        const randFileName = `${Date.now()}.${fileExt}`;
        filename = `contact_support/${randFileName}`;
        await fileHelper.uploadFileOnS3Bucket(base64data, filename, mimeType);
      });
    }

    await ContactSupport.create({
      contact_reason_id: body.contact_reason_id,
      description_en: body.description_en,
      description_th: "logo",
      img_url: filename,
      status: "Pending",
      added_by: "admin",
      created_at: new Date(),
    });

    return ReS(res, {
      message: "เปลี่ยนโลโก้ สำเร็จ",
    });
  } catch (error) {
    console.log(error);
    return ReE(res, { message: "Server not connetced" });
  }
};
const createqr = async function (req, res) {
  var dir = `${__dirname}/../../storage/qr/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // console.log("body", req.body);

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    const body = req.body;
    var files = req.files;
    let attachmentFileName = "";

    if (files.img_url) {
      attachmentFileName = files.img_url[0].filename;
    }

    // await ContactSupport.create({
    //     //user_id: req.user.id,
    //     contact_reason_id: body.contact_reason_id,
    //     added_by: 'admin',
    //     description_en: body.description_en,
    //     description_th: 'description_th',
    //     img_url: attachmentFileName ? attachmentFileName : "dummy_Image",
    //     status: 'Pending',
    //     created_at: new Date(),
    // });
    // await Tran_chack.create({
    //     //user_id: req.user.id,
    //     // contact_reason_id: body.contact_reason_id,
    //     added_by: 'admin',
    //     description_en: body.description_en,
    //     description_th: 'description_th',
    //     img_url: attachmentFileName ? attachmentFileName : "dummy_Image",
    //     status: 'Pending',
    //     created_at: new Date(),
    // });

    return ReS(res, { data: "Tran_chack", nameimg: attachmentFileName }, 200);
  });
};
module.exports = {
  upload_Manual,
  createRecordContactSupport,
  sendlogo,
  createqr,
};
