const { Admin, Merchant } = require('../models');
const { ReE } = require('../services/util.service');
const { Op } = require('sequelize');

let checkUser = async function (req, res, next) {
    // let authToken = req.header('authorization').substring(7);
    //  console.log(req.user)

    let user_id = req.user.Active_merchantId;
    let user = await Merchant.findOne({
        where: {
            [Op.and]: [
                { id: user_id },
                // { username: req.user.username }
                // { auth_token: authToken }
            ]
        }
    });

    user = req.user;

   // console.log(req.user.role)
    if (req.user.role == "Subowner" || req.user.role == "SuperOwner") {
       
        if (!user) return ReE(res, { static_key: ' Active_merchantId is ', message: "Please select Active_merchantId" }, 401);



        next();

    } else {

        if (!user) return ReE(res, { static_key: 'Active_merchantId is', message: "Please select Active_merchantId" }, 401);
 next();
    }

    //  console.log(user)
    // let users = await Member.findOne({
    //     where: {
    //         [Op.and]: [
    //             { id: user_id },
    //             // { username: req.user.username }
    //             // { auth_token: authToken }
    //         ]
    //     }
    // });

    // if (!users) return ReE(res, { static_key: 'UNAUTHORIZED_USER', message: "Unauthorized user." }, 401);


}
module.exports.checkUser = checkUser;