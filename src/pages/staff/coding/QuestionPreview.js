import React, { useEffect, useState } from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Checkbox,
  TextField,
  TablePagination,
} from "@mui/material";
import { Cancel, Visibility, AddCircle, CheckCircle } from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const QuestionPreview = () => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({ collegename: "", dept: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { contestId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  useEffect(() => {
    const storedQuestions = sessionStorage.getItem("selectedQuestions");
    if (storedQuestions) {
      setSelectedQuestions(JSON.parse(storedQuestions));
    }

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        setStudents(response.data);
        setFilteredStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudents();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  useEffect(() => {
    const applyFilters = () => {
      const filtered = students.filter(
        (student) =>
          (filters.collegename ? student.collegename.includes(filters.collegename) : true) &&
          (filters.dept ? student.dept.includes(filters.dept) : true)
      );
      setFilteredStudents(filtered);
    };

    applyFilters();
  }, [filters, students]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map((student) => student.regno));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelect = (regno) => {
    setSelectedStudents((prev) =>
      prev.includes(regno)
        ? prev.filter((id) => id !== regno)
        : [...prev, regno]
    );
  };

  const handleRemoveQuestion = (id) => {
    const updatedQuestions = selectedQuestions.filter((q) => q.id !== id);
    setSelectedQuestions(updatedQuestions);
    sessionStorage.setItem("selectedQuestions", JSON.stringify(updatedQuestions));
  };

  const handleAddMoreQuestions = () => {
    // Store the currently selected questions in sessionStorage
    sessionStorage.setItem("selectedQuestions", JSON.stringify(selectedQuestions));
    navigate(`/${contestId}/QuestionsLibrary`);
  };

  const handleViewQuestion = (question) => {
    setCurrentQuestion(question);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setCurrentQuestion(null);
  };

  const handlePublish = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/publish/`, {
        contestId,
        questions: selectedQuestions.map((q) => q.id),
        students: selectedStudents,
      });
      if (response.status === 200) {
        alert("Questions published successfully!");
        sessionStorage.clear(selectedQuestions)
        navigate(`/staffdashboard`);
      } else {
        alert("Failed to publish questions.");
      }
    } catch (error) {
      console.error("Error publishing questions:", error);
      alert("An error occurred while publishing questions.");
    }
    setPublishDialogOpen(false);
  };

  const renderSamples = (samples) => {
    if (!samples || samples.length === 0) {
      return <Typography>No sample inputs or outputs available.</Typography>;
    }

    return samples.map((sample, index) => (
      <Box key={index} mb={3} p={2} style={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
        <Typography variant="body1" style={{ fontWeight: 600 }}>Sample Input {index + 1}:</Typography>
        <Typography variant="body2" style={{ marginLeft: "16px", color: "#555" }}>{sample.input}</Typography>
        <Typography variant="body1" style={{ fontWeight: 600, marginTop: "8px" }}>Sample Output {index + 1}:</Typography>
        <Typography variant="body2" style={{ marginLeft: "16px", color: "#555" }}>{sample.output}</Typography>
      </Box>
    ));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom style={{ color: "#3f51b5", fontWeight: 700 }}>
        Selected Questions Preview
      </Typography>

      {selectedQuestions.length === 0 ? (
        <Typography align="center" color="error" variant="h5">
          No questions selected. Please add more questions.
        </Typography>
      ) : (
        <TableContainer component={Paper} style={{ borderRadius: "12px", overflow: "hidden" }}>
          <Table>
            <TableHead style={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell style={{ fontWeight: "bold" }}>Title</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Description</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.title}</TableCell>
                  <TableCell>{question.problem_statement}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewQuestion(question)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      <Cancel />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircle />}
          onClick={handleAddMoreQuestions}
          style={{ padding: "12px 24px", fontWeight: "bold" }}
        >
          Add More Questions
        </Button>
      </Box>

      {selectedQuestions.length > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => setPublishDialogOpen(true)}
            style={{ padding: "12px 24px", fontWeight: "bold" }}
          >
            Publish Questions
          </Button>
        </Box>
      )}

      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Select Students</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <TextField
              label="Filter by College Name"
              name="collegename"
              variant="outlined"
              fullWidth
              margin="dense"
              value={filters.collegename}
              onChange={handleFilterChange}
            />
            <TextField
              label="Filter by Department"
              name="dept"
              variant="outlined"
              fullWidth
              margin="dense"
              value={filters.dept}
              onChange={handleFilterChange}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length
                      }
                      checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Registration Number</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>College Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => (
                    <TableRow key={student.regno} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedStudents.includes(student.regno)}
                          onChange={() => handleStudentSelect(student.regno)}
                        />
                      </TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.regno}</TableCell>
                      <TableCell>{student.dept}</TableCell>
                      <TableCell>{student.collegename}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPublishDialogOpen(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handlePublish} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle style={{ backgroundColor: "#3f51b5", color: "white", fontWeight: "bold" }}>
          Question Details
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#fafafa" }}>
          {currentQuestion && (
            <Box>
              <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: "16px" }}>Title: {currentQuestion.title}</Typography>
              <Divider style={{ marginBottom: "16px" }} />
              <Typography variant="body1" style={{ marginBottom: "8px", fontWeight: 600 }}>Description:</Typography>
              <Typography variant="body2" style={{ marginLeft: "16px", marginBottom: "16px", color: "#555" }}>{currentQuestion.problem_statement}</Typography>
              {renderSamples(currentQuestion.samples)}
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ backgroundColor: "#f5f5f5" }}>
          <Button onClick={handleCloseDialog} color="primary" style={{ fontWeight: "bold" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionPreview;
