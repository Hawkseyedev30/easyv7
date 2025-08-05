"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushBullet = void 0;
const tslib_1 = require("tslib");
const axios_1 = (0, tslib_1.__importDefault)(require("axios"));
class pushBullet {
    constructor(accessToken) {
        if (accessToken == null) {
            throw new Error("accessToken is required");
        }
        this.accessToken = accessToken;
    }
    getStringBeentween(str, start, end) {
        let str_ = ' ' + str;
        let ini = str_.indexOf(start);
        if (ini == -1)
            return '';
        ini += start.length;
        let len = str_.indexOf(end, ini);
        return str_.substring(ini, len);
    }
    devicesList() {
        return new Promise((resolve, reject) => {
            axios_1.default.get(`https://api.pushbullet.com/v2/devices`, {
                headers: {
                    'Access-Token': this.accessToken
                }
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    getSMS(iden) {
        //https://api.pushbullet.com/v2/permanents
        return new Promise((resolve, reject) => {
            axios_1.default.get(`https://api.pushbullet.com/v2/permanents/${iden}_threads`, {
                headers: {
                    'Access-Token': this.accessToken
                }
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    getSMSThread(iden, id) {
        return new Promise((resolve, reject) => {
            axios_1.default.get(`https://api.pushbullet.com/v2/permanents/${iden}_thread_${id}`, {
                headers: {
                    'Access-Token': this.accessToken
                }
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    getKBankOTP(iden) {
        return new Promise((resolve, reject) => {
            axios_1.default.get(`https://api.pushbullet.com/v2/permanents/${iden}_threads`, {
                headers: {
                    'Access-Token': this.accessToken
                }
            }).then(res => {
                for (const data of res.data.threads) {
                    if (data.recipients[0].name == 'KBank') {
                        let output_array = data.latest.body.match(/OTP=(\d{6}).*([a-zA-Z]{4})/);
                        if (output_array) {
                            return resolve({
                                ref: output_array[2],
                                otp_code: output_array[1],
                            });
                        }
                        else {
                            return resolve({
                                ref: '',
                                otp_code: '',
                            });
                        }
                    }
                }
            }).catch(err => {
                reject(err);
            });
        });
    }
    getKBankOTPByRef(device_iden, ref) {
        let start_time = new Date().getTime();
        return new Promise((resolve, reject) => {
            let interval = setInterval(async () => {
                let sms = await this.getKBankOTP(device_iden);
                if (sms.otp_code != '') {
                    if (sms.ref == ref) {
                        clearInterval(interval);
                        return resolve({
                            otp_code: sms.otp_code,
                            ref: sms.ref,
                            time: new Date().getTime() - start_time
                        });
                    }
                }
                if (new Date().getTime() - start_time > 60000) {
                    clearInterval(interval);
                    return reject('Timeout');
                }
            }, 1000);
        });
    }
}
exports.pushBullet = pushBullet;
//# sourceMappingURL=pushBullet.js.map