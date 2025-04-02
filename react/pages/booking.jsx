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
import Header1 from "@/src/layout/header/Header1";
import Footer2 from "@/src/layout/Footer2";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';



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
      emailError: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (index, email) => {
    setPassengers((prev) =>
      prev.map((pass, i) =>
        i === index
          ? {
            ...pass,
            email,
            emailError: validateEmail(email) ? "" : "Invalid email address",
          }
          : pass
      )
    );
  };


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

    if (
      passengers.some(
        (p) =>
          !p.firstName ||
          !p.lastName ||
          !p.email ||
          !p.phone ||
          !p.birthDate ||
          p.emailError
      )
    ) {
      setError(
        "All passenger fields (First Name, Last Name, Email, Phone, Date of Birth) are required and must be valid."
      );
      setLoading(false);
      return;
    }
    

    let finalOfferId = offerId;
    let retryCount = 0;

    // const formatPhoneNumber = (phone) => {
    //   let cleaned = phone.trim();
    //   if (!cleaned.startsWith("+")) {
    //     cleaned = "+91" + cleaned.replace(/\D/g, ""); // ✅ Default to +91 if missing
    //   } else {
    //     cleaned = "+" + cleaned.replace(/\D/g, "").replace(/^0+/, ""); // ✅ Ensure + and remove leading 0s
    //   }
    //   return cleaned;
    // };

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
        phone_number: '+' + p.phone,
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
    <div className=" mx-12 my-48">
      <Header1 />
      <div className="container">
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" gutterBottom>
            Basic Details
          </Typography>
          {offerId ? (
            <>
              <Typography className='font-bold' variant="subtitle1">Offer ID: {offerId}</Typography>
              {paymentAmount && (
                <Typography className='font-bold' variant="subtitle1">
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
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        error={Boolean(p.emailError)}
                        helperText={p.emailError}
                      />
                    </Grid>


                    <Grid item xs={12} sm={4}>
                      <PhoneInput
                        country={'us'} // default country (India)
                        value={p.phone}

                        onChange={(phone) =>
                          setPassengers((prev) =>
                            prev.map((pass, i) =>
                              i === index ? { ...pass, phone: phone } : pass
                            )
                          )
                        }
                        inputProps={{
                          required: true,
                          name: 'phone',
                        }}

                        containerStyle={{ width: '100%' }}
                        inputStyle={{
                          width: '100%',
                          height: '56px',                // MUI default TextField height
                          fontSize: '16px',              // Matches MUI TextField font size
                          borderRadius: '4px',           // Matches MUI border-radius
                          borderColor: 'rgba(0,0,0,0.23)', // Matches MUI OutlinedInput border color
                        }}
                        buttonStyle={{
                          borderRadius: '4px 0 0 4px',   // Consistent border radius
                          borderColor: 'rgba(0,0,0,0.23)',
                        }}
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
      </div>
      <Footer2 />
    </div>
  );
};

export default BookingPage;


// Enhanced BookingPage with improved UI
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Grid,
//   TextField,
//   Typography,
//   Container,
//   CircularProgress,
//   Divider
// } from "@mui/material";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import Header1 from "@/src/layout/header/Header1";
// import Footer2 from "@/src/layout/Footer2";

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// const BookingPage = () => {
//   const router = useRouter();
//   const { origin, destination, departure_date, cabin_class } = router.query;

//   const [offerId, setOfferId] = useState("");
//   const [paymentAmount, setPaymentAmount] = useState("");
//   const [passengers, setPassengers] = useState([
//     {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       gender: "m",
//       birthDate: "",
//       title: "Mr",
//       passengerType: "adult",
//       emailError: "",
//     },
//   ]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const handleEmailChange = (index, email) => {
//     setPassengers((prev) =>
//       prev.map((pass, i) =>
//         i === index
//           ? {
//               ...pass,
//               email,
//               emailError: validateEmail(email) ? "" : "Invalid email address",
//             }
//           : pass
//       )
//     );
//   };

//   useEffect(() => {
//     const storedOfferId = localStorage.getItem("selectedOfferId");
//     const storedPrice = localStorage.getItem("selectedOfferPrice");

//     if (storedOfferId) {
//       setOfferId(storedOfferId);
//       setPaymentAmount(storedPrice);
//     } else {
//       alert("No valid flight offer found. Please search again.");
//       router.push("/flight-results");
//     }
//   }, []);

//   const handleBook = async () => {
//     setLoading(true);
//     setError("");

//     if (
//       passengers.some(
//         (p) =>
//           !p.firstName ||
//           !p.lastName ||
//           !p.email ||
//           !p.phone ||
//           !p.birthDate ||
//           p.emailError
//       )
//     ) {
//       setError("Please fill all fields correctly for all passengers.");
//       setLoading(false);
//       return;
//     }

//     // Simulated response delay & redirect (replace with actual API call)
//     setTimeout(() => {
//       router.push({
//         pathname: "/confirmation",
//         query: {
//           booking_reference: "REF123456",
//           booking_id: "BK987654321",
//         },
//       });
//     }, 1500);
//   };

//   return (
    // <>
    //   <Header1 />
    //   <Container maxWidth="md" sx={{ py: 6 }}>
    //     <Typography variant="h4" gutterBottom fontWeight="bold">
    //       Booking Details
    //     </Typography>

    //     <Card elevation={3} sx={{ mb: 3 }}>
    //       <CardContent>
    //         <Typography variant="subtitle1">
    //           <strong>Offer ID:</strong> {offerId || "N/A"}
    //         </Typography>
    //         <Typography variant="subtitle1">
    //           <strong>Payment Amount:</strong> {paymentAmount || "N/A"} USD
    //         </Typography>
    //       </CardContent>
    //     </Card>

    //     <Card elevation={4}>
    //       <CardContent>
    //         <Typography variant="h6" gutterBottom fontWeight="bold">
    //           Passenger Details
    //         </Typography>
    //         <Grid container spacing={2}>
    //           {passengers.map((p, index) => (
    //             <React.Fragment key={index}>
    //               <Grid item xs={12} sm={6}>
    //                 <TextField
    //                   label="First Name"
    //                   fullWidth
    //                   required
    //                   value={p.firstName}
    //                   onChange={(e) =>
    //                     setPassengers((prev) =>
    //                       prev.map((pass, i) =>
    //                         i === index ? { ...pass, firstName: e.target.value } : pass
    //                       )
    //                     )
    //                   }
    //                 />
    //               </Grid>
    //               <Grid item xs={12} sm={6}>
    //                 <TextField
    //                   label="Last Name"
    //                   fullWidth
    //                   required
    //                   value={p.lastName}
    //                   onChange={(e) =>
    //                     setPassengers((prev) =>
    //                       prev.map((pass, i) =>
    //                         i === index ? { ...pass, lastName: e.target.value } : pass
    //                       )
    //                     )
    //                   }
    //                 />
    //               </Grid>
    //               <Grid item xs={12} sm={6}>
    //                 <TextField
    //                   label="Email"
    //                   type="email"
    //                   fullWidth
    //                   required
    //                   value={p.email}
    //                   onChange={(e) => handleEmailChange(index, e.target.value)}
    //                   error={Boolean(p.emailError)}
    //                   helperText={p.emailError}
    //                 />
    //               </Grid>
    //               <Grid item xs={12} sm={6}>
    //                 <PhoneInput
    //                   country="us"
    //                   value={p.phone}
    //                   onChange={(phone) =>
    //                     setPassengers((prev) =>
    //                       prev.map((pass, i) =>
    //                         i === index ? { ...pass, phone } : pass
    //                       )
    //                     )
    //                   }
    //                   inputProps={{ required: true, name: "phone" }}
    //                   containerStyle={{ width: "100%" }}
    //                   inputStyle={{
    //                     width: "100%",
    //                     height: "56px",
    //                     fontSize: "16px",
    //                     borderRadius: "4px",
    //                     borderColor: "rgba(0,0,0,0.23)",
    //                   }}
    //                   buttonStyle={{
    //                     borderRadius: "4px 0 0 4px",
    //                     borderColor: "rgba(0,0,0,0.23)",
    //                   }}
    //                 />
    //               </Grid>
    //               <Grid item xs={12} sm={6}>
    //                 <TextField
    //                   label="Date of Birth"
    //                   type="date"
    //                   fullWidth
    //                   required
    //                   InputLabelProps={{ shrink: true }}
    //                   value={p.birthDate}
    //                   onChange={(e) =>
    //                     setPassengers((prev) =>
    //                       prev.map((pass, i) =>
    //                         i === index ? { ...pass, birthDate: e.target.value } : pass
    //                       )
    //                     )
    //                   }
    //                 />
    //               </Grid>
    //             </React.Fragment>
    //           ))}
    //         </Grid>
    //         <Button
    //           variant="outlined"
    //           fullWidth
    //           sx={{ mt: 3 }}
    //           onClick={() =>
    //             setPassengers([
    //               ...passengers,
    //               {
    //                 firstName: "",
    //                 lastName: "",
    //                 email: "",
    //                 phone: "",
    //                 gender: "m",
    //                 birthDate: "",
    //                 title: "Mr",
    //                 passengerType: "adult",
    //                 emailError: "",
    //               },
    //             ])
    //           }
    //         >
    //           + Add Another Passenger
    //         </Button>
    //       </CardContent>
    //     </Card>

    //     <Box textAlign="center" mt={4}>
    //       <Button
    //         variant="contained"
    //         color="primary"
    //         size="large"
    //         onClick={handleBook}
    //         disabled={loading}
    //       >
    //         {loading ? <CircularProgress size={24} /> : "Confirm Booking"}
    //       </Button>
    //       {error && (
    //         <Typography color="error" mt={2}>
    //           {error}
    //         </Typography>
    //       )}
    //     </Box>
    //   </Container>
    //   <Footer2 />
    // </>
//   );
// };

// export default BookingPage;