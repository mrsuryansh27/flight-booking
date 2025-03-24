// backend/src/controllers/staysController.js
const { stays } = require("../services/duffelService");

exports.searchStays = async (req, res) => {
  const { location, check_in, check_out, guests } = req.body;
  if (!location || !check_in || !check_out || !guests) {
    return res.status(400).json({ error: "Missing required search parameters." });
  }
  try {
    const response = await stays.post("/offer_requests", {
      query: {
        location,
        check_in,
        check_out,
        guests: guests.map(() => ({ type: "adult" })), // Adjust if you collect guest types
      },
    });
    res.json({ stays: response.data.data });
  } catch (error) {
    console.error("❌ Duffel Stays API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to fetch stays", details: error.response?.data });
  }
};

exports.getHotelLocations = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required." });
  }
  try {
    const response = await stays.get(`/locations`, { params: { query } });
    res.json({ locations: response.data.data });
  } catch (error) {
    console.error("❌ Duffel Stays Location API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to fetch hotel locations", details: error.response?.data });
  }
};
