import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  Paper,
  Box,
} from "@mui/material";

const ViewTest = () => {
  const { contestId } = useParams();
  const navigate = useNavigate(); // Used for navigation
  const [testDetails, setTestDetails] = useState(null);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({ collegename: "", dept: "" });
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isPublishing, setIsPublishing] = useState(false); // Button disable state
  const [isPublished, setIsPublished] = useState(false); // Result published state

  const handlePublish = async () => {
    if (isPublished) {
      alert("Results are already published.");
      return;
    }

    // Confirm before publishing
    const confirmPublish = window.confirm("Are you sure you want to publish the results?");
    if (!confirmPublish) return;

    try {
      setIsPublishing(true); // Disable button during API call

      // API call to publish results
      const response = await axios.post(`https://render-frontend-f05v.onrender.com//api/mcq/publish-result/${contestId}/`);
      if (response.status === 200) {
        setIsPublished(true); // Mark as published
        alert("Results published successfully.");
      } else {
        alert("Failed to publish results. Please try again.");
      }
    } catch (error) {
      console.error("Error publishing results:", error);
      alert("An error occurred while publishing the results. Please try again.");
    } finally {
      setIsPublishing(false); // Re-enable the button
    }
  };
  // Fetch Test Details
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get(`https://render-frontend-f05v.onrender.com//api/contests/${contestId}/`);
        setTestDetails(response.data);

        // Save pass percentage to session storage
        const passPercentage = response.data.testConfiguration?.passPercentage;
        if (passPercentage !== undefined) {
          sessionStorage.setItem('passPercentage', passPercentage);
        }
      } catch (err) {
        setError("Failed to fetch test details");
        console.error(err);
      }
    };

    if (contestId) fetchTestDetails();
  }, [contestId]);
  // Fetch All Students
  const fetchStudents = async () => {
    try {
      const response = await axios.get("https://render-frontend-f05v.onrender.com//api/student/");
      console.log("Fetched students:", response.data); // Debugging
      setStudents(response.data);
      setFilteredStudents(response.data); // Apply filters initially
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle Input Change
  const handleInputChange = (e, field, section) => {
    const { value, checked, type } = e.target;
    setTestDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      if (section) {
        updatedDetails[section] = {
          ...updatedDetails[section],
          [field]: type === "checkbox" ? checked : value,
        };
      } else {
        updatedDetails[field] = value;
      }
      return updatedDetails;
    });
  };

  // Handle Save Changes
  const handleSave = async () => {
    try {
      console.log("Updated Test Data:", testDetails);
      await axios.put(`https://render-frontend-f05v.onrender.com//api/contests/${contestId}/`, testDetails);
      setIsEditing(false);
      alert("Test details updated successfully");
    } catch (err) {
      setError("Failed to save test details");
      console.error("Error:", err);
    }
  };

  // Filter Students
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

  // Manage Selected Students
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map((student) => student.regno));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelect = (regno) => {
    setSelectedStudents((prev) =>
      prev.includes(regno) ? prev.filter((id) => id !== regno) : [...prev, regno]
    );
  };

  const handleDeleteStudent = (index) => {
    setTestDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      updatedDetails.visible_to.splice(index, 1);
      return updatedDetails;
    });
  };

  const handleAddStudent = () => {
    setTestDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      const newVisibleTo = new Set([...updatedDetails.visible_to, ...selectedStudents]);
      updatedDetails.visible_to = Array.from(newVisibleTo); // Avoid duplicates
      return updatedDetails;
    });
    setPublishDialogOpen(false);
  };

  // Navigate to Staff Dashboard
  const handleGoToStaffDashboard = () => {
    navigate("/staffdashboard"); // Adjust the path as per your routing setup
  };

  

  if (error) return <div>{error}</div>;
  if (!testDetails) return <div>Loading...</div>;

  const { assessmentOverview, testConfiguration, visible_to, student_details } = testDetails;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Previous Page Button */}
      <div className="mb-4 flex flex-row justify-between">
        <a
          variant="contained"
          color="primary"
          onClick={handleGoToStaffDashboard}
        >
          {'<--'}
        </a>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePublish}
          disabled={isPublishing || isPublished} // Disable if publishing or already published
          className="p-4"
          sx={{ p: 2, borderRadius: "36px" }}
        >
          {isPublished ? "Results Published" : isPublishing ? "Publishing..." : "Publish Result"}
        </Button>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isEditing ? (
            <input
              type="text"
              value={assessmentOverview?.name || ""}
              onChange={(e) => handleInputChange(e, "name", "assessmentOverview")}
              className="border p-2 rounded"
            />
          ) : (
            assessmentOverview?.name || "N/A"
          )}
        </h1>
        <p>{assessmentOverview?.description || "No description available"}</p>
        <div className="mt-4">
          <span>
            Registration Start:{" "}
            {assessmentOverview?.registrationStart ? new Date(assessmentOverview.registrationStart).toLocaleString() : "N/A"}
          </span>
        </div>
        <div>
          <span>
            Registration End:{" "}
            {assessmentOverview?.registrationEnd ? new Date(assessmentOverview.registrationEnd).toLocaleString() : "N/A"}
          </span>
        </div>
      </div>

      {/* Test Configuration Section */}
      {testConfiguration && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Configuration</h2>
          <div>
            <strong>Questions:</strong> {testConfiguration?.questions}
          </div>
          <div>
            <strong>Duration:</strong> {testConfiguration?.duration?.hours} hours {testConfiguration?.duration?.minutes} minutes
          </div>
          <div>
            <strong>Full Screen Mode:</strong> {testConfiguration?.fullScreenMode ? "Enabled" : "Disabled"}
          </div>
          <div>
            <strong>Face Detection:</strong> {testConfiguration?.faceDetection ? "Enabled" : "Disabled"}
          </div>
          <div>
            <strong>Device Restriction:</strong> {testConfiguration?.deviceRestriction ? "Enabled" : "Disabled"}
          </div>
          <div>
            <strong>Noise Detection:</strong> {testConfiguration?.noiseDetection ? "Enabled" : "Disabled"}
          </div>
          <div>
            <strong>Pass Percentage:</strong> {testConfiguration?.passPercentage}%
          </div>
        </div>
      )}

      {/* Visible To Section */}
      {student_details && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Students</h2>
          
          {/* Filter Section */}
          <Box mb={2} display="flex" gap={2}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              margin="dense"
              value={filters.searchText || ""}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            />
            <TextField
              label="Filter by Status"
              select
              variant="outlined"
              fullWidth
              margin="dense"
              value={filters.status || ""}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              <option value="">All</option>
              <option value="Completed">Completed</option>
              <option value="started">Started</option>
              <option value="Yet to Start">Yet to Start</option>
            </TextField>
          </Box>

          {/* Students Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Registration Number</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>College Name</TableCell>
                  <TableCell>Status</TableCell>
                  {!isEditing && <TableCell>Actions</TableCell>}
                  {isEditing && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {student_details
                  .filter((student) => {
                    const matchesSearch = filters.searchText
                      ? Object.values(student).some((value) =>
                          String(value).toLowerCase().includes(filters.searchText.toLowerCase())
                        )
                      : true;
                    const matchesStatus = filters.status
                      ? student.status === filters.status
                      : true;
                    return matchesSearch && matchesStatus;
                  })
                  .map((student, index) => (
                    <TableRow key={student.regno}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.regno}</TableCell>
                      <TableCell>{student.dept}</TableCell>
                      <TableCell>{student.collegename}</TableCell>
                      <TableCell>{student.status}</TableCell>
                      {isEditing && (
                        <TableCell>
                          <button
                            className="text-red-500 ml-2"
                            onClick={() => handleDeleteStudent(index)}
                          >
                            ✖
                          </button>
                        </TableCell>
                      )}
                      {!isEditing && (
                        <TableCell>
                          <button
                            className="text-red-500 ml-2"
                            onClick={() => navigate(`${student.studentId}`)}
                          >
                            View
                          </button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add Student Button */}
          {isEditing && (
            <button
              onClick={() => setPublishDialogOpen(true)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Student
            </button>
          )}
        </div>
      )}


      {/* Edit and Save Buttons */}
      <div className="flex justify-between">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
        {isEditing && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Add Student Dialog */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} fullWidth>
        <DialogTitle>Select Students</DialogTitle>
        <DialogContent>
          <Box mb={2}>
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
                      checked={selectedStudents.length === filteredStudents.length}
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
                    <TableRow key={student.regno}>
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
            rowsPerPage={rowsPerPage}
            page={page}
            count={filteredStudents.length}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewTest;