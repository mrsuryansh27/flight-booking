// react/pages/booking.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const BookingPage = () => {
  const router = useRouter();
  const { origin, destination, departure_date, cabin_class } = router.query;

  const [offerId, setOfferId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [passengers, setPassengers] = useState([
    {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "m",
      birthDate: "",
      title: "Mr",
      passengerType: "adult",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // ✅ Load `offer_id` from Local Storage instead of the URL
  useEffect(() => {
    const storedOfferId = localStorage.getItem("selectedOfferId");
    const storedPrice = localStorage.getItem("selectedOfferPrice");

    if (storedOfferId) {
      setOfferId(storedOfferId);
      setPaymentAmount(storedPrice);
    } else {
      alert("No valid flight offer found. Please search again.");
      router.push("/flight-results");
    }
  }, []);

  const validateOffer = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings/validate-offer?offer_id=${offerId}`);
      const data = await res.json();
  
      if (!res.ok || data.valid === false) {
        console.error("❌ Offer validation failed:", data);
        return false;
      }
  
      return true;
    } catch (err) {
      console.error("❌ Offer validation failed:", err);
      return false;
    }
  };
  
  
  

  const fetchNewOffer = async () => {
    try {
      console.log("🔄 Searching for new flight offers...");
      const res = await fetch(`${BACKEND_URL}/api/flights/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin || "DEFAULT_ORIGIN", 
          destination: destination || "DEFAULT_DESTINATION", 
          departure_date: departure_date || "2025-03-31",
          cabin_class: cabin_class || "economy",
          passengers: [{ type: "adult" }], 
        }),
      });
  
      const data = await res.json();
  
      if (res.ok && data.flights && data.flights.length > 0) {
        const newOffer = data.flights[0]; 
        setOfferId(newOffer.id);
        setPaymentAmount(newOffer.total_price);
        localStorage.setItem("selectedOfferId", newOffer.id);
        localStorage.setItem("selectedOfferPrice", newOffer.total_price);
        return newOffer.id;
      } else {
        console.error("❌ No new offers found.", data);
      }
    } catch (error) {
      console.error("❌ Error fetching new offer:", error);
    }
    return null;
  };
  
  
  
  

  const handleBook = async () => {
    setLoading(true);
    setError("");

    if (passengers.some(p => !p.firstName || !p.lastName || !p.email || !p.phone || !p.birthDate)) {
        setError("All passenger fields (First Name, Last Name, Email, Phone, Date of Birth) are required.");
        setLoading(false);
        return;
    }

    let finalOfferId = offerId;
    let retryCount = 0;

    const formatPhoneNumber = (phone) => {
        let cleaned = phone.trim();
        if (!cleaned.startsWith("+")) {
            cleaned = "+91" + cleaned.replace(/\D/g, ""); // ✅ Default to +91 if missing
        } else {
            cleaned = "+" + cleaned.replace(/\D/g, "").replace(/^0+/, ""); // ✅ Ensure + and remove leading 0s
        }
        return cleaned;
    };

    // ✅ Validate offer before booking, retry if expired
    while (retryCount < 2) {
        const isValid = await validateOffer();
        if (isValid) break;

        console.warn(`⚠️ Expired offer detected. Retrying search... (${retryCount + 1}/2)`);
        finalOfferId = await fetchNewOffer();
        if (!finalOfferId) {
            setError("No available offers found after multiple attempts. Please try again later.");
            setLoading(false);
            return;
        }
        retryCount++;
    }

    // ✅ Fetch the validated offer to get correct passenger ID & price
    try {
        const validatedOfferRes = await fetch(`${BACKEND_URL}/api/bookings/validate-offer?offer_id=${finalOfferId}`);
        const offerData = await validatedOfferRes.json();

        if (!offerData.valid || !offerData.offer?.data?.passengers?.length) {
            setError("No valid passengers found in the offer. Please try again.");
            setLoading(false);
            return;
        }

        const correctPassengerId = offerData.offer.data.passengers[0].id; // ✅ Correct Passenger ID
        const correctPrice = parseFloat(offerData.offer.data.total_amount); // ✅ Exact price from Duffel

        const passengersData = passengers.map((p) => ({
            id: correctPassengerId, // ✅ Use correct passenger ID
            type: p.passengerType || "adult",
            given_name: p.firstName.trim(),
            family_name: p.lastName.trim(),
            born_on: p.birthDate,
            title: p.title || "Mr",
            gender: p.gender || "m",
            email: p.email.trim(),
            phone_number: formatPhoneNumber(p.phone),
        }));

        console.log("📡 Sending booking request to Duffel...");
        const res = await fetch(`${BACKEND_URL}/api/bookings/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                offer_id: finalOfferId,
                payment_amount: correctPrice, // ✅ Ensure exact price match
                passengers: passengersData,
                payments: [{ type: "balance", amount: correctPrice.toFixed(2), currency: "USD" }], // ✅ Correct amount format
                offerDetails: { origin, destination, departure_date, cabin_class },
            }),
        });

        const data = await res.json();
        console.log("📡 FULL DUFFEL RESPONSE:", JSON.stringify(data, null, 2)); // ✅ Debug response

        if (!res.ok) {
            console.error("❌ Booking failed:", data);
            throw new Error(data.error || "Booking failed");
        }

        setBookingConfirmation(data.booking);
        const bookingData = data.booking?.data;
        router.push({
          pathname: "/confirmation",
          query: {
            booking_reference: bookingData?.booking_reference,
            booking_id: bookingData?.id,
          },
        });


    } catch (err) {
        setError(err.message || "An error occurred.");
        console.error("❌ Booking Error:", err);
    } finally {
        setLoading(false);
    }
};






  
  
  
  
  
  

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Booking Confirmation
      </Typography>
      {offerId ? (
        <>
          <Typography variant="subtitle1">Offer ID: {offerId}</Typography>
          {paymentAmount && (
            <Typography variant="subtitle1">
              Payment Amount: {paymentAmount} USD
            </Typography>
          )}
        </>
      ) : (
        <Typography variant="subtitle1" color="error">
          No offer ID provided.
        </Typography>
      )}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Passenger Details
          </Typography>
          <Grid container spacing={2}>
            {passengers.map((p, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="First Name"
                    fullWidth
                    required
                    value={p.firstName}
                    onChange={(e) =>
                      setPassengers((prev) =>
                        prev.map((pass, i) =>
                          i === index ? { ...pass, firstName: e.target.value } : pass
                        )
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    required
                    value={p.lastName}
                    onChange={(e) =>
                      setPassengers((prev) =>
                        prev.map((pass, i) =>
                          i === index ? { ...pass, lastName: e.target.value } : pass
                        )
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    value={p.email}
                    onChange={(e) =>
                      setPassengers((prev) =>
                        prev.map((pass, i) =>
                          i === index ? { ...pass, email: e.target.value } : pass
                        )
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Phone Number"
                    type="tel"
                    fullWidth
                    required
                    value={p.phone}
                    onChange={(e) =>
                      setPassengers((prev) =>
                        prev.map((pass, i) =>
                          i === index ? { ...pass, phone: e.target.value } : pass
                        )
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={p.birthDate}
                    onChange={(e) =>
                      setPassengers((prev) =>
                        prev.map((pass, i) =>
                          i === index ? { ...pass, birthDate: e.target.value } : pass
                        )
                      )
                    }
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setPassengers([...passengers, { firstName: "", lastName: "", email: "", phone: "", gender: "m", birthDate: "", title: "Mr", passengerType: "adult" }])}>
            Add Passenger
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleBook} disabled={loading}>
          {loading ? "Booking..." : "Confirm Booking"}
        </Button>
      </Box>

      {error && <Typography variant="body1" color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Box>
  );
};

export default BookingPage;
