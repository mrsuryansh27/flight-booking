// backend/src/services/hotelbedsService.js
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY;
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET;

if (!HOTELBEDS_API_KEY || !HOTELBEDS_SECRET) {
  console.error("⚠️ HOTELBEDS_API_KEY or HOTELBEDS_SECRET is missing. Check your .env file.");
  process.exit(1);
}

// Generate signature using API_KEY, SECRET and current timestamp
const generateSignature = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signatureString = HOTELBEDS_API_KEY + HOTELBEDS_SECRET + timestamp;
  const signature = crypto.createHash("sha256").update(signatureString).digest("hex");
  return { signature, timestamp };
};

const hotelbedsClient = axios.create({
  // Updated to version 3.0 per the YAML specification
  baseURL: "https://api.test.hotelbeds.com/hotel-api/3.0",
  headers: {
    "Api-key": HOTELBEDS_API_KEY,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add interceptor to set dynamic signature and timestamp headers
hotelbedsClient.interceptors.request.use(
  (config) => {
    const { signature, timestamp } = generateSignature();
    config.headers["X-Signature"] = signature;
    config.headers["X-Timestamp"] = timestamp;
    return config;
  },
  (error) => Promise.reject(error)
);

module.exports = {
  hotels: {
    get: (url, params) => hotelbedsClient.get(url, params),
    post: (url, data) => hotelbedsClient.post(url, data),
  },
};
