import React, { useState, useEffect,  useCallback  } from "react";
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
  Select,
  MenuItem,
  InputLabel,    
  FormControl,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import { useParams } from 'react-router-dom';

const ViewContest = () => {
  const { contestId } = useParams();
  const [students, setStudents] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterCollege, setFilterCollege] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/contests/${contestId}/students/`
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, contestId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleFilterDept = (e) => {
    setFilterDept(e.target.value);
  };

  const handleSearchName = (e) => {
    setSearchName(e.target.value.toLowerCase());
  };

  const handleFilterCollege = (e) => {
    setFilterCollege(e.target.value.toLowerCase());
  };

  const filteredStudents = students.filter((student) => {
    const matchesStatus =
      filterStatus === "" || student.status === filterStatus;
    const matchesDept =
      filterDept === "" || student.department.toLowerCase() === filterDept.toLowerCase();
    const matchesName =
      searchName === "" || student.name.toLowerCase().includes(searchName);
    const matchesCollege =
      filterCollege === "" || student.collegename.toLowerCase().includes(filterCollege);
    return matchesStatus && matchesDept && matchesName && matchesCollege;
  });

  return (
    <Box sx={{ padding: 4, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#1e293b",
          marginBottom: 2,
          textAlign: "center",
        }}
      >
        Contest Details
      </Typography>

      <Paper
        elevation={3}
        sx={{ padding: 3, marginBottom: 3, backgroundColor: "#fff" }}
      >
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={handleFilterStatus}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="started">Started</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={filterDept}
              onChange={handleFilterDept}
              label="Department"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CSE">CSE</MenuItem>
              <MenuItem value="IT">IT</MenuItem>
              <MenuItem value="ECE">ECE</MenuItem>
              <MenuItem value="EEE">EEE</MenuItem>
              <MenuItem value="Mech">Mech</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Search by Name"
            variant="outlined"
            value={searchName}
            onChange={handleSearchName}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Search by College"
            variant="outlined"
            value={filterCollege}
            onChange={handleFilterCollege}
            sx={{ flex: 1 }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={fetchStudents}
            sx={{ marginLeft: "auto" }}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Typography textAlign="center">Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#1e293b" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Registration Number
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Department
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  College
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.registration_number}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.collegename}</TableCell>
                    <TableCell
                      sx={{
                        color:
                          student.status === "completed"
                            ? "green"
                            : "orange",
                      }}
                    >
                      {student.status}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          console.log(`View details for ${student.name}`)
                        }
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ViewContest;
