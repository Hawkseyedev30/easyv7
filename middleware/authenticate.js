const { Admin,KayApi} = require('../models');
const { ReE } = require('../services/util.service');
const { Op } = require('sequelize');

let checkUserApi = async function (req, res, next) {
     let authToken = req.header('secretKey')
    console.log(authToken)

   // let user_id = req.user.id;
    let user = await KayApi.findOne({
        where: {
            [Op.and]: [
                { secretKey: authToken },
                // { username: req.user.username }
                // { auth_token: authToken }
            ]
        }
    });


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

    if (!user) return ReE(res, { static_key: 'UNAUTHORIZED_USER userr', message: "Unauthorized user userr." }, 401);
    // if (!users) return ReE(res, { static_key: 'UNAUTHORIZED_USER', message: "Unauthorized user." }, 401);

    user = req.user;

    next();
}
module.exports.checkUserApi = checkUserApi;