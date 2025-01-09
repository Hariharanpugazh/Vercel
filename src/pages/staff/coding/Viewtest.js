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
  Menu,
  MenuItem
} from "@mui/material";

const ViewTest = () => {
  const { contestId } = useParams();
  const navigate = useNavigate(); // Used for navigation
  const [testDetails, setTestDetails] = useState(null);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({collegename: "", dept: "", year: "", status: "", searchText: "",}); // Extended filters
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [dialogStudents, setDialogStudents] = useState([]); // To store all students for the dialog
  const [dialogFilters, setDialogFilters] = useState({ collegename: "", dept: "", year: "" });
  const [filteredDialogStudents, setFilteredDialogStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isPublishing, setIsPublishing] = useState(false); // Button disable state
  const [isPublished, setIsPublished] = useState(false); // Result published state
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null); // To manage download menu
  const [studentReports, setStudentReports] = useState({}); // To store correct answers for students
  const [loading, setLoading] = useState(false);

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
      const response = await axios.post(`http://127.0.0.1:8000/api/mcq/publish-result/${contestId}/`);
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

  const handleDownloadAll = () => {
    // Ensure student data is available
    if (!testDetails.student_details || testDetails.student_details.length === 0) {
      alert("No student data available to download");
      return;
    }

    // Create CSV
    const headers = [
      "Name",
      "Registration Number",
      "Department",
      "College Name",
      "Year",
      "Status",
      "Correct Answers",
    ];

    const csvContent = [
      headers.join(","),
      ...testDetails.student_details.map((student) =>
        [
          `"${student.name || ""}"`,
          `"${student.regno || ""}"`,
          `"${student.dept || ""}"`,
          `"${student.collegename || ""}"`,
          `"${student.year || ""}"`,
          `"${student.status || ""}"`,
          `"${studentReports[student.regno] || "N/A"}"`,
        ].join(",")
      ),
    ].join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `all_students_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadByStatus = (status) => {
    const filteredData = testDetails.student_details.filter(
      (student) => student.status.toLowerCase() === status.toLowerCase()
    );

    if (filteredData.length === 0) {
      alert(`No students found with status: ${status}`);
      return;
    }

    const headers = [
      "Name",
      "Registration Number",
      "Department",
      "College Name",
      "Year",
      "Status",
      "Correct Answers",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map((student) =>
        [
          `"${student.name || ""}"`,
          `"${student.regno || ""}"`,
          `"${student.dept || ""}"`,
          `"${student.collegename || ""}"`,
          `"${student.year || ""}"`,
          `"${student.status || ""}"`,
          `"${studentReports[student.regno] || "N/A"}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_${status.toLowerCase().replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fetch Test Details
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/contests/${contestId}/`);
        setTestDetails(response.data);

        // Map student details from the response to populate the table
        const updatedStudents = response.data.student_details.map((student) => ({
          ...student,
          year: student.year || "N/A",
          status: student.status || "Unknown",
        }));
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);

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

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/student/");
        const updatedStudents = response.data.map((student) => ({
          ...student,
          year: student.year || "N/A",
          status: student.status || "Unknown",
        }));
        setDialogStudents(updatedStudents); // Set the data for the dialog
        setFilteredDialogStudents(updatedStudents); // Initialize the filtered data
      } catch (error) {
        console.error("Failed to fetch all students:", error);
      }
    };

    if (publishDialogOpen) fetchAllStudents();
  }, [publishDialogOpen]);

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

      // Show loading animation
      setIsEditing(false);
      setLoading(true);

      await axios.put(`http://127.0.0.1:8000/api/contests/${contestId}/`, testDetails);

      alert("Test details updated successfully");

      // Wait for a moment to show the animation before refreshing
      setTimeout(() => {
        window.location.reload(); // Refresh the page
      }, 1500);
    } catch (err) {
      setError("Failed to save test details");
      console.error("Error:", err);
    } finally {
      setLoading(false); // Stop the loading animation
    }
  };

  // Handle Filter Changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Apply Filters
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...students];

      // Filter by Status
      if (filters.status) {
        filtered = filtered.filter((student) =>
          student.status?.toLowerCase() === filters.status.toLowerCase()
        );
      }

      // Filter by Year
      if (filters.year) {
        filtered = filtered.filter((student) => student.year === filters.year);
      }

      // Search Text Filter
      if (filters.searchText) {
        filtered = filtered.filter((student) =>
          Object.values(student).some((value) =>
            String(value).toLowerCase().includes(filters.searchText.toLowerCase())
          )
        );
      }

      setFilteredStudents(filtered);
    };

    applyFilters();
  }, [filters, students]);

  useEffect(() => {
    const applyDialogFilters = () => {
      let filtered = [...dialogStudents];

      // Filter by College Name
      if (dialogFilters.collegename) {
        filtered = filtered.filter((student) =>
          student.collegename.toLowerCase().includes(dialogFilters.collegename.toLowerCase())
        );
      }

      // Filter by Department
      if (dialogFilters.dept) {
        filtered = filtered.filter((student) =>
          student.dept.toLowerCase().includes(dialogFilters.dept.toLowerCase())
        );
      }

      // Filter by Year
      if (dialogFilters.year) {
        filtered = filtered.filter((student) => student.year === dialogFilters.year);
      }

      setFilteredDialogStudents(filtered);
    };

    applyDialogFilters();
  }, [dialogFilters, dialogStudents]);

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

  // Handle Close Session
  const handleCloseSession = async () => {
    try {
      const confirmClose = window.confirm("Are you sure you want to close the session?");
      if (!confirmClose) return;

      await axios.post(`http://127.0.0.1:8000/api/mcq/close-session/${contestId}/`);
      alert("Session closed successfully.");
      navigate("/staffdashboard"); // Adjust the path as per your routing setup
    } catch (error) {
      console.error("Error closing session:", error);
      alert("Failed to close the session. Please try again.");
    }
  };

  // Handle Delete Contest
  const handleDeleteContest = async () => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete the contest?");
      if (!confirmDelete) return;

      await axios.delete(`http://127.0.0.1:8000/api/mcq/delete-contest/${contestId}/`);
      alert("Contest deleted successfully.");
      navigate("/staffdashboard"); // Adjust the path as per your routing setup
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Failed to delete the contest. Please try again.");
    }
  };

  if (error) return <div>{error}</div>;
  if (!testDetails) return <div>Loading...</div>;

  const { assessmentOverview, testConfiguration, visible_to, student_details } = testDetails;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Previous Page Button */}
      <div className="mb-4 flex flex-row justify-between items-center">
        <Button
          variant="outlined"
          color="primary"
          onClick={handleGoToStaffDashboard}
          startIcon={<span>&larr;</span>} // Add a left arrow icon
          className="px-4 py-2 rounded-full"
          sx={{ borderRadius: "24px", textTransform: "none" }}
        >
          Back
        </Button>
        <div className="flex flex-row justify-end space-x-4">
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
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCloseSession}
            className="p-4"
            sx={{ p: 2, borderRadius: "36px" }}
          >
            Close Session
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteContest}
            className="p-4"
            sx={{ p: 2, borderRadius: "36px" }}
          >
            Delete Contest
          </Button>
        </div>
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
          <div className="mb-4 flex gap-2">
            <Button variant="contained" color="primary" onClick={handleDownloadAll}>
              Download All
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
            >
              Download by Status
            </Button>

            <Menu
              anchorEl={downloadAnchorEl}
              open={Boolean(downloadAnchorEl)}
              onClose={() => setDownloadAnchorEl(null)}
            >
              <MenuItem onClick={() => handleDownloadByStatus("Completed")}>
                Download Completed
              </MenuItem>
              <MenuItem onClick={() => handleDownloadByStatus("Started")}>
                Download Started
              </MenuItem>
              <MenuItem onClick={() => handleDownloadByStatus("Yet to Start")}>
                Download Yet to Start
              </MenuItem>
            </Menu>
          </div>

          {/* Filter Section */}
          <Box mb={2} display="flex" gap={2}>
          <TextField
          label="Search"
          variant="outlined"
          fullWidth
          margin="dense"
          name="searchText"
          value={filters.searchText || ""}
          onChange={handleFilterChange}
        />
        <TextField
          label="Filter by Status"
          select
          variant="outlined"
          fullWidth
          margin="dense"
          name="status"
          value={filters.status || ""}
          onChange={handleFilterChange}
          SelectProps={{ native: true }}
        >
          <option value="">All</option>
          <option value="Completed">Completed</option>
          <option value="Started">Started</option>
          <option value="Yet to Start">Yet to Start</option>
        </TextField>
        <TextField
          label="Filter by Year"
          select
          variant="outlined"
          fullWidth
          margin="dense"
          name="year"
          value={filters.year || ""}
          onChange={handleFilterChange}
          SelectProps={{ native: true }}
        >
          <option value="">All</option>
          <option value="I">I</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
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
              <TableCell>Year</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => (
                <TableRow key={student.regno}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.regno}</TableCell>
                  <TableCell>{student.dept}</TableCell>
                  <TableCell>{student.collegename}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>{student.status}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
          </TableContainer>
          {/* <TablePagination
        rowsPerPage={rowsPerPage}
        page={page}
        count={filteredStudents.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      /> */}

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
            className={`bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <div
                className="w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin"
              ></div>
            ) : (
              "Save Changes"
            )}
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
        onChange={(e) =>
          setDialogFilters((prev) => ({ ...prev, collegename: e.target.value }))
        }
      />
      <TextField
        label="Filter by Department"
        name="dept"
        variant="outlined"
        fullWidth
        margin="dense"
        onChange={(e) =>
          setDialogFilters((prev) => ({ ...prev, dept: e.target.value }))
        }
      />
      <TextField
        label="Filter by Year"
        name="year"
        select
        variant="outlined"
        fullWidth
        margin="dense"
        onChange={(e) =>
          setDialogFilters((prev) => ({ ...prev, year: e.target.value }))
        }
        SelectProps={{ native: true }}
      >
        <option value="">All</option>
        <option value="I">I</option>
        <option value="II">II</option>
        <option value="III">III</option>
        <option value="IV">IV</option>
      </TextField>
    </Box>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selectedStudents.length > 0 &&
                  selectedStudents.length < filteredDialogStudents.length
                }
                checked={selectedStudents.length === filteredDialogStudents.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudents(
                      filteredDialogStudents.map((student) => student.regno)
                    );
                  } else {
                    setSelectedStudents([]);
                  }
                }}
              />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Registration Number</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>College Name</TableCell>
            <TableCell>Year</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDialogStudents
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((student) => (
              <TableRow key={student.regno}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedStudents.includes(student.regno)}
                    onChange={() => {
                      setSelectedStudents((prev) =>
                        prev.includes(student.regno)
                          ? prev.filter((id) => id !== student.regno)
                          : [...prev, student.regno]
                      );
                    }}
                  />
                </TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.regno}</TableCell>
                <TableCell>{student.dept}</TableCell>
                <TableCell>{student.collegename}</TableCell>
                <TableCell>{student.year}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      rowsPerPage={rowsPerPage}
      page={page}
      count={filteredDialogStudents.length}
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
</Dialog>;
    </div>
  );
};

export default ViewTest;
