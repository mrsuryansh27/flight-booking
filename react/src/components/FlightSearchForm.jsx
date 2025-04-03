import React, { useState } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  InputAdornment,
  MenuItem,
} from "@mui/material";
// import MenuItem from '@mui/material/MenuItem';

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Autocomplete from "@mui/material/Autocomplete";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import { useRouter } from "next/router";
import PassengerDropdown from "./PassengerDropdown";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const FlightSearchForm = () => {
  const router = useRouter();
  const [tripType, setTripType] = useState("round");
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [airportOptions, setAirportOptions] = useState([]);
  const [passengerData, setPassengerData] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  // const [passengerData, setPassengerData] = useState({
  //   adults: 1,
  //   children: 0,
  //   infants: 0,
  // });

  const [classType, setClassType] = useState("economy");

  const buildPassengersArray = () => {
    const passengers = [];
    for (let i = 0; i < passengerData.adults; i++) {
      passengers.push({ type: "adult" });
    }
    for (let i = 0; i < passengerData.children; i++) {
      passengers.push({ type: "child", age: 6 });
    }
    for (let i = 0; i < passengerData.infants; i++) {
      passengers.push({ type: "infant_without_seat" });
    }
    return passengers;
  };

const fetchAirports = async (query) => {
    if (!query) return;
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/flights/airports?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch airports: ${response.status}`);
      }
      const data = await response.json();
      setAirportOptions(
        data.data.map((airport) => ({
          label: `${airport.name} (${airport.iata_code})`,
          value: airport.iata_code,
        }))
      );
    } catch (error) {
      console.error("Error fetching airports:", error);
    }
  };



  const handleSearch = () => {
    if (!fromAirport || !toAirport || !departureDate) {
      alert("Please fill in all required fields.");
      return;
    }
    const depDateString = departureDate.format("YYYY-MM-DD");
    const retDateString =
      tripType === "round" && returnDate ? returnDate.format("YYYY-MM-DD") : "";

    const passengers = buildPassengersArray();

    router.push({
      pathname: "/flight-results",
      query: {
        origin: fromAirport,
        destination: toAirport,
        departure_date: depDateString,
        return_date: retDateString,
        passengers: JSON.stringify(passengers),
        // cabin_class: "economy",
        cabin_class: classType, // Use the state variable here

      },
    });
  };

  return (
  

    <LocalizationProvider dateAdapter={AdapterDayjs}>
  <Card sx={{ maxWidth: 1200, margin: "auto", borderRadius: 2, boxShadow: 3 }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        {/* ----- Row 1 ----- */}
        {/* Trip Type */}
        <Grid item xs={12} md={2}>
          <ToggleButtonGroup
            value={tripType}
            exclusive
            onChange={(e, newVal) => setTripType(newVal || tripType)}
            sx={{ height: 56 }}
          >
            <ToggleButton value="round" sx={{ height: "100%" }}>
              Round
            </ToggleButton>
            <ToggleButton value="oneway" sx={{ height: "100%" }}>
              One Way
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        {/* From Airport */}
        <Grid item xs={12} md={3}>
          <Autocomplete
            freeSolo
            options={airportOptions}
            onInputChange={(event, newValue) => fetchAirports(newValue)}
            onChange={(event, newValue) => setFromAirport(newValue?.value || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label="From Airport"
                placeholder="City or airport code"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <FlightTakeoffIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* To Airport */}
        <Grid item xs={12} md={3}>
          <Autocomplete
            freeSolo
            options={airportOptions}
            onInputChange={(event, newValue) => fetchAirports(newValue)}
            onChange={(event, newValue) => setToAirport(newValue?.value || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label="To Airport"
                placeholder="City or airport code"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <FlightLandIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Departure Date */}
        <Grid item xs={12} md={2}>
          <DatePicker
            label="Departure Date"
            value={departureDate}
            onChange={setDepartureDate}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "outlined",
                sx: { height: 56 },
              },
            }}
          />
        </Grid>

        {/* If Round Trip, show Return Date on the same row */}
        {tripType === "round" && (
          <Grid item xs={12} md={2}>
            <DatePicker
              label="Return Date"
              value={returnDate}
              onChange={setReturnDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  sx: { height: 56 },
                },
              }}
            />
          </Grid>
        )}

        {/* ----- Row 2 ----- */}
        {/* Passengers */}
        <Grid item xs={12} md={2}>
          <PassengerDropdown value={passengerData} onChange={setPassengerData} />
        </Grid>

        {/* Class Dropdown */}
        <Grid item xs={12} md={2}>
          <TextField
            select
            label="Class"
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ height: 56 }}
          >
            <MenuItem value="first">First</MenuItem>
            <MenuItem value="economy">Economy</MenuItem>
            <MenuItem value="premium_economy">Premium Economy</MenuItem>
            <MenuItem value="Business">Business</MenuItem>
          </TextField>
        </Grid>

        {/* Search Button */}
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            fullWidth
            sx={{ height: 56, borderRadius: 2 }}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</LocalizationProvider>

  );
};

export default FlightSearchForm;
