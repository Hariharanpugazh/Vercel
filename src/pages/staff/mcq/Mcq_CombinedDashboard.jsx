import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  TextField,
  TablePagination,
} from "@mui/material";
import Mcq_sectionDetails from "../../../components/staff/mcq/Mcq_sectionDetails";
import QuestionModal from "../../../components/staff/mcq/QuestionModal";

const Mcq_CombinedDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state;
  const [dashboardStats, setDashboardStats] = useState({
    totalQuestions: 0,
    totalSections: 0,
    totalDuration: "00:00",
    maximumMark: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({ collegename: "", dept: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("https://render-frontend-f05v.onrender.com//api/student/");
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

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        return;
      }

      const response = await axios.get("https://render-frontend-f05v.onrender.com//api/mcq/questions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedQuestions = response.data.questions || [];
      setQuestions(fetchedQuestions);
      setDashboardStats((prev) => ({
        ...prev,
        totalQuestions: fetchedQuestions.length,
      }));
    } catch (error) {
      console.error("Error fetching questions:", error.response?.data || error.message);
      alert("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = () => {
    const newSection = {
      id: sections.length + 1,
      sectionName: `Section ${sections.length + 1}`,
      numQuestions: 10,
      sectionDuration: 10,
    };
    setSections([...sections, newSection]);
  };

  const handleAddQuestion = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFinalSubmit = async () => {
    const token = localStorage.getItem("contestToken");
    if (!token) {
      alert("Unauthorized access. Please start the contest again.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/submit-sections",
        { sections },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Sections submitted successfully!");
      await fetchQuestions(); // Refresh the questions list
      navigate("/mcq/sectionDetails", { state: { requiredQuestions: formData.testConfiguration.questions } });
    } catch (error) {
      console.error("Error submitting sections:", error);
      alert("Failed to submit sections. Please try again.");
    }
  };

  const updateSection = (id, updatedSection) => {
    const updatedSections = sections.map((section) =>
      section.id === id ? updatedSection : section
    );
    setSections(updatedSections);
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        return;
      }

      const response = await axios.post("https://render-frontend-f05v.onrender.com//api/mcq/publish/", {
        students: selectedStudents,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        alert("Questions published successfully!");
        sessionStorage.clear(selectedStudents)
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

  const formatDuration = (duration) => {
    const hours = duration.hours.toString().padStart(2, '0');
    const minutes = duration.minutes.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsResponse = {
          data: {
            totalSections: sections.length,
            totalDuration: formatDuration(formData.testConfiguration.duration),
            maximumMark: formData.testConfiguration.maximumMark,
          },
        };

        setDashboardStats((prev) => ({
          ...prev,
          totalSections: statsResponse.data.totalSections,
          totalDuration: statsResponse.data.totalDuration,
          maximumMark: statsResponse.data.maximumMark,
        }));

        await fetchQuestions();
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [formData, sections]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <div className="max-w-5xl w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 mt-8">
          {[
            {
              label: "Total Questions",
              value: dashboardStats.totalQuestions,
              icon: "❓",
            },
            {
              label: "Total Sections",
              value: dashboardStats.totalSections,
              icon: "📂",
            },
            {
              label: "Total Duration",
              value: dashboardStats.totalDuration,
              icon: "⏱️",
            },
            {
              label: "Maximum Mark",
              value: dashboardStats.maximumMark,
              icon: "📝",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg border-l-4 border-yellow-400"
            >
              <div className="text-yellow-500 text-4xl">{item.icon}</div>
              <div className="text-right">
                <h3 className="text-gray-500 text-sm font-medium">
                  {item.label}
                </h3>
                <p className="text-xl font-semibold text-gray-800">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && questions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Loaded Questions
            </h3>
            <ul className="space-y-4">
              {questions.map((question, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 border border-gray-300"
                >
                  <div className="flex flex-col">
                    <h4 className="text-gray-800 font-medium">{`Question ${index + 1}`}</h4>
                    <p className="text-gray-600">{question.question}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {question.correctAnswer
                        ? `Answer: ${question.correctAnswer}`
                        : "No Answer Provided"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isLoading && (
          <div className="text-center mt-16">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-yellow-500" />
            <p className="text-gray-600 mt-4">Loading questions...</p>
          </div>
        )}

        {!isLoading && questions.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-600">No questions available in the database.</p>
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-lg shadow-md w-full max-w-4xl mt-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Section Details
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Organize your test with sections or add questions directly for a
            tailored organization.
          </p>
          <div className="flex justify-between">
            <button
              className="w-48 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-300"
              onClick={handleAddSection}
            >
              Add Section
            </button>
            <button
              className="w-48 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-300"
              onClick={handleAddQuestion}
            >
              Add Question
            </button>
          </div>
        </div>

        {/* Render Sections */}
        <div className="w-full max-w-4xl mt-6">
          {sections.map((section) => (
            <Mcq_sectionDetails
              key={section.id}
              section={section}
              onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
            />
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleFinalSubmit}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700"
          >
            Submit
          </button>
        </div>

        {isModalOpen && (
          <QuestionModal
            showModal={isModalOpen}
            onClose={handleModalClose}
            handleCreateManually={() => navigate('/mcq/CreateQuestion')}
            handleBulkUpload={() => navigate('/mcq/bulkUpload')}
            handleMcqlibrary={() => navigate('/mcq/McqLibrary')}
          />
        )}

        {!isLoading && questions.length > 0 && (
          <div className="flex justify-end mt-10">
            <button
              onClick={() => setPublishDialogOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Publish
            </button>
          </div>
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
      </div>
    </div>
  );
};

export default Mcq_CombinedDashboard;
