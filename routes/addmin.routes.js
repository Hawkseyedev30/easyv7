const express = require("express");
const AdminRouter = express.Router();


const passport = require("passport");

const userMidd = require("../middleware/app.user");
const userMiddchack = require("../middleware/authenticate");
require("../middleware/passport")(passport);


const Admincontroller = require("../controllers/admin.controllers");
const Bank_account_controller = require("../controllers/bank_account/bank_account.controllers");
const Withdraws_controller = require("../controllers/merchang/withdraw_controller");
const Deposit_controller = require("../controllers/merchang/deposit_controller");
const Paymen_controller = require("../controllers/gatway/depositgen_deviceId_controller");
const Merchang_controller = require("../controllers/merchang/Merchang_controller");
const Uploads_controller = require("../controllers/uploads/uploads.controller");
const Bank_Deposit_controller = require("../controllers/bank_account/Bank_Deposit_controller");
const Addpermission_controller = require("../controllers/permission/permission_controller");
const BankPlatform_controller = require("../controllers/account/getdata_bankPlatform");
const Transaction_tranfer_controller = require("../controllers/transaction_tranfer/transaction_tranfer_controller");
const Report_controller = require("../controllers/bank_account/report_controller");
const Custumer_controller = require("../controllers/customer/customer_controller");
const Merchan_controller = require("../controllers/merchang/Merchang_controller");
const Depprosit_krungthai_controller = require("../controllers/transaction_tranfer/depprosit_krungthai");
const Upload_transfer_controller = require("../controllers/transfer_Manua/Manua");
const Qrcode_v2_controller = require("../controllers/merchang/chack_q_controller");

const Botreset_controller = require("../controllers/bank_account/botreset");
const Tranfer_controller = require("../controllers/transfer/chacktranfer_withdows");
const SetMerchang_controller_controller = require("../controllers/merchang/setmerchang_controller");
const Setting_controller = require("../controllers/setting/setting_controller");
const Create_deposit_new_controller = require("../controllers/v2_transcetions/deposit_controller");

AdminRouter.get("/getProfileAdmin",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getProfileAdmin);
AdminRouter.post("/changPassword",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.postChangPassword);
AdminRouter.post("/create-admin",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.create_admin);

AdminRouter.post("/generate_new_apikey",passport.authenticate("jwt", { session: false }), userMidd.checkUser, SetMerchang_controller_controller.genared_keyapi);

AdminRouter.get("/getdata_keyapi",passport.authenticate("jwt", { session: false }), userMidd.checkUser, SetMerchang_controller_controller.getdata_keyapi);

AdminRouter.get("/getdata_memerchang",passport.authenticate("jwt", { session: false }), userMidd.checkUser, SetMerchang_controller_controller.getdata_memerchang);

AdminRouter.get("/getalldata_memerchang",passport.authenticate("jwt", { session: false }), userMidd.checkUser, SetMerchang_controller_controller.getalldata_memerchang);
AdminRouter.post("/edit_merchans",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchan_controller.edit_merchans);




AdminRouter.post("/forgot-password", Admincontroller.changepassword);

