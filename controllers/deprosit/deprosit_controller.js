
var {
    User_account,
    Datauser,
    Request_All,
    BankAccount,
    Merchant,
    Bank,
    Member,
    Transaction_manual,
    Req_qrcode,
    TransactionsV2,
    BankAccountGroup,
    Systemsettings,
    Botlog_limittime,
    Create_deposits,
    TransactionFeeSetting,
    Customers,
    TransactionsV2
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt");
const ApiKtb_helper = require("../../helpers/krungthai_bus");
const Apikrunthai_businessy = require("../../helpers/Apikrunthai_businessy");
const Apikbank = require("../../kbank/dist/index");
var moment = require("moment");
require("moment/locale/th");
const { v4: uuidv4 } = require("uuid");

function generateUuid() {
    return uuidv4();
}

const Apicllback = require("./api");



async function chack_auth(basicAuth) {

    try {
        // Use the axiosInstance which includes the Bearer token via interceptor

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://business.krungthai.com/ktb/rest/biznext-channel/v1/account/overview',
            headers: {
                'User-Agent': 'okhttp/3.14.9',
                'Connection': 'Keep-Alive',
                'Accept-Encoding': 'gzip',
                'Content-Type': 'application/json',
                'X-Platform': 'android/12',
                // 'X-Client-Version': Version,
                // 'X-Correlation-ID': 'de262939-7151-4c3d-98f3-4a89c3610ab5-crid',
                // 'X-Device-ID': `${devicesid}`,
                // 'X-Device-Model': Device_Model,
                'X-Channel-Id': 'MB',
                'Accept-Language': 'th-TH',
                'Authorization': `Bearer  ${basicAuth}`
            }
        };

        const response = await axios.request(config)
        return {
            status: response.status,
            data: response.data
        }
    } catch (error) {

        // Log detailed error if available
        if (error.response) {

            return {
                status: error.response.status,
                data: error.response.data
            }
            //   return ("data:", error.response.status);
            //  return("Headers:", error.response.headers);
        }
        throw error;
    }

}



