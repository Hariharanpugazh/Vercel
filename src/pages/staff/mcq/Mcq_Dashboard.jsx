import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
} from "@mui/material";
import QuestionModal from "../../../components/staff/mcq/QuestionModal";
import { jwtDecode } from "jwt-decode";
import ShareModal from "../../../components/staff/mcq/ShareModal";
import { Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentTable from "../../../components/staff/StudentTable";
import clockIcon from "../../../assets/icons/clock-icon.svg";
import markIcon from "../../../assets/icons/mark-icon-new.svg";
import markIconmarks from "../../../assets/icons/mark-icon.svg";
import questionIcon from "../../../assets/icons/question-icon.svg";
import { useCallback } from "react";
import Loader from "../../../components/ui/multi-step-loader";



const loadingStates = [
  {
    text: "Loading details...",
  },
  {
    text: "Configuring test details...",
  },
  {
    text: "Loading questions...",
  },
  {
    text: "Assigning to student...",
  },
  {
    text: "Published successfully",
  }
];

const Mcq_Dashboard = () => {
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        handlePublish();
        setLoading(false);
      }, 10000); // 5000 milliseconds = 5 seconds

      // Cleanup function to clear the timer if the component unmounts or loading changes
      return () => clearTimeout(timer);
    }
  }, [loading]);




  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    toast.dismiss(); // Clears all existing toasts when route changes
  }, [location.pathname]);

  const { formData, sections } = location.state || {};
  const [dashboardStats, setDashboardStats] = useState({
    totalQuestions: 0,
    totalMarks: 0,
    totalDuration: "00:00:00",
    maximumMark: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    collegename: [],
    dept: [],
    year: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharingLink, setSharingLink] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const itemsPerPage = 5;
  const initialFetch = useRef(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudents();
  }, [API_BASE_URL]); // Added API_BASE_URL to dependencies

  const duplicateToastShown = useRef(false); // ✅ Prevent duplicate messages



  const showToast = (message, type = "info") => {
    toast[type](message);
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("contestToken");
      if (!token) {
        showToast("Unauthorized access. Please log in again.", "error");
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/api/mcq/delete-question/${questionId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setQuestions((prevQuestions) =>
          prevQuestions.filter((question) => question._id !== questionId)
        );

        // Update the totalQuestions count in dashboardStats
        setDashboardStats((prevStats) => {
          const [selected, total] = prevStats.totalQuestions.split("/").map(Number);
          return {
            ...prevStats,
            totalQuestions: `${selected - 1}/${total}`,
          };
        });

        showToast("Question deleted successfully!", "success");
      } else {
        showToast(response.data.error || "Failed to delete question.", "error");
      }
    } catch (error) {
      console.error(
        "Error deleting question:",
        error.response?.data || error.message
      );
      showToast("Failed to delete question. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };


  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        toast.error("Unauthorized access. Please log in again.");
        return;
      }
      const decodedToken = jwtDecode(token);
      const contestId = decodedToken?.contestId;
      if (!contestId) {
        toast.error("Invalid contest token. Please log in again.");
        return;
      }
  
      const uniqueQuestions = Array.from(
        new Set(questions.map(JSON.stringify))
      ).map(JSON.parse);
  
      const selectedStudentDetails = students.filter((student) =>
        selectedStudents.includes(student.regno)
      );
      const selectedStudentEmails = selectedStudentDetails.map(
        (student) => student.email
      );
  
      const payload = {
        contestId,
        questions: uniqueQuestions,
        students: selectedStudents,
        studentEmails: selectedStudentEmails,
      };
  
      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/publish/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        setSharingLink(
          `${process.env.REACT_APP_FRONTEND_LINK}/testinstructions/${contestId}`
        );
        setShareModalOpen(true);
        toast.success("Questions published successfully!");
  
        // Clear session storage
        sessionStorage.clear();
      } else {
        toast.error(
          `Failed to publish questions: ${response.data.message || "Unknown error."
          }`
        );
      }
    } catch (error) {
      console.error("Error publishing questions:", error);
      if (error.response) {
        toast.error(
          `Error: ${error.response.data.message || error.response.statusText}`
        );
      } else if (error.request) {
        toast.error("No response from the server. Please try again later.");
      } else {
        toast.error(
          "An error occurred while publishing questions. Please try again."
        );
      }
    } finally {
      setPublishDialogOpen(false);
    }
  };
  
  // Inside your component
  const fetchQuestions = useCallback(async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        showToast("Unauthorized access. Please log in again.", "error");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/mcq/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedQuestions = response.data.questions.map((question) => ({
        ...question,
        correctAnswer:
          question.correctAnswer || question.answer || "No Answer Provided",
      }));

      const duplicateCount = response.data.duplicateCount || 0;

      if (duplicateCount > 0 && !duplicateToastShown.current) {
        showToast(`${duplicateCount} duplicate questions removed.`, "warning");
        duplicateToastShown.current = true;
      }

      if (duplicateCount === 0) {
        duplicateToastShown.current = false;
      }

      setQuestions(fetchedQuestions);

      setDashboardStats((prev) => ({
        ...prev,
        totalQuestions: `${fetchedQuestions.length}/${localStorage.getItem("totalquestions") || 0
          }`,
      }));
    } catch (error) {
      console.error(
        "Error fetching questions:",
        error.response?.data || error.message
      );
      showToast("Failed to load questions. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]); // Add dependencies if needed

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const totalMarks = localStorage.getItem("totalMarks");
        const duration = JSON.parse(localStorage.getItem("duration"));
        const passPercentage = localStorage.getItem("passPercentage");
        const totalQuestions = localStorage.getItem("totalquestions");

        let selectedQuestionsCount = 0;

        const token = localStorage.getItem("contestToken");
        if (token) {
          const response = await axios.get(
            `${API_BASE_URL}/api/mcq/questions`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          selectedQuestionsCount = response.data.questions.length;
        }

        setDashboardStats((prev) => ({
          ...prev,
          totalMarks: totalMarks || 0,
          totalDuration: duration
            ? `${duration.hours.padStart(2, "0")}:${duration.minutes.padStart(
              2,
              "0"
            )}:00`
            : "00:00:00",
          maximumMark: passPercentage || 0,
          totalQuestions: `${selectedQuestionsCount}/${totalQuestions || 0}`,
        }));

        await fetchQuestions();
        initialFetch.current = false;
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [formData, sections, API_BASE_URL, fetchQuestions]); // Added fetchQuestions to dependencies


  const handleShareModalClose = () => {
    setShareModalOpen(false);
    navigate(`/staffdashboard`);
  };

  const handleAddQuestion = async () => {
    setIsModalOpen(true);
    await fetchQuestions();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div className="p-6 py-10 px-10 bg-[#f4f6ff86] min-h-screen flex justify-center">

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
      <div className=" w-full">
        <div className="h-14 px-14 pb-10">
          <div className="flex items-center gap-2 text-[#111933]">
            <span className="opacity-60">Home</span>
            <span>{">"}</span>
            <span className="opacity-60">Assessment Overview</span>
            <span>{">"}</span>
            <span className="opacity-60">Test Configuration</span>
            <span>{">"}</span>
            <span className="opacity-60">
              Add Questions
            </span>
            <span>{">"}</span>
            <span >
              Question Dashboard
            </span>

          </div>
        </div>
        <div className="mx-40 max-w-[1200px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-x-20 mb-8 mt-8 items-stretch justify-stretch">
          {[
            {
              label: "Total Questions",
              value: dashboardStats.totalQuestions,
              icon: questionIcon,
            },
            {
              label: "Total Marks",
              value: dashboardStats.totalMarks,
              icon: markIcon,
            },
            {
              label: "Total Duration",
              value: dashboardStats.totalDuration,
              icon: clockIcon,
            },
            {
              label: "Pass Percentage %",
              value: dashboardStats.maximumMark,
              icon: markIconmarks,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white text-[#111933] shadow-md font-semibold rounded-lg p-5 relative flex flex-col items-center justify-center py-8"
            >
              {" "}
              {/* Added key prop */}
              <span className="absolute -top-4 -right-4 p-2 bg-white z-10 shadow-lg rounded-full">
                <img
                  src={item.icon || "/placeholder.svg"}
                  alt=""
                  className="w-6"
                />
              </span>
              <p className="text-xs"> {item.label} </p>
              <p className="text-2xl"> {item.value} </p>
            </div>
          ))}
        </div>

        {!isLoading && questions.length >= 0 && (
          <div className="mt-8 ml-16 px-5 pt-4 pb-6 bg-white shadow-md text-[#111933] rounded-xl w-full max-w-[1400px] ">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold mt-3">Questions</h2>
              <Button
                onClick={handleAddQuestion}
                variant="contained"
                style={{
                  backgroundColor: "#111933",
                  color: "white",
                  borderRadius: "8px",
                }}
              >
                Add Questions +
              </Button>
            </div>
            {/* Horizontal Line Below the Heading */}
            <hr className="border-t-2 border-gray-300 w-full mb-5" />

            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-[#FDC500] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-gray-600">Loading questions...</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {questions
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map((question, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-[#fafdff] shadow-sm rounded-lg p-4 border border-gray-200"
                    >
                      <p className="text-sm text-[#111933] flex-1 pr-4">
                        {question.question}
                      </p>
                      <div className="flex items-center min-w-fit">
                        <span className="text-sm font-semibold text-[#111933] mr-1">
                          ANS:
                        </span>
                        <span className="text-sm text-[#111933]">
                          {question.correctAnswer}
                        </span>
                        <button
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="ml-4 p-2 text-red-600 hover:text-red-700 transition-colors"
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}

            {questions.length > 0 && <div className="mt-6 flex justify-center">
              <Pagination
                count={Math.ceil(questions.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#111933",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "#FDC500",
                    color: "#fff",
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "rgba(17, 25, 51, 0.1)",
                  },
                }}
              />
            </div>}
            { questions.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  No questions available in the database.
                </p>
                {/* <Button
              onClick={() => navigate("/mcq/sectionDetails")}
              variant="contained"
              style={{ backgroundColor: "#111933", color: "white" }}
            >
              Add Sections and Questions
            </Button> */}
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center mt-16">
            <div className="w-8 h-8 border-4 border-[#FDC500] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        )}



        {!isLoading && questions.length > 0 && (
          <div className="flex justify-end mr-20 mt-6">
            <Button
              onClick={() => {
                const [selected, total] = dashboardStats.totalQuestions
                  .split("/")
                  .map(Number);
                if (selected < total) {
                  toast.warning(
                    "Insufficient questions to publish! Please add more questions."
                  );
                } else {
                  setPublishDialogOpen(true);
                }
              }}
              variant="contained"
              style={{
                backgroundColor: "#111933",
                color: "white",
                borderRadius: "8px",
              }}
            >
              Publish
            </Button>
          </div>
        )}

        {isModalOpen && (
          <QuestionModal
            showModal={isModalOpen}
            onClose={handleModalClose}
            handleCreateManually={() => navigate("/mcq/CreateQuestion")}
            handleBulkUpload={() => navigate("/mcq/bulkUpload")}
            handleMcqlibrary={() => navigate("/mcq/McqLibrary")}
            handleAi={() => navigate("/mcq/aigenerator")}
          />
        )}
        <Dialog
          open={publishDialogOpen}
          onClose={() => setPublishDialogOpen(false)}
          fullWidth
          maxWidth="lg"
        >
          <DialogTitle>Select Students</DialogTitle>
          <DialogContent>
            <StudentTable
              students={students}
              selectedStudents={selectedStudents}
              setSelectedStudents={setSelectedStudents}
              filters={filters}
              setFilters={setFilters}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              openFilterDialog={openFilterDialog}
              setOpenFilterDialog={setOpenFilterDialog}
            />
          </DialogContent>
          <DialogActions>

            <Button
              onClick={() => setPublishDialogOpen(false)}
              color="primary"
              variant="outlined"
              sx={{
                color: "#111933",
                borderColor: "#111933", // Set the border color
              }}
            >
              Cancel
            </Button>

            <Loader loadingStates={loadingStates} loading={loading} duration={2000} />

            <Button
              onClick={() => setLoading(true)}
              color="primary"
              variant="outlined"
              sx={{
                color: '#fff',
                backgroundColor: '#111933',
                borderColor: '#111933'
              }}
            >
              Confirm
            </Button>
            {loading && (
              <div className="fixed top-4 right-4 text-black dark:text-white z-[120]">

              </div>
            )}
          </DialogActions>
        </Dialog>
        <ShareModal
          open={shareModalOpen}
          onClose={handleShareModalClose}
          shareLink={sharingLink}
        />
      </div>
    </div>
  );
};

export default Mcq_Dashboard;
