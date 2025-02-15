import React, { useState } from 'react';
import { Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CreateIcon from '@mui/icons-material/Create';

const ManualPage = () => {
  const { contestId } = useParams(); // Get contestId from URL
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  const handleUploadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setSubmitDialogOpen(true);
    }
  };

  const handleBulkUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const csrfToken = Cookies.get('csrftoken');

      axios.post(`${API_BASE_URL}/userinput/`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              'X-CSRFToken': csrfToken
          },
          withCredentials: true,
      })
      .then(response => {
          console.log("Bulk upload successful:", response.data);
          setSelectedFile(null);
          setSubmitDialogOpen(false);
      })
      .catch(error => {
        console.error("Bulk upload failed:", error);
        setSubmitDialogOpen(false);
      });
    } else {
      console.log("No file selected.");
    }
  };

  const handleManualUpload = () => {
    navigate('/OnebyOne');
    handleMenuClose();
  };

  const handlePublish = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/publish/`);
      if (response.status === 200) {
        alert('Questions published successfully!');
      } else {
        alert('Failed to publish questions.');
      }
    } catch (error) {
      console.error("Error publishing questions:", error);
      alert('An error occurred while publishing questions.');
    }
  };

  return (
    <Box p={4} position="relative">
      {/* Display contestId in the top left corner */}
      <Typography variant="body1" style={{ position: 'absolute', top: 16, left: 16, fontWeight: 'bold' }}>
        Contest ID: {contestId}
      </Typography>

      <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        Manual Upload
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleUploadClick}
          style={{
            backgroundColor: '#1976d2',
            color: '#fff',
            padding: '10px 20px',
            fontWeight: 'bold',
            fontSize: '1rem',
            borderRadius: '25px',
            transition: 'background-color 0.3s, transform 0.2s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
        >
          Upload
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handlePublish} 
          style={{
            marginLeft: '10px',
            fontWeight: 'bold',
            padding: '10px 20px',
            fontSize: '1rem',
            borderRadius: '25px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backgroundColor: '#9c27b0',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#8e24aa'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#9c27b0'}
        >
          Publish
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem 
            onClick={() => document.getElementById('bulk-upload-input').click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              padding: '10px 20px',
              fontWeight: 'bold',
              color: '#1976d2',
              transition: 'color 0.3s',
            }}
          >
            <UploadFileIcon /> Bulk Upload
          </MenuItem>
          <MenuItem 
            onClick={handleManualUpload} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              padding: '10px 20px',
              fontWeight: 'bold',
              color: '#1976d2',
              transition: 'color 0.3s',
            }}
          >
            <CreateIcon /> Manual Upload
          </MenuItem>
        </Menu>
        <input
          type="file"
          id="bulk-upload-input"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </Box>

      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle style={{ fontWeight: 'bold' }}>Confirm Upload</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to upload this file?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleBulkUpload} color="primary" variant="contained" style={{ backgroundColor: '#0000FF', color: '#fff' }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManualPage;