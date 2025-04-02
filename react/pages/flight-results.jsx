// // react/pages/flight-results.jsx
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { Box, Card, CardContent, Typography, Button, Divider } from "@mui/material";
// import dayjs from "dayjs";
// import Header1 from "@/src/layout/header/Header1";
// import Footer2 from "@/src/layout/Footer2";
// import Layout from "@/src/layout/Layout";
// import PreLoader from "@/src/layout/PreLoader";




// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// const FlightResults = ({ Component, pageProps }) => {
//   const [loader, setLoader] = useState(true);
//   useEffect(() => {
//     setTimeout(() => {
//       setLoader(false);
//     }, 1500);
//   }, []);

//   const router = useRouter();
//   const { origin, destination, departure_date, return_date, passengers, cabin_class } = router.query;
//   const [flights, setFlights] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!origin || !destination || !departure_date || !passengers) {
//       setLoading(false);
//       return;
//     }
//     const fetchFlights = async () => {
//       try {
//         const payload = {
//           origin,
//           destination,
//           departure_date,
//           return_date: return_date || "",
//           passengers: JSON.parse(passengers),
//           cabin_class: cabin_class || "economy",
//         };
//         const res = await fetch(`${BACKEND_URL}/api/flights/search`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });
//         const data = await res.json();
//         if (!res.ok) {
//           throw new Error(data.error || "Failed to fetch flights");
//         }
//         setFlights(data.flights || []);
//       } catch (err) {
//         setError(err.message || "An error occurred");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFlights();
//   }, [origin, destination, departure_date, return_date, passengers, cabin_class]);

//   if (loading)
//     // return <Typography variant="h6" sx={{ m: 2 }}>Loading flight results...</Typography>;
//   return <PreLoader/>;
//   if (error)
//     return <Typography variant="h6" sx={{ m: 2 }} color="error">Error: {error}</Typography>;
//   if (!flights.length)
//     return <Typography variant="h6" sx={{ m: 2 }}>No flights found.</Typography>;

//   const handleSelectFlight = (flight) => {
//     localStorage.setItem("selectedOfferId", flight.id); // ✅ Store offer_id
//     localStorage.setItem("selectedOfferPrice", flight.total_price);

//     router.push({
//       pathname: "/booking",
//       query: {
//         origin: flight.departure.iata_code,
//         destination: flight.arrival.iata_code,
//         departure_date: flight.departure.time.split("T")[0],
//         cabin_class: flight.cabin_class,
//       },
//     });
//   };

