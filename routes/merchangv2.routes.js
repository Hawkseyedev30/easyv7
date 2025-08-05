const express = require("express");
const MerchangRouter = express.Router();


const passport = require("passport");

const userMidd = require("../middleware/app.merchant");
require("../middleware/passport")(passport);


const Getdata_transections_controllrer = require("../controllers//v2_transcetions/getdata_transections_controllre");
const Getdata_transectionsv2_controllrer = require("../controllers//v2_transcetions/getdata_transections_controllrev2");
const SetMerchang_controller_controller = require("../controllers/merchang/setmerchang_controller");
const Merchang_controller_controller = require("../controllers/merchang/Merchang_controller");
const Create_deposit_new_controller = require("../controllers/v2_transcetions/deposit_controller");
const deprosit_new_controller = require("../controllers/deprosit/deprosit_controller");



MerchangRouter.post("/authenticate", SetMerchang_controller_controller.gettoken);



MerchangRouter.post("/verrify_customers",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchang_controller_controller.verifying_accounts);
MerchangRouter.post("/create_customers",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchang_controller_controller.confirm_accounts);

MerchangRouter.get("/get_list_statement",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.getTransactions);




MerchangRouter.post("/create_deposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Create_deposit_new_controller.create_deposit_new_v2);
MerchangRouter.post("/chack_deposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Create_deposit_new_controller.chack_deposit);


MerchangRouter.get("/getbalance",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.getbalance);
MerchangRouter.post("/withdrowTransaction",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.withdrowTransaction);

MerchangRouter.get("/autowithdrow", Getdata_transectionsv2_controllrer.autowithdrow);
MerchangRouter.get("/auto_deprosit", deprosit_new_controller.auto_deprosit);
MerchangRouter.get("/auto_deprosit2", deprosit_new_controller.auto_deprositv2);


MerchangRouter.get("/autowithdrowv2", Getdata_transectionsv2_controllrer.apiwithdorw_level_20);
MerchangRouter.post("/chack_oder", Getdata_transectionsv2_controllrer.chack_oder);

MerchangRouter.get("/getTransactions",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.getTransactions);

MerchangRouter.post("/listTransactions",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.listTransactions);

MerchangRouter.get("/listTransactions",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.listTransactions);
MerchangRouter.get("/fetchAllTransactions",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.fetchAllTransactions);
MerchangRouter.get("/findTransactionById",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.findTransactionById);
MerchangRouter.get("/searchTransactions",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.searchTransactions);
MerchangRouter.get("/updateTransaction",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.updateTransaction);
MerchangRouter.get("/editTransaction",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.editTransaction);
//MerchangRouter.post("/confirm_transaction_manual",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Getdata_transections_controllrer.confirm_transaction_manual);


module.exports = MerchangRouter;
