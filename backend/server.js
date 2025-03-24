require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const flightRoutes = require("./src/routes/flights");
const bookingRoutes = require("./src/routes/bookings");
const staysRoutes = require("./src/routes/stays");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stays", staysRoutes);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
console.log("Loaded Token:", process.env.DUFFEL_API_KEY);
