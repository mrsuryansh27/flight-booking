// backend/src/controllers/staysController.js
const { hotels } = require("../services/hotelbedsService");

exports.searchHotels = async (req, res) => {
  const { stay, occupancies } = req.body;
  
  // Check for required fields: stay and occupancies must be provided
  if (!stay || !stay.checkIn || !stay.checkOut || !occupancies) {
    return res.status(400).json({ 
      error: "Missing required fields: 'stay' (with checkIn and checkOut) and 'occupancies'" 
    });
  }
  
  // Ensure at least one search criteria is provided:
  // It can be either "hotels", "filters", "geolocation", or "destination"
  if (!req.body.hotels && !req.body.filters && !req.body.geolocation && !req.body.destination) {
    return res.status(400).json({ 
      error: "Missing search criteria: please provide one of 'hotels', 'filters', 'geolocation', or 'destination'" 
    });
  }

  // Build the request body by passing along the payload as is.
  const requestBody = { ...req.body };

  try {
    // According to the spec, use the /hotels endpoint for hotel search.
    const response = await hotels.post("/hotels", requestBody);
    res.json({ hotels: response.data });
  } catch (error) {
    console.error("❌ Hotelbeds API Error:", JSON.stringify(error, null, 2));
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch hotels",
      details: error.response?.data || error.message,
    });
  }
};

exports.getHotelLocations = async (req, res) => {
  // Accept either 'query' or 'q' as the parameter name.
  const searchQuery = req.query.query || req.query.q;
  if (!searchQuery) {
    return res.status(400).json({ error: "Query parameter is required." });
  }
  try {
    const response = await hotels.get("/reference/locations", { params: { q: searchQuery } });
    res.json({ locations: response.data.locations });
  } catch (error) {
    console.error("❌ Hotelbeds Locations API Error:", JSON.stringify(error, null, 2));
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch hotel locations",
      details: error.response?.data || error.message,
    });
  }
};
