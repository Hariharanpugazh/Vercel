import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const PreviewButton = ({ onEditProblem }) => {
  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState({ easy: [], medium: [], hard: [] });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  const handlePreview = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/manualProblems/`);
      const questions = response.data.problems;

      setPreviewData({
        easy: questions.filter((problem) => problem.level === "easy"),
        medium: questions.filter((problem) => problem.level === "medium"),
        hard: questions.filter((problem) => problem.level === "hard"),
      });
      setOpenPreview(true);
    } catch (error) {
      console.error("Failed to fetch preview data:", error);
    }
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  const handleModify = (problem) => {
    if (onEditProblem) onEditProblem(problem);
    setOpenPreview(false);
  };

  const handleDelete = async (problemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/manualProblems/`, { data: { id: problemId } });
      // Refresh the preview data after deletion
      handlePreview();
    } catch (error) {
      console.error("Failed to delete problem:", error);
    }
  };

  return (
    <div>
      <Button variant="contained" color="secondary" onClick={handlePreview}>
        Preview
      </Button>

      <Dialog open={openPreview} onClose={handleClosePreview} fullWidth maxWidth="md">
        <DialogTitle>Preview Problems by Difficulty</DialogTitle>
        <DialogContent>
          {["easy", "medium", "hard"].map((level) => (
            <Accordion key={level} disabled={!previewData[level].length}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
                  {level} ({previewData[level].length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {previewData[level].map((problem) => (
                  <div key={problem.id} style={{ marginBottom: '15px' }}>
                    <Typography variant="h6">{problem.title}</Typography>
                    <Typography variant="body1">{problem.problem_statement}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleModify(problem)}
                      style={{ marginRight: '10px', marginTop: '10px' }}
                    >
                      Modify
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(problem.id)}
                      style={{ marginTop: '10px' }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PreviewButton;