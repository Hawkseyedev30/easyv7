const express = require("express");
const AuthRouter = express.Router();


const passport = require("passport");

const userMidd = require("../middleware/app.user");
require("../middleware/passport")(passport);


const Auth_controller = require("../controllers/auth/auth_controller");


AuthRouter.post("/loginauth", Auth_controller.loginauth);
AuthRouter.post("/get_balance", Auth_controller.get_balance);
AuthRouter.post("/create_accounts", Auth_controller.create_account);
AuthRouter.post("/history", Auth_controller.chack_history);


module.exports = AuthRouter;
