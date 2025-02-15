import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Collapse,
  IconButton,
  Typography,
  Box,
  Pagination,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Delete, Visibility } from "@mui/icons-material";

const ContestDashboard = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const itemsPerPage = 5; // Number of contests per page

  // Fetch contests on mount
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/contests/`);
        setContests(response.data); // Array of contest objects
      } catch (error) {
        console.error("Error fetching contests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  // Handle pagination change
  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  // Fetch stats for a specific contest
  const fetchContestStats = async (contestId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/contests/stats/${contestId}/`
      );
      return response.data; // { total_students, started, completed }
    } catch (error) {
      console.error(`Error fetching stats for contest ${contestId}:`, error);
      return { total_students: 0, started: 0, completed: 0 };
    }
  };

  // Delete contest
  const deleteContest = async (contestId) => {
    if (!window.confirm("Are you sure you want to delete this contest?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/contests/delete/${contestId}/`);
      setContests((prev) => prev.filter((contest) => contest.contest_id !== contestId));
      alert("Contest deleted successfully!");
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Failed to delete contest.");
    }
  };

  // Get contests for the current page
  const paginatedContests = contests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <Typography variant="h4" className="font-bold text-gray-800">
          Contest Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => (window.location.href = "/createcontest")}
        >
          + Create Test
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell><strong>Contest Name</strong></TableCell>
                  <TableCell><strong>Start Time</strong></TableCell>
                  <TableCell><strong>End Time</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedContests.map((contest) => (
                  <ContestRow
                    key={contest.contest_id}
                    contest={contest}
                    fetchStats={() => fetchContestStats(contest.contest_id)}
                    deleteContest={deleteContest}
                    expandedRow={expandedRow}
                    setExpandedRow={setExpandedRow}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(contests.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </div>
  );
};

const ContestRow = ({ contest, fetchStats, deleteContest, expandedRow, setExpandedRow }) => {
  const [stats, setStats] = useState({ total_students: 0, started: 0, completed: 0 });
  const isExpanded = expandedRow === contest.contest_id;

  useEffect(() => {
    if (isExpanded) {
      const loadStats = async () => {
        const statsData = await fetchStats();
        setStats(statsData);
      };

      loadStats();
    }
  }, [isExpanded, fetchStats]);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            onClick={() => setExpandedRow(isExpanded ? null : contest.contest_id)}
          >
            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{contest.contest_name}</TableCell>
        <TableCell>{contest.start_time || "N/A"}</TableCell>
        <TableCell>{contest.end_time || "N/A"}</TableCell>
        <TableCell>
          <IconButton
            color="primary"
            onClick={() => window.location.href = `/viewcontest/${contest.contest_id}`}
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => window.location.href = `/editcontest/${contest.contest_id}`}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => deleteContest(contest.contest_id)}
          >
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box mt={1} ml={2} className="flex flex-row justify-between">
              <Typography variant="body2" className="text-gray-800 font-bold">
                <strong>Total Students:</strong> 
                <span style={{ fontSize: '1.2em' }}>{stats.total_students}</span>
              </Typography>
              <Typography variant="body2" className="text-gray-800 font-bold">
                <strong>Started:</strong> 
                <span style={{ fontSize: '1.2em' }}>{stats.started}</span>
              </Typography>
              <Typography variant="body2" className="text-gray-800 font-bold">
                <strong>Completed:</strong> 
                <span style={{ fontSize: '1.2em' }}>{stats.completed}</span>
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ContestDashboard;
