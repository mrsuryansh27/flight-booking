// backend/src/controllers/checkRatesController.js
const { hotels } = require("../services/hotelbedsService");

exports.checkRates = async (req, res) => {
  const { rooms } = req.body;

  // Validate that rooms is provided as a non-empty array
  if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
    return res.status(400).json({ error: "Missing required field: 'rooms'" });
  }

  try {
    // Call the Hotelbeds checkrates endpoint
    const response = await hotels.post("/checkrates", { rooms });
    // You can choose to return the full response or just a portion (like the rates details)
    res.json({ checkRates: response.data });
  } catch (error) {
    console.error("❌ Hotelbeds Checkrates API Error:", JSON.stringify(error, null, 2));
    res.status(error.response?.status || 500).json({
      error: "Failed to check rates",
      details: error.response?.data || error.message,
    });
  }
};
