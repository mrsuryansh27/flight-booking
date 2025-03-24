// pages/confirmation.jsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const Confirmation = () => {
  const router = useRouter();
  const { booking_id, booking_reference } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    if (!booking_id) {
      router.push("/"); // Redirect if no booking ID
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
        setLoading(false);
      });
  }, [router.isReady, booking_id]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading confirmation...</div>;
  }

  if (!booking) {
    return <div style={{ padding: "2rem", color: "red" }}>Failed to load booking.</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎉 Booking Confirmed!</h1>
      <p><strong>Booking Reference:</strong> {booking.booking_reference || booking_reference}</p>
      <p><strong>Total:</strong> {booking.total_amount} {booking.total_currency}</p>

      {booking.passengers && (
        <>
          <h3>Passengers:</h3>
          <ul>
            {booking.passengers.map((p, idx) => (
              <li key={idx}>{p.given_name} {p.family_name} ({p.type})</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Confirmation;
