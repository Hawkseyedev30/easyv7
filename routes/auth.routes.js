const express = require("express");
const AuthRouter = express.Router();


const passport = require("passport");

const userMidd = require("../middleware/app.user");
require("../middleware/passport")(passport);


const Auth_controller = require("../controllers/auth/auth_controller");
const Transfer_controller = require("../controllers/transfer/transfer_controller");
const Apicallback_controller = require("../controllers/account/callback_true_controller");
const Deposit_controller = require("../controllers/merchang/deposit_controller");
const Botreset_controller = require("../controllers/bank_account/botreset");

AuthRouter.post("/loginauth", Auth_controller.loginauth);
AuthRouter.post("/get_balance", Auth_controller.get_balance);
AuthRouter.post("/create_accounts", Auth_controller.create_account);
AuthRouter.post("/history", Auth_controller.chack_history);
AuthRouter.post("/chack_auth", Auth_controller.chack_auths);
AuthRouter.post("/limit_acc", Auth_controller.chk_limits);
AuthRouter.post("/transferverification", Transfer_controller.verification);
AuthRouter.post("/transferconfirmation", Transfer_controller.transferconfirmation);
AuthRouter.post("/update_eligiblebank", Transfer_controller.update_eligiblebanks);
AuthRouter.post("/apitrue", Transfer_controller.apitrue);



AuthRouter.post("/callback_true", Apicallback_controller.api_callback_true);
//AuthRouter.post("/callback_true2", Auth_controller.chack_history);


AuthRouter.get("/getdeposit", Deposit_controller.getdepositall);
AuthRouter.post("/getdeposit_callback", Deposit_controller.getdeposit_callback);
AuthRouter.get("/callback_payonex", Deposit_controller.callback_payonexs);


AuthRouter.get("/callbacks", Botreset_controller.callbacks);



AuthRouter.post("/chack_authdevice", Apicallback_controller.chack_authdevice);
AuthRouter.post("/loginauth_post", Auth_controller.PostLoginbank_auths);


AuthRouter.post("/get_balance_posts", Auth_controller.get_balance_post);
AuthRouter.get("/chack_historywit_by", Auth_controller.chack_historywit_by);


module.exports = AuthRouter;
