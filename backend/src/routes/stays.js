// backend/src/routes/stays.js
const express = require("express");
const { getHotelLocations } = require("../controllers/staysController");
const router = express.Router();

router.get("/locations", getHotelLocations);

module.exports = router;
