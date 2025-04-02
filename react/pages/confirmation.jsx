// // pages/confirmation.jsx
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import Header1 from "@/src/layout/header/Header1";
// import Footer2 from "@/src/layout/Footer2";

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// const Confirmation = () => {
//   const router = useRouter();
//   const { booking_id, booking_reference } = router.query;
//   const [booking, setBooking] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!router.isReady) return;

//     if (!booking_id) {
//       router.push("/"); // Redirect if no booking ID
//       return;
//     }

//     fetch(`${BACKEND_URL}/api/bookings/details?booking_id=${booking_id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setBooking(data.data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error fetching booking:", err);
//         setLoading(false);
//       });
//   }, [router.isReady, booking_id]);

//   if (loading) {
//     return <div style={{ padding: "2rem" }}>Loading confirmation...</div>;
//   }

//   if (!booking) {
//     return <div style={{ padding: "2rem", color: "red" }}>Failed to load booking.</div>;
//   }

//   return (
//     <div style={{ padding: "2rem" }}>
//       <Header1/>
//       <div className="container">
//       <h1>🎉 Booking Confirmed!</h1>
//       <p><strong>Booking Reference:</strong> {booking.booking_reference || booking_reference}</p>
//       <p><strong>Total:</strong> {booking.total_amount} {booking.total_currency}</p>

//       {booking.passengers && (
//         <>
//           <h3>Passengers:</h3>
//           <ul>
//             {booking.passengers.map((p, idx) => (
//               <li key={idx}>{p.given_name} {p.family_name} ({p.type})</li>
//             ))}
//           </ul>
//         </>
//       )}
//       </div>
//       <Footer2/>
//     </div>
//   );
// };

// export default Confirmation;



// pages/confirmation.jsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Header1 from "@/src/layout/header/Header1";
import Footer2 from "@/src/layout/Footer2";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const Confirmation = () => {
  const router = useRouter();
  const { booking_id, booking_reference } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    if (!booking_id) {
      router.push("/");
      return;
    }

    fetch(`${BACKEND_URL}/api/bookings/details?booking_id=${booking_id}`)
      .then((res) => res.json())
      .then((data) => {
        setBooking(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching booking:", err);
        setError(true);
        setLoading(false);
      });
  }, [router.isReady, booking_id]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
        <Typography variant="h5" color="error" sx={{ mt: 2 }}>
          Failed to load booking details
        </Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => router.push("/")}>
          Go Back Home
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Header1 />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card elevation={4} sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
              <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
              <Typography variant="h4" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                Booking Confirmed!
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Thank you for booking with us. Your flight is confirmed.
              </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Booking Reference
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {booking.booking_reference || booking_reference}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Paid
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {booking.total_amount} {booking.total_currency}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {booking.passengers && booking.passengers.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Passengers
                </Typography>
                <List>
                  {booking.passengers.map((p, idx) => (
                    <ListItem key={idx} divider>
                      <ListItemText
                        primary={`${p.given_name} ${p.family_name}`}
                        secondary={`Passenger Type: ${p.type}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Box textAlign="center" sx={{ mt: 4 }}>
              <Button variant="contained" color="primary" onClick={() => router.push("/")}>
                Back to Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Footer2 />
    </>
  );
};

export default Confirmation;