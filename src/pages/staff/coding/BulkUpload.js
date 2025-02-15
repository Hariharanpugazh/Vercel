import React, { useState } from "react";
import { Button, Box, Typography, Paper } from "@mui/material";

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    validateAndSetFile(uploadedFile);
  };

  const validateAndSetFile = (uploadedFile) => {
    if (uploadedFile) {
      const allowedTypes = ["application/json"];
      if (!allowedTypes.includes(uploadedFile.type)) {
        alert("Please upload a valid JSON file.");
        return;
      }
      setFile(uploadedFile);
      setUploadStatus("");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const uploadedFile = event.dataTransfer.files[0];
    validateAndSetFile(uploadedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a JSON file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Uploading...");
      const response = await fetch(`${API_BASE_URL}/api/bulk-upload/`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setUploadStatus(`Success: ${result.message}`);
      } else {
        setUploadStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Bulk Upload Coding Questions
      </Typography>
      <Typography variant="body1" align="center" gutterBottom>
        Drag and drop your JSON file below or choose it from local storage.
      </Typography>

      {/* Drag-and-Drop Zone */}
      <Paper
        elevation={3}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: `2px dashed ${isDragActive ? "#1976d2" : "#ccc"}`,
          padding: "2rem",
          textAlign: "center",
          backgroundColor: isDragActive ? "#f0f8ff" : "#f9f9f9",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
      >
        <Typography variant="h6">
          {file ? `Selected File: ${file.name}` : "Drag and drop your JSON file here"}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          OR
        </Typography>
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={{ cursor: "pointer", color: "#1976d2" }}>
          <Typography variant="body2" sx={{ textDecoration: "underline" }}>
            Click to Browse
          </Typography>
        </label>
      </Paper>

      {/* Upload Button */}
      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!file}
        >
          Upload
        </Button>
        {uploadStatus && (
          <Typography variant="body2" color="secondary" sx={{ mt: 2 }}>
            {uploadStatus}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default BulkUpload;