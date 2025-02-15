import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  CardActions,
  Grid,
  Menu,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CreateIcon from "@mui/icons-material/Create";
import { useNavigate, useParams } from "react-router-dom";

const HrUpload = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ collegename: "", dept: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/manualProblems/`);
        setQuestions(response.data.problems);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        setStudents(response.data);
        setFilteredStudents(response.data); // Initialize filtered list
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchQuestions();
    fetchStudents();
  }, []);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

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

  const handleModify = (question) => {
    navigate("/manualSelectUI", { state: { question } });
  };

  const handleDelete = async (questionId) => {
    try {
      await axios.delete(`${API_BASE_URL}/manualProblems/`, {
        data: { id: questionId },
      });
      setQuestions(questions.filter((q) => q.id !== questionId));
      setDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

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

  const handleBulkUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const csrfToken = Cookies.get("csrftoken");

      try {
        const response = await axios.post(`${API_BASE_URL}/userinput/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        });
        setQuestions((prevQuestions) => [...prevQuestions, ...response.data.problems]);
        setSelectedFile(null);
        setSubmitDialogOpen(false);
      } catch (error) {
        console.error("Bulk upload failed:", error);
        setSubmitDialogOpen(false);
      }
    }
  };

  const handleManualUpload = () => {
    navigate("/OnebyOne");
    handleMenuClose();
  };

  const handlePublish = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/publish/`, {
        contestId,
        students: selectedStudents,
      });
      if (response.status === 200) {
        alert("Questions published successfully!");
        navigate(`/HrUpload/${contestId}`);
      } else {
        alert("Failed to publish questions.");
      }
    } catch (error) {
      console.error("Error publishing questions:", error);
      alert("An error occurred while publishing questions.");
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={4}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        style={{ fontWeight: "bold", marginBottom: "20px" }}
      >
        Coding Questions
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadClick}
          style={{
            backgroundColor: "#1976d2",
            color: "#fff",
            padding: "10px 20px",
            fontWeight: "bold",
            fontSize: "1rem",
            borderRadius: "25px",
          }}
        >
          Upload
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setPublishDialogOpen(true)}
          style={{
            marginLeft: "10px",
            fontWeight: "bold",
            padding: "10px 20px",
            fontSize: "1rem",
            borderRadius: "25px",
            backgroundColor: "#9c27b0",
          }}
        >
          Publish
        </Button>
      </Box>

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
                        selectedStudents.length > 0 &&
                        selectedStudents.length < filteredStudents.length
                      }
                      checked={
                        filteredStudents.length > 0 &&
                        selectedStudents.length === filteredStudents.length
                      }
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
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
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

      {/* Question Cards */}
      <Grid container spacing={3}>
        {questions.map((question) => (
          <Grid item xs={12} sm={6} md={4} key={question.id}>
            <Card
              variant="outlined"
              style={{
                borderRadius: "10px",
                transition: "transform 0.2s",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <CardContent>
                <Typography variant="h6" style={{ fontWeight: "bold" }}>
                  {question.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginTop: "10px" }}
                >
                  {question.problem_statement}
                </Typography>
              </CardContent>
              <CardActions style={{ justifyContent: "space-between", padding: "16px" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleModify(question)}
                  style={{ fontSize: "0.875rem", fontWeight: "bold" }}
                >
                  Modify
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setSelectedQuestionId(question.id);
                    setDeleteConfirm(true);
                  }}
                  style={{ fontSize: "0.875rem", fontWeight: "bold" }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle style={{ fontWeight: "bold" }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this question?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(selectedQuestionId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HrUpload;
