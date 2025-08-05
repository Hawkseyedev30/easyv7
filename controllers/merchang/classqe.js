const qrcode = require('qrcode');


module.exports = class PromptPay {
    generatePayload(target, amount = null) {
      let qrData = '00020101021';
      qrData += amount ? '2' : '1'; // 1 for no amount, 2 for with amount
      qrData += '29370016A00000067701011101130066';
      qrData += target.replace(/[^0-9]/g, ''); // Remove non-digit characters
      qrData += '5802TH5303764';
      qrData += amount ? '5406' + amount.toFixed(2) + '6304' : '';
      return qrData;
    }
  
    async generateQrCode(savePath, target, amount = null, width = 256) {
      const qrData = this.generatePayload(target, amount);
      await qrcode.toFile(savePath, qrData, { width });
    }
  }