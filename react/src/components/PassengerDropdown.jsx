// react/src/components/PassengerDropdown.jsx
import React, { useState } from "react";
import {
  Button,
  Popover,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const PassengerDropdown = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [passengers, setPassengers] = useState(value || {
    adults: 1,
    children: 0,
    infants: 0,
  });

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    onChange?.(passengers);
  };

  const handleIncrement = (type) => {
    setPassengers((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const handleDecrement = (type, minValue) => {
    setPassengers((prev) => ({ ...prev, [type]: Math.max(minValue, prev[type] - 1) }));
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  return (
    <>
      <Button variant="outlined" onClick={handleClick}>
        {totalPassengers} Passengers
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, width: 220 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography>Adults</Typography>
            <Box>
              <IconButton size="small" onClick={() => handleDecrement("adults", 1)}>
                <RemoveIcon />
              </IconButton>
              <Typography component="span" sx={{ px: 1 }}>
                {passengers.adults}
              </Typography>
              <IconButton size="small" onClick={() => handleIncrement("adults")}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography>Children</Typography>
            <Box>
              <IconButton size="small" onClick={() => handleDecrement("children", 0)}>
                <RemoveIcon />
              </IconButton>
              <Typography component="span" sx={{ px: 1 }}>
                {passengers.children}
              </Typography>
              <IconButton size="small" onClick={() => handleIncrement("children")}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Infants</Typography>
            <Box>
              <IconButton size="small" onClick={() => handleDecrement("infants", 0)}>
                <RemoveIcon />
              </IconButton>
              <Typography component="span" sx={{ px: 1 }}>
                {passengers.infants}
              </Typography>
              <IconButton size="small" onClick={() => handleIncrement("infants")}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default PassengerDropdown;
