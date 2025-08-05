const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const axiosRetry = require("axios-retry");

try {
    const http = rateLimit(axios.create(), {
        maxRequests: 1000,
        perMilliseconds: 1000,
    });

    axiosRetry.default(http, { retries: 3, retryDelay: axiosRetry.default.exponentialDelay }); // Access the default function

    module.exports = http;
} catch (error) {
    console.error("Error during axios setup:", error);
    module.exports = axios.create();
}