var {
  User_account,
  Server_api,
  Request_All,
  BankAccount,
  Merchant,
  Bank,
  Member,
  TransactionsV2,
} = require("../models");

var moment = require("moment");
require("moment/locale/th");
var md5 = require("md5");
const axios = require("axios"); // Import axios once at the top
const qs = require("qs"); // Import qs once at the top

/**
 * Sends a request to the Krungthai Connext statement content endpoint.
 * This is used for both initial load (implicitly by account-detail) and "View More".
 * @param {object} payload - The data payload for the request.
 * @param {object} serverApiData - Contains tokens and other API details.
 * @returns {Promise<object>} - The Axios response promise.
 */
async function requestStatementContent(payload, serverApiData) {
  // Note: The Cookie might need to be dynamic or managed if sessions expire.
  // The current hardcoded cookie might become invalid.
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://krungthaiconnext.krungthai.com/KTB-Line-Balance/deposit/statement-content",
    headers: {
      Accept: "text/html, */*; q=0.01", // Server might respond with JSON despite this Accept header
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
      "Content-Type": "application/json", // Important: Sending JSON payload
      Origin: "https://krungthaiconnext.krungthai.com",
      Referer:
        "https://krungthaiconnext.krungthai.com/KTB-Line-Balance/deposit/account-detail",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0", // Consider making this less specific or configurable
      "X-Requested-With": "XMLHttpRequest",
      "sec-ch-ua":
        '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      // TODO: Manage cookies properly. Hardcoding is unreliable.
      Cookie:
        "_ga=GA1.1.1153744425.1738514164; _ga_Q2WE3JCMLS=GS1.1.1743886335.4.1.1743886340.0.0.0",
      // Add tokens needed for authentication if required in headers (though often they are in payload)
      // e.g., 'Authorization': `Bearer ${serverApiData.someToken}` // If applicable
    },
    data: JSON.stringify(payload), // Send payload as a JSON string
  };

  try {
      const response = await axios.request(config);
      // Assuming the actual transaction data is in response.data
      // The structure might be { success: true, data: { transactions: [...] } } or similar
      return response.data;
  } catch (error) {
      console.error("Error requesting statement content:", error.response ? error.response.data : error.message);
      // Rethrow or handle error appropriately
      throw new Error("Failed to fetch statement content from Krungthai API.");
  }
}


/**
 * Sends a request to the Krungthai Connext account detail page.
 * This page contains the initial transaction list embedded in the HTML.
 * @param {string} datapost - The x-www-form-urlencoded string containing tokens.
 * @returns {Promise<object>} - The Axios response promise (HTML content).
 */
