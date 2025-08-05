const axios = require("./call.js");
// const { curly } = require('node-libcurl');
const fs = require("fs");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar, Cookie } = require("tough-cookie");
const CookieFileStore = require("tough-cookie-file-store").FileCookieStore;
const jar = new CookieJar(new CookieFileStore("./cookie.txt"));
const client = wrapper(
  axios.create({
    jar: jar,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  })
);

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

async function posts(path, payload) {
  const url = `${path}`;
  const mockIp = `${getRandom(1, 255)}.${getRandom(1, 255)}.${getRandom(
    1,
    255
  )}.${getRandom(1, 255)}`;

  return await client
    .post(url, payload, {
      jar: jar, // add jar here
      headers: {
        Host: "www.krungsribizonline.com",
        Connection: "keep-alive",
        // "Content-Length": "4384", //Remove this
        "Cache-Control": "max-age=0",
        "sec-ch-ua":
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        Origin: "https://www.krungsribizonline.com",
        "Content-Type": "application/x-www-form-urlencoded",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        Referer:
          "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Common/Login.aspx",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "th,en;q=0.9",
        //Cookie: "ASP.NET_SessionId=0344auc2uotcmyluts0eapgl; PD_STATEFUL_0e5e24c4-2849-11ec-8028-005056963270=%2FBAY.KOL.Corp.WebSite; KS_Cookie=!WVjqRLjIDU4eEkpF2K6W4qRnVN/XG1PPC6uw3trV/zD7sVRCkR2FVQ/E+hCw3yUMadvaxXFuEvtrBc4=", //Remove this

      },
      withCredentials: true,
      timeout: 15000,
    })
    .then((resp) => {
      return resp;
    });
}

async function gets(path) {
  const url = `${path}`;
  const mockIp = `${getRandom(1, 255)}.${getRandom(1, 255)}.${getRandom(
    1,
    255
  )}.${getRandom(1, 255)}`;
  return await client
    .get(`${url}`, {
      jar: jar, // add jar here
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "th,en;q=0.9",
        "Cache-Control": "max-age=0",
        Connection: "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://www.krungsribizonline.com",
        Referer:
          "https://www.krungsribizonline.com/BAY.KOL.Corp.WebSite/Common/Login.aspx",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "sec-ch-ua":
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
      withCredentials: true,
      timeout: 15000,
    })
    .then((resp) => {
      if (resp.data) {
        return resp.data;
      } else {
        return "";
      }
    });
}

async function info(path) {
  const url = `${path}`;
  return await client
    .get(`${url}`, {
      headers: {
        Origin: "https://www.krungsribizonline.com",
      },
      withCredentials: true,
      timeout: 15000,
    })
    .then((resp) => {
      if (resp.data) {
        // console.log(jar);
        // jar.getCookies();
        return resp.data;
      } else {
        return [];
      }
    });
}

async function proxy(path) {
  const url = `${path}`;
  return await client
    .get(`url`, {
      headers: {
        // 'origin': 'http://ocean.isme99.com',
      },
      withCredentials: true,
      timeout: 15000,
    })
    .then((resp) => {
      if (resp.data) {
        // console.log(jar);
        // jar.getCookies();
        return resp.data;
      } else {
        return [];
      }
    });
}

module.exports = { posts, gets, info, proxy };