async function krungthai_verrifyusers(basicAuth) {

    try {
        // Use the axiosInstance which includes the Bearer token via interceptor


        let data = JSON.stringify({
            "accessToken": basicAuth.accessToken,
            "bankCode": basicAuth.bankcode,
            "accountNumber": basicAuth.accnumber
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://appktb.scb-easy.org/api/app/v3/krungthai_business/krungthai_verrifyusers',
            headers: {
                'apiToken': '7c31fe0a-60cf-4877-98c2-c34d75bb6875',
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios.request(config)
        return {
            status: response.status,
            data: response.data
        }
    } catch (error) {

        // Log detailed error if available
        if (error.response) {

            return {
                status: error.response.status,
                data: error.response.data
            }
            //   return ("data:", error.response.status);
            //  return("Headers:", error.response.headers);
        }
        throw error;
    }

}

async function create_tranferOder(basicAuth) {

    try {
        // Use the axiosInstance which includes the Bearer token via interceptor



        let data = JSON.stringify(basicAuth);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://appktb.scb-easy.org/api/app/v3/krungthai_business/create_tranferOder',
            headers: {
                'apiToken': '7c31fe0a-60cf-4877-98c2-c34d75bb6875',
                'Content-Type': 'application/json'
            },
            data: data
        };


        const response = await axios.request(config)
        return {
            status: response.status,
            data: response.data
        }
    } catch (error) {

        // Log detailed error if available
        if (error.response) {

            return {
                status: error.response.status,
                data: error.response.data
            }
            //   return ("data:", error.response.status);
            //  return("Headers:", error.response.headers);
        }
        throw error;
    }

}

async function chack_hotdep(basicAuth, ccc) {

    try {


        const startDate = moment().add(-1, "days").startOf("day").format("YYYY-MM-DD")
        const endDate = moment().endOf("day").format("YYYY-MM-DD")

        // Use the axiosInstance which includes the Bearer token via interceptor

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://business.krungthai.com/ktb/rest/biznext-channel/v1/transaction-history/accounts/${ccc}?accountType=CASA&transactionType=deposit&minAmount=1&maxAmount=100000&startDate=${startDate}&endDate=${endDate}&pageSize=50`,
            headers: {
                'User-Agent': 'okhttp/3.14.9',
                'Connection': 'Keep-Alive',
                'Accept-Encoding': 'gzip',
                'Content-Type': 'application/json',
                'X-Platform': 'android/12',
                // 'X-Client-Version': Version,
                // 'X-Correlation-ID': 'de262939-7151-4c3d-98f3-4a89c3610ab5-crid',
                // 'X-Device-ID': `${devicesid}`,
                // 'X-Device-Model': Device_Model,
                'X-Channel-Id': 'MB',
                'Accept-Language': 'th-TH',
                'Authorization': `Bearer  ${basicAuth}`
            }
        };

        const response = await axios.request(config)
        return {
            status: response.status,
            data: response.data
        }
    } catch (error) {

        // Log detailed error if available
        if (error.response) {

            return {
                status: error.response.status,
                data: error.response.data
            }
            //   return ("data:", error.response.status);
            //  return("Headers:", error.response.headers);
        }
        throw error;
    }

}

const auto_deprositv2 = async function (req, res) {
    let bankfroms = await BankAccount.findAll({
        where: {
            status_bank: "Active",
            accountType: "deposit",
            // merchantId: 28
        },
    });


    for (const bankfrom of bankfroms) {


        if (bankfrom.channel == "ktb-business") {
            let chackauth = await chack_auth(bankfrom.auth)


            if (chackauth.status == 500) {
                let login = await Apikrunthai_businessy.authenticateBankData(bankfrom)
            }

            let bankfrom2 = await BankAccount.findOne({
                where: {
                    id: bankfrom.id,

                },
            });
            let chackauthhit = await chack_hotdep(bankfrom2.auth, bankfrom2.accounts)


            for (const element of chackauthhit.data.content) {
                let extractedBankCode = null;
                let extractedAccountNumber = null;
                if (element.transactionComment) {
                    const comment = element.transactionComment;
                    const regex = /TR fr (\d{3})-(\d+)/; // Regex เพื่อจับรหัสธนาคาร (3 หลัก) และเลขบัญชี
                    const match = comment.match(regex);

                    if (match) {
                        extractedBankCode = match[1]; // รหัสธนาคาร (เช่น "014")
                        extractedAccountNumber = match[2]; // เลขบัญชี (เช่น "6522427352")

                        // Check if transaction already processed
                        const existingTransaction = await TransactionsV2.findOne({
                            where: {
                                merchantOrderId: element.transactionRefId // Assuming transactionRefId is unique from the bank
                            }
                        });

                        if (existingTransaction) {
                            console.log(`Transaction ${element.transactionRefId} already processed. Skipping.`);
                            continue;
                        }

                        let customer = await Customers.findOne({
                            where: {
                                account_no: extractedAccountNumber,
                                merchantId: bankfrom.merchantId
                            }
                        });

                        let objects = await Create_deposits.findOne({
                            where: {
                                status: "PENDING",
                                customerAccountNo: extractedAccountNumber
                            },
                        });

                        let create_deposits_idd = null;

                        if (objects) {
                            const [errUpdate, updateResult] = await to(
                                Create_deposits.update(
                                    {
                                        status: "SUCCESS",
                                        remark: `Payment confirmed via transaction ${element.transactionRefId}`,
                                        userId: element.transactionRefId,
                                    },
                                    {
                                        where: { id: objects.id },
                                    }
                                )
                            );

                            create_deposits_idd = objects.id;
                            create_uuid = objects.uuid;
                            referenceIds = objects.referenceId;

                        }


                        if (customer) {
                            const merchant = await Merchant.findOne({ where: { id: bankfrom.merchantId } });
                            if (!merchant) {
                                console.log(`Merchant not found for id: ${bankfrom.merchantId}`);
                                continue;
                            }



                            const depositAmount = parseFloat(element.deposit);
                            // For now, assuming no deposit fees. If there are, this needs to be calculated.
                            const transferAmount = depositAmount;
                            const fee = depositAmount - transferAmount;

                            const newTransactionData = {
                                logUuid: generateUuid(),
                                clientCode: customer.client_code || "",
                                qrcode: null,
                                slip_url: "",
                                partnerCode: merchant.id,
                                referenceId: referenceIds,
                                merchantOrderId: element.transactionRefId,
                                platformOrderId: create_uuid,
                                CustomersId: customer.id,
                                customer: customer.customer_uuid,
                                amount: depositAmount,
                                transferAmount: transferAmount,
                                currency: "THB",
                                settleCurrency: "THB",
                                type: "deposit",
                                status: "SUCCESS",
                                note: element.transactionComment || "Deposit from KTB Business",
                                eventCreatedAt: new Date(element.transactionDateTime),
                                eventUpdatedAt: Date.now(),
                                bank: {
                                    accountNo: customer.account_no, // ใช้จากข้อมูลลูกค้า
                                    accountName: customer.name,     // ใช้จากข้อมูลลูกค้า
                                    bankCode: customer.bank_code,   // ใช้จากข้อมูลลูกค้า
                                    // หากต้องการใช้ extractedBankCode/accountNumber ให้พิจารณาว่าข้อมูลใดควรมีความสำคัญกว่า
                                    extractedBankCode: extractedBankCode,
                                    extractedAccountNumber: extractedAccountNumber,
                                },
                                rate: 1,
                                channelName: merchant.name || "DEFAULT_CHANNEL",
                                fee: fee,
                                feePlatform: 0,
                                feeSale: 0,
                                feePartner: 0,
                                settleAmount: transferAmount,
                                settleRate: 1,
                                rateDisplay: 1,
                                refUuid: element.transactionRefId,
                                //create_deposits_id: null, // No Create_deposits record in this flow
                                feePayment: 0,
                                profit: 0,
                                balance: parseFloat(merchant.balance) + transferAmount,
                                updatedBy: "system",
                                create_deposits_id: create_deposits_idd,
                                merchantId: bankfrom2.merchantId
                            };

                            if (referenceIds) {
                                await TransactionsV2.create(newTransactionData);

                            }

                            await Merchant.update(
                                { balance: parseFloat(merchant.balance) + transferAmount },
                                { where: { id: merchant.id } }
                            );

                            let data_member = await Apicllback.submitDepositTransaction(newTransactionData, merchant);



                            //  console.log(`Processed deposit for ${customer.name} amount ${depositAmount}`);
                        }
                        // console.log(`Extracted Bank Code: ${extractedBankCode}`);
                    } else {
                        //  console.log("Could not extract bank code and account number from transactionComment.");
                    }
                }

            }
        } else if (bankfrom.channel == "k-biz") {










        }



    }



    return ReS(res, { message: bankfroms });

}



async function Insert_datadep_Kbiz(params, fron_bank) {
    function conRes(res) {
        return Object.values(JSON.parse(JSON.stringify(res)));
    }
    async function sreat(str) {
        let d = await Request_All.findOne({
            where: {
                description: str,
            },
        });
        return d;
    }
    function splitStr(str) {
        // Function to split string
        var string = str.split(" ");

        return string;
    }
    function normalizeName(name) {
        // Remove common titles (adjust the regex as needed)
        name = name.replace(/^(miss|mr\.|น\.ส\.|นาย)\s+/i, "");

        // Convert to lowercase and trim whitespace
        name = name.trim().toLowerCase();

        return name;
    }
    for (const rr of params) {
        let cleanedAccountNumber = "";
        let req_tpye = "";
        let bank_to = "";

        if (rr.statement.transNameTh == "รับโอนเงิน") {
            let stat = "ฝากเงิน";

            if (rr.statement.transType == "FTOT") {
                cleanedAccountNumber = Array.from(rr.statement.toAccountNumber)
                    .filter((char) => char !== "x" && char !== "-")
                    .join("");
                req_tpye = "BANKPAY";
                bank_to = "kbank";
            } else if (rr.statement.transType == "FTOB") {
                bank_to = rr.statement.bankNameEn;
                cleanedAccountNumber = rr.statement.toAccountNo;
                req_tpye = "BANKPAY";
            } else if (rr.statement.transType == "FTPP") {
                cleanedAccountNumber = Array.from(rr.statement.toAccountNo)
                    .filter((char) => char !== "x" && char !== "-")
                    .join("");

                bank_to = rr.statement.bankNameEn;
                req_tpye = "QRPAY";
            }

            //  let txn_types = md5(rr.statement.depositAmount + rr.statement.transDate+cleanedAccountNumber);
            const existingTransaction = await TransactionsV2.findOne({
                where: {
                    merchantOrderId: rr.statement.origRqUid // Assuming transactionRefId is unique from the bank
                }
            });
            if (existingTransaction) {
                console.log(`Transaction ${rr.statement.origRqUid} already processed. Skipping.`);
                continue;
            }

            let customer = "";
            if (bank_to == "kbank") {
                let normalizedThai = ""; // "จินตนา สุทธิวงศ์"
                let rrto = rr.statement.toAccountNameTh;
                // ตรวจสอบว่า rr.name_to เป็น string หรือไม่
                if (typeof rrto === "string") {
                    // ลบเครื่องหมายบวกทั้งหมด

                    rrto = rrto.replace(/\+/g, ""); // Remove '+' symbols
                    rrto = rrto.trim().toLowerCase(); // Trim whitespace and convert to lowercase

                    // Remove common prefixes (adjust the regex as needed)
                    // rrto = rrto.replace(/^(miss|mr\.|น\.ส\.|นาย)\s+/i, "");
                    rrto = rrto.replace(
                        /^(mrs\.|miss|ms\.|mr\.|dr\.|นางสาว|น\.ส\.|นาง|นาย|ด\.ช\.|ด\.ญ\.)\s+/i,
                        ""
                    );

                    normalizedEnglish = normalizeName(rrto);
                    // "jintana sud"
                    normalizedThai = normalizeName(rrto); // "จินตนา สุทธิวงศ์"

                    // console.log(normalizedThai);
                    // console.log(normalizedThai);
                } else {
                    console.error("rr.name_to is not a string");
                }


                //  console.log(rrto)
                customer = await Customers.findOne({
                    where: {
                        //userStatus: 1,
                        //rr.accnum = 1097
                        account_no: {
                            [Op.like]: `%${cleanedAccountNumber}%`,
                        },

                        [Op.or]: [
                            {
                                name: {
                                    [Op.like]: `%${normalizedThai}%`,
                                },
                            },

                        ],

                        merchantId: fron_bank.merchantId,
                    },
                });

                let objects = await Create_deposits.findOne({
                    where: {
                        status: "PENDING",
                        customerAccountNo: {
                            [Op.like]: `%${cleanedAccountNumber}%`,
                        },
                        amount: rr.statement.depositAmount
                    },
                });



                let create_deposits_idd = null;

                if (objects) {
                    const [errUpdate, updateResult] = await to(
                        Create_deposits.update(
                            {
                                status: "SUCCESS",
                                remark: `Payment confirmed via transaction ${rr.statement.origRqUid}`,
                                userId: rr.statement.origRqUid,
                            },
                            {
                                where: { id: objects.id },
                            }
                        )
                    );

                    create_deposits_idd = objects.id;
                    create_uuid = objects.uuid;
                    referenceIds = objects.referenceId;
                    if (customer) {
                        const merchant = await Merchant.findOne({ where: { id: fron_bank.merchantId } });
                        if (!merchant) {
                            console.log(`Merchant not found for id: ${fron_bank.merchantId}`);
                            continue;
                        }



                        const depositAmount = parseFloat(rr.statement.depositAmount);
                        // For now, assuming no deposit fees. If there are, this needs to be calculated.
                        const transferAmount = depositAmount;
                        const fee = depositAmount - transferAmount;

                        const newTransactionData = {
                            logUuid: generateUuid(),
                            clientCode: customer.client_code || "",
                            qrcode: null,
                            slip_url: "",
                            partnerCode: merchant.id,
                            referenceId: referenceIds,
                            merchantOrderId: rr.statement.origRqUid,
                            platformOrderId: create_uuid,
                            CustomersId: customer.id,
                            customer: customer.customer_uuid,
                            amount: depositAmount,
                            transferAmount: transferAmount,
                            currency: "THB",
                            settleCurrency: "THB",
                            type: "deposit",
                            status: "SUCCESS",
                            note: rr.statement.origRqUid || "Deposit from KTB Business",
                            eventCreatedAt: new Date(rr.statement.transDate),
                            eventUpdatedAt: Date.now(),
                            bank: {
                                accountNo: customer.account_no, // ใช้จากข้อมูลลูกค้า
                                accountName: customer.name,     // ใช้จากข้อมูลลูกค้า
                                bankCode: customer.bank_code,   // ใช้จากข้อมูลลูกค้า
                                // หากต้องการใช้ extractedBankCode/accountNumber ให้พิจารณาว่าข้อมูลใดควรมีความสำคัญกว่า
                                // extractedBankCode: extractedBankCode,
                                extractedAccountNumber: cleanedAccountNumber,
                            },
                            rate: 1,
                            channelName: merchant.name || "DEFAULT_CHANNEL",
                            fee: fee,
                            feePlatform: 0,
                            feeSale: 0,
                            feePartner: 0,
                            settleAmount: transferAmount,
                            settleRate: 1,
                            rateDisplay: 1,
                            refUuid: rr.statement.origRqUid,
                            //create_deposits_id: null, // No Create_deposits record in this flow
                            feePayment: 0,
                            profit: 0,
                            balance: parseFloat(merchant.balance) + transferAmount,
                            updatedBy: "system",
                            create_deposits_id: create_deposits_idd,
                            merchantId: fron_bank.merchantId
                        };

                        if (referenceIds) {
                            await TransactionsV2.create(newTransactionData);

                        }

                        await Merchant.update(
                            { balance: parseFloat(merchant.balance) + transferAmount },
                            { where: { id: merchant.id } }
                        );

                        let data_member = await Apicllback.submitDepositTransaction(newTransactionData, merchant);



                        //  console.log(`Processed deposit for ${customer.name} amount ${depositAmount}`);
                    }
                } else {
                    if (customer) {
                        const merchant = await Merchant.findOne({ where: { id: fron_bank.merchantId } });
                        if (!merchant) {
                            console.log(`Merchant not found for id: ${fron_bank.merchantId}`);
                            continue;
                        }



                        const depositAmount = parseFloat(rr.statement.depositAmount);
                        // For now, assuming no deposit fees. If there are, this needs to be calculated.
                        const transferAmount = depositAmount;
                        const fee = depositAmount - transferAmount;

                        const newTransactionData = {
                            logUuid: generateUuid(),
                            clientCode: customer.client_code || "",
                            qrcode: null,
                            slip_url: "",
                            partnerCode: merchant.id,
                            referenceId: null,
                            merchantOrderId: rr.statement.origRqUid,
                            platformOrderId: null,
                            CustomersId: customer.id,
                            customer: customer.customer_uuid,
                            amount: depositAmount,
                            transferAmount: transferAmount,
                            currency: "THB",
                            settleCurrency: "THB",
                            type: "deposit",
                            status: "SUCCESS",
                            note: rr.statement.origRqUid || "Deposit from KTB Business",
                            eventCreatedAt: new Date(rr.statement.transDate),
                            eventUpdatedAt: Date.now(),
                            bank: {
                                accountNo: customer.account_no, // ใช้จากข้อมูลลูกค้า
                                accountName: customer.name,     // ใช้จากข้อมูลลูกค้า
                                bankCode: customer.bank_code,   // ใช้จากข้อมูลลูกค้า
                                // หากต้องการใช้ extractedBankCode/accountNumber ให้พิจารณาว่าข้อมูลใดควรมีความสำคัญกว่า
                                // extractedBankCode: extractedBankCode,
                                extractedAccountNumber: cleanedAccountNumber,
                            },
                            rate: 1,
                            channelName: merchant.name || "DEFAULT_CHANNEL",
                            fee: fee,
                            feePlatform: 0,
                            feeSale: 0,
                            feePartner: 0,
                            settleAmount: transferAmount,
                            settleRate: 1,
                            rateDisplay: 1,
                            refUuid: rr.statement.origRqUid,
                            //create_deposits_id: null, // No Create_deposits record in this flow
                            feePayment: 0,
                            profit: 0,
                            balance: parseFloat(merchant.balance) + transferAmount,
                            updatedBy: "system",
                            create_deposits_id: create_deposits_idd,
                            merchantId: fron_bank.merchantId
                        };

                        await TransactionsV2.create(newTransactionData);

                        await Merchant.update(
                            { balance: parseFloat(merchant.balance) + transferAmount },
                            { where: { id: merchant.id } }
                        );

                        let data_member = await Apicllback.submitDepositTransaction(newTransactionData, merchant);



                        //  console.log(`Processed deposit for ${customer.name} amount ${depositAmount}`);
                    }
                }
















            } else {

                customer = await Customers.findOne({
                    where: {
                        //userStatus: 1,
                        //rr.accnum = 1097
                        account_no: {
                            [Op.like]: `%${cleanedAccountNumber}%`,
                        },
                        merchantId: fron_bank.merchantId,
                    },
                });

                let objects = await Create_deposits.findOne({
                    where: {
                        status: "PENDING",
                        customerAccountNo: {
                            [Op.like]: `%${cleanedAccountNumber}%`,
                        },
                        amount: rr.statement.depositAmount
                    },
                });



                let create_deposits_idd = null;

                if (objects) {
                    const [errUpdate, updateResult] = await to(
                        Create_deposits.update(
                            {
                                status: "SUCCESS",
                                remark: `Payment confirmed via transaction ${rr.statement.origRqUid}`,
                                userId: rr.statement.origRqUid,
                            },
                            {
                                where: { id: objects.id },
                            }
                        )
                    );

                    create_deposits_idd = objects.id;
                    create_uuid = objects.uuid;
                    referenceIds = objects.referenceId;
                    if (customer) {
                        const merchant = await Merchant.findOne({ where: { id: fron_bank.merchantId } });
                        if (!merchant) {
                            console.log(`Merchant not found for id: ${fron_bank.merchantId}`);
                            continue;
                        }



                        const depositAmount = parseFloat(rr.statement.depositAmount);
                        // For now, assuming no deposit fees. If there are, this needs to be calculated.
                        const transferAmount = depositAmount;
                        const fee = depositAmount - transferAmount;

                        const newTransactionData = {
                            logUuid: generateUuid(),
                            clientCode: customer.client_code || "",
                            qrcode: null,
                            slip_url: "",
                            partnerCode: merchant.id,
                            referenceId: referenceIds,
                            merchantOrderId: rr.statement.origRqUid,
                            platformOrderId: create_uuid,
                            CustomersId: customer.id,
                            customer: customer.customer_uuid,
                            amount: depositAmount,
                            transferAmount: transferAmount,
                            currency: "THB",
                            settleCurrency: "THB",
                            type: "deposit",
                            status: "SUCCESS",
                            note: rr.statement.origRqUid || "Deposit from KTB Business",
                            eventCreatedAt: new Date(rr.statement.transDate),
                            eventUpdatedAt: Date.now(),
                            bank: {
                                accountNo: customer.account_no, // ใช้จากข้อมูลลูกค้า
                                accountName: customer.name,     // ใช้จากข้อมูลลูกค้า
                                bankCode: customer.bank_code,   // ใช้จากข้อมูลลูกค้า
                                // หากต้องการใช้ extractedBankCode/accountNumber ให้พิจารณาว่าข้อมูลใดควรมีความสำคัญกว่า
                                // extractedBankCode: extractedBankCode,
                                extractedAccountNumber: cleanedAccountNumber,
                            },
                            rate: 1,
                            channelName: merchant.name || "DEFAULT_CHANNEL",
                            fee: fee,
                            feePlatform: 0,
                            feeSale: 0,
                            feePartner: 0,
                            settleAmount: transferAmount,
                            settleRate: 1,
                            rateDisplay: 1,
                            refUuid: rr.statement.origRqUid,
                            //create_deposits_id: null, // No Create_deposits record in this flow
                            feePayment: 0,
                            profit: 0,
                            balance: parseFloat(merchant.balance) + transferAmount,
                            updatedBy: "system",
                            create_deposits_id: create_deposits_idd,
                            merchantId: fron_bank.merchantId
                        };

                        if (referenceIds) {
                            await TransactionsV2.create(newTransactionData);

                        }

                        await Merchant.update(
                            { balance: parseFloat(merchant.balance) + transferAmount },
                            { where: { id: merchant.id } }
                        );

                        let data_member = await Apicllback.submitDepositTransaction(newTransactionData, merchant);



                        //  console.log(`Processed deposit for ${customer.name} amount ${depositAmount}`);
                    }
                } else {
                    if (customer) {
                        const merchant = await Merchant.findOne({ where: { id: fron_bank.merchantId } });
                        if (!merchant) {
                            console.log(`Merchant not found for id: ${fron_bank.merchantId}`);
                            continue;
                        }



                        const depositAmount = parseFloat(rr.statement.depositAmount);
                        // For now, assuming no deposit fees. If there are, this needs to be calculated.
                        const transferAmount = depositAmount;
                        const fee = depositAmount - transferAmount;

                        const newTransactionData = {
                            logUuid: generateUuid(),
                            clientCode: customer.client_code || "",
                            qrcode: null,
                            slip_url: "",
                            partnerCode: merchant.id,
                            referenceId: null,
                            merchantOrderId: rr.statement.origRqUid,
                            platformOrderId: null,
                            CustomersId: customer.id,
                            customer: customer.customer_uuid,
                            amount: depositAmount,
                            transferAmount: transferAmount,
                            currency: "THB",
                            settleCurrency: "THB",
                            type: "deposit",
                            status: "SUCCESS",
                            note: rr.statement.origRqUid || "Deposit from KTB Business",
                            eventCreatedAt: new Date(rr.statement.transDate),
                            eventUpdatedAt: Date.now(),
                            bank: {
                                accountNo: customer.account_no, // ใช้จากข้อมูลลูกค้า
                                accountName: customer.name,     // ใช้จากข้อมูลลูกค้า
                                bankCode: customer.bank_code,   // ใช้จากข้อมูลลูกค้า
                                // หากต้องการใช้ extractedBankCode/accountNumber ให้พิจารณาว่าข้อมูลใดควรมีความสำคัญกว่า
                                // extractedBankCode: extractedBankCode,
                                extractedAccountNumber: cleanedAccountNumber,
                            },
                            rate: 1,
                            channelName: merchant.name || "DEFAULT_CHANNEL",
                            fee: fee,
                            feePlatform: 0,
                            feeSale: 0,
                            feePartner: 0,
                            settleAmount: transferAmount,
                            settleRate: 1,
                            rateDisplay: 1,
                            refUuid: rr.statement.origRqUid,
                            //create_deposits_id: null, // No Create_deposits record in this flow
                            feePayment: 0,
                            profit: 0,
                            balance: parseFloat(merchant.balance) + transferAmount,
                            updatedBy: "system",
                            create_deposits_id: create_deposits_idd,
                            merchantId: fron_bank.merchantId
                        };

                        await TransactionsV2.create(newTransactionData);

                        await Merchant.update(
                            { balance: parseFloat(merchant.balance) + transferAmount },
                            { where: { id: merchant.id } }
                        );

                        let data_member = await Apicllback.submitDepositTransaction(newTransactionData, merchant);

                        //  console.log(`Processed deposit for ${customer.name} amount ${depositAmount}`);
                    }
                }
            }

        }
    }
}






async function forkbank(params) {

    const bubbles = [];


    for (const trans of params.recentTransactionList) {
        // let details = await mybank.getTransactionDetail(trans, acc,body.telephoneNumber);

        //console.log(details);

        const combinedData = { ...trans, ...details };

        let datasave = {
            statement: statement,
            statement_actionList: statement.recentTransactionList,
        };
        // console.log("\nStatement", statement, statement.recentTransactionList);

        await sleep(1000);

        const dataretun = {
            aAccountcc: acc,
            statement: combinedData,
        };
        bubbles.push(dataretun);
        //  console.log(dataretun);
    }

    return bubbles;
}



//const updateTransaction = async function (req, res) { };
const auto_deprosit = async function (req, res) {

    try {

        // let bankfrom = await BankAccount.findOne({
        //     where: {
        //         status_bank: "Active",
        //         accountType: "deposit",
        //         merchantId: 28
        //     },
        // });


        // //  console.log(bankfrom)


        // if (bankfrom.channel == "ktb-business") {

        //     let chackauth = await chack_auth(bankfrom.auth)


        //     if (chackauth.status == 500) {
        //         let login = await Apikrunthai_businessy.authenticateBankData(bankfrom)
        //     }

        //     let bankfrom2 = await BankAccount.findOne({
        //         where: {
        //             id: bankfrom.id,

        //         },
        //     });

        //     let chackauthhit = await chack_hotdep(bankfrom2.auth, bankfrom2.accounts)

        //     if (!chackauthhit.data || !chackauthhit.data.content) {
        //         console.log("No transaction content found.");
        //         return ReS(res, { message: "No transaction content found." });
        //     }


        //     //  let login = await Apikrunthai_businessy.authenticateBankData(bankfrom)

        //     for (const element of chackauthhit.data.content) {
        //         let extractedBankCode = null;
        //         let extractedAccountNumber = null;
        //         if (element.transactionComment) {
        //             const comment = element.transactionComment;
        //             const regex = /TR fr (\d{3})-(\d+)/; // Regex เพื่อจับรหัสธนาคาร (3 หลัก) และเลขบัญชี
        //             const match = comment.match(regex);

        //             if (match) {
        //                 extractedBankCode = match[1]; // รหัสธนาคาร (เช่น "014")
        //                 extractedAccountNumber = match[2]; // เลขบัญชี (เช่น "6522427352")

        //                 // Check if transaction already processed
        //                 const existingTransaction = await TransactionsV2.findOne({
        //                     where: {
        //                         merchantOrderId: element.transactionRefId // Assuming transactionRefId is unique from the bank
        //                     }
        //                 });

        //                 if (existingTransaction) {
        //                     console.log(`Transaction ${element.transactionRefId} already processed. Skipping.`);
        //                     continue;
        //                 }

        //                 let customer = await Customers.findOne({
        //                     where: {
        //                         account_no: extractedAccountNumber
        //                     }
        //                 });

        //                 let objects = await Create_deposits.findOne({
        //                     where: {
        //                         status: "PENDING",
        //                         customerAccountNo: extractedAccountNumber
        //                     },
        //                 });

        //                 let create_deposits_idd = null;

        //                 if (objects) {
        //                     const [errUpdate, updateResult] = await to(
        //                         Create_deposits.update(
        //                             {
        //                                 status: "SUCCESS",
        //                                 remark: `Payment confirmed via transaction ${element.transactionRefId}`,
        //                                 userId: element.transactionRefId,
        //                             },
        //                             {
        //                                 where: { id: objects.id },
        //                             }
        //                         )
        //                     );

        //                     create_deposits_idd = objects.id;
        //                     create_uuid = objects.uuid;
        //                     referenceIds = objects.referenceId;

        //                 }


        //                 if (customer) {
        //                     const merchant = await Merchant.findOne({ where: { id: bankfrom.merchantId } });
        //                     if (!merchant) {
        //                         console.log(`Merchant not found for id: ${bankfrom.merchantId}`);
        //                         continue;
        //                     }



        //                     const depositAmount = parseFloat(element.deposit);
        //                     // For now, assuming no deposit fees. If there are, this needs to be calculated.
        //                     const transferAmount = depositAmount;
        //                     const fee = depositAmount - transferAmount;

        //                     const newTransactionData = {
        //                         logUuid: generateUuid(),
        //                         clientCode: customer.client_code || "",
        //                         qrcode: null,
        //                         slip_url: "",
        //                         partnerCode: merchant.id,
        //                         referenceId: referenceIds,
        //                         merchantOrderId: element.transactionRefId,
        //                         platformOrderId: create_uuid,
        //                         CustomersId: customer.id,
        //                         customer: customer.customer_uuid,
        //                         amount: depositAmount,
        //                         transferAmount: transferAmount,
        //                         currency: "THB",
        //                         settleCurrency: "THB",
        //                         type: "deposit",
        //                         status: "SUCCESS",
        //                         note: element.transactionComment || "Deposit from KTB Business",
        //                         eventCreatedAt: new Date(element.transactionDateTime),
        //                         eventUpdatedAt: Date.now(),
        //                         bank: {
        //                             accountNo: customer.account_no, // ใช้จากข้อมูลลูกค้า
        //                             accountName: customer.name,     // ใช้จากข้อมูลลูกค้า
        //                             bankCode: customer.bank_code,   // ใช้จากข้อมูลลูกค้า
        //                             // หากต้องการใช้ extractedBankCode/accountNumber ให้พิจารณาว่าข้อมูลใดควรมีความสำคัญกว่า
        //                             extractedBankCode: extractedBankCode,
        //                             extractedAccountNumber: extractedAccountNumber,
        //                         },
        //                         rate: 1,
        //                         channelName: merchant.name || "DEFAULT_CHANNEL",
        //                         fee: fee,
        //                         feePlatform: 0,
        //                         feeSale: 0,
        //                         feePartner: 0,
        //                         settleAmount: transferAmount,
        //                         settleRate: 1,
        //                         rateDisplay: 1,
        //                         refUuid: element.transactionRefId,
        //                         //create_deposits_id: null, // No Create_deposits record in this flow
        //                         feePayment: 0,
        //                         profit: 0,
        //                         balance: parseFloat(merchant.balance) + transferAmount,
        //                         updatedBy: "system",
        //                         create_deposits_id: create_deposits_idd,
        //                         merchantId: bankfrom2.merchantId
        //                     };

        //                     if (referenceIds) {
        //                         await TransactionsV2.create(newTransactionData);

        //                     }

        //                     await Merchant.update(
        //                         { balance: parseFloat(merchant.balance) + transferAmount },
        //                         { where: { id: merchant.id } }
        //                     );

        //                     let data_member = await Apicllback.submitDepositTransaction(newTransactionData, merchant);



        //                     //  console.log(`Processed deposit for ${customer.name} amount ${depositAmount}`);
        //                 }
        //                 // console.log(`Extracted Bank Code: ${extractedBankCode}`);
        //             } else {
        //                 //  console.log("Could not extract bank code and account number from transactionComment.");
        //             }
        //         }

        //     }

        //     return ReS(res, { message: "Auto deposit process completed." });

        // } else if (bankfrom.channel == "k-biz") {


        // }
        let bankfroms = await BankAccount.findAll({
            where: {
                status_bank: "Active",
                accountType: "deposit",
                // merchantId: 28
            },
        });


        for (const bankfrom of bankfroms) {


            if (bankfrom.channel == "ktb-business") {
                let chackauth = await chack_auth(bankfrom.auth)


                if (chackauth.status == 500) {
                    let login = await Apikrunthai_businessy.authenticateBankData(bankfrom)
                }

                let bankfrom2 = await BankAccount.findOne({
                    where: {
                        id: bankfrom.id,

                    },
                });
                let chackauthhit = await chack_hotdep(bankfrom2.auth, bankfrom2.accounts)


                for (const element of chackauthhit.data.content) {
                    let extractedBankCode = null;
                    let extractedAccountNumber = null;
                    if (element.transactionComment) {
                        const comment = element.transactionComment;
                        const regex = /TR fr (\d{3})-(\d+)/; // Regex เพื่อจับรหัสธนาคาร (3 หลัก) และเลขบัญชี
                        const match = comment.match(regex);

                        if (match) {
                            extractedBankCode = match[1]; // รหัสธนาคาร (เช่น "014")
                            extractedAccountNumber = match[2]; // เลขบัญชี (เช่น "6522427352")

                            // Check if transaction already processed
                            const existingTransaction = await TransactionsV2.findOne({
                                where: {
                                    merchantOrderId: element.transactionRefId // Assuming transactionRefId is unique from the bank
                                }
                            });

                            if (existingTransaction) {
                                console.log(`Transaction ${element.transactionRefId} already processed. Skipping.`);
                                continue;
                            }

                            let customer = await Customers.findOne({
                                where: {
                                    account_no: extractedAccountNumber,
                                    merchantId: bankfrom.merchantId
                                }
                            });
                                const amounts = parseFloat(element.deposit);

                            let objects = await Create_deposits.findOne({
                                where: {
                                    status: "PENDING",
                                    customerAccountNo: extractedAccountNumber
                                },
                            });
                            // ค้นหาการตั้งค่าค่าธรรมเนียมการทำธุรกรรม
                            const TransactionFeeSettings = await TransactionFeeSetting.findOne({ where: { merchantId: bankfrom.merchantId } });

                            // ตรวจสอบว่ามีการตั้งค่าค่าธรรมเนียมหรือไม่ และค่าธรรมเนียมเป็นตัวเลขที่ถูกต้อง
                            const depositFeePercentage = TransactionFeeSettings ? parseFloat(TransactionFeeSettings.depositFeePercentage) : 0;
                            const amounts_tranfger = amounts - (amounts * (depositFeePercentage / 100));


                            let create_deposits_idd = null;

                            if (objects) {
                                const [errUpdate, updateResult] = await to(
                                    Create_deposits.update(
                                        {
                                            status: "SUCCESS",
                                            remark: `Payment confirmed via transaction ${element.transactionRefId}`,
                                            userId: element.transactionRefId,
                                        },
                                        {
                                            where: { id: objects.id },
                                        }
                                    )
                                );

                                create_deposits_idd = objects.id;
                                create_uuid = objects.uuid;
                                referenceIds = objects.referenceId;

                            }


                            if (customer) {
                                const merchant = await Merchant.findOne({ where: { id: bankfrom.merchantId } });
                                if (!merchant) {
                                    console.log(`Merchant not found for id: ${bankfrom.merchantId}`);
                                    continue;
                                }



                                const depositAmount = parseFloat(element.deposit);
                                // For now, assuming no deposit fees. If there are, this needs to be calculated.
                                const transferAmount = depositAmount;
                                const fee = depositAmount - transferAmount;

                                const newTransactionData = {
                                    logUuid: generateUuid(),
                                    clientCode: customer.client_code || "",
                                    qrcode: null,
                                    slip_url: "",
                                    partnerCode: merchant.id,
                                    referenceId: referenceIds,
                                    merchantOrderId: element.transactionRefId,
                                    platformOrderId: create_uuid,
                                    CustomersId: customer.id,
                                    customer: customer.customer_uuid,
                                    amount: depositAmount,
                                    transferAmount: transferAmount,
                                    currency: "THB",
                                    settleCurrency: "THB",
                                    type: "deposit",
                                    status: "SUCCESS",
                                    note: element.transactionComment || "Deposit from KTB Business",
                                    eventCreatedAt: new Date(element.transactionDateTime),
                                    eventUpdatedAt: Date.now(),
                                    bank: {
                                        accountNo: customer.account_no, // ใช้จากข้อมูลลูกค้า
                                        accountName: customer.name,     // ใช้จากข้อมูลลูกค้า
                                        bankCode: customer.bank_code,   // ใช้จากข้อมูลลูกค้า
                                        // หากต้องการใช้ extractedBankCode/accountNumber ให้พิจารณาว่าข้อมูลใดควรมีความสำคัญกว่า
                                        extractedBankCode: extractedBankCode,
                                        extractedAccountNumber: extractedAccountNumber,
                                    },
                                    rate: 1,
                                    channelName: merchant.name || "DEFAULT_CHANNEL",
                                    fee: amounts_tranfger,
                                    feePlatform: 0,
                                    feeSale: 0,
                                    feePartner: 0,
                                    settleAmount: transferAmount,
                                    settleRate: 1,
                                    rateDisplay: 1,
                                    refUuid: element.transactionRefId,
                                    //create_deposits_id: null, // No Create_deposits record in this flow
                                    feePayment: 0,
                                    profit: 0,
                                    balance: parseFloat(merchant.balance) + transferAmount,
                                    updatedBy: "system",
                                    create_deposits_id: create_deposits_idd,
                                    merchantId: bankfrom2.merchantId
                                };

                                if (referenceIds) {
                                    await TransactionsV2.create(newTransactionData);

                                }

                                await Merchant.update(
                                    { balance: parseFloat(merchant.balance) + transferAmount },
                                    { where: { id: merchant.id } }
                                );

                                let data_member = await Apicllback.submitDepositTransaction(newTransactionData, merchant);



                                //  console.log(`Processed deposit for ${customer.name} amount ${depositAmount}`);
                            }
                            // console.log(`Extracted Bank Code: ${extractedBankCode}`);
                        } else {
                            //  console.log("Could not extract bank code and account number from transactionComment.");
                        }
                    }

                }
            } else if (bankfrom.channel == "k-biz") {




                //   let chack = await Apikbank.Loginkbank_auth(bankfrom)
                let getTransactionLists = await Apikbank.getTransactionList(bankfrom)


                let fors = await Insert_datadep_Kbiz(getTransactionLists, bankfrom)
                // console.log(fors);




            } else if (bankfrom.channel == "scb-business") {




                //   let chack = await Apikbank.Loginkbank_auth(bankfrom)
                //  let getTransactionLists = await Apikbank.getTransactionList(bankfrom)


                // let fors = await Insert_datadep_Kbiz(getTransactionLists, bankfrom)
                console.log("fors");




            }

            return ReS(res, { message: "Auto deposit process completed." });

        }


    } catch (err) {
        console.log(err)
        return ReE(res, { message: "An error occurred during auto deposit.", error: err.message }, 500);
    }





};






module.exports = {
    auto_deprosit,
    chack_auth,
    krungthai_verrifyusers,
    create_tranferOder,
    auto_deprositv2

};
