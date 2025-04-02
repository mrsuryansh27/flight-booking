// backend/src/routes/stays.js
const express = require("express");
const { getHotelLocations, searchHotels } = require("../controllers/staysController");
const router = express.Router();

router.get("/locations", getHotelLocations);
router.post("/search", searchHotels);

module.exports = router;
