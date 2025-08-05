const sendTelegram = async (params) => {
  const TelegramBot = require("node-telegram-bot-api");
  const token = "7539160765:AAGBfzMk92oTZm3ULIPgjxCKa1uLflSqSgg"; // Replace with your bot token
  const bot = new TelegramBot(token, { polling: false });
  let chatId = ""; // Replace with your chat ID or group chat ID
  // -4646733538

  //-4646733538  // แจ้งเตือนวงเงินออโต้
  //-4736964258  // แจ้งเตือนการถอนเงิน
  const messageOptions = {
    parse_mode: "HTML", // Enable HTML parsing for styling
    disable_web_page_preview: true, // ปิดการแสดงตัวอย่างลิงก์
  };

  try {
    let message = "";
    //console.log(params);

    if (params.tpye === "worning" && params.type_option === "withdraw") {
      chatId = "-1002389205865";
      message = params.msg;
    } else if ((params.tpye === "success", params.type_option === "withdraw")) {
      chatId = "-1002389205865";
      message = params.msg;
    } else if (params.tpye === "worning" && params.type_option === "limit") {
      chatId = "-1002389205865";
      message = params.msg;
    } else if (params.tpye === "success" && params.type_option === "deposit") {
      chatId = "-1002389205865";
      message = params.msg;
    }else{
      
      chatId = "-1002389205865";
      
      // message = generateNotificationMessage(params.data);
      message = params.msg;
    }
   // Gen บช | ลบ-เพิ่ม บช Backend88 -4708516718
   // Gen บช | ลบ-เพิ่ม บช Backend88 -4708516718
   // Gen บช | ลบ-เพิ่ม บช Backend88 -4708516718
   // Gen บช | ลบ-เพิ่ม บช Backend88 -4708516718
   // Gen บช | ลบ-เพิ่ม บช Backend88 -4708516718
    chatId = "-1002389205865";

    await bot.sendMessage(chatId, message, messageOptions);
    console.log("Telegram notification sent successfully.");
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
};

module.exports = {
  sendTelegram,
};
