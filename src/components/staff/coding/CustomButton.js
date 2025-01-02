// CustomButton.js
import React from 'react';
import { Button } from '@mui/material';

const CustomButton = ({ onClick, text, icon: Icon, color = "primary" }) => {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      style={{
        backgroundColor: color === "primary" ? "#3f51b5" : "#f50057",
        color: "#fff",
        fontWeight: "bold",
        padding: "10px 20px",
        fontSize: "1rem",
        borderRadius: "30px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.05)";
        e.target.style.boxShadow = "0px 6px 18px rgba(0, 0, 0, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0px 4px 12px rgba(0, 0, 0, 0.2)";
      }}
    >
      {Icon && <Icon style={{ marginRight: "8px" }} />}
      {text}
    </Button>
  );
};

export default CustomButton;