async function depkrungthaiconnext(datapost) {
  // This function seems to fetch the HTML page, not just API data.
  // The hardcoded data section within it should be removed if datapost is used.
  /*
  // Remove this hardcoded block if datapost parameter is intended to be used
  let data = qs.stringify({
    accountTokenNumber: "A2025020494cc008f399c41b7b22ce917451f462b",
    lineToken:
      "9jibDtdJGTpqY0xJPfVFrozL73xfM+2Y9d3/mvzdvLVDVdNhVLKPfNzt3dDMdDv2IIfpRHz+UXtuaCavAQIl4I9gc4ws3IgW4goGZTwIoSVlVzko9OsNdM833BPRUpM9lSUSYmGrRSaQFOBX0SYp70g+bXSuoVwN3u+vQC4vjXcyob1RLCk6/AH5KW6faqvccBGavNRf5zZJv0lqo+PLoxE1sa4QnZYdxBgsHLFzbmdrMuiemi2DmQkq2281JWvvnWGbemhvv8F+mqkddg98CEX4QTv0bM41ZeXyLR8Jv7truGMyGt4/Qe660l8J8JmZDH7SjCUuSzOH0O7jwwAeiejoFjBkthT5jjPXiOS3RHQFvRvbwV2YidrYvF7tHHmjYdw27CAi6nvJjaN3MEXtOzXr+KXO/xLjuMKJjZFrTWdgdHCSUwSz+7Wyefy3RBjAltOHXXUVK44kJ1LD77OKQWj4IHgk+I8a71u9qNkqLe8AUdenl76CKNlqzUgbncpm4H9NhbH6SCviHbgBcMn2sK+Ea5nTDGTaczFRYC8dJQq0pNO03tP6rceqBONN1DgOWXgT9bTsSes0/iP8Sumce3b0ZT1W2CnIoGErqtDwAjfhSoUmfLy/tyDLX/oe9eq87iSDNnOs/qdF/6OdtQjBtaUkn553wdCxwYsrMqmoT2xgzXyUiJ6J+JhvEpjCtnkilM260aoERanIo9YZjSmmqoFpXAtkHt5XTRPlO2raT2Miapyv23KKiWTAj90Rcqur7DplAFAmseSnL9u5LVkcxGsUYXlb8ZJvmAN9Z4D2MM0w1dVPUGBGtWSffAYmUoAF1i4170Dbuu/91K4Uc3AZZi9p1oaRtXwNR6FpxhC8yVSHWemxR+/HK4F9Y+0uz/eSFacm4CAw7HOseBuNSbqO8mgUKLCJ9/A49IZBJV9bIQnHRg1sYjpRlCmkBUhvEaCmJ+qILkzJ0/pc3TfdoJjr299fq2zORtSjUl8BrW2Nc31c4CgD2tXl70tGH6Puxrd6mOSeP6qkUr3mIdLW1egn1MFMjvGqoVJjOTVqGvliZHuXLglwASeHQyAElYuweL5a+1OMKVCWLhGbAcoH78BzSWkp2TTVBQaPCzpuIe34d9JAQ+RvoY2t+jRPfnBKMw4aA37lWo1AW0EoZ/wCpgmRDYPp1UMMJeYjThVGJJ4vK/viocbu+YGltUVRbLqOeAqetxithYuS25+H+l0Pfdr/XgYLQDmRcAT7YcHxSJNUGN0=",
    userTokenIdentity: "C202306109b34005a3c344127ab6f90ad5c88da84",
    channel: "Krungthai Next",
    language: "TH",
  });
  */

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://krungthaiconnext.krungthai.com/KTB-Line-Balance/deposit/account-detail",
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded", // Correct for qs.stringify
      Origin: "https://krungthaiconnext.krungthai.com",
      Referer:
        "https://krungthaiconnext.krungthai.com/KTB-Line-Balance/summary/main?tab=deposit&code=l9TaVgNR9ioHUpkbA5uE&state=BSOz3xwnCP", // This might need to be dynamic
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
      "sec-ch-ua":
        '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      // TODO: Manage cookies properly. Hardcoding is unreliable.
      // 'Cookie': '_ga=GA1.1.1811525023.174sss3793522; _ga_Q2WE3JCMLS=GS1.1.1743793521.1.1.1743793532.0.0.0'
    },
    data: datapost, // Use the passed-in data
  };

  try {
      return await axios.request(config);
  } catch (error) {
      console.error("Error fetching account detail page:", error.response ? error.response.data : error.message);
      throw new Error("Failed to fetch account detail page from Krungthai.");
  }
}

/**
 * Fetches initial account details and transactions from Krungthai Connext.
 * Parses the data embedded within the HTML response.
 * @param {object} bankAccountData - The bank account details from the database.
 * @returns {Promise<object|null>} - Parsed account details and transactions, or null on error.
 */
