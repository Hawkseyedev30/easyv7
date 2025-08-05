// services/apiLogService.js
const { Api_logs_banks } = require('../models'); // Adjust the path if needed

async function logApiRequest(logData) {
    const apiLog = await Api_logs_banks.create(logData);
//   try {
//    
//    // console.log('API log created:', apiLog.toJSON());
//     return apiLog; // Return the created log entry
//   } catch (error) {
//     console.error('Error creating API log:', error);
//     return null; // Or throw the error if you want to handle it elsewhere
//   }
}

module.exports = {
  logApiRequest,
};
