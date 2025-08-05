const axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");
const FormData = require("form-data");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const call = require("../../controllers/krungsribizonline/method");
const { CookieJar, Cookie } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const { unlink } = require('fs/promises')
const CookieFileStore = require("tough-cookie-file-store").FileCookieStore;
// this.jar = new CookieJar(new CookieFileStore("./cookie.json")); // move here
// this.jar = wrapper(axios.create({jar: new CookieJar(new CookieFileStore("./cookie.json"))}));

class BayIbkLib {
  constructor() {
    this.next =
      "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Common/Login.aspx";
    this.portfolioUrl =
      "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyPortfolio.aspx";
    this.baba =
      "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyPortfolio.aspx/GraphDataAsset";
    this.GetStatementHistory =
      "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/Deposit/StatementInquiryResult.aspx/GetStatementHistory";
    this.GetStatementToday =
      "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx/GetStatementToday";
    // this.jar = new CookieJar(new CookieFileStore("./cookie.json")); // move here
    this.jar = new CookieFileStore("./cookie.txt")
    this.cookieFilePath = path.join(__dirname, 'cookie.txt');
  }
  async clearCookieJar() {
    try {
      await unlink(this.cookieFilePath); // Delete the file
      console.log("Cookie file cleared successfully.");
      this.jar = new CookieFileStore(this.cookieFilePath); //Recreate jar
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log("Cookie file not found, no need to clear.");
      } else {
        console.error("Error clearing cookie file:", err);
      }
    }
  }

  async login(user, pass) {
    try {
      let res = await call.gets(`${this.next}`);
      let $ = cheerio.load(res);

      const VIEWSTATE = await this.getFormData(res, "__VIEWSTATE");
      const VIEWSTATEGENERATOR = await this.getFormData(
        res,
        "__VIEWSTATEGENERATOR"
      );
      const PREVIOUSPAGE = await this.getFormData(res, "__PREVIOUSPAGE");
      const EVENTVALIDATION = await this.getFormData(res, "__EVENTVALIDATION");

      let data = qs.stringify({
        __LASTFOCUS: "",
        __EVENTTARGET: "ctl00$cphLoginBox$imgLogin",
        __EVENTARGUMENT: "",
        __VIEWSTATE: VIEWSTATE,
        __VIEWSTATEGENERATOR: VIEWSTATEGENERATOR,
        __VIEWSTATEENCRYPTED: "",
        __PREVIOUSPAGE: PREVIOUSPAGE,
        __EVENTVALIDATION: EVENTVALIDATION,
        ctl00$hddApplicationMode: "KBOL",
        ctl00$cphLoginBox$hddPWD: "",
        ctl00$cphLoginBox$hddLanguage: "TH",
        username: "",
        password: "",
        ctl00$cphLoginBox$txtUsernameSME: user,
        ctl00$cphLoginBox$txtPasswordSME: "",
        ctl00$cphLoginBox$hdPassword: pass,
        ctl00$cphLoginBox$hdLogin: "",
      });

      let login = await call.posts(`${this.next}`, data);
      //  let location = login.headers;
      await this.clearCookieJar(); // Call this before every login
      console.log("Cookies after login:", await this.getkook()); // add this
      if (login) {
        const $ = cheerio.load(login.data);
        const divError = $("#ctl00_cphLoginBox_lblLoginMessage").text();
        const pageNotFound = $("title").text();
        const isLoggedIn = $('[id="ctl00_cphMainContent_lblUser"]').text();
        console.log("Cookies after login:", await this.getkook());
        // console.log(divError);
        // console.log(pageNotFound);
        // console.log(isLoggedIn);

        if (pageNotFound) {
          // let dataall = this.getPortfolioData();
          //  console.log(dataall);
          return true;
        } else {
          return false;
        }
      } else {
        console.log("Cookies after login fail :", await this.getkook());
        console.log("Login failed: No response data");
        return false;
      }
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  }
  async getPortfolioData() {
    try {
      //let data = '{"pageIndex":1,"pageoffset":""}';
      let result = await call.gets(
        "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyPortfolio.aspx"
      );

      let $ = cheerio.load(result);
    //  console.log(result.data)
      const accountData = {
        accountType: $(".content_acclist_acc_acctype").text().trim(),
        accountImage: $(".content_acclist_acc_accimage img").attr("src"),
        accountName: $(".content_acclist_acc_accname").text().trim(),
        accountBalance: $(".content_acclist_acc_accbalance").text().trim(),
        dataacc:
          "https://www.krungsribizonline.com" +
          $(".accmenu_menuitem").parent("a").attr("href"), // แก้ไขตรงนี้
        pageId: $(".accmenu_menuitem").attr("pageid"), // เพิ่มบรรทัดนี้เพื่อดึง pageid
      };

       let result2 = await call.gets(accountData.dataacc)


      

      let re = cheerio.load(result2);

      return accountData;
    } catch (error) {
      console.error("Error getting portfolio data:", error);
      return null;
    }
  }
  async StatementInquiryResult_today() {
    try {

      
      const axios = require('axios');
      let data = '{"pageIndex":1,"pageoffset":""}';
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx/GetStatementToday',
        headers: { 
          'Accept': 'application/json, text/javascript, */*; q=0.01', 
          'Accept-Language': 'th,en;q=0.9', 
          'Connection': 'keep-alive', 
          'Content-Type': 'application/json; charset=UTF-8', 
          'Origin': 'https://www.krungsribizonline.com', 
          'Referer': 'https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Pages/MyAccount.aspx?token=OSAwi8c9ntEjqrYKhCnQFk7fLgUgUzL5MLyPCwg1j1NbimeOQVjBctvHX2G2xkB3QVH0JNqoCYLrR8um5kynENicQknjna8etp-VBzSapIZg_h0yIh2ssS9Q5wsGdTauFOi4Pq3HyycMx5HSQG0ggBpfkd7em4zTQFh27Uaay0Fp-aGMu1bauHaLoXDK9qpPlJHDoJKK0jBFti0rMUxJh0INj8xP3Epowauizr5QlabD7lEt934YkHsf60Cm2-MQ0&ma=226084', 
          'Sec-Fetch-Dest': 'empty', 
          'Sec-Fetch-Mode': 'cors', 
          'Sec-Fetch-Site': 'same-origin', 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', 
          'X-Requested-With': 'XMLHttpRequest', 
          'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"', 
          'sec-ch-ua-mobile': '?0', 
          'sec-ch-ua-platform': '"Windows"', 
          'Cookie':await this.getkook()
        },
        data : data
      };
      
      let datatt = await axios.request(config)

     return  datatt;
    } catch (error) {
      console.error("Error getting cookie:", error);
      return null;
    }
  }
  async StatementInquiryResult_today2(url) {
    try {
      let result = await call.gets(url);

      const $ = cheerio.load(result);
    
     return true
    } catch (error) {
      console.error("Error getting cookie:", error);
      return null;
    }
  }
  async getkook() {
    const cookieFilePath = './cookie.txt';
    const cookieData = JSON.parse(fs.readFileSync(cookieFilePath, 'utf-8'));
    let cookies_data = cookieData["www.krungsribizonline.com"]["/"];

   // console.log(cookieData)
     
    let cookieString = "";
    for (const key in cookies_data) {
      const cookie = cookies_data[key];
      cookieString += `${cookie.key}=${cookie.value}; `;
    }
    console.log(cookieString.trim())
    return cookieString.trim();
  }

  async getFormData(response, inputName) {
    if (response) {
      const $ = cheerio.load(response);
      const inputElement = $(`input[name="${inputName}"]`);
      if (inputElement.length > 0) {
        return inputElement.val();
      } else {
        console.log(`Input field with name ${inputName} not found.`);
        return "";
      }
    } else {
      console.log("Response is null or undefined.");
      return "";
    }
  }
}

module.exports = BayIbkLib;
