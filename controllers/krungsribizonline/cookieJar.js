// cookieJar.js
const { CookieJar } = require('tough-cookie');
const { FileCookieStore } = require('tough-cookie-file-store');

const sharedCookieJar = new CookieJar(new FileCookieStore('./cookie.json'));

module.exports = sharedCookieJar;
