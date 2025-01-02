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

const StudentProfile = ({  }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    collegename: '',
    dept: '',
    regno: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`https://vercel-1bge.onrender.com/api/student/profile/`, {
            withCredentials: true, // Include cookies for authentication
          }); // Replace with your backend API
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile data.');
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
      await axios.put('https://vercel-1bge.onrender.com/api/student/profile/', profile); // Replace with your backend API
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to save profile data.');
    }
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
          Student Profile
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
              InputLabelProps={{
                style: { color: '#00296B' },
              }}
              InputProps={{
                style: { color: '#00296B' },
              }}
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
              InputLabelProps={{
                style: { color: '#00296B' },
              }}
              InputProps={{
                style: { color: '#00296B' },
              }}
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
              InputLabelProps={{
                style: { color: '#00296B' },
              }}
              InputProps={{
                style: { color: '#00296B' },
              }}
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
              InputLabelProps={{
                style: { color: '#00296B' },
              }}
              InputProps={{
                style: { color: '#00296B' },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Department"
              name="dept"
              value={profile.dept}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{
                style: { color: '#00296B' },
              }}
              InputProps={{
                style: { color: '#00296B' },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Registration Number"
              name="regno"
              value={profile.regno}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{
                style: { color: '#00296B' },
              }}
              InputProps={{
                style: { color: '#00296B' },
              }}
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
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentProfile;
