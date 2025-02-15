import React, { useState, useEffect } from "react";
import { Container, Card, CardContent, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  
  useEffect(() => {
    // Fetch the data from the API
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/questions/`);
        const data = await response.json();
        setQuestions(data.problems);
        setFilteredQuestions(data.problems);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (difficulty) {
      // Filter questions based on the selected difficulty
      const filtered = questions.filter(question => question.level === difficulty);
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [difficulty, questions]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Problem List
      </Typography>

      {/* Filter Section */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Filter by Difficulty</InputLabel>
        <Select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          label="Filter by Difficulty"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </Select>
      </FormControl>

      {/* List of Problems */}
      <Grid container spacing={4}>
        {filteredQuestions.map((question) => (
          <Grid item xs={12} sm={6} md={4} key={question.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {question.title}
                </Typography>
                <Typography color="text.secondary">
                  Level: {question.level}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {question.problem_statement}
                </Typography>
                <Button variant="outlined" color="primary" fullWidth>
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default QuestionList;