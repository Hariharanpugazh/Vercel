import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlinePublish } from "react-icons/md";
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
  Paper,
  Box,
  Pagination,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  Skeleton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { parseISO, isAfter } from "date-fns";
import CloseIcon from "@mui/icons-material/Close";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import { XCircle } from "lucide-react";
import heroImg from "../../../assets/test_view_hero_img.png";
import StudentTable from "../../../components/staff/StudentTable";
import DownloadContestData from "../../../components/staff/report/DownloadContestData";

function formatDateTime(dateString) {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)

  return `${day} ${month} ${year}, ${hours}:${minutes} ${period}`;
}

const RulesAndRegulations = ({ assessmentOverview }) => {
  const parseGuidelines = (guidelines) => {
    if (!guidelines) return [];

    const lines = guidelines.split("\n");
    const items = lines.map((line) => {
      const match = line.match(/^(\d+\.|\d+\)|\*|\-|\+)\s(.*)/);
      if (match) {
        return { type: match[1], content: match[2] };
      }
      return { type: "", content: line };
    });

    return items;
  };

  const items = parseGuidelines(assessmentOverview?.guidelines);

  return (
    <section className="flex p-6 shadow-sm flex-1 bg-[#ffffff] mb-6 rounded-lg">
      <div className="mb-6 flex-[2] mr-12">
        <p className="text-2xl font-semibold text-[#111933] mb-2">
          {" "}
          Rules and Regulations{" "}
        </p>
        <p className="text-md font-semibold ml-6 text-[#111933] mb-2">
          Instructions: Read carefully; contact the Department for
          clarifications.
        </p>
        {items.length > 0 ? (
          <ul className="list-disc list-inside ml-7">
            {items.map((item, index) => (
              <li
                key={index}
                className="text-md text-black break-words ml-3 text-justify"
              >
                {item.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-md text-black break-words text-justify">
            {assessmentOverview?.guidelines}
          </p>
        )}
      </div>
    </section>
  );
};

const ViewTest = () => {
  const [testDetails, setTestDetails] = useState(null); // Added state variable
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const themeButtonStyle =
    "px-5 p-2 rounded-xl bg-transparent border-[#111933] border-[1px] mx-2 hover:bg-[#b6c5f7]";

  const [showDownload, setShowDownload] = useState(false);
  const { contestId } = useParams();
  const { studentId } = useParams();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [popup, setPopup] = useState("some popup message");
  const [showPopup, setShowPopup] = useState(false);
  const [popupFunction, setPopupFunction] = useState();
  const [page, setPage] = useState(0);

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    collegename: [],
    dept: [],
    year: [],
    status: "",
    searchText: "",
  });
  const [dialogFilters, setDialogFilters] = useState({
    collegename: "",
    dept: "",
    year: "",
  });
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [dialogStudents, setDialogStudents] = useState([]);
  const [filteredDialogStudents, setFilteredDialogStudents] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showPublishPopup, setShowPublishPopup] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false); // New state for close popup
  const [showDeleteStudentPopup, setShowDeleteStudentPopup] = useState(false); // New state for delete student popup
  const [studentToDelete, setStudentToDelete] = useState(null); // State to track the student to delete

  const assessmentOverview = testDetails?.assessmentOverview || {};
  const isRegistrationPeriodOver = assessmentOverview?.registrationEnd
    ? isAfter(new Date(), parseISO(assessmentOverview.registrationEnd))
    : false;
  const isOverallStatusClosed = testDetails?.overall_status === "closed";

  const handlePublish = async () => {
    try {
      setIsPublished(true);

      console.log("Contest ID:", contestId);
      console.log(
        "API URL:",
        `${API_BASE_URL}/api/mcq/publish-result/${contestId}/`
      );

      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/publish-result/${contestId}/`
      );
      if (response.status === 200) {
        setIsPublished(true);
        // Removed the toast success message here
      } else {
        toast.error("Failed to publish results. Please try again.");
      }
    } catch (error) {
      console.error("Error publishing results:", error);
      toast.error(
        "An error occurred while publishing the results. Please try again."
      );
    } finally {
      setIsPublished(false);
    }
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/contests/${contestId}/`
        );
        setTestDetails(response.data);

        const updatedStudents = (response.data.student_details || []).map(
          (student) => ({
            ...student,
            year: student.year || "N/A",
            status: student.status || "Unknown",
          })
        );
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);

        const passPercentage = response.data.testConfiguration?.passPercentage;
        if (passPercentage !== undefined) {
          sessionStorage.setItem("passPercentage", passPercentage);
        }
      } catch (err) {
        setError("Failed to fetch test details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (contestId) fetchTestDetails();
  }, [contestId, API_BASE_URL]);

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        const updatedStudents = response.data.map((student) => ({
          ...student,
          year: student.year || "N/A",
        }));
        setDialogStudents(updatedStudents);
        setFilteredDialogStudents(updatedStudents);
      } catch (error) {
        console.error("Failed to fetch all students:", error);
      }
    };

    if (publishDialogOpen) fetchAllStudents();
  }, [publishDialogOpen, API_BASE_URL]);

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

  const handleSave = async () => {
    try {
      console.log("Updated Test Data:", testDetails);
      await axios.put(
        `${API_BASE_URL}/api/contests/${contestId}/`,
        testDetails
      );

      setLoading(true);

      await axios.put(
        `${API_BASE_URL}/api/contests/${contestId}/`,
        testDetails
      );
      toast.success("Test details updated successfully");

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContestData = () => {
    const completedStudents = students.filter(student => student.status === 'Completed');
  
    if (completedStudents.length === 0) {
      toast.info("No students have completed the assessment. Download is not available.");
    } else {
      setShowDownload(true);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...students];

      if (filters.status) {
        filtered = filtered.filter(
          (student) =>
            student.status?.toLowerCase() === filters.status.toLowerCase()
        );
      }

      if (filters.year.length > 0) {
        filtered = filtered.filter((student) =>
          filters.year.includes(student.year)
        );
      }

      if (filters.searchText) {
        filtered = filtered.filter((student) =>
          student.name.toLowerCase().includes(filters.searchText.toLowerCase())
        );
      }

      if (filters.collegename.length > 0) {
        filtered = filtered.filter((student) =>
          filters.collegename.some((college) =>
            student.collegename.toLowerCase().includes(college.toLowerCase())
          )
        );
      }

      if (filters.dept.length > 0) {
        filtered = filtered.filter((student) =>
          filters.dept.some((dept) =>
            student.dept.toLowerCase().includes(dept.toLowerCase())
          )
        );
      }

      setFilteredStudents(filtered);
      setPage(0);
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

  const handleStudentRemove = (regno) => {
    setStudentToDelete(regno);
    setShowDeleteStudentPopup(true);
  };

  const confirmStudentRemove = async () => {
    try {
      // Send delete request to backend
      await axios.delete(`${API_BASE_URL}/api/remove_student/${contestId}/${studentToDelete}/`);

      // Update the state to remove the student from the list
      setTestDetails((prevDetails) => {
        const updatedDetails = { ...prevDetails };
        updatedDetails.visible_to = updatedDetails.visible_to.filter(
          (studentRegno) => studentRegno !== studentToDelete
        );
        updatedDetails.student_details = updatedDetails.student_details.filter(
          (student) => student.regno !== studentToDelete
        );
        return updatedDetails;
      });

      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.regno !== studentToDelete)
      );
      setFilteredStudents((prevFilteredStudents) =>
        prevFilteredStudents.filter((student) => student.regno !== studentToDelete)
      );

      // Show a toast notification for feedback
      toast.success(`Student removed successfully`);

      // Close the popup
      setShowDeleteStudentPopup(false);
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    }
  };

  const handleAddStudent = async () => {
    try {
      // Create a new Set from the current visible_to array and add new selected students
      const updatedVisibleTo = new Set([
        ...(testDetails?.visible_to || []),
        ...selectedStudents
      ]);

      // Create the updated test details
      const updatedTestDetails = {
        ...testDetails,
        visible_to: Array.from(updatedVisibleTo)
      };

      // Update the API first
      await axios.put(
        `${API_BASE_URL}/api/contests/${contestId}/`,
        updatedTestDetails
      );

      // After successful API update, update the local state
      setTestDetails(updatedTestDetails);

      // Fetch the updated student details for the newly added students
      const newStudentDetails = await Promise.all(
        selectedStudents.map(async (regno) => {
          try {
            const response = await axios.get(`${API_BASE_URL}/api/student/${regno}/`);
            return {
              ...response.data,
              status: 'Yet to Start',
              year: response.data.year || 'N/A'
            };
          } catch (error) {
            console.error(`Error fetching details for student ${regno}:`, error);
            return null;
          }
        })
      );

      // Filter out any null values and add only valid student details
      const validNewStudents = newStudentDetails.filter(student => student !== null);

      // Update the students state with new students
      setStudents(prevStudents => {
        const existingRegnos = new Set(prevStudents.map(s => s.regno));
        const uniqueNewStudents = validNewStudents.filter(s => !existingRegnos.has(s.regno));
        return [...prevStudents, ...uniqueNewStudents];
      });

      // Update filtered students as well
      setFilteredStudents(prevFiltered => {
        const existingRegnos = new Set(prevFiltered.map(s => s.regno));
        const uniqueNewStudents = validNewStudents.filter(s => !existingRegnos.has(s.regno));
        return [...prevFiltered, ...uniqueNewStudents];
      });

      // Show success message
      toast.success('Students added successfully');

      // Clear selection and close dialog
      setSelectedStudents([]);
      setPublishDialogOpen(false);
    } catch (error) {
      console.error('Error adding students:', error);
      toast.error('Failed to add students. Please try again.');
    }
  };

  const handleCloseSession = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/mcq/close-session/${contestId}/`);
      toast.success("Session closed successfully.");
      navigate("/staffdashboard", {
        state: {
          toastMessage: "Assessment session has been closed.",
          testStatus: "closed",
        },
      });
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close the session. Please try again.");
    }
  };

  const handleDeleteContest = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/mcq/delete-contest/${contestId}/`
      );
      toast.success("Contest deleted successfully.");
      navigate("/staffdashboard", {
        state: {
          toastMessage: "Assessment has been deleted.",
        },
      });
    } catch (error) {
      console.error("Error deleting contest:", error);
      toast.error("Failed to delete the contest. Please try again.");
    }
  };

  const handleReassign = async (student) => {
    console.log(student);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/mcq/reassign/${contestId}/${student.studentId}/`);
      if (response.status === 200) {
        toast.success("Student reassigned successfully");
      } else {
        toast.error("Failed to reassign student. Please try again.");
      }
    } catch (error) {
      console.error("Error reassigning student:", error);
      toast.error("An error occurred while reassigning the student. Please try again.");
    }
  };

  if (error) return <div>{error}</div>;

  const handleViewClick = (student) => {
    if (student.status.toLowerCase() === "yet to start") {
      setModalOpen(true);
    } else if (student.status.toLowerCase() === "started") {
      setModalOpen(true);
    } else {
      navigate(`${student.studentId}`);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const { testConfiguration, student_details, sections } = testDetails || {};

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const indexOfLastStudent = (page + 1) * rowsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - rowsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const handleFilterDialogOpen = () => {
    setOpenFilterDialog(true);
  };

  const handleFilterDialogClose = () => {
    setOpenFilterDialog(false);
  };

  const toggleFilter = (filterType, value) => {
    setFilters((prevFilters) => {
      let newFilters = { ...prevFilters };
      if (filterType === "collegename") {
        newFilters.collegename = newFilters.collegename.includes(value)
          ? newFilters.collegename.filter((college) => college !== value)
          : [...newFilters.collegename, value];
      } else if (filterType === "dept") {
        newFilters.dept = newFilters.dept.includes(value)
          ? newFilters.dept.filter((dept) => dept !== value)
          : [...newFilters.dept, value];
      } else if (filterType === "year") {
        newFilters.year = newFilters.year.includes(value)
          ? newFilters.year.filter((year) => year !== value)
          : [...newFilters.year, value];
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      collegename: [],
      dept: [],
      year: [],
      status: "",
      searchText: "",
    });
    setOpenFilterDialog(false);
  };

  const applyFilters = () => {
    setOpenFilterDialog(false);
  };

  return (
    <div className="min-h-screen relative">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div
        className={`w-screen h-screen bg-[#0000005a] fixed ${showPopup ? "flex" : "hidden"
          } items-center justify-center z-10 px-10`}
      >
        <div className="h-fit p-4 rounded-xl bg-white flex flex-col text-center min-w-[300px] w-1/2 max-w-[70%]">
          <i className="bi bi-exclamation-diamond-fill text-rose-700 text-7xl"></i>
          <p className="text-3xl mt-8"> Warning </p>
          <p className="text-xl mt-1 w-[90%] self-center"> {popup} </p>
          <div className="flex space-x-2 mt-8">
            <button
              className="px-5 p-2 rounded-lg flex-1 bg-[#11193361] border-[#111933] border-[1px] hover:bg-[#11193390]"
              onClick={() => popupFunction()}
            >
              Okay
            </button>
            <button
              className={`${themeButtonStyle} rounded-lg flex-1 m-0`}
              onClick={() => setShowPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 w-[600px] max-w-full rounded-xl shadow-lg text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-14 h-14 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-red-600">Warning</h2>
            <p className="text-lg text-gray-700 mt-2">
              Are you sure you want to delete the assessment?
            </p>
            <p className="text-sm text-red-500 mt-2">
              <strong>Note:</strong> This action cannot be undone.
            </p>
            <div className="flex justify-center mt-6 space-x-32">
              <button
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                onClick={() => {
                  handleDeleteContest();
                  setShowDeletePopup(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

{showPublishPopup && (
  <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white p-8 w-[600px] max-w-full rounded-xl shadow-lg text-center">
      <div className="flex items-center justify-center space-x-3">
        <svg
          className="w-8 h-8 text-green-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-semibold">Confirm Publish</h2>
      </div>
      <p className="text-md text-gray-700 mt-4">
        Are you sure you want to publish the assessment? Once published,
        it will be visible to all participants.
      </p>
      <p className="text-sm text-red-500 mt-2">
        <strong>Note:</strong> This action cannot be undone.
      </p>
      <div className="flex justify-center mt-6 space-x-44">
        <button
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition"
          onClick={() => setShowPublishPopup(false)}
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 bg-[#111933] hover:bg-blue-900 text-white rounded-lg transition"
          onClick={() => {
            handlePublish();
            setShowPublishPopup(false);
          }}
        >
          Yes, Publish
        </button>
      </div>
    </div>
  </div>
)}
      {showClosePopup && (
        <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 w-[600px] max-w-full rounded-xl shadow-lg text-center">
            {/* Warning Icon */}
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Warning Message */}
            <h2 className="text-2xl font-semibold text-red-600">Warning</h2>
            <p className="text-lg text-gray-700 mt-2">
              Are you sure you want to close the assessment?
            </p>
            <p className="text-sm text-red-500 mt-2">
              <strong>Note:</strong> This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex justify-center mt-6 space-x-40">
              <button
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition"
                onClick={() => setShowClosePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                onClick={() => {
                  handleCloseSession();
                  setShowClosePopup(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteStudentPopup && (
        <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 w-[600px] max-w-full rounded-xl shadow-lg text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-14 h-14 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-red-600">Warning</h2>
            <p className="text-lg text-gray-700 mt-2">
              Are you sure you want to delete this student?
            </p>
            <p className="text-sm text-red-500 mt-2">
              <strong>Note:</strong> This action cannot be undone.
            </p>
            <div className="flex justify-center mt-6 space-x-32">
              <button
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition"
                onClick={() => setShowDeleteStudentPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                onClick={confirmStudentRemove}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-14 py-12 px-24 bg-[#f4f6ff86] min-h-full">
        <section className="flex p-6 shadow-sm flex-1 bg-white mb-6 rounded-lg text-[#111933] items-start">
          <div className="flex-1 p-2 flex flex-col mr-12 justify-between">
            <div className="mb-6">
              {loading ? (
                <Skeleton variant="text" width={200} height={30} />
              ) : (
                <p className="text-2xl font-semibold mb-2">
                  {assessmentOverview?.name}{" "}
                </p>
              )}
              {loading ? (
                <Skeleton variant="text" width={400} height={20} />
              ) : (
                <p className="text-sm text-black break-words text-justify">
                  {assessmentOverview?.description}
                </p>
              )}
            </div>

            <div className="mt-4 border-2 rounded-lg">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-[#111933] text-white">
                  <tr>
                    {[
                      "Registration Start",
                      "Total Duration",
                      "Total Attendees",
                      "Registration End",
                    ].map((title, index) => (
                      <th
                        key={index}
                        className={`relative font-normal py-2 px-6 text-center ${
                          index === 0
                            ? "rounded-tl-lg"
                            : index === 3
                            ? "rounded-tr-lg"
                            : ""
                        }`}
                      >
                        {title}
                        {index !== 0 && (
                          <span
                            className="absolute top-1/2 -translate-y-1/2 left-0 h-3/4 w-[1px] bg-gray-200"
                            style={{
                              marginTop: "0.001rem",
                              marginBottom: "2rem",
                            }}
                          ></span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300 hover:bg-gray-100">
                    <td className="py-3 px-6 text-center ">
                      {loading ? (
                        <Skeleton variant="text" width={150} height={20} />
                      ) : (
                        formatDateTime(assessmentOverview?.registrationStart)
                      )}
                    </td>
                    <td className="py-3 px-6 text-center ">
                      {loading ? (
                        <Skeleton variant="text" width={100} height={20} />
                      ) : (
                        `${testConfiguration?.duration?.hours}:${testConfiguration?.duration?.minutes} hrs`
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {loading ? (
                        <Skeleton variant="text" width={50} height={20} />
                      ) : (
                        student_details?.length || 0
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {loading ? (
                        <Skeleton variant="text" width={150} height={20} />
                      ) : (
                        formatDateTime(assessmentOverview?.registrationEnd)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <img
            src={heroImg}
            alt="Hero"
            className="w-[200px] ml-1 lg:w-[250px]"
          />
        </section>

        <section className="flex space-x-6 flex-1 mb-6">
          <div className="flex-1 flex flex-col items-center bg-white text-[#111933] border border-gray-300 rounded-xl shadow-md">
            <p className="bg-[#111933] rounded-t-xl py-3 text-[#ffffff] text-lg font-medium w-full text-center">
              Progress Details
            </p>
            <div className="flex flex-col w-full">
              {/* Row for Headers */}
              <div className="grid grid-cols-2  border-b border-gray-300 p-2">
                <p className="p-2 border-r border-gray-300 font-medium text-center">Assigned</p>
                {loading ? (
                  <Skeleton variant="text" width={50} height={20} />
                ) : (
                  <p className="p-2 text-center">{student_details.length}</p>
                )}
              </div>
              <div className="grid grid-cols-2 border-b border-gray-300 p-2">
                <p className="p-2 border-r border-gray-300 font-medium text-center ">Yet to Complete</p>
                {loading ? (
                  <Skeleton variant="text" width={50} height={20} />
                ) : (
                  <p className="p-2 text-center">{student_details.filter(student => student.status === 'Yet to Complete').length}</p>
                )}
              </div>
              <div className="grid grid-cols-2 p-2">
                <p className="p-2 border-r border-gray-300 font-medium text-center">Completed</p>
                {loading ? (
                  <Skeleton variant="text" width={50} height={20} />
                ) : (
                  <p className="p-2 text-center">{student_details.filter(student => student.status === 'Completed').length}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center bg-white text-[#111933] border border-gray-300 rounded-xl shadow-md">
            <p className="bg-[#111933] rounded-t-xl py-3 text-[#ffffff] text-lg font-medium w-full text-center">
              Progress Details
            </p>
            <div className="flex flex-col w-full">
              {/* No. of Questions */}
              <div className="grid grid-cols-2 border-b border-gray-300 p-2">
                <p className="p-2 border-r border-gray-300 font-medium text-center">No. of Questions</p>
                {loading ? (
                  <Skeleton variant="text" width={50} height={20} />
                ) : (
                  <p className="p-2 text-center">{testConfiguration?.questions || 0}</p>
                )}
              </div>

              {/* No. of Sections (Only if sections exist) */}
              {sections?.length > 0 && (
                <div className="grid grid-cols-2 border-b border-gray-300 p-2">
                  <p className="p-2 border-r border-gray-300 font-medium text-center">No. of Sections</p>
                  {loading ? (
                    <Skeleton variant="text" width={50} height={20} />
                  ) : (
                    <p className="p-2 text-center">{sections?.length || 0}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 border-b border-gray-300 p-2">
                <p className="p-2 border-r border-gray-300 font-medium text-center">
                  Marks per Question
                </p>
                {loading ? (
                  <Skeleton variant="text" width={50} height={20} />
                ) : (
                  <p className="p-2 text-center">
                    {testConfiguration?.questions
                      ? (Number.isInteger(testConfiguration?.totalMarks / testConfiguration?.questions)
                          ? (testConfiguration?.totalMarks / testConfiguration?.questions)
                          : (testConfiguration?.totalMarks / testConfiguration?.questions).toFixed(2))
                      : 0}
                  </p>
                )}
              </div>

              {/* Total Marks */}
              <div className="grid grid-cols-2 p-2">
                <p className="p-2 border-r border-gray-300 font-medium text-center">Total Marks</p>
                {loading ? (
                  <Skeleton variant="text" width={50} height={20} />
                ) : (
                  <p className="p-2 text-center">{testConfiguration?.totalMarks || 0}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center bg-white text-[#111933] border border-gray-300 rounded-xl shadow-md">
            <p className="bg-[#111933] rounded-t-xl py-3 text-[#ffffff] text-lg font-medium w-full text-center">
              Sections & Questions
            </p>
            <div className="w-full">
              <div className="grid grid-cols-2 border-b border-gray-300 p-2">
                <p className="p-2 border-r border-gray-300 font-medium text-center">Sections</p>
                <p className="p-2 text-center font-medium">Questions</p>
              </div>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Skeleton variant="rectangular" width="100%" height={100} />
                </div>
              ) : (
                (sections ?? []).length === 0 ? (
                  <div className="flex items-center justify-center p-4">
                    <p className="text-center font-semibold">!! No Sections here to Display !!</p>
                  </div>
                ) : (
                  <>
                    {sections?.map((section, index) => (
                      <div key={index} className="grid grid-cols-2 border-b border-gray-300 p-2">
                        <p className="p-2 border-r border-gray-300 text-center flex items-center justify-center">{section.sectionName}</p>
                        <p className="p-2 text-center flex items-center justify-center">{section.numQuestions}</p>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 p-2 border-t border-gray-300">
                      <p className="p-2 border-r border-gray-300 text-center font-medium">Total</p>
                      <p className="p-2 text-center font-medium">{testConfiguration?.questions || 0}</p>
                    </div>
                  </>
                )
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col text-center bg-white text-[#111933] border-[1px] border-gray-200 rounded-md pb-2">
            <p className="bg-[#111933] rounded-tl-md rounded-tr-md p-2 text-[#ffffff] text-lg font-normal">
              Proctoring Enabled
            </p>
            {[
              {
                title: "Full Screen Mode",
                value: testConfiguration?.fullScreenMode
                  ? "Enabled"
                  : "Disabled",
                enabled: testConfiguration?.fullScreenMode,
                icon: "fullscreen-icon",
              },
              {
                title: "Face Detection",
                value: testConfiguration?.faceDetection
                  ? "Enabled"
                  : "Disabled",
                enabled: testConfiguration?.faceDetection,
                icon: "face-detection-icon",
              },
              {
                title: "Device Restriction",
                value: testConfiguration?.deviceRestriction
                  ? "Enabled"
                  : "Disabled",
                enabled: testConfiguration?.deviceRestriction,
                icon: "device-restriction-icon",
              },
              {
                title: "Noise Detection",
                value: testConfiguration?.noiseDetection
                  ? "Enabled"
                  : "Disabled",
                enabled: testConfiguration?.noiseDetection,
                icon: "noise-detection-icon",
              },
            ].map((configParam) => (
              <div
                key={configParam.title}
                className="flex justify-between p-2 w-[85%] self-center"
              >
                <p> {configParam.title} </p>{" "}
                <label className="relative inline-flex items-center cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={configParam.enabled}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 cursor-auto bg-gray-300 rounded-full peer-focus:ring-2 peer-focus:ring-blue-900 peer-checked:bg-[#111933] transition-all duration-300">
                    <div
                      className={`absolute left-0.5 top-1 h-4 w-4 bg-white rounded-full shadow-md transition-transform duration-300 ${configParam.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                    ></div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </section>

        <RulesAndRegulations assessmentOverview={assessmentOverview} />

        {student_details && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#111933] mb-4">
              Students
            </h2>

            <div className="flex items-center mb-4">
            {!isRegistrationPeriodOver && !isOverallStatusClosed && (
            <button
                className="bg-[#111933] text-white font-medium mb3 py-1 px-5 border rounded-lg"
                onClick={() => setPublishDialogOpen(true)}
                disabled={isOverallStatusClosed}
              >
                Add Student
              </button>
            )}
              <button
                className="bg-[#111933] ml-auto text-white font-medium mb3 py-1 px-5 border rounded-lg"
                onClick={handleFilterDialogOpen}
              >
                <span className="pr-1">Filter</span>
                <FilterListIcon />
              </button>

            </div>

            <Dialog
              open={openFilterDialog}
              onClose={handleFilterDialogClose}
              fullWidth
              maxWidth="md"
              PaperProps={{
                style: {
                  width: "800px",
                  height: "530px",
                  borderRadius: 15,
                  backgroundColor: "#fff",
                },
              }}
              BackdropProps={{
                className:
                  "fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm",
              }}
              TransitionProps={{ unmountOnExit: true }}
            >
              <DialogTitle
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  color: "#111933",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Filter Options
                <IconButton
                  onClick={handleFilterDialogClose}
                  sx={{ color: "#111933" }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ paddingTop: 0 }}>

                <Typography
                  variant="h6"
                  sx={{  mb: 1, fontWeight: "bold", color: "#111933" }}
                >
                  Institution
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {[
                    "SNSCT",
                    "SNSCE",
                    "SNS Spine",
                    "SNS Nursing",
                    "SNS Pharmacy",
                    "SNS Health Science",
                    "SNS Academy",
                    "SNS Physiotherapy",
                  ].map((college) => (
                    <Chip
                      key={college}
                      label={college}
                      clickable
                      onClick={() => toggleFilter("collegename", college)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: filters.collegename.includes(college)
                          ? "#111933"
                          : "rgba(225, 235, 255, 0.8)",
                        color: filters.collegename.includes(college)
                          ? "#fff"
                          : "#111933",
                        width: "auto",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "15px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        "&:hover": {
                          backgroundColor: "#111933",
                          color: "#fff",
                        },
                      }}
                    />
                  ))}
                </Box>

                <Typography
                  variant="h6"
                  sx={{ mt: 3, mb: 1, fontWeight: "bold", color: "#111933" }}
                >
                  Year
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {["I", "II", "III", "IV"].map((year) => (
                    <Chip
                      key={year}
                      label={year}
                      clickable
                      onClick={() => toggleFilter("year", year)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: filters.year.includes(year)
                          ? "#111933"
                          : "rgba(225, 235, 255, 0.8)",
                        color: filters.year.includes(year) ? "#fff" : "#111933",
                        width: "auto",
                        height: "35px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "15px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        "&:hover": {
                          backgroundColor: "#111933",
                          color: "#fff",
                        },
                      }}
                    />
                  ))}
                </Box>
                <Typography
                  variant="h6"
                  sx={{mt:3, mb: 1, fontWeight: "bold", color: "#111933" }}
                >
                  Department
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {[
                    "AI&ML",
                    "IT",
                    "CSE",
                    "AI&DS",
                    "Mech",
                    "EEE",
                    "ECE",
                    "CSD",
                    "CST",
                    "AERO",
                    "MCT",
                    "CIVIL",
                    "Others",
                  ].map((dept) => (
                    <Chip
                      key={dept}
                      label={dept}
                      clickable
                      onClick={() => toggleFilter("dept", dept)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: filters.dept.includes(dept)
                          ? "#111933"
                          : "rgba(225, 235, 255, 0.8)",
                        color: filters.dept.includes(dept) ? "#fff" : "#111933",
                        width: "auto",
                        height: "35px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "15px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        "&:hover": {
                          backgroundColor: "#111933",
                          color: "#fff",
                        },
                      }}
                    />
                  ))}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={clearFilters}
                  variant="outlined"
                  sx={{
                    color: "#111933",
                    borderColor: "#111933",
                    borderRadius: "10px",
                    width: "150px",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    gap: "8px",
                    "&:hover": {
                      backgroundColor: "#fff",
                      color: "#111933",
                    },
                  }}
                >
                  <div className="rounded-full border border-[#111933] p-[2px]">
                    <IoCloseCircleOutline className="text-[#111933]" />
                  </div>
                  Clear Filter
                </Button>
                <Button
                  onClick={applyFilters}
                  variant="contained"
                  sx={{
                    backgroundColor: "#111933",
                    color: "#fff",
                    borderRadius: "10px",
                    width: "150px",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    gap: "8px",
                    "&:hover": {
                      backgroundColor: "#111933",
                    },
                  }}
                >
                  <div className="rounded-full border border-white ">
                    <FaCheckCircle className="text-white" />
                  </div>
                  Apply Filters
                </Button>
              </DialogActions>
            </Dialog>

            <Box mb={2} display="flex" gap={2}>
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                name="searchText"
                value={filters.searchText || ""}
                onChange={handleFilterChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                    height: "40px",
                    padding: "0 16px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "gray",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "darkgray",
                  },
                  "& .MuiInputLabel-root": {
                    top: "-5px",
                    fontSize: "0.9rem",
                    color: "gray",
                  },
                  "& .MuiInputLabel-shrink": {
                    top: "0px",
                  },
                }}
              />
              <TextField
                label="Filter by Year"
                select
                fullWidth
                name="year"
                value={filters.year || ""}
                onChange={handleFilterChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                    height: "40px",
                    padding: "0 16px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "gray",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "darkgray",
                  },
                  "& .MuiInputLabel-root": {
                    top: "-5px",
                    fontSize: "0.9rem",
                    color: "gray",
                  },
                  "& .MuiInputLabel-shrink": {
                    top: "0px",
                  },
                }}
              >
                <MenuItem key={"All"} value={""}>
                  All
                </MenuItem>
                <MenuItem key={"I"} value={"I"}>
                  I
                </MenuItem>
                <MenuItem key={"II"} value={"II"}>
                  II
                </MenuItem>
                <MenuItem key={"III"} value={"III"}>
                  III
                </MenuItem>
                <MenuItem key={"IV"} value={"IV"}>
                  IV
                </MenuItem>
              </TextField>
              <TextField
                label="Filter by Status"
                select
                fullWidth
                name="status"
                value={filters.status || ""}
                onChange={handleFilterChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                    height: "40px",
                    padding: "0 16px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "gray",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "darkgray",
                  },
                  "& .MuiInputLabel-root": {
                    top: "-5px",
                    fontSize: "0.9rem",
                    color: "gray",
                  },
                  "& .MuiInputLabel-shrink": {
                    top: "0px",
                  },
                }}
              >
                <MenuItem key="All" value={""}>
                  All
                </MenuItem>
                <MenuItem key={"Completed"} value={"Completed"}>
                  Completed
                </MenuItem>
                <MenuItem key={"Started"} value={"Started"}>
                  Started
                </MenuItem>
                <MenuItem key={"Yet to Start"} value={"Yet to Start"}>
                  Yet to Start
                </MenuItem>
              </TextField>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: "10px" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#111933", color: "white" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Name
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Registration Number
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Department
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        College Name
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Year
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Status
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? Array.from({ length: rowsPerPage }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={7}>
                            <Skeleton
                              variant="rectangular"
                              width="100%"
                              height={40}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    : currentStudents.map((student) => (
                        <TableRow key={student.regno}>
                          <TableCell
                            sx={{ position: "relative", textAlign: "center" }}
                          >
                            {!isRegistrationPeriodOver && !isOverallStatusClosed && (
                            <button
                              onClick={() => handleStudentRemove(student.regno)}
                              style={{
                                position: "absolute",
                                left: "20px",
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            >
                              <XCircle className="text-red-500" />
                            </button>
                            )}
                            <span>{student.name}</span>
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            {student.regno}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            {student.dept}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            {student.collegename}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            {student.year}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            {student.status}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <button
                              className="text-red-500 ml-2"
                              onClick={() => handleViewClick(student)}
                            >
                              View
                            </button>
                            <button
                              className="text-blue-500 ml-2"
                              onClick={() => handleReassign(student)}
                            >
                              Reassign
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filters.searchText === "" && (
              <div className="flex justify-center mt-6">
                <Pagination
                  count={Math.ceil(filteredStudents.length / rowsPerPage)}
                  page={page + 1}
                  onChange={handlePageChange}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "#111933",
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                      backgroundColor: "#FDC500",
                      color: "#111933",
                    },
                    "& .MuiPaginationItem-root:hover": {
                      backgroundColor: "rgba(0, 9, 117, 0.1)",
                    },
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <div className="flex">
            {!isRegistrationPeriodOver && !isOverallStatusClosed && (
              <>
                <button
                  className={themeButtonStyle}
                  onClick={() => setShowClosePopup(true)}
                   // Show the close popup
                >
                  Close Assessment
                </button>
              </>
            )}
            <button
              className={themeButtonStyle}
              onClick={() => setShowDeletePopup(true)}
            >
              Delete Assessment
            </button>
            <button
              className={themeButtonStyle}
              onClick={handleDownloadContestData}
            >
              Download Contest Data
            </button>
          </div>

          <button
            className="px-7 p-1 rounded-lg bg-[#111933] border-[#111933] text-white border-[1px] mx-2 hover:bg-[#12204b] flex items-center"
            onClick={() => setShowPublishPopup(true)}
          >
            <span className="mr-2">Publish Assessment</span>
            <MdOutlinePublish />
          </button>
        </div>

        <Dialog
          open={publishDialogOpen}
          onClose={() => setPublishDialogOpen(false)}
          fullWidth
          maxWidth="lg"
        >
          <DialogTitle>Select Students</DialogTitle>
          <DialogContent>
            <StudentTable
              students={dialogStudents}
              selectedStudents={selectedStudents}
              setSelectedStudents={setSelectedStudents}
              filters={dialogFilters}
              setFilters={setDialogFilters}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              openFilterDialog={openFilterDialog}
              setOpenFilterDialog={setOpenFilterDialog}
              testDetails={testDetails}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setPublishDialogOpen(false)}
              sx={{ color: "#111933" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              sx={{ backgroundColor: "#111933" }}
              variant="contained"
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle className="font-semibold">
            No Report Available
          </DialogTitle>
          <DialogContent>
            <p>The report for this student is not available yet.</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {modalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm z-40"></div>
        )}

        {showDownload && (
          <DownloadContestData
            contestId={contestId}
            contestName={assessmentOverview?.name}
          />
        )}
      </div>
    </div>
  );
};

export default ViewTest;
