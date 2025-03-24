const axios = require("axios");
require("dotenv").config();

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;
if (!DUFFEL_API_KEY) {
  console.error("⚠️  DUFFEL_API_KEY is missing. Check your .env file.");
  process.exit(1);
} else {
  // Print a truncated version of the token for debugging
  console.log("✅ DUFFEL_API_KEY Loaded Successfully:", DUFFEL_API_KEY.substring(0, 10) + "...");
}

const duffelFlightsClient = axios.create({
  baseURL: "https://api.duffel.com/air",
  headers: {
    Authorization: `Bearer ${DUFFEL_API_KEY}`,
    "Accept-Encoding": "gzip",
    Accept: "application/json",
    "Content-Type": "application/json",
    "Duffel-Version": "v2",
  },
});

const duffelStaysClient = axios.create({
  baseURL: "https://api.duffel.com/stays",
  headers: {
    Authorization: `Bearer ${DUFFEL_API_KEY}`,
    "Accept-Encoding": "gzip",
    Accept: "application/json",
    "Content-Type": "application/json",
    "Duffel-Version": "v2",
  },
});

module.exports = {
  flights: {
    get: (url, params) => duffelFlightsClient.get(url, params),
    post: (url, data) => duffelFlightsClient.post(url, data),
  },
  stays: {
    get: (url, params) => duffelStaysClient.get(url, params),
    post: (url, data) => duffelStaysClient.post(url, data),
  },
};
