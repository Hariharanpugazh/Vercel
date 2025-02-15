import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Card } from "@nextui-org/react";
import mcq from '../../assets/mcq.png';
import code from '../../assets/code.png';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Typography, Grid, Box } from '@mui/material';

const CreateTestCard = () => {
  const navigate = useNavigate();


  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className="w-full max-w-md cursor-pointer"
        onClick={() => {
          navigate('/mcq/details');
         
        }}
      >
        <Card className="p-12 bg-transparent border-2 border-dashed rounded-2xl flex items-center justify-center">
          <Plus className="w-12 h-12 bg-transparent rounded-full text-gray-500" />
          <h2 className="m-2 mb-2 text-gray-500">Create Your Test Here...</h2>
        </Card>
      </motion.div>
      {/* <Dialog
          open={isModalOpen}
          onClose={handleModalClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px', // Smooth curved corners for the modal
              padding: '16px',
            },
          }}
        >
          <DialogTitle>
            <Typography variant="h6" align="center" fontWeight="bold">
              Select Test Type
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleModalClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '250px', // Increased height for better spacing
                    border: '1px solid #E0E0E0',
                    borderRadius: '24px', // Smooth curved corners for boxes
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s', // Smooth hover animations
                    '&:hover': {
                      backgroundColor: '#f9faff',
                      transform: 'scale(1.05)', // Slight zoom effect
                      boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Add shadow on hover
                    },
                  }}
                  onClick={() => {
                    navigate('/mcq/details');
                    handleModalClose();
                  }}
                >
                  <img src={mcq} alt="Skill Assessment" style={{ maxWidth: '80px', margin: '0 auto' }} />
                  <Typography variant="h6" mt={3}>
                    Skill Assessment
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Evaluations to test knowledge and skills across different topics
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '250px', // Increased height for better spacing
                    border: '1px solid #E0E0E0',
                    borderRadius: '24px', // Smooth curved corners for boxes
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s', // Smooth hover animations
                    '&:hover': {
                      backgroundColor: '#f9faff',
                      transform: 'scale(1.05)', // Slight zoom effect
                      boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Add shadow on hover
                    },
                  }}
                  onClick={() => {
                    navigate('/coding/details');
                    handleModalClose();
                  }}
                >
                  <img src={code} alt="Code Contest" style={{ maxWidth: '80px', margin: '0 auto' }} />
                  <Typography variant="h6" mt={3}>
                    Code Contest
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Challenges to assess programming and problem-solving skills
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', mt: 3 }}>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}
            >
              You can select a test type to proceed or close the dialog.
            </Typography>
          </DialogActions>
        </Dialog> */}
    </>
  );
};

export default CreateTestCard;