//   return (
//     // <Layout header={1}>
//     <div className=" mx-12 my-48">
//       <Header1 />
// <div className="container">
//       <Box sx={{ p: 2 }} className='pt-20'>
//         <Typography variant="h4" gutterBottom>
//           Flight Results
//         </Typography>
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           {flights.map((flight) => {
//             const depTime = dayjs(flight.departure.time).format("MMM D, YYYY HH:mm");
//             const arrTime = dayjs(flight.arrival.time).format("MMM D, YYYY HH:mm");
//             return (
//               <Card key={flight.id} sx={{ display: "flex", flexWrap: "wrap", p: 2 }}>
//                 <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2 }}>
//                   {flight.airline?.logo && (
//                     <img
//                       src={flight.airline.logo}
//                       alt={flight.airline.name}
//                       style={{ width: 40, height: "auto", marginRight: 8 }}
//                     />
//                   )}
//                   <Typography variant="subtitle1">
//                     {flight.airline?.name || "Unknown Airline"}
//                   </Typography>
//                 </Box>
//                 <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
//                 <Box sx={{ flex: 1, minWidth: 200, mr: 2 }}>
//                   <Typography variant="body2">
//                     <strong>Departure:</strong> {flight.departure.airport} ({flight.departure.iata_code})
//                     <br />
//                     <em>{depTime}</em>
//                   </Typography>
//                   <Typography variant="body2" sx={{ mt: 1 }}>
//                     <strong>Arrival:</strong> {flight.arrival.airport} ({flight.arrival.iata_code})
//                     <br />
//                     <em>{arrTime}</em>
//                   </Typography>
//                 </Box>
//                 <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
//                 <Box sx={{ minWidth: 150, mr: 2 }}>
//                   <Typography variant="body2">
//                     <strong>Duration:</strong> {flight.duration}
//                   </Typography>
//                   <Typography variant="body2">
//                     <strong>Cabin:</strong> {flight.cabin_class}
//                   </Typography>
//                   <Typography variant="body2">
//                     <strong>Baggage:</strong>{" "}
//                     {flight.baggage.map((bag, idx) => (
//                       <span key={idx}>
//                         {bag.quantity} x {bag.type}
//                         {idx < flight.baggage.length - 1 ? ", " : ""}
//                       </span>
//                     ))}
//                   </Typography>
//                 </Box>
//                 <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
//                 <Box sx={{ textAlign: "right", minWidth: 120 }}>
//                   <Typography variant="h6" sx={{ mb: 1 }} color="primary">
//                     {flight.total_price}
//                   </Typography>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     size="small"
//                     onClick={() => handleSelectFlight(flight)}
//                   >
//                     Select
//                   </Button>
//                 </Box>
//               </Card>
//             );
//           })}
//         </Box>
//       </Box>
//     </div>
//       <Footer2 />
//     </div>
//     // </Layout>
//   );
// };

// export default FlightResults;

// Enhanced Flight Results Page
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Container,
  CircularProgress
} from "@mui/material";
import dayjs from "dayjs";
import Header1 from "@/src/layout/header/Header1";
import Footer2 from "@/src/layout/Footer2";
import PreLoader from "@/src/layout/PreLoader";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const FlightResults = () => {
  const [loader, setLoader] = useState(true);
  const router = useRouter();
  const { origin, destination, departure_date, return_date, passengers, cabin_class } = router.query;
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => setLoader(false), 1500);
  }, []);

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
        if (!res.ok) throw new Error(data.error || "Failed to fetch flights");
        setFlights(data.flights || []);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [origin, destination, departure_date, return_date, passengers, cabin_class]);

  const handleSelectFlight = (flight) => {
    localStorage.setItem("selectedOfferId", flight.id);
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

  if (loading) return <PreLoader />;
  if (error) return <Container sx={{ py: 8 }}><Typography variant="h6" color="error">Error: {error}</Typography></Container>;
  if (!flights.length) return <Container sx={{ py: 8 }}><Typography variant="h6">No flights found.</Typography></Container>;

  return (
    <>
      <Header1 />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Available Flights
        </Typography>
        <Box display="flex" flexDirection="column" gap={3}>
          {flights.map((flight) => {
            const depTime = dayjs(flight.departure.time).format("MMM D, YYYY HH:mm");
            const arrTime = dayjs(flight.arrival.time).format("MMM D, YYYY HH:mm");

            return (
              <Card key={flight.id} sx={{ p: 3, borderLeft: '6px solid #1976d2' }}>
                <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" minWidth={200}>
                    {flight.airline?.logo && (
                      <img
                        src={flight.airline.logo}
                        alt={flight.airline.name}
                        style={{ width: 40, height: 'auto', marginRight: 12 }}
                      />
                    )}
                    <Typography variant="subtitle1">
                      {flight.airline?.name || "Unknown Airline"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2">
                      <strong>From:</strong> {flight.departure.airport} ({flight.departure.iata_code})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Departure:</strong> {depTime}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2">
                      <strong>To:</strong> {flight.arrival.airport} ({flight.arrival.iata_code})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Arrival:</strong> {arrTime}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {flight.duration}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cabin:</strong> {flight.cabin_class}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Baggage:</strong> {flight.baggage.map((bag, idx) => (
                        <span key={idx}>{bag.quantity} x {bag.type}{idx < flight.baggage.length - 1 ? ", " : ""}</span>
                      ))}
                    </Typography>
                  </Box>

                  <Box textAlign="right" minWidth={120}>
                    <Typography variant="h6" color="primary">
                      ${flight.total_price}
                    </Typography>
                    <Button variant="contained" onClick={() => handleSelectFlight(flight)}>
                      Select
                    </Button>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      </Container>
      <Footer2 />
    </>
  );
};

export default FlightResults;