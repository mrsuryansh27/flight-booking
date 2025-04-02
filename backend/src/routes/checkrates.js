// backend/src/routes/checkrates.js
const express = require("express");
const { checkRates } = require("../controllers/checkRatesController");
const router = express.Router();

// POST /api/hotels/checkrates
router.post("/", checkRates);

module.exports = router;
