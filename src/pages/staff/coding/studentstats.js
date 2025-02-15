import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Box, Typography, Pagination, Button, Modal, Slider } from "@mui/material";
import { Assessment, CheckCircle, Cancel, WatchLater, Search, Warning } from "@mui/icons-material";
import { FaUserCog, FaUniversity, FaRegAddressBook, FaMailBulk } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import ProfileBg from "../../../assets/profilebg.svg";
import ProfileImg from "../../../assets/Dashboard icon.png";
import GoldBadge from "../../../assets/badges/Gold.png";
import SilverBadge from "../../../assets/badges/Silver.png";
import BronzeBadge from "../../../assets/badges/Bronze.png";
import Loader from "../../../layout/Loader";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactDOM from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import StudentReport from "../Student_report";
import { LuDownload } from "react-icons/lu";
import { FaEye } from "react-icons/fa";

const EnhancedStudentDashboard = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const { regno } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // State to manage pagination
  const [currentPage, setCurrentPage] = useState(1);
  const assessmentsPerPage = 5;

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const codingResponse = await axios.get(`${API_BASE_URL}/staff/studentstats/${regno}/`);
        const mcqResponse = await axios.get(`${API_BASE_URL}/staff/mcq_stats/${regno}/`);

        if (codingResponse.status === 200 && mcqResponse.status === 200) {
          setStudentData({
            coding: codingResponse.data,
            mcq: mcqResponse.data,
          });
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [regno, API_BASE_URL]);

  if (loading) {
    return <Loader message="Loading student data..." />;
  }

  if (!studentData) {
    return <div className="text-center text-xl text-red-500">Error: Unable to load student data.</div>;
  }

  const getBadgeImage = (overallScore) => {
    if (overallScore >= 80) {
      return GoldBadge;
    } else if (overallScore >= 50) {
      return SilverBadge;
    } else {
      return BronzeBadge;
    }
  };

  const handleDownloadReport = async (contestStatus, contestId, studentId, studentName, setLoading) => {
    if (contestStatus !== "Completed") {
      toast.warning("The contest is not completed. You can download the report once it is completed.");
      return;
    }

    if (!contestId || !studentId) {
      console.error("Invalid contestId or studentId");
      return;
    }

    setLoading(true);

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    try {
      ReactDOM.render(<StudentReport contestId={contestId} regno={studentId} hideDetails={true} />, container);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const canvas = await html2canvas(container, { scale: 1.5 });
      const imgData = canvas.toDataURL("image/jpeg", 0.8);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Student-Report of ${studentName}.pdf`); // Use the student's name

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download report. Please try again.");
    } finally {
      document.body.removeChild(container);
      setLoading(false);
    }
  };

  const { coding, mcq } = studentData;

  const { student, performance: codingPerformance, assessments: codingAssessments } = coding || {};
  const { performance: mcqPerformance, assessments: mcqAssessments } = mcq || {};

  const totalTests = (codingPerformance?.total_tests || 0) + (mcqPerformance?.total_tests || 0);
  const completedTests = (codingPerformance?.completed_tests || 0) + (mcqPerformance?.completed_tests || 0);

  const allAssessments = [...(codingAssessments || []), ...(mcqAssessments || [])];

  const attended = allAssessments.filter((assessment) => assessment.contestStatus === "started").length;
  const unAttended = allAssessments.filter((assessment) => assessment.contestStatus === "Yet to Start").length;

  const handleViewReport = (contestStatus, assessmentId, studentId) => {
    if (contestStatus === "Completed") {
      navigate(`/viewtest/${assessmentId}/${studentId}`);
    } else {
      setPopupMessage("The student status is not completed. After completion, you can view the report.");
      setOpenPopup(true);
    }
  };

  const averageScore = mcqPerformance?.average_score || 0
  const badgeImage = getBadgeImage(averageScore)

  const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white w-[30%] h-full shadow-md rounded-lg p-6 relative text-center">
      <span className="p-1 absolute -right-3 -top-3 bg-white rounded-full"><Icon className="text-[#FFCC00]" /></span>
      <p className="m-0 text-xs font-semibold text-[#111933] mb-3">{label}</p>
      <p className="m-0 text-3xl font-semibold text-[#111933]">{value}</p>
    </div>
  );

  const indexOfLastAssessment = currentPage * assessmentsPerPage;
  const indexOfFirstAssessment = indexOfLastAssessment - assessmentsPerPage;
  const currentAssessments = allAssessments.slice(indexOfFirstAssessment, indexOfLastAssessment);
  const recentAssessments = allAssessments.slice(0, 3);

  const filteredAssessments = allAssessments.filter((assessment) =>
    assessment.name.toLowerCase().includes(search.toLowerCase())
  );

  const pageAssessments = search === "" ? currentAssessments : filteredAssessments;

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  console.log(student);

  return (
    <div className="min-h-screen bg-[#f4f6ff86] py-20 px-24 ">
      <div className="container-lg max-w-8xl mx-auto">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-[30%,70%] gap-8 h-full">
          <div className="bg-white flex items-center space-x-1 rounded-lg shadow-md overflow-hidden h-full p-2">
            <div className="w-44">
              <img
                src={ProfileImg}
                alt="Profile"
                className="w-full"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[#111933] text-2xl font-semibold text-start mb-2">{student.name}</h2>
              <p className="text-start text-sm mb-6">{student.year} Year - {student.regno}</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  {/* <FaMailBulk className="text-[#000066] mr-5" /> */}
                  <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center">
                  {/* <FaUserCog className="text-[#000066] mr-5" /> */}
                  <span className="text-sm">{student.dept}</span>
                </div>
                <div className="flex items-center">
                  {/* <FaUniversity className="text-[#000066] mr-5" /> */}
                  <span className="text-sm">{student.collegename}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl grid grid-cols-[70%,30%] h-full">
            <div className="h-full flex flex-col">
              <h3 className="text-[#111933] text-xl text-center font-bold mb-8 mt-4">Test Summary</h3>
              <div className="flex justify-between">
                <StatCard icon={Assessment} label="Total Tests Attended" value={totalTests} />
                <StatCard icon={CheckCircle} label="Completed" value={completedTests} />
                {/* <StatCard icon={Cancel} label="Not Completed" value={totalTests - completedTests} /> */}
                <StatCard icon={WatchLater} label="In Progress" value={attended} />
              </div>
            </div>

            <div className="h-full flex flex-col justify-around align-center">
              <div className="flex flex-col items-center justify-center">
                { averageScore && <CircularProgressWithLabel value={averageScore} />}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-8 lg:px-10 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-[#111933] mb-3">Assessment Details</h2>
          <p className="text-sm mb-5 text-[#111933]">Track the assessments report also view, and download.</p>
          <div className="flex shadow-sm shadow-gray-200 border px-5 py-2 mb-5 rounded-xl space-x-3">
            <Search fontSize="large" className="text-gray-500" />
            <input
              type="text"
              onChange={handleSearch}
              value={search}
              className="flex-1 focus:outline-none"
              placeholder="Search"
            />
          </div>
          <div className="space-y-4">
            {pageAssessments.length === 0 && <div className="text-center p-5">No Such Assessments Found!!!</div>}

            {pageAssessments.map((assessment, index) => (
              <React.Fragment key={index}>
                <div
                  key={index}
                  className="lg:flex justify-between items-center text-center p-4 lg:p-1 rounded-lg hover:bg-blue-50"
                >
                  <h3 className="text-normal font-medium text-[#111933]">{assessment.name}</h3>
                  <div className="flex items-center lg:justify-end justify-center space-x-4 mt-2 lg:m-0">
                    <button
                      className="text-sm flex items-center space-x-2 font-medium border border-[#111933] text-[#111933] rounded px-4 py-2 hover:bg-[#FFCC00] hover:border-[#FFCC00] hover:text-[#111933]"
                      onClick={() =>
                        handleViewReport(
                          assessment.contestStatus,
                          assessment.contestId,
                          studentData.mcq.student.student_id,
                        )
                      }
                    >
                      View Report
                      <FaEye className="ml-2" />
                    </button>
                    <button
                      className="text-sm flex items-center font-medium bg-[#111933] border-[#111933] text-white border hover:border-[#FFCC00] rounded px-4 py-2 hover:bg-[#FFCC00] hover:text-[#111933]"
                      onClick={() =>
                        handleDownloadReport(
                          assessment.contestStatus,
                          assessment.contestId,
                          mcq.student.student_id,
                          mcq.student.name, // Pass the student's name
                          setLoading,
                        )
                      }
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="loader" style={{ display: "inline-block" }}>
                          <div className="loading-ring"></div>
                        </div>
                      ) : (
                        <>Download <LuDownload className="ml-2" /></>
                      )}
                    </button>

                    <ToastContainer position="top-right" autoClose={3000} />
                  </div>
                </div>
                <hr />
              </React.Fragment>
            ))}
          </div>
        </div>

        <Modal
          open={openPopup}
          onClose={() => setOpenPopup(false)}
          aria-labelledby="status-popup"
          aria-describedby="status-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
              width: 500,
              minHeight: 200,
              bgcolor: "#ffffff",
              boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
              p: 4,
              textAlign: "center",
              borderRadius: "16px",
              animation: "fadeIn 0.4s ease-out",
            }}
          >
            <Box
              sx={{
                fontSize: 40,
                color: "#111933",
                mb: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FaCircleXmark />
            </Box>
            <Typography
              id="status-popup"
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                color: "#2c3e50",
                mb: 1,
              }}
            >
              Status Update
            </Typography>
            <Typography
              id="status-description"
              sx={{
                fontSize: "15px",
                color: "#4b5563",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              The report is currently unavailable as the student has not yet completed the assessment.
            </Typography>
            <Button
              onClick={() => setOpenPopup(false)}
              variant="contained"
              sx={{
                bgcolor: "#FFCC00",
                color: "#111933",
                fontWeight: 600,
                textTransform: "none",
                px: 5,
                py: 1.5,
                borderRadius: "12px",
                fontSize: "16px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                "&:hover": {
                  bgcolor: "#111933",
                  color: "#fff",
                },
                transition: "all 0.3s ease",
              }}
            >
              Close
            </Button>
          </Box>
        </Modal>

        <style jsx global>
          {`
            @keyframes fadeIn {
              0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
              }
              100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }
          `}
        </style>

        <div className="relative flex justify-center mt-6">
          <small className="absolute text-md left-5 text-gray-400 font-semibold">Show data {currentPage} to {Math.ceil(allAssessments.length / assessmentsPerPage)} of {allAssessments.length} entries</small>
          <Pagination
            count={Math.ceil(allAssessments.length / assessmentsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#000975',
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: '#111933',
                color: '#fff',
              },
              '& .MuiPaginationItem-root:hover': {
                backgroundColor: 'rgba(0, 9, 117, 0.4)',
                color: '#fff'
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};


function CircularProgressWithLabel({ value }) {
  const [showBadge, setShowBadge] = useState(false);

  const getBadgeImage = (score) => {
    if (score >= 80) {
      return GoldBadge;
    } else if (score >= 50) {
      return SilverBadge;
    } else {
      return BronzeBadge;
    }
  };

  const badgeImage = getBadgeImage(value);

  const toggleView = () => {
    setShowBadge(!showBadge);
  };

  return (
    <div className="flex flex-col flex-1 p-2 items-center justify-center">
      {showBadge ? (
        <img src={badgeImage} alt="Badge" className="w-32 mb-2" />
      ) : (
        <div className="relative mb-2">
          <CircularProgress
            variant="determinate"
            value={100}
            size={120}
            sx={{
              color: "#fff5cc",
              backgroundColor: "white",
              borderRadius: "50%",
            }}
            thickness={8}
          />
          <div className="absolute z-10 w-full h-full top-0">
            <CircularProgress
              variant="determinate"
              value={value}
              size={120}
              sx={{ color: "#fdc500" }}
              thickness={8}
            />
          </div>
          <div className="rounded-full text-[#111933] font-bold absolute top-0 h-full w-full flex items-center justify-center">
            {value}%
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleView}
        className="mt-2 text-[#111933] font-semibold cursor-pointer"
      >
        {!showBadge ? "Overall Stats >" : "< Progress"}
      </button>
    </div>
  );
}

export default EnhancedStudentDashboard