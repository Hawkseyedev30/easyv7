
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
/**
 * @class KrungthaiAPI
 * @description A service class for interacting with the Krungthai Business API.
 * Handles authentication, request headers, and API calls.
 */
module.exports = class KrungthaiAPI {
  /**
   * Creates an instance of KrungthaiAPI.
   * @param {string} accessToken - The access token for authenticated API calls.
   * @param {string} [clientVersion=""] - The client application version (e.g., "1.0.0").
   * @param {string} [deviceModel=""] - The device model (e.g., "iPhone13,4").
   * @param {string} [devicePlatform=""] - The device platform (e.g., "iOS").
   * @param {string} [deviceId=""] - The unique device identifier.
   */
  constructor(
    accessToken,
    clientVersion = "",
    deviceModel = "",
    devicePlatform = "",
    deviceId = ""
  ) {
    // Base URL for most authenticated API calls after login/token acquisition
    this.baseApiURL = "https://business.krungthai.com/ktb/rest/biznext-channel/v1";
    // Base URL for pre-login/authentication steps (often the same as baseApiURL)
    this.authBaseURL = "https://business.krungthai.com/ktb/rest/biznext-channel/v1";

    // Store the access token
    this.accessToken = accessToken;

    // Default headers for all API calls. Authorization header will be added dynamically.
    this.defaultHeaders = {
      "User-Agent": "okhttp/3.14.9",
      Connection: "Keep-Alive",
      "Accept-Encoding": "gzip",
      "Content-Type": "application/json",
      "X-Platform": devicePlatform,
      "X-Client-Version": clientVersion,
      // X-Correlation-ID will be generated per request in the interceptor
      "X-Device-ID": deviceId,
      "X-Device-Model": deviceModel,
      "X-Channel-Id": "MB",
      "Accept-Language": "th-TH",
    };

    // Axios instance for making API calls
    this.axiosInstance = axios.create({
      baseURL: this.baseApiURL,
      headers: { ...this.defaultHeaders }, // Start with default headers
      // withCredentials: true, // Uncomment if cookies are needed and managed server-side
    });

    // Axios Interceptor to add Authorization header and dynamic X-Correlation-ID for each request
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add Authorization header if an access token is available
        if (this.accessToken) {
          config.headers["Authorization"] = `Bearer ${this.accessToken}`;
        }
        // Generate a new unique correlation ID for each request
        config.headers["X-Correlation-ID"] = `${uuidv4()}-crid`;
        return config;
      },
      (error) => {
        // Handle request error
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtains an initial client credentials grant (access token) from the bank API.
   * This token is typically required before performing user-specific login steps.
   * @param {string} deviceId - The unique device identifier.
   * @param {string} platform - The device platform (e.g., "iOS", "Android").
   * @param {string} clientVersion - The client application version.
   * @param {string} deviceModel - The device model.
   * @returns {Promise<object>} A promise that resolves with the grant response data (containing the access token)
   * or rejects with an error.
   * @throws {Error} If the API call fails.
   */
  async getClientCredentialsToken(deviceId, platform, clientVersion, deviceModel) {
    const url = `${this.authBaseURL}/prelogin/grant?grant_type=client_credentials`;

    // IMPORTANT: The Basic Authorization header contains client credentials.
    // 'YWRtaW46cGFzc3dvcmQ=' is base64 for 'admin:password'.
    // This value MUST NOT be hardcoded in production.
    // It should be securely stored (e.g., in environment variables) and retrieved.
    const basicAuth = process.env.KTB_BUSINESS_BASIC_AUTH || "YWRtaW46cGFzc3dvcmQ="; // Example using env var

    const requestHeaders = {
      "User-Agent": "okhttp/3.14.9",
      Connection: "Keep-Alive",
      "Accept-Encoding": "gzip",
      "Content-Type": "application/json",
      "X-Platform": platform,
      "X-Client-Version": clientVersion,
      "X-Correlation-ID": `${uuidv4()}-crid`, // New correlation ID for this specific request
      "X-Device-ID": deviceId,
      "X-Device-Model": deviceModel,
      "X-Channel-Id": "MB",
      "Accept-Language": "th-TH",
      Authorization: `Basic ${basicAuth}`,
    };

    try {
      // Assuming an empty body is required for this POST request based on the original code
      const response = await axios.post(url, {}, { headers: requestHeaders });

      // Store the access token if successful
      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        //   console.log("Client credentials token obtained successfully.");
      } else {
        //   console.warn("Client credentials response did not contain an access_token.");
      }

      //  console.log("Response Headers:", response.headers); // Log response headers for debugging

      return response.data; // Return the full response data
    } catch (error) {
      console.error(
        "Error in getClientCredentialsToken:",
        error.response ? error.response.data : error.message
      );
      // Log detailed error if available
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
      }
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Generates a password key (likely part of the E2EE process) for PIN authentication.
   * Requires a valid client credentials token (obtained via getClientCredentialsToken)
   * to be set as `this.accessToken` prior to calling this method.
   * @param {string} loginModuleId - The login module ID (e.g., 'BIZ_NEXT_WEB').
   * @returns {Promise<object>} A promise that resolves with the response data or rejects with an error.
   * @throws {Error} If the API call fails or no access token is available.
   */
  async generatePinKey(loginModuleId) {
    if (!this.accessToken) {
      throw new Error("Access token is not set. Call getClientCredentialsToken first.");
    }

    const url = "/auth/pin/key/generation"; // Relative URL, `axiosInstance` will use `baseURL`
    const data = {
      loginModuleId: loginModuleId,
    };

    try {
      // Use the pre-configured axiosInstance which handles headers and base URL
      const response = await this.axiosInstance.post(url, data);

      // console.log("generatePinKey response:", response.data);
      return response.data; // Return the full response data
    } catch (error) {
      console.error(
        "Error in generatePinKey:",
        error.response ? error.response.data : error.message
      );
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
      }
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Authenticates with the Krungthai Business API using a PIN.
   * Requires a valid client credentials token (obtained via getClientCredentialsToken)
   * to be set as `this.accessToken` prior to calling this method.
   * @param {object} pinAuthData - The data payload for PIN authentication.
   * @returns {Promise<object>} A promise that resolves with the authentication response data or rejects with an error.
   * @throws {Error} If the API call fails or no access token is available.
   */
  async authenticatePin(pinAuthData) {
    if (!this.accessToken) {
      throw new Error("Access token is not set. Call getClientCredentialsToken first.");
    }

    const url = "/pin/grant?grant_type=client_credentials"; // Relative URL

    try {
      // Use the pre-configured axiosInstance which handles Authorization (Bearer token)
      // and other default headers (User-Agent, X-Platform, X-Client-Version, X-Device-ID, X-Device-Model, X-Correlation-ID).
      const response = await this.axiosInstance.post(url, pinAuthData);

      //  console.log("authenticatePin response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error in authenticatePin:",
        error.response ? error.response.data : error.message
      );
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
        // Do not return a string like "data:..." here; throw the error
      }
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Authenticates with the Krungthai Business API using a PIN.
   * Requires a valid client credentials token (obtained via getClientCredentialsToken)
   * to be set as `this.accessToken` prior to calling this method.
   * @param {object} pinAuthData - The data payload for PIN authentication.
   * @returns {Promise<object>} A promise that resolves with the authentication response data or rejects with an error.
   * @throws {Error} If the API call fails or no access token is available.
   */
  async overview_apps(basicAuth) {
    try {
      // Use the axiosInstance which includes the Bearer token via interceptor

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://business.krungthai.com/ktb/rest/biznext-channel/v1/account/overview',
        headers: {
          'User-Agent': 'okhttp/3.14.9',
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'Content-Type': 'application/json',
          'X-Platform': 'android/12',
          // 'X-Client-Version': Version,
          // 'X-Correlation-ID': 'de262939-7151-4c3d-98f3-4a89c3610ab5-crid',
          // 'X-Device-ID': `${devicesid}`,
          // 'X-Device-Model': Device_Model,
          'X-Channel-Id': 'MB',
          'Accept-Language': 'th-TH',
          'Authorization': `Bearer  ${basicAuth}`
        }
      };

      const response = await axios.request(config)
      return response.data;
    } catch (error) {

      // Log detailed error if available
      if (error.response) {
        return ("data:", error.response.status);
        //  return("Headers:", error.response.headers);
      }
      throw error;
    }

  }

  /**
   * Authenticates with the Krungthai Business API using a PIN.
   * Requires a valid client credentials token (obtained via getClientCredentialsToken)
   * to be set as `this.accessToken` prior to calling this method.
   * @param {object} pinAuthData - The data payload for PIN authentication.
   * @returns {Promise<object>} A promise that resolves with the authentication response data or rejects with an error.
   * @throws {Error} If the API call fails or no access token is available.
   */
  async qr_scan(basicAuth) {
    try {
      // Use the axiosInstance which includes the Bearer token via interceptor



      const data = {
        qrData: basicAuth.qrData,
      };

      try {
        // Use the pre-configured axiosInstance which handles headers and base URL
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://business.krungthai.com/ktb/rest/biznext-channel/v1/qr/scan',
          headers: {
            'User-Agent': 'okhttp/3.14.9',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'X-Platform': 'android/14',
            'X-Channel-Id': 'MB',
            'Accept-Language': 'th-TH',
            'Authorization': `Bearer  ${basicAuth.auth}`
          },
          data: data
        };
        const response = await axios.request(config)
        // console.log("generatePinKey response:", response.data);
        return response.data; // Return the full response data
      } catch (error) {
        console.error(
          "Error in generatePinKey:",
          error.response ? error.response.data : error.message
        );
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Headers:", error.response.headers);
        }
        throw error; // Re-throw the error to be handled by the caller
      }
    } catch (error) {

      // Log detailed error if available
      if (error.response) {
        return ("data:", error.response.status);
        //  return("Headers:", error.response.headers);
      }
      throw error;
    }

  }


  /**
   * Authenticates with the Krungthai Business API using a PIN.
   * Requires a valid client credentials token (obtained via getClientCredentialsToken)
   * to be set as `this.accessToken` prior to calling this method.
   * @param {object} pinAuthData - The data payload for PIN authentication.
   * @returns {Promise<object>} A promise that resolves with the authentication response data or rejects with an error.
   * @throws {Error} If the API call fails or no access token is available.
   */
  async overview_app(basicAuth) {
    try {
      // Use the axiosInstance which includes the Bearer token via interceptor

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://business.krungthai.com/ktb/rest/biznext-channel/v1/account/overview',
        headers: {
          'User-Agent': 'okhttp/3.14.9',
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'Content-Type': 'application/json',
          'X-Platform': 'android/12',
          // 'X-Client-Version': Version,
          // 'X-Correlation-ID': 'de262939-7151-4c3d-98f3-4a89c3610ab5-crid',
          // 'X-Device-ID': `${devicesid}`,
          // 'X-Device-Model': Device_Model,
          'X-Channel-Id': 'MB',
          'Accept-Language': 'th-TH',
          'Authorization': `Bearer  ${basicAuth}`
        }
      };

      const response = await axios.request(config)
      return response.data;
    } catch (error) {

      // Log detailed error if available
      if (error.response) {
        return ("data:", error.response.status);
        //  return("Headers:", error.response.headers);
      }
      throw error;
    }

  }





  
  /**
   * Sets a cookie string for subsequent API requests.
   * Generally not needed if `withCredentials: true` is used with Axios.
   * @param {string} cookieString - The cookie string to set.
   */
  setCookie(cookieString) {
    this.axiosInstance.defaults.headers.common["Cookie"] = cookieString;
    console.log("Manual cookie set:", cookieString);
  }

  /**
   * Clears any manually set cookies from the Axios instance.
   */
  clearCookie() {
    delete this.axiosInstance.defaults.headers.common["Cookie"];
    console.log("Manual cookie cleared.");
  }

  /**
   * Clears the stored access token from the instance.
   */
  clearToken() {
    this.accessToken = null;
    // Optionally clear from the default instance headers if it was set there directly
    // delete this.axiosInstance.defaults.headers.common['Authorization'];
    console.log("Access token cleared.");
  }
};