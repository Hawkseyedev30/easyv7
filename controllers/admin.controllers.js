var {
  Admin,
  User_account,
  Activity_system,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  TransactionsV2,
  KayApi,
  VerificationOtp,
  Tfa,
  Role,
  Customers
} = require("../models");

const { to, ReE, ReS, TE } = require("../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const CONFIG = require("../config/config.json");
const bcrypt_p = require("bcrypt-promise");

var url = require("url");
const app = require("../services/app.service");
const config = require("../config/app.json")[app["env"]];
const io = require("socket.io-client");
var socket = io.connect(config["BASE_URL"], { reconnect: true });
var moment = require("moment");
require("moment/locale/th");
const crypto = require("crypto");
const base32 = require("hi-base32");
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");

const GoogleAuthenticator = require("./GoogleAuthenticator");

const authenticator = require("js-google-authenticator");
const authenticators = new GoogleAuthenticator();
async function createpasshes(pw) {
  let salt, hash;
  [err, salt] = await to(bcrypt_p.genSalt(10));
  if (err) TE(err.message, true);

  [err, hash] = await to(bcrypt_p.hash(pw, salt));
  if (err) TE(err.message, true);

  let pwhash = hash;

  return pwhash;
}
const betweenRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

async function generateSecret(length = 20) {
  const randomBuffer = crypto.randomBytes(length);
  return base32.encode(randomBuffer).replace(/=/g, "");
}

async function generateQRCode(secret, username, issuer) {
  const url = `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;
  return `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(
    url
  )}`;
}

function getClientIp(req) {
  let ipAddress;
  const forwardedIpsStr = req.header("x-forwarded-for");

  if (forwardedIpsStr) {
    const forwardedIps = forwardedIpsStr.split(",");
    ipAddress = forwardedIps[0];
  }

  if (!ipAddress) {
    ipAddress =
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);
  }

  return ipAddress;
}

const login = async function (req, res) {
  let body = req.body;

  if (!body.username) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "กรุณากรอก Username ของคุณ....",
      },
      422
    );
  } else if (!body.password) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_password_require",
        message: "กรุณากรอก Password ของคุณ",
      },
      422
    );
  }

  // console.log(body)

  let auth_info, err, user;

  [err, user] = await to(
    Admin.findOne({
      where: {
        username: body.username,
        password: body.password,
      },
    })
  );
  //console.log(user)
  if (err) {
    return ReE(
      res,
      {
        message: "ชื่อผู้ใช้ หรือ รหัสผ่านของท่านไม่ถูกต้อง.",
        status_code: 400,
      },
      200
    );
  }

  if (!user) {
    return ReE(
      res,
      {
        message: "ชื่อผู้ใช้ หรือ รหัสผ่านของท่านไม่ถูกต้อง.",
        status_code: 400,
      },
      200
    );
  }

  let ruser = await Admin.findOne({
    where: { username: body.username },
  });

  token = await jwt.sign(
    { user_id: ruser.id, username: ruser.username, user_type: "enduser" },
    CONFIG.jwt_encryption,
    { expiresIn: "1d" }
  );

  return ReS(res, {
    user: ruser,
    token: token,
    redirect: "home",
    message: `เข้าสู่ระบบ สำเร็จ ยินดีต้อนรับ ${ruser.username}`,
  });

  //let ad = await Admin.findAll({})
  //
};

const loginadmin = async function (req, res) {
  const body = req.body;
  //console.log(body)
  const userAgent = req.header("user-agent");
  let userdivce = "";
  if (userAgent.includes("Android")) {
    userdivce = "Android";
    // console.log('This is probably an Android Android');
  } else if (
    userAgent.includes("Windows") ||
    userAgent.includes("Macintosh") ||
    userAgent.includes("X11")
  ) {
    userdivce = "Windows";
  } else {
    userdivce = "Unable";
    //console.log('Unable to determine device type');
  }
  //console.log(body);

  if (!body.username) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_username_require",
        message: "Please enter the registered username address.",
      },
      200
    );
  } else if (!body.password) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_password_require",
        message: "Please enter a password to login.",
      },
      200
    );
  }

  let err, user, users;
  let auth_info = {};
  let verifiedUserOtpCount;
  let otpRes;
  let isUserOtpExist;
  auth_info.status = "login";

  [err, user] = await to(
    Admin.findOne({
      where: {
        username: body.username,
      },
    })
  );

  //console.log(user,err);
  //
  //
  if (err) {
    return ReE(
      res,
      {
        message: "บัญชีของคุณถูกระงับ ไม่สามารถเข้าใช้งานได้.",
        status_code: 400,
      },
      200
    );
  }
  if (!user) {
    return ReE(
      res,
      {
        // static_key: "invalid_email_password",
        message: "ไม่มีผู้ใช้งานนี้",
        status_code: 104,
      },
      200
    );
  }
  if (user?.admin_status != 1) {
    let activity = await Activity_system.create({
      username: body.username,
      description: `${moment().locale("th").format("lll")} ${body.username
        } ยายามเข้าสู่ระบบ`,
      types: "login",
      IP: body?.IP || "000.0.0.0",
      status: 0,
      note: "บัญชีถูกระงับ ไม่สามารถเข้าใช้งานได้",
      token: "",
    });
    return ReE(
      res,
      {
        message: "บัญชีของคุณถูกระงับ ไม่สามารถเข้าใช้งานได้.",
        status_code: 400,
      },
      200
    );
  }
  // [err, user] = await to(
  //   Admin.findOne({
  //     where: {
  //       username: body.username,

  //       admin_status: {
  //         [Op.eq]: 1,
  //       },
  //     },
  //   })
  // );
  // if (!user) {
  //   return ReE(
  //     res,
  //     {
  //       // static_key: "invalid_email_password",
  //       message: "ผู้ใช้งานนี้ถูกระงับ. กรุณาติดต่อผู้ดูแล",
  //       status_code: 104,
  //     },
  //     200
  //   );
  // }

  [err, users] = await to(user.comparePassword(body.password));

  if (err) {
    // console.log(user.invalid_email_password);
    if (user.invalid_email_password == 4) {
      let activity = await Activity_system.create({
        username: body.username,
        description: `${moment().locale("th").format("lll")} ${body.username
          } ยายามเข้าสู่ระบบ`,
        types: "login",
        IP: body?.IP || "000.0.0.0",
        status: 0,
        note: "บัญชีถูกระงับ ไม่สามารถเข้าใช้งานได้",
        token: "",
      });
      let upf = await Admin.update(
        {
          admin_status: 0,
        },
        {
          where: { id: user.id },
        }
      );
    } else {
      let upf = await Admin.update(
        {
          invalid_email_password: user.invalid_email_password + 1,
        },
        {
          where: { id: user.id },
        }
      );
    }

    let activity = await Activity_system.create({
      username: body.username,
      description: `${moment().locale("th").format("lll")} ${body.username
        } ยายามเข้าสู่ระบบ`,
      types: "login",
      IP: body?.IP || "000.0.0.0",
      status: 0,
      note: "ใส่รหัสผ่านที่ไม่ถูกต้อง",
      token: "",
    });
    return ReE(
      res,
      {
        static_key: user.invalid_email_password,
        message: `รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง.  ( ${user.invalid_email_password + 1
          } / 5  ) `,
        status_code: 106,
      },
      200
    );
  }
  //console.log(user);
  let token;
  let otp;

  if (user) {
    user.password = undefined;
    let verifiedUserOtpCount;

    [err, verifiedUserOtpCount] = await to(
      Tfa.findOne({
        where: {
          username: body?.username,
        },
      })
    );

    let data = {
      username: body?.username,
      password: body?.password,
      IP: body?.IP,
    };

    const secret = await speakeasy.generateSecret({
      length: 10,
      name: data?.username, //commons.userObject.uname,
      issuer: `RTB${userdivce}`,
    });

    if (user.role == "Owner" || user.admin_type == "programer") {
      await Admin.update(
        {
          user_device_id: body.user_device_id,
        },
        {
          where: { username: body.username },
        }
      );

      token = await jwt.sign(
        {
          user_id: user.id,
          username: user.username,
          merchantId: user.merchantId,
          //  token_v: Key_apiservers.token_v,
          user_type: "admin",
          user_device_id: body.user_device_id,
        },
        CONFIG.jwt_encryption,
        { expiresIn: "2d" }
      );

      await Admin.update(
        {
          auth_token: token,
          IP: body?.IP || "000.0.0.0",
          invalid_email_password: 0,
          user_device_id: body.user_device_id,
        },
        {
          where: { id: user.id },
        }
      );
      socket.emit("send_notification", {
        to: "Allroom",
        message: "LOGIN SUCCESS  เข้าสู่ระบบ สมาชิกสำเร็จ",
      });
      let ruser = await Admin.findOne({ where: { id: user.id } });
      let activity = await Activity_system.create({
        username: body.username,
        description: `${moment().locale("th").format("lll")} ${body.username
          } ล็อกอินเข้าสู่ระบบ สำเร็จ`,
        types: "login",
        IP: body?.IP || "000.0.0.0",
        status: 1,
        note: "",
        token: token,
      });
      return ReS(res, {
        user: ruser,
        token: token,
        redirect: "home",
        message: "LOGIN SUCCESS  เข้าสู่ระบบ สมาชิกสำเร็จ",
      });
    }

    if (!verifiedUserOtpCount) {
      var url = await speakeasy.otpauthURL({
        secret: secret?.base32,
        label: data?.username,
        issuer: `RTB${userdivce}`,
        encoding: "base32",
      });

      var QRCodes = await QRCode.toDataURL(url);
      let dataTrf = {
        IP: data?.IP,
        username: data?.username,
        issuer: `RTB${userdivce}`,
        tempSecret: secret?.base32,
        created_date: new Date(),
        user_device_id: body.user_device_id,
      };

      var updateTfa, updateAdmin;
      token = await jwt.sign(
        {
          user_id: user.id,
          username: user.username,
          merchantId: user.merchantId,
          //  token_v: Key_apiservers.token_v,
          user_type: "admin",
          user_device_id: body.user_device_id,
        },
        CONFIG.jwt_encryption,
        { expiresIn: "8h" }
      );

      let savetaf = await Tfa.create(dataTrf);

      return ReE(res, {
        dataURL: QRCodes,
        data: savetaf,
        redirect: "verify",
        status: 200,
        message: "scan qrcode เพื่อรับรหัสยืนยัน IP address",
        //message: "OTP is send to your email address.",
      });
    } else {
      //ถ้าเจอ

      if (
        verifiedUserOtpCount.IP != body?.IP ||
        verifiedUserOtpCount.user_device_id != body.user_device_id
      ) {
        if (
          verifiedUserOtpCount.is_verified == 1 &&
          verifiedUserOtpCount.status == 1
        ) {
          return ReE(res, {
            data: verifiedUserOtpCount,
            redirect: "verify",
            status: 200,
            message: "ยืนยัน OTP",
            //message: "OTP is send to your email address.",
          });
        } else if (verifiedUserOtpCount.status == 0) {
          var url = await speakeasy.otpauthURL({
            secret: secret?.base32,
            label: body?.username,
            issuer: `RTB${userdivce}`,
            encoding: "base32",
          });

          var QRCodes = await QRCode.toDataURL(url);
          let dataTrfs = {
            IP: body?.IP,
            username: body?.username,
            issuer: `RTB${userdivce}`,
            tempSecret: secret?.base32,
            created_date: new Date(),

            user_device_id: body.user_device_id,
          };
          await Tfa.update(dataTrfs, {
            where: { username: body?.username },
          });

          let tt = await Tfa.findOne({
            where: {
              username: body?.username,
            },
          });
          // let savetaf = await Tfa.create(dataTrfs);

          return ReE(res, {
            dataURL: QRCodes,
            data: tt,
            redirect: "verify",
            status: 200,
            message: "scan qrcode เพื่อรับรหัสยืนยัน IP address",
            //message: "OTP is send to your email address.",
          });
        }
      } else {
        if (verifiedUserOtpCount.is_verified == 1) {
          await Admin.update(
            {
              user_device_id: body.user_device_id,
            },
            {
              where: { username: body.username },
            }
          );

          token = await jwt.sign(
            {
              user_id: user.id,
              username: user.username,
              merchantId: user.merchantId,
              //  token_v: Key_apiservers.token_v,
              user_type: "admin",
              user_device_id: body.user_device_id,
            },
            CONFIG.jwt_encryption,
            { expiresIn: "1h" }
          );

          await Admin.update(
            {
              auth_token: token,
              IP: body?.IP || "000.0.0.0",
              invalid_email_password: 0,
              user_device_id: body.user_device_id,
            },
            {
              where: { id: user.id },
            }
          );
          socket.emit("send_notification", {
            to: "Allroom",
            message: "LOGIN SUCCESS  เข้าสู่ระบบ สมาชิกสำเร็จ",
          });
          let ruser = await Admin.findOne({ where: { id: user.id } });
          let activity = await Activity_system.create({
            username: body.username,
            description: `${moment().locale("th").format("lll")} ${body.username
              } ล็อกอินเข้าสู่ระบบ สำเร็จ`,
            types: "login",
            IP: body?.IP || "000.0.0.0",
            status: 1,
            note: "",
            token: token,
          });
          return ReS(res, {
            user: ruser,
            token: token,
            redirect: "home",
            message: "LOGIN SUCCESS  เข้าสู่ระบบ สมาชิกสำเร็จ",
          });
        } else if (verifiedUserOtpCount.status == 0) {
          var url = await speakeasy.otpauthURL({
            secret: secret?.base32,
            label: body?.username,
            issuer: `RTB${userdivce}`,
            encoding: "base32",
          });

          var QRCodes = await QRCode.toDataURL(url);
          let dataTrfs = {
            IP: body?.IP,
            username: body?.username,
            issuer: `RTB${userdivce}`,
            tempSecret: secret?.base32,
            created_date: new Date(),

            user_device_id: body.user_device_id,
          };
          await Tfa.update(dataTrfs, {
            where: { username: body?.username },
          });

          let tt = await Tfa.findOne({
            where: {
              username: body?.username,
            },
          });
          // let savetaf = await Tfa.create(dataTrfs);

          return ReE(res, {
            dataURL: QRCodes,
            data: tt,
            redirect: "verify",
            status: 200,
            message: "scan qrcode เพื่อรับรหัสยืนยัน IP address",
            //message: "OTP is send to your email address.",
          });
        }
      }
    }
  }
};

const verifyOtp = async (otpInfo, userdivce) => {
  let user, err;

  if (otpInfo.token != "") {
    user = await Admin.findOne({
      where: {
        username: otpInfo.username,
      },
    });

    let userss = await Tfa.findOne({
      where: {
        username: otpInfo.username,
        user_device_id: otpInfo.user_device_id,
        issuer: `RTB${userdivce}`,
      },
    });

    const otpData = userss;
    let isVerified = await speakeasy.totp.verify({
      secret: userss?.tempSecret, //dataTfa.tempSecret,
      encoding: "base32",
      token: otpInfo.token,
    });
    if (isVerified) {
      user.VerificationOtp = undefined;

      [err, resArr] = await to(
        Tfa.update(
          {
            is_verified: 1,
            status: 1,
          },
          {
            where: {
              id: userss.id,
            },
          }
        )
      );

      token = await jwt.sign(
        {
          user_id: user.id,
          username: user.username,
          merchantId: user.merchantId,
          //  token_v: Key_apiservers.token_v,
          user_type: "admin",
          user_device_id: user.user_device_id,
        },
        CONFIG.jwt_encryption,
        { expiresIn: "8h" }
      );

      let d = new Date();

      let ruser = await Admin.findOne({ where: { id: user.id } });

      await Admin.update(
        {
          auth_token: token,

          fcm_token: otpInfo.user_device_id,
        },
        {
          where: { id: user.id },
        }
      );

      return {
        user: ruser,
        id: userss.id,
        token: token,
        message: "OTP Verified",
      };
    } else {
      return {
        message: "Invalid OTP",
      };
    }
  } else {
    return {
      message: "Invalid OTP",
    };
  }
};

const postVerifyCode = async function (req, res) {
  const userAgent = req.header("user-agent");
  let userdivce = "";
  let body = req.body;
  if (userAgent.includes("Android")) {
    userdivce = "Android";
    // console.log('This is probably an Android Android');
  } else if (
    userAgent.includes("Windows") ||
    userAgent.includes("Macintosh") ||
    userAgent.includes("X11")
  ) {
    userdivce = "Windows";
  } else {
    userdivce = "Unable";
    //console.log('Unable to determine device type');
  }

  if (!body.username) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_username_require",
        message: "Please enter the registered username address.",
      },
      200
    );
  } else if (!body.token) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_password_require",
        message: "Please enter a password to login.",
      },
      200
    );
  }

  let vertoken = await verifyOtp(req.body, userdivce);

  //console.log(req.body)

  if (vertoken.message == "OTP Verified") {
    async function ensureSingleActive(activeId) {
      try {
        //  Find all BankAccountGroups and set isActive to false
        await Tfa.update(
          { is_verified: false },
          { where: { id: { [Op.ne]: activeId }, username: activeId.username } }
        );

        //  Find the specific BankAccountGroup by activeId and set isActive to true
        await Tfa.update({ is_verified: true }, { where: { id: activeId.id } });

        return { msg: "Successfully updated isActive for BankAccountGroup." };
      } catch (error) {
        return { msg: "Error updating isActive for BankAccountGroup" };
        // console.error('Error updating isActive for BankAccountGroup:', error);
      }
    }

    let max = await ensureSingleActive(vertoken);

    return ReS(res, vertoken);
  }

  return ReS(
    res,
    {
      //  static_key: "api_response_auth_login_email_require",
      message: "Invalid OTP",
    },
    402
  );
  var token;

  // var dataTfa, err, user;
  // [err, dataTfa] = await to(
  //   Tfa.findOne({
  //     where: {
  //       IP: req?.body?.IP,
  //       platform: req?.body?.platform,
  //       user_device_id: req?.body?.user_device_id,
  //       username: req?.body?.username,
  //       is_verified: 0,
  //       status: 0,
  //     },
  //   })
  // );
  // if (err) {
  //   return ReE(res, {
  //     user: "",
  //     token: "",
  //     redirect: "error",
  //     status: 404,
  //     message: err.message,
  //   });
  // }
  // if (!dataTfa) {
  //   return ReE(res, {
  //     user: "",
  //     token: "",
  //     redirect: "error",
  //     status: 404,
  //     message: "ไม่พบข้อมูล",
  //   });
  // }
  // [err, user] = await to(
  //   Admin.findOne({
  //     where: {
  //       IP: req?.body?.IP,
  //       username: req?.body?.username,
  //       admin_status: 1,
  //     },
  //   })
  // );
  // if (err) {
  //   return ReE(res, {
  //     redirect: "error",
  //     status: 404,
  //     message: err.message,
  //   });
  // }
  // if (!user) {
  //   return ReE(res, {
  //     redirect: "error",
  //     status: 404,
  //     message: "ไม่พบข้อมูล",
  //   });
  // }
  // var token;
  // token = await jwt.sign(
  //   {
  //     user_id: user.id,
  //     username: user.username,
  //     user_type: "admin",
  //     // user_device_id: body?.user_device_id,
  //   },
  //   CONFIG.jwt_encryption,
  //   { expiresIn: "8h" }
  // );

  // let isVerified = await speakeasy.totp.verify({
  //   secret: !dataTfa?.tempSecret ? "IRZTCRJMIQ2XOOLGx" : dataTfa?.tempSecret, //dataTfa.tempSecret,
  //   encoding: "base32",
  //   token: !req.body.token ? "111222" : req.body.token,
  // });
  // // console.log(dataTfa);
  // // console.log(isVerified);
  // if (isVerified) {
  //   ///console.log(`TFA ได้รับการตรวจสอบแล้วว่าสามารถเปิดใช้งานได้`);
  //   let updateTfa = await Tfa.update(
  //     {
  //       status: 1,
  //       is_verified: 1,
  //     },
  //     {
  //       where: {
  //         user_device_id: req?.body?.user_device_id,
  //       },
  //     }
  //   );
  //   if (updateTfa[0] < 0) {
  //     return res.send({
  //       status: 403,
  //       message: "อัพเดทข้อมูลผิดพลาด",
  //     });
  //   }
  //   return ReS(res, {
  //     user: user,
  //     token: token,
  //     redirect: "/#/dashboard",
  //     status: 200,
  //     message: `เข้าสู่ระบบสำเร็จ`,
  //   });
  // }
  // //console.log(`ERROR: TFA is verified to be wrong`);
  // return res.send({
  //   status: 403,
  //   message: "ERROR: TFA is verified to be wrong",
  // });
};

const create_users = async function (req, res) {
  const body = req.body;
  let auth_info, err, user;

  auth_info = {};
  auth_info.status = "create";

  body.code_id = "PT" + Date.now();
  body.avatar_image = `avatar.png`;
  body.sprite_avatar_image = `sprite-avatar.png`;

  if (!body.username) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "Please enter the registered username address.",
      },
      200
    );
  } else if (!body.password) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_password_require",
        message: "Please enter a password to login.",
      },
      200
    );
  }

  [err, user] = await to(
    Admin.findOne({
      where: {
        username: body.username,
      },
    })
  );

  if (user) {
    return ReE(
      res,
      {
        // static_key: "email_has_already_been_taken",
        message: "username has already been taken.",
        status_code: 101,
      },
      200
    );
  }

  [err, user] = await to(
    Admin.findOne({
      where: {
        name: body.name,
      },
    })
  );

  if (user) {
    return ReE(
      res,
      {
        // static_key: "email_has_already_been_taken",
        message: "name has already been taken.",
        status_code: 101,
      },
      200
    );
  }

  let datasave = await Admin.create(body);

  return ReS(res, {
    user: datasave,
    //  token: token,
    message: "Registration success",
  });
};

const getallAdmin = async function (req, res) {

  let admin = await Admin.findAll({
    where: {
      merchantId: req.user.merchantId
    },
  });
  //console.log(admin);
  if (!admin) {
    return ReS(res, {
      error: 400,
      message: "error",
    });
  }
  return ReS(res, {
    data: admin,
    message: "Success",
  });
};
const getallMember = async function (req, res) {
  const body = req.body;
  const startDate = new Date(
    moment()
      .subtract(1, "day")
      .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
      .format("YYYY-MM-DD HH:mm:ss")
  );
  const endDate = new Date(
    moment()
      .endOf("day")
      .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
      .format("YYYY-MM-DD HH:mm:ss.SSS")
  );

  try {
    const member = await Customers.findAndCountAll({
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
        status: "SUCCESS",
      },
      offset: parseFloat(body.offset),
      limit: parseFloat(body.limit),
      order: [["customer_uuid", "desc"]],
    });

    const newMembersToday = await Customers.findAndCountAll({
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
        status: "SUCCESS",
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      offset: parseFloat(body.offset),
      limit: parseFloat(body.limit),
      order: [["customer_uuid", "desc"]], // Consider if order is needed for the count
    });

    return ReS(res, {
      data: member, // Include the paginated list of all active members
      newMembersToday, // Return only the count of new members today
      startDate: startDate,
      data: member,
      message: "Success",
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return ReE(
      res,
      { message: "Failed to fetch members", error: error.message },
      500
    );
  }
};

const getTransaction = async function (req, res) {
  let body = req.body;

  let trans = await TransactionsV2.findAndCountAll({
    include: [
      {
        as: "Member",
        model: Member,
      },
      {
        as: "Request_All",
        model: Request_All,
      },
    ],

    offset: body.offset,
    limit: body.limit,
    order: [["id", "desc"]],
  });
  /// console.log(trans);
  return ReS(res, {
    data: trans,
    message: "Success",
  });
};

const getListOfBankAccounts = async function (req, res) {
  let trans = await Request_All.findAll({
    include: [
      {
        as: "BankAccount",
        model: BankAccount,
        attributes: {
          exclude: ["deviceId", "auth", "pin"],
        },
      },
    ],

    order: [["id", "desc"]],
  });
  /// console.log(trans);
  if (!trans) {
    return ReS(res, {
      error: 400,
      message: "error",
    });
  }
  return ReS(res, {
    data: trans,
    message: "Success",
  });
};
const getall_bankinfo = async function (req, res) {
  let bank = await Bank.findAll({
    // include: [
    //   {
    //     as: "BankAccount",
    //     model: BankAccount,
    //     attributes: {
    //       exclude: ["deviceId", "auth", "pin"],
    //     },
    //   },
    // ],
    // order: [["id", "desc"]],
  });
  /// console.log(trans);
  if (!bank) {
    return ReS(res, {
      error: 400,
      message: "error",
    });
  }
  return ReS(res, {
    data: bank,
    message: "Success",
  });
};

// Report

const postOverviewReport = async function (req, res) {
  let body = req.body;
  let dateFrom = {
    startDate: body.startDate,
    endDate: body.endDate,
  };
  if (
    dateFrom.startDate == "Invalid date" ||
    dateFrom.endDate == "Invalid date"
  ) {
    return ReE(res, {
      errorCode: 1001,
      message: "เลือกวันที่ เริ่มต้น และ สิ้นสุด ให้ถูกต้อง",
    });
  }
  const startDate = moment(dateFrom.startDate)
    .add(+7, "hour")
    .startOf("day")
    .format("YYYY-MM-DD HH:mm:ss");
  const endDate = moment(dateFrom.endDate)
    .add(+7, "hour")
    .endOf("day")
    .format("YYYY-MM-DD HH:mm:ss");
  // console.log(startDate, endDate);
  let err, Trans;
  [err, Trans] = await to(
    TransactionsV2.findAll({
      where: {
        [Op.or]: [
          {
            created_at: {
              [Op.between]: [startDate, endDate],
            },
          },
        ],
      },
    })
  );
  // console.log(result);
  if (err) {
    return ReE(res, {
      errorCode: 404,
      message: "error",
    });
  }
  const lengthDep = Trans.filter((type) => type.type_option == "deposit");
  const lengthWit = Trans.filter((type) => type.type_option == "ถอน");
  let result = await calculateTotalAmountsByDate(Trans);
  //console.log(lengthDep.length)
  let obj = {
    dataTransaction: Trans,
    ...result,
    length: {
      deposit: lengthDep.length,
      withdraw: lengthWit.length,
    },
  };
  return ReS(res, {
    data: obj,
    message: "Success",
  });
};
const postOverviewReportChart = async function (req, res) {
  let body = req?.body;
  let dateFrom = {
    startDate: body?.startDate,
    endDate: body?.endDate,
    type: body?.type,
  };
  if (
    dateFrom.startDate == "Invalid date" ||
    dateFrom.endDate == "Invalid date"
  ) {
    return ReE(res, {
      errorCode: 1001,
      message: "เลือกวันที่ เริ่มต้น และ สิ้นสุด ให้ถูกต้อง",
    });
  }
  const startDate = moment(dateFrom.startDate)
    .startOf(dateFrom.type)
    .format("YYYY-MM-DD 00:00:00");
  const endDate = moment(dateFrom.endDate)
    .endOf(dateFrom.type)
    .format("YYYY-MM-DD 23:59:59");

  let err, Trans;
  [err, Trans] = await to(
    TransactionsV2.findAll({
      where: {
        [Op.or]: [
          {
            created_at: {
              [Op.between]: [startDate, endDate],
            },
          },
        ],
      },
    })
  );
  if (err) {
    return {
      success: false,
      message: "error",
    };
  }
 // const result = await calculateTransactionSummary(Trans);
  if (result.success == false) {
    return ReE(res, {
      errorCode: 404,
      message: "error",
    });
  }
  return ReS(res, {
    data: result.data,
    weekstartDate: result.weekstartDate,
    weekendDate: result.weekendDate,
    message: "Success",
  });
};

// async function
// รายงานภาพรวม
async function calculateTotalAmountsByDate(data) {
  const groupedData = data.reduce((acc, item) => {
    const date = moment(item.created_at).format("YYYY-MM-DD");
    const type_option = item.type_option;
    acc[date] = acc[date] || { date, type_option, totalAmount: 0 };
    acc[date].totalAmount += item.amount;
    return acc;
  }, {});
  const totalAmountsByDate = Object.values(groupedData);
  const totalByDay = await calculateTotals(totalAmountsByDate);
  return { ...totalByDay };
}
async function calculateTotals(transactions) {
  const totals = {};
  transactions.forEach((transaction) => {
    const date = moment(transaction.date).format("YYYY-MM-DD");

    if (!totals[date]) {
      totals[date] = { date: "", deposit: 0, withdraw: 0, profit_and_loss: 0 };
    }

    if (transaction.type_option == "deposit") {
      totals[date].deposit += transaction.totalAmount;
      totals[date].date += transaction.date;
    } else {
      totals[date].withdraw += transaction.totalAmount;
      totals[date].date += transaction.date;
    }

    for (const date in totals) {
      totals[date].profit_and_loss =
        totals[date].deposit - totals[date].withdraw;
    }
  });
  // คำนวณยอดรวมทั้งหมด
  let totalDeposit = 0;
  let totalWithdraw = 0;
  for (const date in totals) {
    totalDeposit += totals[date].deposit;
    totalWithdraw += totals[date].withdraw;
  }
  let totalByDay = Object.values(totals);
  let AllProfit_and_loss = totalDeposit - totalWithdraw;
  return {
    totalByDay,
    AllProfit_and_loss,
    totalDeposit,
    totalWithdraw,
  };
}
async function calculateTransactionSummary(transactions) {
  const summary = {};

  transactions.forEach((transaction) => {
    const date = moment(transaction.created_at).format("YYYY-MM-DD");
    const type = transaction.type;
    const amount = transaction.amount;

    if (!summary[date]) {
      summary[date] = {
        label: null,
        deposit: 0,
        withdraw: 0,
        total: 0,
      };
    }

    if (type === "deposit") {
      summary[date].deposit += amount;
      summary[date].label = date;
    } else {
      summary[date].label = date;
      summary[date].withdraw += amount;
    }
    summary[date].total = summary[date].deposit - summary[date].withdraw;
  });

  // แปลงข้อมูลเป็นรูปแบบที่ Chart.js ใช้
  const chartData = Object.values(summary).map((data) => ({
   // label: data.label,
   // data: { ...data },
  }));

  return { data: chartData, success: true };
}

const getall_BankAccount = async function (req, res) {
  let acc = await BankAccount.findAll({
    include: [
      {
        as: "Bank",
        model: Bank,
      },
      {
        as: "Request_All",
        model: Request_All,
      },
    ],
    attributes: {
      exclude: ["deviceId", "auth", "pin"],
    },
    order: [["id", "desc"]],
  });
  // console.log(acc);

  return ReS(res, {
    data: acc,
    message: "Success",
  });
};
const generateApiKey = async function (req, res) {
  function generateApiKey() {
    return crypto.randomBytes(12).toString("hex");
  }

  try {
    const userchack = await KayApi.findOne({
      where: {
        [Op.and]: [
          { userFrom: req.user.name },
          // { auth_token: authToken } //  ถ้าต้องการตรวจสอบ authToken ด้วย
        ],
      },
    });

    if (userchack) {
      return ReS(res, {
        //  สมมติว่า ReS เป็น helper function สำหรับส่ง response
        data: userchack,
        message: "Error มี Key นี้แล้ว",
        status: 400, //  ควรส่ง status code ที่เหมาะสม เช่น 400 Bad Request
      });
    }

    const key1 = generateApiKey();
    const key2 = generateApiKey();

    const datasave = {
      userFrom: req.user.name,
      userTpye: "Apicenter",
      expdate: "365d", //  ควรเก็บเป็น timestamp หรือ Date object แทน string
      accessKey: key1,
      secretKey: key2,
      updated_at: new Date(), //  ควรตั้งค่า updated_at เป็นเวลาปัจจุบัน
    };

    const savedata = await KayApi.create(datasave);

    return ReS(res, {
      data: savedata,
      message: "Success สร้าง Key สำเร็จ",
      status: 201, //  ควรส่ง status code ที่เหมาะสม เช่น 201 Created
    });
  } catch (error) {
    console.error(error);
    return ReS(res, {
      message: "Error เกิดข้อผิดพลาดในการสร้าง Key",
      status: 500, //  ส่ง status code 500 Internal Server Error กรณีเกิด error
    });
  }
};
const getAllmembers = async function (req, res) {
  let member = await Member.findAll({
    include: [
      {
        as: "Merchant",
        model: Merchant,
      },
      {
        as: "Bank",
        model: Bank,
      },
    ],

    // attributes: {
    //   exclude: ["deviceId", "auth", "pin"],
    // },
    order: [["id", "desc"]],
  });
  /// console.log(member);
  if (!member) {
    return ReS(res, {
      error: 400,
      message: "error",
    });
  }
  return ReS(res, {
    data: member,
    message: "Success",
  });
};
const getalluser = async function (req, res) {
  if (req.user.admin_type == "admin") {
    return ReE(
      res,
      {
        //  static_key: "api_response_auth_login_email_require",
        message: "Please enter the registered username address.",
      },
      200
    );
  } else {

    const page = parseInt(req.query.page) || 1; //  หน้าปัจจุบัน, เริ่มต้นที่ 1
    const limit = req.query.limit ? parseInt(req.query.limit) : 10; // จำนวนรายการต่อหน้า
    const offset = (page - 1) * limit; // คำนวณ offset

    // ใช้ findAndCountAll เพื่อให้ได้ทั้งข้อมูลและจำนวนทั้งหมดสำหรับการทำ pagination
    const { count, rows } = await Admin.findAndCountAll({
      where: {
        merchantId: req.user.merchantId
      },
      limit: limit,
      offset: offset,
      order: [
        ["id", "DESC"], // เรียงตามวันที่สร้างล่าสุด (ตัวอย่าง)
        // หรือ ['id', 'DESC'] หากต้องการเรียงตาม ID ล่าสุด
      ],
      // สามารถเพิ่มเงื่อนไขอื่นๆ (where clause) ได้ตามต้องการ
    });

    return ReS(
      res,
      {
        data: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        message: "Transactions retrieved successfully",
      },
      200
    );

  }
};
const chack_apilogins = async function (req, res) {
  return ReS(
    res,
    {
      //  static_key: "api_response_auth_login_email_require",
      message: "Please enter the registered username address.",
    },
    200
  );
};

// create_admin
const create_admin = async function (req, res) {
  let body = req.body;
  let err, created;
  let genUser = randomString(6);
  let genPass = randomString(10);
  let user = await Admin.findOne({
    where: {
      username: genUser,
    },
  });
  console.log(user, genUser);
  if (user) {
    return ReE(
      res,
      {
        error: 401,
        message: "มีชื่อในระบบแล้ว",
      },
      200
    );
  }

  let pass = await createpasshes(genPass);

  [err, created] = await to(
    Admin.create({
      username: "RTB88" + genUser,
      name: "RTB88" + genUser, //body?.username,
      password: pass, //body?.password,
      admin_type: body?.admin_type,
      merchantId: body?.merchantId,
      role: body?.role,
      roleID: body?.roleID,
       Active_merchantId: body?.merchantId,
      IP: body?.IP,
    })
  );
  //console.log(err);
  if (err) {
    let activity = await Activity_system.create({
      username: req.user.username,
      description: `${moment().locale("th").format("lll")} ${req.user.username
        } พยายามเพิ่มพนักงาน  Username: ${"RTB88" + genUser}, Role: ${body?.role
        }`,
      types: "created",
      IP: req.user.IP || "000.0.0.0",
      status: 0,
      note: "บันทึกข้อมูลล้มเหลว",
      token: req.user.auth_token,
    });
    return ReE(
      res,
      {
        error: 401,
        message: err?.message,
      },
      200
    );
  }

  //
  let activity = await Activity_system.create({
    username: req.user.username,
    description: `${moment().locale("th").format("lll")} ${req.user.username
      } เพิ่มพนักงาน Username: ${"RTB88" + genUser}, Role: ${body?.role} สำเร็จ`,
    types: "created",
    IP: req.user.IP || "000.0.0.0",
    status: 1,
    note: "",
    token: req.user.auth_token,
  });
  return ReS(
    res,
    {
      //  static_key: "api_response_auth_login_email_require",
      error: 0,
      message: "Successed",
      data: created,
      userAdmin: {
        username: created?.username,
        password: genPass,
      },
    },
    200
  );
};

//  ProfileAdmin ***
const getProfileAdmin = async function (req, res) {
  let body = req?.user;

  if (!body) {
    return ReE(
      res,
      {
        error: 400,
        message: "ไม่พบข้อมูล",
      },
      200
    );
  }
  return ReS(
    res,
    {
      error: 0,
      message: "Successed",
      user: body,
    },
    200
  );
};
// ChangPassword
const postChangPassword = async function (req, res) {
  let body = req.body;
  let err, user, checkPass, updated;
  [err, user] = await to(
    Admin.findOne({
      where: {
        username: req.user.username,
      },
    })
  );
  if (err || !user) {
    return ReE(
      res,
      {
        error: 400,
        message: !err.message || "ไม่พบข้อมูล",
      },
      200
    );
  }
  [err, checkPass] = await to(user.comparePassword(body.currentPassword));
  if (err) {
    let activity = await Activity_system.create({
      username: req.user.username,
      description: `${moment().locale("th").format("lll")} ${req.user.username
        } พยายามเปลียนรหัสผ่าน`,
      types: "chang password",
      IP: req.user.IP || "000.0.0.0",
      status: 0,
      note: err.message,
      token: req.user.auth_token,
    });
    return ReE(
      res,
      {
        error: 400,
        message: err.message,
      },
      200
    );
  }
  let Pass = await createpasshes(body.newPassword);
  [err, updated] = await to(
    Admin.update(
      {
        password: Pass,
      },
      {
        where: {
          username: req.user.username,
        },
      }
    )
  );
  if (err) {
    let activity = await Activity_system.create({
      username: req.user.username,
      description: `${moment().locale("th").format("lll")} ${req.user.username
        } พยายามเปลียนรหัสผ่าน`,
      types: "chang password",
      IP: req.user.IP || "000.0.0.0",
      status: 0,
      note: "บันทึกข้อมูลล้มเหลว" + "log error : " + err.message,
      token: req.user.auth_token,
    });
    return ReE(
      res,
      {
        error: 400,
        message: err.message,
      },
      200
    );
  }
  let activity = await Activity_system.create({
    username: req.user.username,
    description: `${moment().locale("th").format("lll")} ${req.user.username
      } เปลียนรหัสผ่านสำเร็จ`,
    types: "chang password",
    IP: req.user.IP || "000.0.0.0",
    status: 1,
    note: "",
    token: req.user.auth_token,
  });
  return ReS(
    res,
    {
      error: 0,
      message: "Successed",
      user: checkPass,
    },
    200
  );
};

const loginadmin2 = async function (req, res) {
  let body = req.body;
  if (!body.username) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_email_require",
        message: "กรุณากรอก Username ของคุณ....",
      },
      422
    );
  } else if (!body.password) {
    return ReE(
      res,
      {
        static_key: "api_response_auth_login_password_require",
        message: "กรุณากรอก Password ของคุณ",
      },
      422
    );
  }
  let err, user;
  [err, user] = await to(
    Admin.findOne({
      where: {
        username: body.username,
      },
    })
  );
  //console.log(user)
  if (err) {
    return ReE(
      res,
      {
        message: err.message,
        status_code: 400,
      },
      200
    );
  }
  if (!user) {
    return ReE(
      res,
      {
        message: "ชื่อผู้ใช้ หรือ รหัสผ่านของท่านไม่ถูกต้อง.",
        status_code: 400,
      },
      200
    );
  }
  if (user?.admin_status != 1) {
    return ReE(
      res,
      {
        message: "บัญชีของคุณถูกระงับ ไม่สามารถเข้าใช้งานได้.",
        status_code: 400,
      },
      200
    );
  }
  [err, user] = await to(user.comparePassword(body.password));
  if (err) {
    return ReE(
      res,
      {
        message: err.message,
        status_code: 400,
      },
      200
    );
  }
  let ruser = await Admin.findOne({
    where: { username: body.username },
  });
  return ReS(res, {
    user: {
      password: body.password,
      username: ruser.username,
      IP: body.IP,
      user_device_id: body.user_device_id,
    },
    redirect: "changepassword",
    message: `ล็อกอินครั้งแรก กรุณาเปลี่ยนรหัสผ่านของท่านใหม่`,
  });
};
const logout = async function (req, res) {
  let activity = await Activity_system.create({
    username: req.user.username,
    description: `${moment().locale("th").format("lll")} ${req.user.username
      } ออกจากระบบสำเร็จ`,
    types: "logout",
    IP: req.user.IP || "000.0.0.0",
    status: 1,
    note: "",
    token: "",
  });

  return ReS(
    res,
    {
      error: 0,
      message: "Logout Successed",
    },
    200
  );
};

const getActivity_system = async function (req, res) {
  let err, all, dataToday;
  let body = req.body;
  const startDate = new Date(
    moment().startOf("day").format("YYYY-MM-DD HH:mm")
  );
  const endDate = new Date(moment().endOf("day").format("YYYY-MM-DD HH:mm"));

  [err, dataToday] = await to(
    Activity_system.findAndCountAll({
      // where: {
      //   created_at: {
      //     [Op.between]: [startDate, endDate],
      //   },
      // },
      offset: body.offset,
      limit: body.limit,
      order: [["id", "desc"]],
    })
  );
  //console.log(user)
  if (err) {
    return ReE(
      res,
      {
        message: err.message,
        status_code: 400,
      },
      200
    );
  }
  return ReS(res, {
    data: dataToday,
    code: 1000,
    startDate: startDate,
    endDate: endDate,
    message: "success",
  });
};
function randomString(len, charSet) {
  charSet =
    charSet || "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var randomString = "";
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

const changepassword = async function (req, res) {
  try {
    let body = req.body;
    let err, user, updated, token;
    if (!body.current_password || !body.new_password || !body.username) {
      return ReE(
        res,
        {
          message: "เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูลให้ถูกต้อง",
          status_code: 400,
        },
        200
      );
    }
    [err, user] = await to(
      Admin.findOne({
        where: {
          username: body.username,
        },
      })
    );
    //console.log(user);
    if (err || !user) {
      return ReE(
        res,
        {
          message: !user ? "ไม่มีผู้ใช้งานนี้" : err.message,
          status_code: 404,
        },
        200
      );
    }
    if (user?.admin_status != 1) {
      return ReE(
        res,
        {
          message: "บัญชีของคุณถูกระงับ ไม่สามารถเข้าใช้งานได้.",
          status_code: 400,
        },
        200
      );
    }
    [err, user] = await to(user.comparePassword(body.current_password));
    if (err) {
      return ReE(
        res,
        {
          message: "Invalid current password",
          status_code: 403,
        },
        200
      );
    }
    let Pass = await createpasshes(body.new_password);
    token = await jwt.sign(
      {
        user_id: user.id,
        username: user.username,
        merchantId: user.merchantId,
        user_type: "admin",
        user_device_id: body.user_device_id,
      },
      CONFIG.jwt_encryption,
      { expiresIn: "8h" }
    );
    if (!token) {
      return ReE(
        res,
        {
          message: "Token generation failed",
          status_code: 403,
        },
        200
      );
    }

    [err, updated] = await to(
      Admin.update(
        {
          password: Pass,
          auth_token: token,
          IP: body?.IP || "000.0.0.0",
          invalid_email_password: 0,
          user_device_id: body.user_device_id,
        },
        {
          where: {
            id: user.id,
          },
        }
      )
    );
    if (err || updated[0] < 0) {
      return ReE(
        res,
        {
          message: err.message || "Failed to update password",
          status_code: 403,
        },
        200
      );
    };
    await Activity_system.create({
      username: body.username,
      description: `${moment().locale("th").format("lll")} ${body?.username
        } เปลียนรหัสผ่าน และ ล็อกอินสำเร็จ`,
      types: "first_time_login",
      IP: body.IP || "000.0.0.0",
      status: 1,
      note: "",
      token: token,
    });
    return ReS(
      res,
      {
        message: "Change password successfully",
        status_code: 200,
        redirect: "/#/dashboard",
        token: token,
        user: user,
      },
      200
    );
  } catch (error) {
    console.log(error);
    return ReE(
      res,
      {
        message: error.message || "Internal server error",
        status_code: 500,
      },
      200
    );
  }
};
module.exports = {
  login,
  loginadmin,
  create_admin,
  getProfileAdmin,
  postChangPassword,
  create_users,
  getalluser,
  chack_apilogins,
  getallAdmin,
  getallMember,
  getall_BankAccount,
  getall_bankinfo,
  getTransaction,
  getListOfBankAccounts,
  postOverviewReport,
  postOverviewReportChart,
  generateApiKey,
  getAllmembers,
  postVerifyCode,
  loginadmin2,
  logout,
  getActivity_system,
  changepassword
};