const getkrungthai_datainfobank = async function (bankAccountData) {
  try {
    const serverApiData = await Server_api.findOne({
      where: {
        bankAccountId: bankAccountData.id,
      },
    });

    if (!serverApiData) {
      throw new Error(
        `Server_api data not found for bankAccountId: ${bankAccountData.id}`
      );
    }

    // Prepare data for the POST request to get the HTML page
    const requestData = qs.stringify({
      accountTokenNumber: serverApiData.accountTokenNumber,
      lineToken: serverApiData.lineToken,
      userTokenIdentity: serverApiData.userTokenIdentity,
      channel: serverApiData.channel || "Krungthai Next", // Use stored or default
      language: serverApiData.language || "TH", // Use stored or default
    });

    // Fetch the HTML page
    const formattedResponse = await depkrungthaiconnext(requestData);

    // --- Helper functions ---
    function convertToJson(res) {
      // This function seems redundant as JSON.parse expects a string.
      // If 'res' is already a string, just return it. If it's an object, JSON.stringify it.
      if (typeof res === 'string') {
        return res;
      }
      return JSON.stringify(res);
    }

    function extractSubstring(text, startMarker, endMarker) {
      const startIndex = text.indexOf(startMarker);
      if (startIndex === -1) {
        console.error("Start marker not found:", startMarker);
        return null; // Start marker not found
      }
      const start = startIndex + startMarker.length;
      // Find the end marker *after* the start position
      const endIndex = text.indexOf(endMarker, start);
      if (endIndex === -1) {
        console.error("End marker not found:", endMarker);
        return null; // End marker not found
      }
      return text.substring(start, endIndex);
    }
    // --- End Helper functions ---


    // Extract the JSON string embedded in the HTML
    // Looking for `window.accountDetail = { ... }}`
    const extractedData = extractSubstring(
      formattedResponse.data, // The HTML content is in response.data
      `window.accountDetail = `, // Start marker
      `}}`                       // End marker (adjust if the structure is different)
    );

    if (!extractedData) {
      // Try extracting with a different end marker if the first fails, e.g., ending with ;
       const extractedDataAlt = extractSubstring(
         formattedResponse.data,
         `window.accountDetail = `,
         `;` // Alternative end marker
       );
       if (!extractedDataAlt) {
          console.error("Raw HTML Response Data:", formattedResponse.data); // Log raw data for debugging
          throw new Error("Data extraction failed: Markers 'window.accountDetail = ' or end markers not found in HTML response.");
       }
       // If alternative extraction worked, parse it carefully
       try {
           // Remove trailing semicolon if present before parsing
           const jsonStringAlt = extractedDataAlt.trim().replace(/;$/, '');
           const parsedDataAlt = JSON.parse(jsonStringAlt);
           return parsedDataAlt;
       } catch (parseError) {
           console.error("Failed to parse extracted data with alternative marker:", parseError);
           console.error("Extracted string (Alt):", extractedDataAlt);
           throw new Error("Data extraction succeeded (alt marker), but JSON parsing failed.");
       }
    }

    // Append the end marker back to form a complete JSON string
    const completeJsonString = extractedData + `}}`;

    try {
        // Parse the extracted JSON string
        const parsedData = JSON.parse(convertToJson(completeJsonString)); // convertToJson might be unnecessary here if completeJsonString is correct
        return parsedData;
    } catch (parseError) {
        console.error("Failed to parse extracted JSON:", parseError);
        console.error("Extracted string:", completeJsonString);
        throw new Error("Data extraction succeeded, but JSON parsing failed.");
    }

  } catch (error) {
    console.error("Error in getkrungthai_datainfobank:", error.message);
    // Optionally log the bankAccountId for which it failed
    console.error(`Failed for bankAccountId: ${bankAccountData ? bankAccountData.id : 'N/A'}`);
    return null; // Or handle the error as needed, e.g., return an error object
  }
};


/**
 * Fetches more transactions ("View More") from Krungthai Connext API.
 * @param {object} bankAccountData - The bank account details from the database.
 * @param {string} lastSeq - The sequence number of the last transaction from the previous batch.
 * @returns {Promise<object|null>} - Parsed object containing new transactions, or null on error.
 */
