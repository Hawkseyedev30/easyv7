const express = require("express");
const MerchangRouter = express.Router();


const passport = require("passport");

const userMidd = require("../middleware/authenticate2");
require("../middleware/passport")(passport);


const Admincontroller = require("../controllers/admin.controllers");
const Bank_account_controller = require("../controllers/bank_account/bank_account.controllers");
const Merchan_controller = require("../controllers/merchang/Merchang_controller");
const Withdraws_controller = require("../controllers/merchang/withdraw_controller");
const Withdraws2_controller = require("../controllers/merchang/option_withdraw");
const Deposit_controller = require("../controllers/merchang/deposit_controller");
const Member_controller = require("../controllers/merchang/member_info");
const editsetting_controller = require("../controllers/merchang/edit_Merchang_controller");
const Qrcode_controller = require("../controllers/qrcode/qrcode_controller");
const Manual_controller = require("../controllers/merchang/Manual_controller");
const Uploads_controller = require("../controllers/uploads/uploads.controller");
const BankPlatform_controller = require("../controllers/account/getdata_bankPlatform");
const Tran_controller = require("../controllers/transaction_tranfer/transaction_merchang_controller");
const Payonex_controller = require("../controllers/merchang/payonex_controller");
const SetMerchang_controller_controller = require("../controllers/merchang/setmerchang_controller");


const update_withdrow_controller = require("../controllers/merchang/update_withdrow");

// MerchangRouter.post("/login",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.login);
// MerchangRouter.post("/login_admin", Admincontroller.loginadmin);


 MerchangRouter.post("/create_merchants",passport.authenticate("jwt", { session: false }), userMidd.checkUserApi2, Merchan_controller.create_merchant_v1);
// //MerchangRouter.post("/banner", Merchan_controller.getdatamerchantbanner);
// //MerchangRouter.post("/transferpromtpay", Merchan_controller.transferpromtpay);
// MerchangRouter.post("/scanqrcode", Merchan_controller.scanqrcode);
// MerchangRouter.post("/gettokens", SetMerchang_controller_controller.gettoken);




// // MerchangRouter.post("/verifying_account",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.verifying_accountsv2);
// // MerchangRouter.post("/verifying_accountv2",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.verifying_accountsv2);

// MerchangRouter.post("/confirm_account",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.confirm_accounts);

// // manual


// MerchangRouter.post("/transaction_manual",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Manual_controller.transaction_manual);

// MerchangRouter.post("/qrscan",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.scanqrcode);
// MerchangRouter.post("/chackDeposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.chackDeposit);
// MerchangRouter.post("/update_status_chackDeposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.update_status_chackDeposit);


// MerchangRouter.post("/create_transaction_manual",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Uploads_controller.upload_Manual);
// MerchangRouter.post("/confirm_transaction_manual",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Manual_controller.confirm_transaction_manual);


// // End manual
// MerchangRouter.post("/getDeposit_recipient",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.getDeposit_recipients);


// MerchangRouter.post("/update_withdrow",passport.authenticate("jwt", { session: false }), userMidd.checkUser, update_withdrow_controller.update_withdrow);


// MerchangRouter.get("/processBankDeposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.processBankDeposits);
// MerchangRouter.post("/confirm_withdraws",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Withdraws2_controller.confirm_withdraws);
// MerchangRouter.post("/confirm_withdrawsauto",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Withdraws2_controller.confirm_withdrawsauto);

// MerchangRouter.get("/getallbankacc",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.getalluser);
// MerchangRouter.post("/create_BankAccount",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.create_BankAccount);
// MerchangRouter.get("/getall_BankAccount",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.getalluser);
// MerchangRouter.post("/create_BankAccountApiscb_Kbankz",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.create_BankAccountApiscb_Kbankz);


// //AuthRouter.post("/create_BankAccountApiscb_Kbankz", BankAccount_controller.create_BankAccountApiscb_Kbankz);
// //MerchangRouter.post("/withdraws",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Withdraws_controller.withdraw);
// MerchangRouter.post("/withdraws",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Withdraws2_controller.withdraw);


// MerchangRouter.get("/getdeposit_callback",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Deposit_controller.getdeposit_callback);
// MerchangRouter.get("/getdeposit_callback_rejected",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Deposit_controller.getdeposit_callback_rejected);




// MerchangRouter.post("/create_scanqrcode",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.createscanqrcode);

// MerchangRouter.get("/getall_bankinfo", Bank_account_controller.getall_bankinfo);
// MerchangRouter.post("/edit_merchans",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.edit_merchans);
// MerchangRouter.get("/merchang_info",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.merchang_info);


// MerchangRouter.get("/getall_memberinfo",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Member_controller.getalldatamember_merchang);
// MerchangRouter.get("/getall_memberinfo_unuserStatus",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Member_controller.getalldatamember_merchang2);

// MerchangRouter.post("/memberinfo",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Member_controller.memberinfo);


// MerchangRouter.post("/editMember/:memberId", passport.authenticate("jwt", { session: false }), userMidd.checkUser, Member_controller.editMember);
// MerchangRouter.post("/getdata_transactionall", passport.authenticate("jwt", { session: false }), userMidd.checkUser, Tran_controller.getdata_transactionall);



// MerchangRouter.post("/transaction_byuuid", passport.authenticate("jwt", { session: false }), userMidd.checkUser, Payonex_controller.transaction_byuuid);


// MerchangRouter.post("/get_transaction", passport.authenticate("jwt", { session: false }), userMidd.checkUser, Tran_controller.getdata_transaction);

// MerchangRouter.post("/edit_setting",passport.authenticate("jwt", { session: false }), userMidd.checkUser, editsetting_controller.edit_mechang);


// MerchangRouter.post("/create_Member",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Member_controller.createMember);
// MerchangRouter.post("/transactions_PayoneX",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Withdraws2_controller.chack_tranchackwitdows);
// MerchangRouter.post("/deposit_PayoneX",passport.authenticate("jwt", { session: false }), userMidd.checkUser, BankPlatform_controller.deposit_PayoneX);


 MerchangRouter.get("/getbank_info", Bank_account_controller.getall_bankinfo);



 MerchangRouter.post("/view_qrcode", Qrcode_controller.viewqrcode);

// MerchangRouter.post("/login_admin", Admincontroller.loginadmin);


module.exports = MerchangRouter;
