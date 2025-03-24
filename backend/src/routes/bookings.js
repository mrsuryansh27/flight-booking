// backend/src/routes/bookings.js
const express = require("express");
const { createBooking, validateOffer, getBookingDetails } = require("../controllers/bookingController");
const router = express.Router();

router.post("/book", createBooking);
router.get("/validate-offer", validateOffer); 
router.get("/details", getBookingDetails);



module.exports = router;


