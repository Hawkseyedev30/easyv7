const axios = require('axios');
const util = require('util');
const parseString = util.promisify(require('xml2js').parseString);

module.exports = class ENC {
   
    async getTag(phone) {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://info-msisdn.scb.co.th:8080/msisdn?date=' + Date.now() + '',
            headers: {
                'Accept': '*/*', 
                'Accept-Language': 'th', 
                'scb-channel': 'APP', 
                'ser-Agent': '75', 
                'Connection': 'Keep-Alive', 
                'Accept-Encoding': 'gzip', 
                'Cache-Control': 'max-age=0, no-cache', 
                'x-msisdn': '' + phone + '',
            }
        };
        const response = await axios(config).then(r => r).catch(e => e.response)
        const result = await parseString(response.data);
        const tag = result.Susanoo.TAG[0];
        return tag
    }

    async enctag(phone) {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://info-msisdn.scb.co.th:8080/msisdn?date=' + Date.now() + '',
            headers: {
                'x-msisdn': '' + phone + '',
            }
        };
        const response = await axios(config).then(r => r).catch(e => e.response)
        const result = await parseString(response.data);
        const tag = result.Susanoo.TAG[0];
        return tag
    }

    async playloads(deviceid) {

        
        const axios = require("axios");
        
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: "http://www.api-scb-preload.com/scbpreload/?deviceId=" + deviceid,
            headers: {
                "content-type": "application/json; charset=UTF-8"
            },
           // data: data
        };
        const response = await axios(config).then((r) => r).catch((e) => e.response);
        return response.data.data;
    }

}