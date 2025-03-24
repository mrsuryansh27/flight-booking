// backend/src/controllers/airportController.js
const duffelService = require("../services/duffelService");

exports.getAirports = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  try {
    const response = await duffelService.flights.get("/airports", {
      params: { query },
    });
    console.log("✅ Duffel API Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching airports from Duffel:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch airport data", 
      details: error.response?.data || error.message,
    });
  }
};