const getMoreKrungthaiTransactions = async function (bankAccountData, lastSeq) {
    try {
        const serverApiData = await Server_api.findOne({
            where: {
                bankAccountId: bankAccountData.id,
            },
        });

        if (!serverApiData) {
            throw new Error(
                `Server_api data not found for bankAccountId: ${bankAccountData.id}`
            );
        }

        // Construct the payload for the "View More" request
        const payload = {
            action: "UPDATE", // Assuming this is the correct action for fetching more
            accountTokenNumber: serverApiData.accountTokenNumber,
            activeIndex: 0, // Assuming this is constant, adjust if needed
            lastSeq: lastSeq, // The key parameter for pagination
            lineToken: serverApiData.lineToken, // Include the lineToken
            // userTokenIdentity: serverApiData.userTokenIdentity, // May or may not be needed for this specific request
            // channel: serverApiData.channel || "Krungthai Next", // May or may not be needed
            // language: serverApiData.language || "TH", // May or may not be needed
            hasViewMore: true, // Indicate intention to load more
        };

        console.log("Requesting more transactions with payload:", payload);

        // Use the dedicated function to make the API call
        const responseData = await requestStatementContent(payload, serverApiData);

        // Log the raw response for debugging
        console.log("Response from statement-content:", responseData);

        // Validate the response structure (adjust based on actual API response)
        if (!responseData || typeof responseData !== 'object') {
             throw new Error("Invalid response format received from statement-content endpoint.");
        }

        // Assuming the response directly contains the transaction list and view more status
        // e.g., { transactions: [...], hasViewMore: false }
        // Return the relevant part of the response
        return responseData; // Return the whole response object for now

    } catch (error) {
        console.error("Error in getMoreKrungthaiTransactions:", error.message);
        console.error(`Failed for bankAccountId: ${bankAccountData ? bankAccountData.id : 'N/A'}, lastSeq: ${lastSeq}`);
        return null;
    }
};


/**
 * Inserts fetched Krungthai deposit transactions into the Request_All table.
 * @param {object} params - The parsed data containing the transactions array.
 * @param {object} bankAccountData - The bank account details from the database.
 * @returns {Promise<number>} - Returns 1 on successful processing (or number of inserts).
 */
