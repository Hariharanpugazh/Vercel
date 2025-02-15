import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TablePagination,
} from "@mui/material";
import axios from "axios";
import BulkUpload from "./BulkUpload"; // Import BulkUpload component
import DeleteIcon from "@mui/icons-material/Delete";
import ViewIcon from "@mui/icons-material/Visibility";

const QuestionDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null); // Store the selected question for viewing/editing
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // State for view dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for bulk upload dialog

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/get-coding-questions/`);
        setQuestions(response.data.questions);
        setFilteredQuestions(response.data.questions);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions;

    if (searchQuery) {
      filtered = filtered.filter((question) =>
        question.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (difficulty) {
      filtered = filtered.filter((question) => question.level === difficulty);
    }

    setFilteredQuestions(filtered);
  }, [searchQuery, difficulty, questions]);

  const handleDeleteClick = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/api/delete-coding-question/${id}/`);

        // Find the question to delete
        const questionToDelete = questions.find((question) => question._id === id);

        if (!questionToDelete) return;

        // Remove all occurrences of the same question (matching text + options)
        setQuestions(questions.filter(q => q.question !== questionToDelete.question || q.options.join('-') !== questionToDelete.options.join('-')));
        setFilteredQuestions(filteredQuestions.filter(q => q.question !== questionToDelete.question || q.options.join('-') !== questionToDelete.options.join('-')));

    } catch (err) {
        console.error("Failed to delete question:", err);
        setError("Failed to delete question. Please try again.");
    }
};


  const handleViewClick = (question) => {
    setSelectedQuestion(question);
    setIsViewDialogOpen(true);
  };

  const handleUploadBulkClick = () => {
    setIsDialogOpen(true); // Open the dialog when button is clicked
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false); // Close the dialog
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <Typography align="center">Loading questions...</Typography>;
  }

  if (error) {
    return <Typography align="center" color="error">{error}</Typography>;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Coding Questions
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={handleUploadBulkClick}>
          + Upload Bulk
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, marginRight: "1rem" }}
        />

        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel id="difficulty-label">Difficulty</InputLabel>
          <Select
            labelId="difficulty-label"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            label="Difficulty"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredQuestions.length === 0 ? (
        <Typography align="center">No questions available in the dashboard.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuestions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((question, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{question.title}</TableCell>
                    <TableCell>{question.problem_statement}</TableCell>
                    <TableCell>{question.level}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewClick(question)}>
                        <ViewIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(question.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredQuestions.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TableContainer>
      )}

      {/* Dialog for Viewing Full Question */}
      <Dialog open={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} fullWidth>
        <DialogTitle>View Full Question</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Title: {selectedQuestion?.title}</Typography>
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            Problem Statement: {selectedQuestion?.problem_statement}
          </Typography>
          <Typography variant="body2" style={{ marginTop: "1rem" }}>
            Difficulty: {selectedQuestion?.level}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Bulk Upload */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Bulk Upload Coding Questions</DialogTitle>
        <DialogContent>
          <BulkUpload />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionDashboard;