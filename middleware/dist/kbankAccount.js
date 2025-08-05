"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kbankAccount = void 0;
const tslib_1 = require("tslib");
const axios_1 = (0, tslib_1.__importDefault)(require("axios"));
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
class kbankAccount {
    constructor(username, password, captchakey, userProfile = 0, language = 'th', cookie_path = '', retry_401 = false, sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }) {
        this.sessions = {
            ownerId: '',
            ownerType: '',
            token: '',
            ownerTypeIX: "",
            ownerIdIX: "",
            custType: "",
        };
        this.online_gateway = 'https://kbiz.kasikornbank.com';
        this.ib_gateway = 'https://kbiz.kasikornbank.com/services';
        this.retry_401 = false;
        this.sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        };
        this.credentials = {
            username: username,
            password: password,
            userProfile: userProfile,
            language: language,
        };
        this.retry_401 = retry_401;
        this.cookie_file = cookie_path;
        this.captchakey = captchakey;
        this.sleep = sleep;
        this.jar = new CookieJar();
        this.client = wrapper(axios_1.default.create());
    }
    login() {
        return new Promise(async (resolve, reject) => {
            try {
                const loginpage = await this.client.request({
                    url: this.online_gateway + '/authen/login.do',
                    method: "get",
                    jar: this.jar,
                });
                let tokenid = loginpage.data.match(/id="tokenId" value="(.*)";/);
                let form = new URLSearchParams();
                form.append('userName', this.credentials.username);
                form.append('password', this.credentials.password);
                form.append('tokenId', tokenid);
                form.append('cmd', 'authenticate');
                form.append('locale', this.credentials.language);
                form.append('custType', '');
                form.append('captcha', '');
                form.append('app', '0');
                let flog = await this.client.request({
                    method: 'post',
                    url: this.online_gateway + '/authen/login.do',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    data: form,
                    jar: this.jar,
                    withCredentials: true
                });
                let login = await this.client.request({
                    method: 'get',
                    url: this.online_gateway + '/authen/ib/redirectToIB.jsp',
                    jar: this.jar,
                    withCredentials: true
                });
                let logdat = login.data;
                let regx = logdat.match(/window\.top\.location\.href = "(.*)";/);
                if (regx) {
                    let urlDataRsso = regx[1];
                    let dataRsso = urlDataRsso.split('dataRsso=')[1];
                    await this.client.request({
                        method: "get",
                        jar: this.jar,
                        url: urlDataRsso,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                        },
                        withCredentials: true
                    });
                    return resolve(dataRsso);
                }
                return reject(logdat);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getCredentials(json = false) {
        return json ? JSON.parse(this.credentials) : this.credentials;
    }
    setCredentials(credentials, json = false) {
        this.credentials = json ? JSON.stringify(credentials) : credentials;
    }
    getHeaders(refresh = true) {
        return {
            "Content-Type": "application/json",
            "X-IB-ID": this.sessions.ownerId,
            "X-SESSION-IBID": this.sessions.ownerId,
            "X-REQUEST-ID": this.requestID(),
            "Authorization": this.sessions.token,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46",
            "X-RE-FRESH": refresh ? "Y" : "N",
            "X-VERIFY": "Y",
        };
    }
    getSession(dataRsso) {
        return new Promise(async (resolve, reject) => {
            var _a;
            try {
                let resp = await this.client.request({
                    method: "post",
                    url: this.ib_gateway + '/api/authentication/validateSession',
                    data: JSON.stringify({ dataRsso: dataRsso }),
                    jar: this.jar,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json, text/plain, */*",
                    },
                    withCredentials: true
                });
                this.sessions.token = resp.headers['x-session-token'];
                let profile = resp.data.data.userProfiles[this.credentials.userProfile];
                this.sessions.ownerId = profile.ibId;
                this.sessions.ownerType = profile.roleList[0].roleName;
                this.sessions.custType = profile.custType;
                this.sessions.ownerTypeIX = "Company";
                this.sessions.ownerIdIX = profile.companyId;
                if (resp.data.data.userProfiles[this.credentials.userProfile].blacklist == "1") {
                    console.log(`Blacklist Detect !`);
                    const keyid = await axios_1.default.post(`http://2captcha.com/in.php?key=${this.captchakey}&method=userrecaptcha&googlekey=${resp.data.data.recaptchaSiteKey}&pageurl=https://kbiz.kasikornbankgroup.com/`);
                    console.log(`KEY CAPTCHA : ${keyid.data.split("|")[1]}`);
                    await this.sleep(30000);
                    let verifykey = await axios_1.default.post(`http://2captcha.com/res.php?key=${this.captchakey}&action=get&id=${keyid.data.split("|")[1]}`);
                    while (!verifykey.data.split("|")[1]) {
                        console.log(`CAPCHA NOT READY & Wait again for 10 Sec`);
                        await this.sleep(10000);
                        verifykey = await axios_1.default.post(`http://2captcha.com/res.php?key=${this.captchakey}&action=get&id=${keyid.data.split("|")[1]}`);
                    }
                    const checkverify = await axios_1.default.post(this.ib_gateway + '/api/authentication/recaptchaVerify', JSON.stringify({ recaptchaResponse: verifykey.data.split("|")[1] }), {
                        headers: {
                            "Content-Type": "application/json",
                            "X-IB-ID": this.sessions.ownerId,
                            "Authorization": this.sessions.token,
                            "X-URL": '',
                            "X-REQUEST-ID": ''
                        },
                        withCredentials: true
                    });
                    if (checkverify.data.data.verified == true) {
                        console.log(`Verify Pass`);
                    }
                    else {
                        return reject(`Verify Failed`);
                    }
                }
                return resolve(resp);
            }
            catch (e) {
                if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) == 401 && this.retry_401) {
                    console.log(e);
                    let newdataRsso = await this.login();
                    resolve(await this.getSession(newdataRsso));
                }
                return reject(e);
            }
        });
    }
    refreshSession(url) {
        return new Promise(async (resolve, reject) => {
            try {
                let resp = await this.client.request({
                    method: "post",
                    url: this.ib_gateway + '/api/refreshSession',
                    data: {},
                    jar: this.jar,
                    headers: {
                        "Content-Type": "application/json",
                        "X-IB-ID": this.sessions.ownerId,
                        "X-SESSION-IBID": this.sessions.ownerId,
                        "X-REQUEST-ID": this.requestID(),
                        "Authorization": this.sessions.token,
                        "Referer": url,
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46",
                        "X-URL": url,
                        "X-RE-FRESH": "Y",
                        "X-VERIFY": "Y",
                    },
                    withCredentials: true
                });
                this.sessions.token = resp.headers['x-session-token'];
                this.getBlacklistFlag();
                return resolve(resp);
            }
            catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    }
    getBlacklistFlag() {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await this.client.request({
                    url: this.ib_gateway + "/api/configuration/getBlacklistFlag",
                    method: "post",
                    data: {},
                    headers: this.getHeaders(false),
                    jar: this.jar
                });
                resolve(res.data);
            }
            catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    }
    requestID() {
        const now = new Date();
        const dateString = now.getFullYear().toString().padStart(4, '0') + // year
            (now.getMonth() + 1).toString().padStart(2, '0') + // month
            now.getDate().toString().padStart(2, '0') + // day
            now.getHours().toString().padStart(2, '0') + // hour
            now.getMinutes().toString().padStart(2, '0') + // minute
            now.getSeconds().toString().padStart(2, '0') + // second
            now.getMilliseconds().toString().padStart(3, '0'); // milliseconds
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        const finalString = dateString + randomNum;
        return finalString;
    }
    getBankAccount(checkBalance = 'Y', accType = 'CA,SA,FD', nicknameType = 'OWNAC') {
        return new Promise(async (resolve, reject) => {
            try {
                let resp = await this.client.request({
                    method: "post",
                    jar: this.jar,
                    url: this.ib_gateway + '/api/bankaccountget/getOwnBankAccountFromList',
                    data: JSON.stringify({
                        'accountType': accType,
                        'checkBalance': checkBalance,
                        'custType': this.sessions.custType,
                        'language': this.credentials.language,
                        'nicknameType': nicknameType,
                        'ownerId': this.sessions.custType == "IX" ? this.sessions.ownerIdIX : this.sessions.ownerId,
                        'ownerType': this.sessions.custType == "IX" ? this.sessions.ownerTypeIX : this.sessions.ownerType,
                    }),
                    headers: this.getHeaders(false),
                    withCredentials: true
                });
                return resolve(resp.data.data);
            }
            catch (e) {
                console.log(e);
                if (e.response.status == 401 && this.retry_401) {
                    let newResso = await this.login();
                    resolve(await this.getBankAccount(checkBalance, accType, nicknameType));
                }
                return reject(e);
            }
        });
    }
    getAccountSummary(pageAmount = 6) {
        return new Promise(async (resolve, reject) => {
            try {
                let resp = await this.client.request({
                    url: this.ib_gateway + '/api/accountsummary/getAccountSummaryList',
                    data: JSON.stringify({
                        'custType': this.sessions.custType,
                        'isReload': 'N',
                        'lang': this.credentials.language,
                        'nicknameType': 'OWNAC',
                        'ownerId': this.sessions.ownerIdIX,
                        'ownerType': this.sessions.ownerTypeIX,
                        'pageAmount': pageAmount,
                    }),
                    headers: this.getHeaders(false),
                    withCredentials: true
                });
                return resolve(resp.data);
            }
            catch (e) {
                if (e.response.status == 401 && this.retry_401) {
                    await this.login();
                    resolve(await this.getAccountSummary(pageAmount));
                }
                return reject(e);
            }
        });
    }
    getStatement(accountInfo, start_date, end_date) {
        return new Promise(async (resolve, reject) => {
            try {
                let currentTime = new Date();
                let startDateString = this.convertTime(currentTime);
                let endDateString = startDateString;
                if (start_date && typeof start_date == 'object') {
                    startDateString = this.convertTime(start_date);
                }
                else if (start_date && typeof start_date == 'string') {
                    startDateString = start_date;
                }
                if (end_date && typeof end_date == 'object') {
                    endDateString = this.convertTime(end_date);
                }
                else if (end_date && typeof end_date == 'string') {
                    endDateString = end_date;
                }
                let resp = await this.client.request({
                    url: this.ib_gateway + '/api/accountstatement/generateAccountStatement',
                    method: "post",
                    jar: this.jar,
                    data: JSON.stringify({
                        "isEmail": false,
                        "accountId": accountInfo.accountNo,
                        "accountType": accountInfo.accountType,
                        "custType": this.sessions.custType,
                        "dateFrom": startDateString,
                        "dateTo": endDateString,
                        "requestDocType": "CSV",
                        "statementPeriodList": [],
                        "rcvEmail": "",
                        "language": "th",
                        "svcType": "SA02"
                    }),
                    headers: this.getHeaders(false),
                    withCredentials: true
                });
                return resolve(resp.data.data);
            }
            catch (e) {
                if (e.response.status == 401 && this.retry_401) {
                    await this.login();
                    resolve(await this.getStatement(accountInfo, start_date, end_date));
                }
                return reject(e);
            }
        });
    }
    getTransactionList(accountInfo, start_date, end_date, pageNo = 1, rowPerPage = 7) {
        return new Promise(async (resolve, reject) => {
            try {
                let currentTime = new Date();
                let startDateString = this.convertTime(currentTime);
                let endDateString = startDateString;
                if (start_date && typeof start_date == 'object') {
                    startDateString = this.convertTime(start_date);
                }
                else if (start_date && typeof start_date == 'string') {
                    startDateString = start_date;
                }
                if (end_date && typeof end_date == 'object') {
                    endDateString = this.convertTime(end_date);
                }
                else if (end_date && typeof end_date == 'string') {
                    endDateString = end_date;
                }
                let resp = await this.client.request({
                    url: this.ib_gateway + '/api/accountsummary/getRecentTransactionList',
                    method: "post",
                    jar: this.jar,
                    data: JSON.stringify({
                        'acctNo': accountInfo.accountNo,
                        'acctType': accountInfo.accountType,
                        'custType': this.sessions.custType,
                        'ownerType': this.sessions.ownerTypeIX,
                        'ownerId': this.sessions.ownerIdIX,
                        'pageNo': pageNo,
                        'rowPerPage': rowPerPage,
                        'refKey': '',
                        'startDate': startDateString,
                        'endDate': endDateString,
                    }),
                    headers: this.getHeaders(false),
                    withCredentials: true
                });
                return resolve(resp.data.data);
            }
            catch (e) {
                if (e.response.status == 401 && this.retry_401) {
                    await this.login();
                    resolve(await this.getTransactionList(accountInfo, start_date, end_date, pageNo, rowPerPage));
                }
                return reject(e);
            }
        });
    }
    convertTime(date) {
        return `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth()}/${date.getFullYear()}`;
    }
    promptpayTransfer(transfer_type, number, amount, ownAccount) {
        return new Promise(async (resolve, reject) => {
            try {
                let resp = await this.client.request({
                    method: "post",
                    url: this.ib_gateway + `/api/fundtransferPromptpay${this.sessions.custType == `I` ? `individual` : `business`}/inquiryFundTransferPromptpay`,
                    data: JSON.stringify({
                        amount: amount,
                        anyType: transfer_type,
                        anyValue: number,
                        attachFileName: "",
                        bulk: "N",
                        custType: this.sessions.custType,
                        effectiveDate: "",
                        favFlag: "N",
                        feeAmount: "0.00",
                        fromAccountName: ownAccount.accountName,
                        fromAccountNo: ownAccount.accountNo,
                        lang: "th",
                        memo: "",
                        memoTypeId: this.sessions.custType == "IX" ? "12" : "26",
                        notiEmailNote: "",
                        ownerId: this.sessions.ownerIdIX,
                        ownerType: this.sessions.ownerTypeIX,
                        scheduleFlag: "N",
                        smsLang: "th",
                        totalAmount: amount,
                        transType: "FTPP",
                        transferType: "Online",
                    }),
                    headers: this.getHeaders(false),
                    withCredentials: true
                });
                this.sessions.token = resp.headers['x-session-token'];
                return resolve(resp.data.data);
            }
            catch (e) {
                if (e.response.status == 401 && this.retry_401) {
                    await this.login();
                    resolve(await this.promptpayTransfer(transfer_type, number, amount, ownAccount));
                }
                reject(e);
            }
        });
    }
    promptpayPhoneTransfer(phone_number, amount, ownAccount) {
        return this.promptpayTransfer('02', phone_number, amount, ownAccount);
    }
    promptpayIDTransfer(phone_number, amount, ownAccount) {
        return this.promptpayTransfer('01', phone_number, amount, ownAccount);
    }
    bankTransferOther(bankCode, id, amount, ownAccount) {
        return this.bankTransfer(bankCode, id, amount, ownAccount, `/api/fundtransferOrft${this.sessions.custType == `I` ? `individual` : `business`}/inquiryFundTransferOrft`, this.sessions.custType == `I` ? "FTOT" : "FTOB");
    }
    bankTransferOtherOTP(transferData, otp) {
        return this.bankTransferSubmitOTP(transferData, otp, false);
    }
    bankTransferOrft(bankCode, id, amount, ownAccount) {
        return this.bankTransfer(bankCode, id, amount, ownAccount, `/api/fundtransferOther${this.sessions.custType == `I` ? `individual` : `business`}/inquiryFundTransferOther`, this.sessions.custType == `I` ? "FTOT" : "FTOB");
    }
    bankTransferOrftOTP(transferData, otp) {
        return this.bankTransferSubmitOTP(transferData, otp, true);
    }
    getTransactionDetail(transactionInfomation, accountInfo) {
        return new Promise(async (resolve, reject) => {
            if ((!transactionInfomation.proxyId || transactionInfomation.proxyId.length < 1) && (!accountInfo)) {
                return reject('Account info is required for this transaction details');
            }
            try {
                let payloadNew = { ...transactionInfomation };
                payloadNew.acctNo = transactionInfomation.proxyId && transactionInfomation.proxyId.length > 0 ? transactionInfomation.proxyId : accountInfo.accountNo;
                payloadNew.custType = this.sessions.custType;
                payloadNew.ownerId = this.sessions.ownerId;
                payloadNew.ownerType = this.sessions.ownerType;
                payloadNew.transDate = transactionInfomation.transDate.split(' ')[0];
                let resp = await this.client.request({
                    method: "post",
                    url: this.ib_gateway + '/api/accountsummary/getRecentTransactionDetail',
                    data: JSON.stringify(payloadNew),
                    headers: this.getHeaders(false),
                    withCredentials: true,
                    jar: this.jar
                });
                return resolve(resp.data.data);
            }
            catch (e) {
                if (e.response.status == 401 && this.retry_401) {
                    await this.login();
                    resolve(await this.getTransactionDetail(transactionInfomation, accountInfo));
                }
                return reject(e);
            }
        });
    }
    getSystemParameter(key = "min_amt", subCategory = "bahtnet") {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this.client.request({
                    url: this.ib_gateway + "/api/configuration/getSystemParameter",
                    method: "post",
                    jar: this.jar,
                    data: { category: "fundtransfer", subCategory: subCategory, key: key },
                    headers: this.getHeaders(false)
                });
                resolve(result.data);
            }
            catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    bankTransfer(bankCode, id, amount, ownAccount, url, tranType) {
        return new Promise(async (resolve, reject) => {
            var _a;
            try {
                await this.getSystemParameter("min_amt", "bahtnet");
                await this.getSystemParameter("cutoff_time", "bahtnet");
                await this.getSystemParameter("cutoff_time", "smart");
                await this.getSystemParameter("min_amt", "smart");
                let payload = {
                    amount: amount,
                    bankCode: bankCode,
                    beneficiaryNo: id,
                    bulk: "N",
                    custType: this.sessions.custType,
                    effectiveDate: "",
                    favFlag: "N",
                    feeAmount: "0.00",
                    fromAccountName: ownAccount.accountName,
                    fromAccountNo: ownAccount.accountNo,
                    lang: "th",
                    memo: "",
                    memoTypeId: this.sessions.custType == "IX" ? "12" : "26",
                    notiEmailNote: "",
                    ownerId: this.sessions.custType == "IX" ? this.sessions.ownerIdIX : this.sessions.ownerId,
                    ownerType: this.sessions.custType == "IX" ? this.sessions.ownerTypeIX : this.sessions.ownerType,
                    scheduleFlag: "N",
                    smsLang: "th",
                    totalAmount: amount,
                    transType: tranType,
                    transferType: "Online",
                };
                let resp = await this.client.request({
                    url: this.ib_gateway + url,
                    jar: this.jar,
                    method: "post",
                    data: JSON.stringify(payload),
                    headers: this.getHeaders(false),
                    withCredentials: true
                });
                this.sessions.token = resp.headers['x-session-token'];
                return resolve(resp.data.data);
            }
            catch (e) {
                console.log(e);
                if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) == 401 && this.retry_401) {
                    await this.login();
                    resolve(await this.bankTransfer(bankCode, id, amount, ownAccount, url, tranType));
                }
                reject(e);
            }
        });
    }
    bankTransferSubmitOTP(transferData, otp, isKBank = false) {
        return new Promise(async (resolve, reject) => {
            let json = JSON.stringify({
                actionAttachFile: "DEFAULT",
                amount: transferData.amount,
                bankCode: transferData.bankCode,
                beneficiaryName: transferData.beneficiaryName,
                beneficiaryNo: transferData.beneficiaryNo,
                bulk: transferData.bulk,
                custType: transferData.custType || this.sessions.custType,
                effectiveDate: "",
                feeAmount: transferData.feeAmount,
                fromAccountName: transferData.fromAccountName,
                fromAccountNo: transferData.fromAccountNo,
                lang: transferData.lang,
                memo: transferData.memo,
                memoTypeId: transferData.memoTypeId,
                otp: otp,
                ownerId: this.sessions.custType == "IX" ? this.sessions.ownerIdIX : this.sessions.ownerId,
                ownerType: this.sessions.custType == "IX" ? this.sessions.ownerTypeIX : this.sessions.ownerType,
                pac: transferData.pac,
                reqRefNo: transferData.reqRefNo,
                rqUID: transferData.rqUID,
                scheduleFlag: transferData.scheduleFlag,
                tokenUUID: transferData.tokenUUID,
                totalAmount: transferData.totalAmount,
                transType: transferData.transType,
                transferType: transferData.transferType,
            });
            try {
                let route = `/api/fundtransfer${isKBank ? `Other` : `Orft`}${this.sessions.custType == `I` ? `individual` : `business`}/confirmFundTransfer${isKBank ? `Other` : `Orft`}`;
                let url = `${this.ib_gateway}${route}`;
                let resp = await this.client.request({
                    url,
                    method: "post",
                    data: `------WebKitFormBoundaryxDsXmAAIGCfI5P5Z\r\nContent-Disposition: form-data; name="${isKBank ? `fundtransferOtherRequestModel` : `fundtransferOrftRequestModel`}"; filename="blob"\r\nContent-Type: application/json\r\n\r\n` + json + '\r\n------WebKitFormBoundaryxDsXmAAIGCfI5P5Z--',
                    headers: {
                        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryxDsXmAAIGCfI5P5Z',
                        "X-IB-ID": this.sessions.ownerId,
                        "X-SESSION-IBID": this.sessions.ownerId,
                        "X-REQUEST-ID": this.requestID(),
                        "Authorization": this.sessions.token,
                        "Referer": "https://kbiz.kasikornbankgroup.com/menu/fundtranfer/fundtranfer/fundtranfer-other",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46",
                        "X-URL": "https://kbiz.kasikornbankgroup.com/menu/fundtranfer/fundtranfer/fundtranfer-other",
                        "X-RE-FRESH": "N",
                        "X-VERIFY": "Y",
                    },
                    jar: this.jar,
                    withCredentials: true,
                });
                return resolve(resp.data);
            }
            catch (e) {
                if (e.response) {
                    if (e.response.status == 401 && this.retry_401) {
                        await this.login();
                        resolve(await this.bankTransferSubmitOTP(transferData, otp));
                    }
                    reject(e);
                }
                else {
                    reject(e);
                }
            }
        });
    }
    promptpaySubmitOTP(transferData, otp) {
        return new Promise(async (resolve, reject) => {
            let json = JSON.stringify({
                actionAttachFile: "DEFAULT",
                amount: transferData.amount,
                anyType: transferData.anyType,
                anyValue: transferData.anyValue,
                beneficiaryName: transferData.beneficiaryName,
                beneficiaryNo: transferData.beneficiaryNo,
                bulk: transferData.bulk,
                custType: transferData.custType || this.sessions.custType,
                effectiveDate: "",
                feeAmount: transferData.feeAmount,
                fromAccountName: transferData.fromAccountName,
                fromAccountNo: transferData.fromAccountNo,
                lang: transferData.lang,
                memo: transferData.memo,
                memoTypeId: transferData.memoTypeId,
                otp: otp,
                ownerId: this.sessions.ownerIdIX,
                ownerType: this.sessions.ownerTypeIX,
                pac: transferData.pac,
                reqRefNo: transferData.reqRefNo,
                rqUID: transferData.rqUID,
                scheduleFlag: transferData.scheduleFlag,
                tokenUUID: transferData.tokenUUID,
                totalAmount: transferData.totalAmount,
                transType: transferData.transType,
                transferType: transferData.transferType,
            });
            try {
                let url = this.ib_gateway + '/api/fundtransferPromptpay ${ this.session.custType = `I` ? `individual` : `business`}/confirmFundTransferPromptpay';
                let resp = await this.client.request({
                    url,
                    method: "post",
                    data: '------WebKitFormBoundaryxDsXmAAIGCfI5P5Z\r\nContent-Disposition: form-data; name="fundtransferPPRequestModel"; filename="blob"\r\nContent-Type: application/json\r\n\r\n' + json + '\r\n------WebKitFormBoundaryxDsXmAAIGCfI5P5Z--',
                    headers: {
                        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryxDsXmAAIGCfI5P5Z',
                        "X-IB-ID": this.sessions.ownerId,
                        "X-SESSION-IBID": this.sessions.ownerId,
                        "X-REQUEST-ID": this.requestID(),
                        "Authorization": this.sessions.token,
                        "Referer": "https://kbiz.kasikornbankgroup.com/menu/fundtranfer/fundtranfer/fundtranfer-other",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46",
                        "X-URL": "https://kbiz.kasikornbankgroup.com/menu/fundtranfer/fundtranfer/fundtranfer-other",
                        "X-RE-FRESH": "N",
                        "X-VERIFY": "Y",
                    },
                    jar: this.jar,
                    withCredentials: true,
                });
                return resolve(resp.data);
            }
            catch (e) {
                if (e.response) {
                    if (e.response.status == 401 && this.retry_401) {
                        await this.login();
                        resolve(await this.promptpaySubmitOTP(transferData, otp));
                    }
                    reject(e.response);
                }
                else {
                    reject(e);
                }
            }
        });
    }
}
exports.kbankAccount = kbankAccount;
//# sourceMappingURL=kbankAccount.js.map