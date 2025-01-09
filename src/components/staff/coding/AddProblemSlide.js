// AddProblemSlide.js
import React from "react";

function AddProblemSlide({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100%",
        width: "300px",
        backgroundColor: "#fff",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        padding: "20px",
        transition: "transform 0.3s ease-in-out",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        zIndex: 1000,
      }}
    >
      <h2>Add Questions</h2>
      <button
        onClick={() => alert("Bulk upload from CSV/Excel functionality coming soon!")}
        style={{
          background: "#28a745",
          color: "white",
          borderRadius: "5px",
          padding: "10px 20px",
          marginBottom: "10px",
          width: "100%",
        }}
      >
        Add Bulk Questions
      </button>
      <button
        onClick={() => alert("Manual input functionality coming soon!")}
        style={{
          background: "#007bff",
          color: "white",
          borderRadius: "5px",
          padding: "10px 20px",
          width: "100%",
        }}
      >
        Manual Input
      </button>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "red",
          color: "white",
          borderRadius: "5px",
          padding: "5px 10px",
        }}
      >
        Close
      </button>
    </div>
  );
}

export default AddProblemSlide;