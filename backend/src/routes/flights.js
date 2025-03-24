// backend/src/routes/flights.js
const express = require("express");
const { searchFlights } = require("../controllers/flightController");
const { getAirports } = require("../controllers/airportController");
const router = express.Router();

router.post("/search", searchFlights);
router.get("/airports", getAirports);

module.exports = router;
