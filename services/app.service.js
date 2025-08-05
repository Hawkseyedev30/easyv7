var os = require("os");
const APP = require("../config/app.json");

var hostname = os.hostname();
var env;
var port;
var wallet_base_url;

if (hostname == "PratikMalewar" || hostname == "DESKTOP-8O3VJHU"
  || hostname == "iloma-HP-Notebook"
  || hostname == "LAPTOP-6JILN4C9" || hostname == "amol-Lenovo-ideapad-110-15ISK"
  || hostname == "DESKTOP-B63KABN"
  || hostname == "DESKTOP-UK9GCE1"
  || hostname == "DELL") {
  env = "development";
  port = APP.development.PORT;
  base_url = APP.development.BASE_URL;
  req_base_url = APP.development.REQ_BASE_URL;
  web_front_req_base_url = APP.development.WEB_FRONT_BASE_URL;
  wallet_base_url = APP.development.WALLET_BASE_URL
  fcm_server_key = APP.development.FCM_SERVER_KEY
} else {
  env = "production";
  port = APP.production.PORT;
  base_url = APP.production.BASE_URL;
  req_base_url = APP.production.REQ_BASE_URL;
  web_front_req_base_url = APP.development.WEB_FRONT_BASE_URL;
  wallet_base_url = APP.production.WALLET_BASE_URL
  fcm_server_key = APP.production.FCM_SERVER_KEY
}

const app = {
  env: env,
  port: port,
  base_url: base_url,
  req_base_url: req_base_url,
  web_front_req_base_url: web_front_req_base_url,
  wallet_base_url: wallet_base_url,
  fcm_server_key: fcm_server_key
};

module.exports = app;
