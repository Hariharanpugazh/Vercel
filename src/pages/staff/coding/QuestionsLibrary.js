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
  Checkbox,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

const QuestionsLibrary = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const { contestId } = useParams();
  const location = useLocation();
  const requiredQuestions = location.state?.requiredQuestions || 0;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/manualProblems/`);
        setQuestions(response.data.problems);
        setFilteredQuestions(response.data.problems);

        // Load previously selected questions from sessionStorage
        const storedQuestions = sessionStorage.getItem("selectedQuestions");
        if (storedQuestions) {
          const parsedStoredQuestions = JSON.parse(storedQuestions);
          setSelectedQuestions(parsedStoredQuestions.map((q) => q.id));
        }
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

  const handleSelectQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    console.log("Required Questions:", requiredQuestions);
    console.log("Selected Questions:", selectedQuestions.length);
    if (selectedQuestions.length < requiredQuestions) {
      alert(`Please select at least ${requiredQuestions} questions.`);
      return;
    }

    const storedQuestions = sessionStorage.getItem("selectedQuestions");
    const previousSelectedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];

    // Combine previously selected and newly selected questions
    const allSelectedQuestions = [
      ...previousSelectedQuestions,
      ...questions.filter((q) => selectedQuestions.includes(q.id)),
    ];

    // Remove duplicates
    const uniqueSelectedQuestions = Array.from(
      new Map(allSelectedQuestions.map((q) => [q.id, q])).values()
    );

    sessionStorage.setItem("selectedQuestions", JSON.stringify(uniqueSelectedQuestions));
    navigate(`/${contestId}/question-preview`);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const navigate = useNavigate();

  if (loading) {
    return <Typography align="center">Loading questions...</Typography>;
  }

  if (error) {
    return (
      <Typography align="center" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box p={4} display="flex">
      {/* Main Library Section */}
      <Box flex={2} pr={2}>
        <Typography variant="h4" align="center" gutterBottom>
          Question Library
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <Typography align="center">No questions available in the library.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Select</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleSelectQuestion(question.id)}
                        />
                      </TableCell>
                      <TableCell>{question.title}</TableCell>
                      <TableCell>{question.problem_statement}</TableCell>
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
      </Box>

      {/* Selected Questions Section */}
      <Box flex={1} pl={2}>
        <Typography variant="h5" gutterBottom>
          Selected Questions
        </Typography>
        {selectedQuestions.length === 0 ? (
          <Typography align="center">No questions selected.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedQuestions.map((id) => {
                  const question = questions.find((q) => q.id === id);
                  return (
                    <TableRow key={id}>
                      <TableCell>{question?.title}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={selectedQuestions.length < requiredQuestions}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default QuestionsLibrary;
