const { ExtractJwt, Strategy } = require('passport-jwt');
const { User, Admin,Merchant } = require('../models');
const CONFIG = require('../config/config.json');
const { to } = require('../services/util.service');


module.exports = function (passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.jwt_encryption;

    passport.use(new Strategy(opts, async function (jwt_payload, done) {

        if (Object.keys(jwt_payload).length < 4) {
            return done(null, false);
        }
       // console.log(jwt_payload)
        let err, user, admin;
        if (jwt_payload.user_type == 'admin') {
            [err, admin] = await to(Admin.findOne({ where: { id: jwt_payload.user_id,username: jwt_payload.username } }));
        }else if (jwt_payload.user_type == 'merchang') {
            [err, admin] = await to(Merchant.findOne({ where: { id: jwt_payload.user_id } }));
        }else {
            [err, user] = await to(Merchant.findOne({ where: { id: jwt_payload.user_id } }));
        }

        if (err) return done(err, false);
        if (user) {
            return done(null, user);
        } else if (admin) {
            return done(null, admin);
        } else {
            return done(null, false);
        }
    }));
}