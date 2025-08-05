var { Logreq } =  require("../models");

function logRequestTime(req, res, next) {
    const start = Date.now();
  
    res.on('finish', () => {
      // const end = Date.now();
      // const responseTime = end - start;
  
      // const ipAddress = req.headers['cf-connecting-ip']; // ดึง IP address
      // const userAgent = req.headers['user-agent']; // ดึง user agent
      // const userAgents = req.headers; // ดึง user agent
  
      // //console.log(userAgents);

      // let testsave = `Request: ${req.method} ${req.originalUrl} - ${responseTime}ms - IP: ${ipAddress} - User Agent: ${userAgent}`

      // Logreq.create({text:testsave})
        
      
      // หรือบันทึก log ลงไฟล์ หรือ database ตามต้องการ
    });
  
    next();
  }
  
  module.exports = logRequestTime;