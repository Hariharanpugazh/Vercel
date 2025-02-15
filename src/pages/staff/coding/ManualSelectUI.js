import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Grid, IconButton, Select, MenuItem, InputLabel, FormControl, ListItemText, Checkbox, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

// Define available roles (can be customized or fetched from an API if needed)
const availableRoles = ["Junior Software Developer", "Senior Software Developer", "AI Developer", "Project Manager"];
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

const ManualSelectUI = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialQuestionData = location.state?.question || {
    title: '',
    problem_statement: '',
    samples: [],
    hidden_samples: [],
    role: [],
    level: '',
  };

  const [questionData, setQuestionData] = useState(initialQuestionData);
  const [testCases, setTestCases] = useState(
    initialQuestionData.samples.map(sample => ({
      ...sample,
      input: sample.input || ['']  // Ensure input is an array with at least one element
    }))
  );
  const [hiddenTestCases, setHiddenTestCases] = useState(
    initialQuestionData.hidden_samples.map(hiddenSample => ({
      ...hiddenSample,
      input: hiddenSample.input || ['']  // Ensure input is an array with at least one element
    }))
  );

  useEffect(() => {
    if (!questionData.id) navigate('/hrUpload'); // Redirect if no question data is provided
  }, [questionData, navigate]);

  const handleSave = async () => {
    try {
      const updatedQuestion = {
        ...questionData,
        samples: testCases,
        hidden_samples: hiddenTestCases,
      };
      await axios.put(`${API_BASE_URL}/manualProblems/`, { problems: [updatedQuestion] });
      navigate('/hrUpload');
    } catch (error) {
      console.error("Failed to save question:", error);
    }
  };

  const handleRoleChange = (event) => {
    setQuestionData({ ...questionData, role: event.target.value });
  };

  const handleAddTestCase = (isHidden = false) => {
    if (isHidden) {
      setHiddenTestCases([...hiddenTestCases, { input: [''], output: '' }]);
    } else {
      setTestCases([...testCases, { input: [''], output: '' }]);
    }
  };

  const handleRemoveTestCase = (index, isHidden = false) => {
    if (isHidden) {
      const updatedHiddenTestCases = [...hiddenTestCases];
      updatedHiddenTestCases.splice(index, 1);
      setHiddenTestCases(updatedHiddenTestCases);
    } else {
      const updatedTestCases = [...testCases];
      updatedTestCases.splice(index, 1);
      setTestCases(updatedTestCases);
    }
  };

  return (
    <Box p={4} sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Edit Question
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, padding: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Question Details
            </Typography>
            <TextField
              fullWidth
              label="Title"
              variant="outlined"
              margin="normal"
              value={questionData.title}
              onChange={(e) => setQuestionData({ ...questionData, title: e.target.value })}
              sx={{ marginBottom: '16px' }}
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              margin="normal"
              multiline
              rows={3}
              value={questionData.problem_statement}
              onChange={(e) => setQuestionData({ ...questionData, problem_statement: e.target.value })}
              sx={{ marginBottom: '16px' }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, padding: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Roles
            </Typography>
            <FormControl fullWidth variant="outlined" margin="normal" sx={{ marginBottom: '16px' }}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={questionData.role}
                onChange={handleRoleChange}
                renderValue={(selected) => selected.join(', ')}
                label="Roles"
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    <Checkbox checked={questionData.role.includes(role)} />
                    <ListItemText primary={role} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Card>
        </Grid>
      </Grid>

      {/* Test Cases Section */}
      <Box mt={4}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Test Cases</Typography>
        {testCases.map((testCase, index) => (
          <Card key={index} sx={{ marginBottom: '16px', padding: 2, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Test Case {index + 1}</Typography>
            {testCase.input.map((input, inputIndex) => (
              <TextField
                key={inputIndex}
                fullWidth
                label={`Input ${inputIndex + 1}`}
                variant="outlined"
                margin="normal"
                value={input}
                onChange={(e) => {
                  const updatedTestCases = [...testCases];
                  updatedTestCases[index].input[inputIndex] = e.target.value;
                  setTestCases(updatedTestCases);
                }}
                sx={{ marginBottom: '16px' }}
              />
            ))}
            <TextField
              fullWidth
              label="Output"
              variant="outlined"
              margin="normal"
              value={testCase.output}
              onChange={(e) => {
                const updatedTestCases = [...testCases];
                updatedTestCases[index].output = e.target.value;
                setTestCases(updatedTestCases);
              }}
              sx={{ marginBottom: '16px' }}
            />
            <IconButton onClick={() => handleRemoveTestCase(index)} color="error">
              <RemoveIcon />
            </IconButton>
          </Card>
        ))}
        <Button onClick={() => handleAddTestCase(false)} variant="contained" color="success" sx={{ marginBottom: '32px' }}>
          Add Test Case
        </Button>
      </Box>

      {/* Hidden Test Cases Section */}
      <Box mt={4}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Hidden Test Cases</Typography>
        {hiddenTestCases.map((hiddenTestCase, index) => (
          <Card key={index} sx={{ marginBottom: '16px', padding: 2, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Hidden Test Case {index + 1}</Typography>
            {hiddenTestCase.input.map((input, inputIndex) => (
              <TextField
                key={inputIndex}
                fullWidth
                label={`Hidden Input ${inputIndex + 1}`}
                variant="outlined"
                margin="normal"
                value={input}
                onChange={(e) => {
                  const updatedHiddenTestCases = [...hiddenTestCases];
                  updatedHiddenTestCases[index].input[inputIndex] = e.target.value;
                  setHiddenTestCases(updatedHiddenTestCases);
                }}
                sx={{ marginBottom: '16px' }}
              />
            ))}
            <TextField
              fullWidth
              label="Hidden Output"
              variant="outlined"
              margin="normal"
              value={hiddenTestCase.output}
              onChange={(e) => {
                const updatedHiddenTestCases = [...hiddenTestCases];
                updatedHiddenTestCases[index].output = e.target.value;
                setHiddenTestCases(updatedHiddenTestCases);
              }}
              sx={{ marginBottom: '16px' }}
            />
            <IconButton onClick={() => handleRemoveTestCase(index, true)} color="error">
              <RemoveIcon />
            </IconButton>
          </Card>
        ))}
        <Button onClick={() => handleAddTestCase(true)} variant="contained" color="success" sx={{ marginBottom: '32px' }}>
          Add Hidden Test Case
        </Button>
      </Box>

      <Box mt={4}>
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ padding: '10px 20px', fontSize: '16px' }}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default ManualSelectUI;
