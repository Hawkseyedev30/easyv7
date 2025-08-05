const { Admin,KayApi} = require('../models');
const { ReE } = require('../services/util.service');
const { Op } = require('sequelize');

let checkUserApi2 = async function (req, res, next) {
    // let authToken = req.header('secretKey')
 //  console.log(req.user)

 let user_id = req.user.id;
    let user = await Admin.findOne({
    where: {
        [Op.and]: [
            {
                // Check if admin_type is 'programer' OR 'superadmin'
                [Op.or]: [
                    { admin_type: "programer" },
                    { admin_type: "superadmin" }
                ]
            },
            { role: "Subowner" },
            { id: user_id },
            // { username: req.user.username } // Uncomment if needed
            // { auth_token: } // Uncomment if needed
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
module.exports.checkUserApi2 = checkUserApi2;