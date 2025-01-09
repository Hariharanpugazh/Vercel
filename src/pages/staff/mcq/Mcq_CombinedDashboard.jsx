import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Mcq_sectionDetails from "../../../components/staff/mcq/Mcq_sectionDetails";
import QuestionModal from "../../../components/staff/mcq/QuestionModal";

const Mcq_CombinedDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, sectionDetails } = location.state;
  const [dashboardStats, setDashboardStats] = useState({
    totalQuestions: 0,
    totalSections: 0,
    totalDuration: "00:00",
    maximumMark: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({ collegeName: "", dept: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("https://render-frontend-f05v.onrender.com/api/student/");
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
          (filters.collegeName ? student.collegeName.includes(filters.collegeName) : true) &&
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

  const handleAddSection = () => {
    const newSection = {
      id: sections.length + 1,
      sectionName: `Section ${sections.length + 1}`,
      numQuestions: 10,
      sectionDuration: 10,
      questions: [],
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
            maximumMark: formData.testConfiguration.totalMarks,
          },
        };

        setDashboardStats((prev) => ({
          ...prev,
          totalSections: statsResponse.data.totalSections,
          totalDuration: statsResponse.data.totalDuration,
          maximumMark: statsResponse.data.maximumMark,
        }));
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
      <div className="max-w-7xl w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 mt-8">
          {[
           
            {
              label: "Total Sections",
              value: dashboardStats.totalSections,
              icon: "📂",
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

        {sectionDetails === "Yes" && (
          <div className="bg-gray-50 p-6 rounded-lg flex justify-between items-center shadow-md w-full max-w-7xl mt-6">
            <span className="font-medium text-2xl">Section Details</span>
            <button
              className="w-48 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-300"
              onClick={handleAddSection}
            >
              Add Section
            </button>
          </div>
        )}

        {/* Render Sections */}
        {sectionDetails === "Yes" && (
          <div className="w-full max-w-7xl mt-6">
            {sections.map((section) => (
              <Mcq_sectionDetails
                key={section.id}
                section={section}
                onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          {sectionDetails === "No" && (
            <button
              onClick={handleAddQuestion}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700"
            >
              Add Question
            </button>
          )}
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
            handleMcqLibrary={() => navigate('/mcq/McqLibrary')}
            handleAi={() => navigate('/mcq/aiGenerator')}
          />
        )}
      </div>
    </div>
  );
};

export default Mcq_CombinedDashboard;
