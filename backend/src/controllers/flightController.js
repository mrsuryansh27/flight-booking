const duffelService = require("../services/duffelService");

exports.searchFlights = async (req, res) => {
  try {
    console.log("🔍 Received flight search request:", req.body);
    const { origin, destination, departure_date, return_date, passengers, cabin_class } = req.body;

    if (!origin || !destination || !departure_date || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ error: "Missing or invalid required fields: origin, destination, departure_date, passengers" });
    }

    const requestBody = {
      data: {
        slices: [
          { origin, destination, departure_date },
          ...(return_date ? [{ origin: destination, destination: origin, departure_date: return_date }] : []),
        ],
        passengers: passengers.map((p) => ({ type: p.type || "adult" })),
        cabin_class: cabin_class || "economy",
      },
    };

    console.log("📨 Request to Duffel API:", JSON.stringify(requestBody, null, 2));

    const response = await duffelService.flights.post('/offer_requests?return_offers=true', requestBody);
    console.log("✅ Duffel API Response:", response.data);

    // ✅ Extract valid offer_id and return it to the frontend
    const offers = response.data.data.offers;
    const formattedFlights = offers.map((offer) => ({
      id: offer.id,
      total_price: `${offer.total_amount} ${offer.total_currency}`,
      departure: {
        airport: offer.slices[0].origin.name,
        iata_code: offer.slices[0].origin.iata_code,
        time: offer.slices[0].segments[0].departing_at,
      },
      arrival: {
        airport: offer.slices[0].destination.name,
        iata_code: offer.slices[0].destination.iata_code,
        time: offer.slices[0].segments[0].arriving_at,
      },
      airline: {
        name: offer.slices[0].segments[0].marketing_carrier.name,
        logo: offer.slices[0].segments[0].marketing_carrier.logo_symbol_url,
      },
      duration: offer.slices[0].duration,
      cabin_class: offer.slices[0].segments[0].passengers[0].cabin_class_marketing_name,
      baggage: offer.slices[0].segments[0].passengers[0].baggages,
      emissions_kg: offer.total_emissions_kg,
    }));

    res.json({ flights: formattedFlights });

  } catch (error) {
    console.error("❌ Duffel API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to search flights",
      details: error.response?.data || error.message,
    });
  }
};