AdminRouter.get("/processBankDeposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.processBankDeposits);

// NEW 14/02/25
AdminRouter.post("/editRolePermission",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.editRolePermission);
AdminRouter.post("/editPermission",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.editPermission);

AdminRouter.post("/getActivity_system",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getActivity_system);

AdminRouter.post("/upload_transfer_Manua",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Upload_transfer_controller.upload_transfer_Manua);
AdminRouter.post("/chack_upload_Manual",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Upload_transfer_controller.chack_upload_Manual);

AdminRouter.post("/update_stust_Manual",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Upload_transfer_controller.update_stust_Manual);

AdminRouter.post("/update_autokbank",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Upload_transfer_controller.update_autokbank);
AdminRouter.post("/chack_stuaus_kbank",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Upload_transfer_controller.chack_stuaus_kbank);


AdminRouter.post("/instructionViewType",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Upload_transfer_controller.chack_stuaus_tranferrefkrungthai);


AdminRouter.delete("/deleteRole/:roleId",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.deleteRole);



AdminRouter.post("/create_depositv1",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Create_deposit_new_controller.create_deposit_new_v3);




AdminRouter.post("/editsetting_transaction_fee_settings",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Setting_controller.editsetting_transaction_fee_setting);




AdminRouter.get("/botreset_summerrylimit", Botreset_controller.botreset_summerrylimit);

AdminRouter.post("/create_transaction_tranfer",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Transaction_tranfer_controller.create_transaction_tranfer);
AdminRouter.get("/getdata_transaction_tranfer",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Transaction_tranfer_controller.getdata_transaction_tranfer);

// 16/02/25
AdminRouter.post("/postEditAdmin",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.postEditAdmin);
AdminRouter.post("/postalternateAdmin",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.postalternateAdmin);



AdminRouter.get("/logout",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.logout);


AdminRouter.post("/create_depprosit_krungthai",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Depprosit_krungthai_controller.create_depprosit_krungthais);
AdminRouter.post("/update_depprosit_krungthais",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Depprosit_krungthai_controller.update_depprosit_krungthais);

AdminRouter.post("/create_depprositgateway",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Depprosit_krungthai_controller.create_depprositgateway);



AdminRouter.post("/chack_depprositgateway",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Depprosit_krungthai_controller.chack_depprositgateway);


AdminRouter.get("/get_customer",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Custumer_controller.getalluserCustumer);
AdminRouter.post("/get_customer",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Custumer_controller.getalluserCustumer);

AdminRouter.post("/role_permissions",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.role_permissions);
AdminRouter.post("/role_menu",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.role_menu);

AdminRouter.get("/role_permissions",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.role_permissions);
AdminRouter.get("/role_menu",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.role_menu);



AdminRouter.post("/login",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.login);
AdminRouter.post("/login_admin", Admincontroller.loginadmin);
AdminRouter.post("/login_admin2", Admincontroller.loginadmin2);
AdminRouter.post("/create_user", Admincontroller.create_users);
AdminRouter.post("/verify", Admincontroller.postVerifyCode);
AdminRouter.get("/getalluser",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getalluser);

AdminRouter.get("/getallbankacc",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.getalluser);
AdminRouter.post("/create_BankAccount",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.create_BankAccount);
AdminRouter.get("/getall_BankAccount",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.getalluser);
AdminRouter.post("/create_BankAccountApiscb_Kbankz",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.create_BankAccountApiscb_Kbankz);
AdminRouter.post("/update_BankAccounts",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.update_BankAccount);
AdminRouter.post("/postIsActiveBanks",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.postIsActiveBank);

// endbank

AdminRouter.post("/get_data_deposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Deposit_controller.gtdata_deposit);
AdminRouter.post("/verrify_tranfer_withdrowinq",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Tranfer_controller.verrify_tranfer_withdrowinq);

AdminRouter.post("/gtdata_withdraw",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Withdraws_controller.gtdata_withdraw);
AdminRouter.post("/verify_withdraw",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Withdraws_controller.verify_withdraws);
AdminRouter.post("/transferconfirmations",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Withdraws_controller.transferconfirmations);
AdminRouter.post("/delete_bank_account",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.delete_bank_account);
AdminRouter.post("/generateApiKey",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.generateApiKey);

AdminRouter.post("/upBank_level_withdrawal",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.upBankAccountGroup_withdrawal);
AdminRouter.post("/upBank_level_deposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.upBankAccountGroup_deposit);
AdminRouter.post("/addpermission",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.addpermission);
AdminRouter.get("/alldata_permissions",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.alldata_permissions);
AdminRouter.get("/getalldata_Role",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Addpermission_controller.getalldata_Role);

AdminRouter.get("/botnotify_timezone", Botreset_controller.botnotify_timezone);




AdminRouter.post("/paymentsbillscanv1",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Qrcode_v2_controller.paymentsbillscan);


AdminRouter.get("/get_bankinfo", Bank_account_controller.getall_bankinfo);
AdminRouter.get("/chack_apilogin",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.chack_apilogins);

//AuthRouter.post("/create_BankAccountApiscb_Kbankz", BankAccount_controller.create_BankAccountApiscb_Kbankz);

AdminRouter.get("/getall_bankinfo", Bank_account_controller.getall_bankinfo);

AdminRouter.get("/getallAdmin",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getallAdmin);
AdminRouter.post("/getallMember",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getallMember);
//AdminRouter.get("/getall_BankAccount",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getall_BankAccount);
AdminRouter.get("/getall_bankinfo",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getall_bankinfo);
AdminRouter.post("/getTransaction",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getTransaction);
AdminRouter.get("/getListOfBankAccounts",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.getListOfBankAccounts);


// Report

AdminRouter.post("/postOverviewReport",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.postOverviewReport);


//AdminRouter.post("/postOverviewReportChart",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Admincontroller.postOverviewReportChart);
AdminRouter.post("/postOverviewReportChart",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Report_controller.report);
AdminRouter.post("/chack_Invoice",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Report_controller.chack_Invoice);


AdminRouter.get("/getAllBankAccounts",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.getAllBankAccounts);

AdminRouter.post("/get_balance_summery",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.get_balance_summery);


AdminRouter.get("/getAllmembersgatway",userMiddchack.checkUserApi, Admincontroller.getAllmembers);
AdminRouter.get("/getAllbank_accountgatway",userMiddchack.checkUserApi,Bank_account_controller.getAllbank_accountgatway);

AdminRouter.post("/history_bank_account",Bank_account_controller.history_bank_account);
AdminRouter.post("/fetchAllTransactions",passport.authenticate("jwt", { session: false }), userMidd.checkUser,Custumer_controller.fetchAllTransactions);


AdminRouter.post("/addbank_deposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser,Bank_Deposit_controller.addbank_Depositall);



AdminRouter.get("/getbank_deposit",passport.authenticate("jwt", { session: false }), userMidd.checkUser,Bank_Deposit_controller.getdata_deposit_pay);
AdminRouter.get("/getall_BankGrop",passport.authenticate("jwt", { session: false }), userMidd.checkUser,Bank_Deposit_controller.getall_BankGrop);




AdminRouter.post("/get_Token_generate",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Paymen_controller.get_Token_generate);

AdminRouter.post("/upBankAccountGroup",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Bank_account_controller.upBankAccountGroup);

AdminRouter.post("/notifyforword",Merchang_controller.notifyforword);
AdminRouter.get("/update_gatway",BankPlatform_controller.update_transactions_PayoneX);


AdminRouter.get("/getdataMerchang",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Merchang_controller.getdatamerchant);
AdminRouter.post("/create_Manual",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Deposit_controller.create_create_Manual);
AdminRouter.post("/upload_Manual",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Uploads_controller.upload_Manual);


AdminRouter.get("/getall_Transaction_manuals",passport.authenticate("jwt", { session: false }), userMidd.checkUser, Deposit_controller.getall_Transaction_manual);



AdminRouter.get("/getdata_bankPlatform",passport.authenticate("jwt", { session: false }), userMidd.checkUser, BankPlatform_controller.getdata_bankPlatform);




module.exports = AdminRouter;
