import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CenteredModal = ({ isConfirmModalOpen, setIsConfirmModalOpen, targetPath }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    setIsConfirmModalOpen(false);
  };

  const handleConfirm = () => {
    if (targetPath.includes('stafflogin')) {
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/;secure;samesite=strict`);
      });

      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
    }
    navigate(targetPath); // Navigate to the requested page
    setIsConfirmModalOpen(false); // Close the modal
  };

  return (
    <Dialog
      open={isConfirmModalOpen}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)', // Center the modal
          borderRadius: '10px',
          backgroundColor: 'white',
          padding: '1rem',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(4px)', // Apply blur effect
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
        },
      }}
    >
      <DialogTitle align="center">
        <div className="text-red-600">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <Typography variant="h6" fontWeight="bold" color='#00296B' align="center">
          Warning
        </Typography>
        
      </DialogTitle>
      <Typography variant="body1" align="center" color="text.secondary">
          Are you sure you want to terminate the process?
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" mb={2}>
          You'll lose course creation progress!!!
        </Typography>
      <DialogActions sx={{ justifyContent: 'center', gap: '1rem' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            flex: 1,
            padding: '0.75rem',
            borderColor: 'gray.300',
            borderRadius: '0.75rem',
            color: 'gray.700',
            '&:hover': {
              backgroundColor: 'gray.50',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#000975',
            color: 'white',
            borderRadius: '0.75rem',
            '&:hover': {
              backgroundColor: '#eab308',
              color: '#000975',
            },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CenteredModal;