const Insert_datadep_krungthai = async function (params, bankAccountData) {
  // Helper function to check if a transaction already exists
  async function sreat(description) {
    try {
        return await Request_All.findOne({
            where: { description: description }, // Assuming description is unique identifier (like transSeqNo)
        });
    } catch(dbError) {
        console.error("Database error checking existing transaction:", dbError);
        return null; // Handle DB error case
    }
  }

  // Validate input
  if (!params || !params.transactions || !Array.isArray(params.transactions)) {
      console.error("Insert_datadep_krungthai: Invalid or missing transactions data.");
      return 0; // Indicate no transactions processed
  }
  if (!bankAccountData || !bankAccountData.id || !bankAccountData.accountNumber) {
      console.error("Insert_datadep_krungthai: Invalid bankAccountData.");
      return 0;
  }

  let insertedCount = 0;

  // Iterate through transactions received
  for (const rr of params.transactions) {
    // Process only "เงินโอนเข้า" (Incoming Transfers)
    if (rr.type === "เงินโอนเข้า") {
      // --- Data Transformation & Validation ---
      // 1. Unique Identifier: Use transSeqNo as the unique key for checking existence.
      const uniqueDesc = rr.transSeqNo;
      if (!uniqueDesc) {
          console.warn("Skipping transaction due to missing transSeqNo:", rr);
          continue; // Skip if no unique ID
      }

      // 2. Amount: Parse and validate the amount. Remove commas.
      let amount = 0;
      try {
          // Remove commas before parsing
          const cleanedBalance = rr.balance ? rr.balance.replace(/,/g, '') : '0';
          amount = parseFloat(cleanedBalance);
          if (isNaN(amount) || amount <= 0) { // Ensure it's a positive number
              console.warn(`Skipping transaction ${uniqueDesc}: Invalid or zero amount '${rr.balance}'.`);
              continue;
          }
      } catch (e) {
          console.warn(`Skipping transaction ${uniqueDesc}: Error parsing amount '${rr.balance}'.`, e);
          continue;
      }

      // 3. Date/Time: Parse and format the date/time.
      // Example dateTime: "22 เม.ย. 10:16 น."
      // Need to convert this Thai date format to a standard ISO format.
      let transactionDateTime;
      try {
          // Map Thai month abbreviations to numbers (adjust if needed)
          const thaiMonths = {
              'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
              'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
              'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
          };
          const parts = rr.dateTime.split(' '); // ["22", "เม.ย.", "10:16", "น."]
          if (parts.length < 3) throw new Error("Incorrect date/time format parts");

          const day = parts[0].padStart(2, '0');
          const monthAbbr = parts[1];
          const time = parts[2]; // "10:16"
          const month = thaiMonths[monthAbbr];

          if (!month) throw new Error(`Unknown Thai month abbreviation: ${monthAbbr}`);

          // Assuming the year is the current year. This might be incorrect for older statements!
          // A more robust solution would get the year from the context if possible.
          const currentYear = moment().year();
          // If the transaction month is later than the current month, assume it's from the previous year.
          const transactionMonth = parseInt(month, 10);
          const currentMonth = moment().month() + 1; // moment().month() is 0-indexed
          const year = transactionMonth > currentMonth ? currentYear - 1 : currentYear;

          const isoString = `${year}-${month}-${day}T${time}:00`; // Construct ISO-like string
          transactionDateTime = moment(isoString); // Parse with moment

          if (!transactionDateTime.isValid()) {
              throw new Error(`Parsed date is invalid: ${isoString}`);
          }

      } catch (e) {
          console.warn(`Skipping transaction ${uniqueDesc}: Error parsing dateTime '${rr.dateTime}'.`, e);
          continue;
      }

      // 4. Source Account/Bank: Extract from 'cmt' if possible.
      // Example cmt for transfer in: "014-6522427352" (BankCode-AccountNumber)
      let fromAccountNumber = rr.cmt || "N/A"; // Default if cmt is empty
      let fromBankCode = "N/A";
      const cmtMatch = rr.cmt ? rr.cmt.match(/^(\d{3})-(\S+)$/) : null; // Match BankCode-RestOfString
      if (cmtMatch) {
          fromBankCode = cmtMatch[1];
          fromAccountNumber = cmtMatch[2]; // Use the part after the hyphen as account number/identifier
      } else {
          // Handle cases where cmt doesn't match the expected format
          console.log(`TransactionsV2 ${uniqueDesc}: 'cmt' format ('${rr.cmt}') not recognized for bank/account extraction.`);
          // Keep rr.cmt as the account number in this case
      }


      // --- Check for Existence ---
      const datafull = await sreat(uniqueDesc);

      if (!datafull) {
        // --- Prepare Data for Insertion ---
        let datasave = {
          description: uniqueDesc, // Unique identifier from the bank statement
          date_creat: transactionDateTime.toISOString(), // Standard ISO format
          date_creat_qr: transactionDateTime.format("YYYY-MM-DD"), // Format as YYYY-MM-DD
          time_creat: transactionDateTime.format("HH:mm"), // Format as HH:mm

          amount: amount, // Parsed amount
          accnum: fromAccountNumber, // Extracted source account number/identifier
          to_bank: fromBankCode, // Extracted source bank code (or N/A)

          req_tpye: "BANKPAY", // Type of request
          fron_bank: bankAccountData.accountNumber, // Destination account (our bank account)
          status_pay: 1, // Payment status (assuming 1 means completed/received)
          status: 1, // General status (assuming 1 means active/valid)
          remark: `ระบบฝากเงินกรุงไทย ${fromAccountNumber} ${rr.type} จำนวน ${amount.toFixed(2)}`, // Detailed remark
          bankAccount_id: bankAccountData.id, // Link to our BankAccount record
          type_status: "ฝากเงิน", // Status description
          // name_to: ??? // Destination name (usually our account name, maybe fetch from bankAccountData?)
          // Add other relevant fields from rr if needed
        };

        // --- Insert into Database ---
        try {
            console.log("Attempting to insert transaction:", datasave);
            let saves = await Request_All.create(datasave);
            insertedCount++;
            console.log(`TransactionsV2 ${uniqueDesc} inserted successfully.`);
            // TODO: Call notification function if needed
            // notifition(datasave);
        } catch (dbInsertError) {
            console.error(`Failed to insert transaction ${uniqueDesc}:`, dbInsertError);
            // Consider logging datasave object here for debugging failed inserts
        }
      } else {
         // console.log(`TransactionsV2 ${uniqueDesc} already exists. Skipping.`);
      }
    } // End if (rr.type == "เงินโอนเข้า")
  } // End for loop

  console.log(`Processed ${params.transactions.length} transactions, inserted ${insertedCount} new deposit(s).`);
  return insertedCount; // Return the number of newly inserted records
};

module.exports = {
  getkrungthai_datainfobank,
  Insert_datadep_krungthai,
  getMoreKrungthaiTransactions, // Export the new function
  // formatKrungthaiCurlCommand, // Keep if used elsewhere, otherwise requestStatementContent replaces its direct use
  depkrungthaiconnext,
};
