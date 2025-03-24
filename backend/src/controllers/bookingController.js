const duffelClient = require("../services/duffelService");

async function searchForNewOffer(passengerData, offerDetails) {
  console.log("🔄 Retrying flight search to get a fresh offer...");

  const searchRequest = {
    data: {
      slices: [
        {
          origin: offerDetails.origin,
          destination: offerDetails.destination,
          departure_date: offerDetails.departure_date,
        },
      ],
      passengers: passengerData.map((p) => ({ type: p.type || "adult" })),
      cabin_class: offerDetails.cabin_class || "economy",
    },
  };

  try {
    const response = await duffelClient.flights.post("/offer_requests?return_offers=true", searchRequest);
    if (!response.data.data.offers || response.data.data.offers.length === 0) {
      console.error("❌ No new flight offers found.");
      return null;
    }

    const newOffer = response.data.data.offers.find(offer => offer.owner.id === process.env.DUFFEL_ACCOUNT_ID);
    if (!newOffer) {
      console.error("❌ No valid offers found under your Duffel account.");
      return null;
    }

    console.log("✅ New Offer Found:", newOffer.id, "New Price:", newOffer.total_amount, newOffer.total_currency);
    
    return { id: newOffer.id, price: newOffer.total_amount, currency: newOffer.total_currency };
  } catch (error) {
    console.error("❌ Error fetching new offer:", error.response?.data || error.message);
    return null;
  }
}



exports.createBooking = async (req, res) => {
  try {
    let { offer_id, passengers, payment_amount, offerDetails } = req.body;

    if (!offer_id || !passengers || !Array.isArray(passengers) || passengers.length === 0 || !payment_amount) {
      return res.status(400).json({ error: "Missing required fields: offer_id, passengers, or payment_amount." });
    }

    // Step 1: Prepare order request
    let orderRequestBody = {
      data: {
        selected_offers: [offer_id],
        passengers: passengers.map((p, index) => ({
          id: p.id,
          type: p.type,
          given_name: p.given_name,
          family_name: p.family_name,
          born_on: p.born_on,
          title: p.title || "Mr",
          gender: p.gender,
          email: p.email,
          phone_number: p.phone_number.replace(/\s+/g, ""),
        })),
        payments: [
          {
            type: "balance",
            amount: payment_amount,
            currency: "USD",
          },
        ],
      },
    };

    console.log("📡 Order Request Sent to Duffel:", JSON.stringify(orderRequestBody, null, 2));

    // Step 2: Send booking request
    let orderResponse;
    try {
      orderResponse = await duffelClient.flights.post("/orders", orderRequestBody);
    } catch (error) {
      if (error.response?.status === 422 && error.response.data.errors[0].code === "not_found") {
        console.warn("⚠️ Expired `offer_id` detected. Fetching a new one...");
    
        // Step 3: Get a fresh `offer_id`
        const newOffer = await searchForNewOffer(passengers, offerDetails);
        if (!newOffer) {
          return res.status(400).json({ error: "No available offers for this flight. Please try again." });
        }
    
        // Step 4: Retry booking with new offer and updated price
        orderRequestBody.data.selected_offers = [newOffer.id];
        orderRequestBody.data.payments[0].amount = newOffer.price; // ✅ Use updated price
        orderRequestBody.data.payments[0].currency = newOffer.currency; // ✅ Use correct currency
    
        console.log("🔄 Retrying booking with new offer:", newOffer.id, "Price:", newOffer.price);
        orderResponse = await duffelClient.flights.post("/orders", orderRequestBody);
      } else {
        throw error; // If it's another error, return it as is.
      }
    }
    

    console.log("✅ Booking Successful:", JSON.stringify(orderResponse.data, null, 2));
    return res.json({ success: true, booking: orderResponse.data });

  } catch (error) {
    console.error("❌ Booking Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Booking failed",
      details: error.response?.data || error.message,
    });
  }
};

exports.validateOffer = async (req, res) => {
  const { offer_id } = req.query;

  if (!offer_id) {
    return res.status(400).json({ error: "Missing offer_id" });
  }

  try {
    const response = await duffelClient.flights.get(`/offers/${offer_id}`);

    if (!response.data) {
      return res.status(404).json({ valid: false, error: "Offer not found" });
    }

    res.json({ valid: true, offer: response.data });
  } catch (error) {
    console.error("❌ Offer validation error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ valid: false, error: "Offer validation failed" });
  }
};





exports.getBookingDetails = async (req, res) => {
  const { booking_id } = req.query;
  if (!booking_id) {
    return res.status(400).json({ error: "Missing booking_id" });
  }
  try {
    // Example: Fetch details from Duffel API if available
    const response = await duffelClient.flights.get(`/orders/${booking_id}`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching booking details:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch booking details",
      details: error.response?.data || error.message,
    });
  }
};
