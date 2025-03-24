// react/pages/flight-results.jsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Card, CardContent, Typography, Button, Divider } from "@mui/material";
import dayjs from "dayjs";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const FlightResults = () => {
  const router = useRouter();
  const { origin, destination, departure_date, return_date, passengers, cabin_class } = router.query;
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!origin || !destination || !departure_date || !passengers) {
      setLoading(false);
      return;
    }
    const fetchFlights = async () => {
      try {
        const payload = {
          origin,
          destination,
          departure_date,
          return_date: return_date || "",
          passengers: JSON.parse(passengers),
          cabin_class: cabin_class || "economy",
        };
        const res = await fetch(`${BACKEND_URL}/api/flights/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch flights");
        }
        setFlights(data.flights || []);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [origin, destination, departure_date, return_date, passengers, cabin_class]);

  if (loading)
    return <Typography variant="h6" sx={{ m: 2 }}>Loading flight results...</Typography>;
  if (error)
    return <Typography variant="h6" sx={{ m: 2 }} color="error">Error: {error}</Typography>;
  if (!flights.length)
    return <Typography variant="h6" sx={{ m: 2 }}>No flights found.</Typography>;

  const handleSelectFlight = (flight) => {
    localStorage.setItem("selectedOfferId", flight.id); // ✅ Store offer_id
    localStorage.setItem("selectedOfferPrice", flight.total_price);

    router.push({
      pathname: "/booking",
      query: {
        origin: flight.departure.iata_code,
        destination: flight.arrival.iata_code,
        departure_date: flight.departure.time.split("T")[0],
        cabin_class: flight.cabin_class,
      },
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Flight Results
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {flights.map((flight) => {
          const depTime = dayjs(flight.departure.time).format("MMM D, YYYY HH:mm");
          const arrTime = dayjs(flight.arrival.time).format("MMM D, YYYY HH:mm");
          return (
            <Card key={flight.id} sx={{ display: "flex", flexWrap: "wrap", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2 }}>
                {flight.airline?.logo && (
                  <img
                    src={flight.airline.logo}
                    alt={flight.airline.name}
                    style={{ width: 40, height: "auto", marginRight: 8 }}
                  />
                )}
                <Typography variant="subtitle1">
                  {flight.airline?.name || "Unknown Airline"}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Box sx={{ flex: 1, minWidth: 200, mr: 2 }}>
                <Typography variant="body2">
                  <strong>Departure:</strong> {flight.departure.airport} ({flight.departure.iata_code})
                  <br />
                  <em>{depTime}</em>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Arrival:</strong> {flight.arrival.airport} ({flight.arrival.iata_code})
                  <br />
                  <em>{arrTime}</em>
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Box sx={{ minWidth: 150, mr: 2 }}>
                <Typography variant="body2">
                  <strong>Duration:</strong> {flight.duration}
                </Typography>
                <Typography variant="body2">
                  <strong>Cabin:</strong> {flight.cabin_class}
                </Typography>
                <Typography variant="body2">
                  <strong>Baggage:</strong>{" "}
                  {flight.baggage.map((bag, idx) => (
                    <span key={idx}>
                      {bag.quantity} x {bag.type}
                      {idx < flight.baggage.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Box sx={{ textAlign: "right", minWidth: 120 }}>
                <Typography variant="h6" sx={{ mb: 1 }} color="primary">
                  {flight.total_price}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleSelectFlight(flight)}
                >
                  Select
                </Button>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default FlightResults;
