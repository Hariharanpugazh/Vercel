import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StaffProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    staffId: '',
    designation: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate(); // For navigation

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('https://render-frontend-f05v.onrender.com//api/staff/profile/', {
          withCredentials: true, // Include cookies for authentication
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch staff profile data.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSuccessMessage('');
    setError('');
    try {
      await axios.put('https://render-frontend-f05v.onrender.com//api/staff/profile/', profile, {
        withCredentials: true,
      });
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to save staff profile data.');
    }
  };

  // Handle "Go Back" button click
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#00296B',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            color: '#00296B',
            textAlign: 'center',
          }}
        >
          Staff Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ style: { color: '#00296B' } }}
              InputProps={{ style: { color: '#00296B' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              variant="outlined"
              type="email"
              InputLabelProps={{ style: { color: '#00296B' } }}
              InputProps={{ style: { color: '#00296B' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              value={profile.password}
              onChange={handleChange}
              variant="outlined"
              type="password"
              InputLabelProps={{ style: { color: '#00296B' } }}
              InputProps={{ style: { color: '#00296B' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Department"
              name="department"
              value={profile.department}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ style: { color: '#00296B' } }}
              InputProps={{ style: { color: '#00296B' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="College Name"
              name="collegename"
              value={profile.collegename}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ style: { color: '#00296B' } }}
              InputProps={{ style: { color: '#00296B' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: '#FDC500',
                color: '#00296B',
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: '5px',
                width: '100%',
                '&:hover': {
                  backgroundColor: '#00296B',
                  color: '#FFFFFF',
                },
              }}
            >
              Save Changes
            </Button>
          </Grid>

          {/* Go Back Button */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={handleGoBack}
              sx={{
                color: '#00296B',
                borderColor: '#00296B',
                textTransform: 'none',
                fontWeight: 'bold',
                width: '100%',
                '&:hover': {
                  borderColor: '#FDC500',
                  color: '#FDC500',
                },
              }}
            >
              Go Back
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StaffProfile;
