import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaFilter,
  FaUserCog,
  FaUniversity,
  FaRegAddressBook,
  FaMailBulk,
  FaSchool,
  FaDownload
} from "react-icons/fa";
import { CircularProgress, Pagination } from "@mui/material";
import UserImg from "../../assets/Dashboard icon.png";
import PptxGenJS from "pptxgenjs"; // for PowerPoint generation
import { SHA256 } from 'crypto-js';
import { jsPDF } from "jspdf"; // for PDF export

const StudentResult = () => {
  const { contestId, studentId } = useParams();
  const [testData, setTestData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Number of items per page

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  useEffect(() => {
    const fetchStudentReport = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/mcq/student-report/${contestId}/${studentId}/`
        );
        setTestData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch student report.");
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudentReport();
    fetchStudents();
  }, [contestId, studentId]);

  const handleDownloadCertificate = async () => {
    if (!testData || !students.length) {
        alert("Student or contest data is missing.");
        return;
    }

    const matchedStudent = students.find((s) => s.studentId === testData.student_id);
    if (!matchedStudent) {
        alert("Student not found.");
        return;
    }

    const studentName = matchedStudent.name || "Unknown Student";
    const contestName = testData.contest_name || "Unknown Contest";
    const studentId = testData.student_id;

    // Generate a unique ID
    const uniqueId = SHA256(`${studentName}-${contestName}`).toString();

    // Get the test date from API
    let testDate = "Unknown Date";
    try {
        const response = await axios.get(`${API_BASE_URL}/api/mcq/get_cert_date/`, {
            params: { student_id: studentId, contest_id: testData.contest_id }
        });
        
        if (response.data && response.data.finish_time) {
            testDate = new Date(response.data.finish_time).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
            });
        }
    } catch (error) {
        console.error("Error fetching test date:", error);
        alert("Failed to fetch test date.");
        return;
    }

    // Get total correct answers
    let correctAnswers = 0;
    try {
      
      const scoreResponse = await axios.get(`${API_BASE_URL}/api/mcq/get-score/${testData.contest_id}/${studentId}/`);
        if (scoreResponse.data && typeof scoreResponse.data.correct_answers === "number") {
            correctAnswers = scoreResponse.data.correct_answers;
        }
    } catch (error) {
        console.error("Error fetching correct answers:", error);
        alert("Failed to fetch correct answers.");
        return;
    }

    // Store certificate data in MongoDB
    try {
        await axios.post(`${API_BASE_URL}/api/mcq/store-certificate/`, {
            uniqueId,
            studentName,
            contestName,
            studentId,

            testDate,
            correctAnswers,
        });

    } catch (error) {
        console.error("Error storing certificate data:", error);
        alert("Failed to store certificate data.");
        return;
    }

    // Initialize jsPDF
    const pdf = new jsPDF("l", "mm", "a4");

    // Load Certificate Template
    const templateImage = "/cert_template.png";
    const img = new Image();
    img.src = templateImage;
    img.onload = () => {
        pdf.addImage(img, "PNG", 0, 0, 297, 210);
        
        // Text Styling
        pdf.setFont("helvetica", "bold");

        // Place Contest Name
        pdf.setFontSize(16);
        pdf.text(contestName, 148, 134, { align: "center" });

        // Place Student Name
        pdf.setFontSize(22);
        pdf.text(studentName, 148, 105, { align: "center" });

        // Place Test Date
        pdf.setFontSize(14);
        pdf.text(`On ${testDate}`, 148, 144, { align: "center" });
        
        // Place Total Correct Answers
        pdf.setFontSize(14);
        pdf.text(`${correctAnswers}`, 158, 153, { align: "center" });

        // Place Unique ID
        pdf.setFontSize(10);
        pdf.text(`${uniqueId}`, 40, 193);

        // Place Clickable Verify Link
        const frontendBaseUrl = window.location.origin;
        const verifyLink = `${frontendBaseUrl}/verify-certificate/${uniqueId}/`;

        pdf.setTextColor(0, 0, 255);
        pdf.textWithLink("Verify Certificate", 268, 193, {
            url: verifyLink, 
            align: "center"
        });

        // Save PDF
        pdf.save(`${studentName}_Certificate.pdf`);
    };
};



  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!testData) return <div>No data available.</div>;

  const { attended_questions, start_time, finish_time, fullscreen, tabswitchwarning, facewarning, noisewarning, correct_answers, student_id } = testData;

  const score = (attended_questions.filter((q) => q.isCorrect).length / attended_questions.length) * 100;

  const start = new Date(start_time);
  const finish = new Date(finish_time);
  const timeTaken = (finish - start) / (1000 * 60);

  const notAnsweredQuestions = attended_questions.filter(q => q.userAnswer === null || q.userAnswer === '').length;
  const answeredQuestions = attended_questions.length - notAnsweredQuestions;

  const matchedStudent = students.find((s) => s.studentId === student_id);

  const filteredQuestions = attended_questions.filter(question => {
    if (filter === "all") return true;
    if (filter === "answered") return question.userAnswer !== null && question.userAnswer !== '';
    if (filter === "not_answered") return question.userAnswer === null || question.userAnswer === '';
    if (filter === "correct") return question.isCorrect;
    if (filter === "incorrect") return !question.isCorrect;
    return false;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div id="report-preview" className="space-y-6 p-6 px-20 bg-gray-100">
      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 p-6 bg-gray-100">
        {/* Student Info Card */}
        <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md w-full max-w-lg flex-shrink-0">
          {/* Student Image */}
          <div className="flex-shrink-0 mr-6">
            <img
              src={UserImg}
              className="w-44 h-44 bg-[#ffcc00] rounded-full "
              alt="Student"
            />
          </div>

          {/* Student Details */}
          <div className="flex-1 bg-white p-4 rounded-2xl">
            {/* Student Name */}
            <div className="text-2xl font-semibold text-blue-900 mb-4 text-center uppercase">
              {matchedStudent ? matchedStudent.name : "Unknown Student"}
            </div>
            <div className="text-start">
              <p className="text-lg font-semibold text-gray-900">
                1st Year - {matchedStudent?.regno?.toUpperCase() || "N/A"}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                {matchedStudent?.email || "N/A"}
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-2">
                {matchedStudent?.dept?.toUpperCase() || "N/A"}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                {matchedStudent?.collegename?.toUpperCase() || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Test Marks Summary Table */}
        <div className="w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-gray-800 text-white text-center py-3 font-semibold">
            Test Marks Summary
          </div>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="bg-gray-50">
                <td className="py-7 px-6 border-b border-r border-gray-200 font-semibold">Total Questions</td>
                <td className="py-4 px-6 border-b border-gray-200 text-center">{attended_questions.length}</td>
              </tr>
              <tr className="bg-white">
                <td className="py-7 px-6 border-b border-r border-gray-200 font-semibold">Correct Answers</td>
                <td className="py-4 px-6 border-b border-gray-200 text-center">{correct_answers}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-7 px-6 border-b border-r border-gray-200 font-semibold">Wrong Answers</td>
                <td className="py-4 px-6 border-b border-gray-200 text-center">{attended_questions.length - correct_answers - notAnsweredQuestions}</td>
              </tr>
              <tr className="bg-white">
                <td className="py-7 px-6 font-semibold border-r">Total Marks</td>
                <td className="py-4 px-6 text-center">{`${correct_answers}/${attended_questions.length}`}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Test Policy Breaches Table */}
        <div className="w-full max-w-lg bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-gray-800 text-white text-center py-3 font-semibold">
            Test Policy Breaches
          </div>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="bg-gray-50">
                <td className="py-4 px-6 border-b border-r border-gray-200 font-semibold">Time Taken</td>
                <td className="py-4 px-6 border-b border-gray-200 text-center">{timeTaken.toFixed(2)} minutes</td>
              </tr>
              <tr className="bg-white">
                <td className="py-4 px-6 border-b border-r border-gray-200 font-semibold">Fullscreen Policy Breach</td>
                <td className="py-4 px-6 border-b border-gray-200 text-center">{fullscreen + tabswitchwarning}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-4 px-6 border-b border-r border-gray-200 font-semibold">Face Recognition Anomaly</td>
                <td className="py-4 px-6 border-b border-gray-200 text-center">-</td>
              </tr>
              <tr className="bg-white">
                <td className="py-4 px-6 font-semibold border-r">Audio Disturbance Detected</td>
                <td className="py-4 px-6 text-center">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Progress Circle */}
        <div className="flex flex-col flex-1 p-1 rounded-xl items-center justify-center">
          <div className="relative">
            <CircularProgress
              variant="determinate"
              value={100}
              size={180}
              sx={{ color: "#fff5cc" }}
              thickness={8}
            />
            <div className="absolute z-10 w-full h-full top-0">
              <CircularProgress
                variant="determinate"
                value={score}
                size={180}
                sx={{ color: "#ffcc00" }}
                thickness={8}
              />
            </div>
            <div className="rounded-full absolute top-0 h-full w-full flex items-center justify-center">
              {score.toFixed(1)}%
            </div>
          </div>
          <p className="text-[#111933] mt-3 text-2xl font-bold">Total Marks</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 m-5 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#00296B] text-xl">Question Details</h2>
          <div className="flex items-center space-x-4">
            <FaFilter className="text-xl text-gray-500" />
            <select
              className="px-4 py-2 border border-gray-300 rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="answered">Answered</option>
              <option value="not_answered">Not Answered</option>
              <option value="correct">Correct</option>
              <option value="incorrect">Incorrect</option>
            </select>
          </div>
        </div>
        <div className="space-y-4 mt-4">
          <div className="bg-white overflow-hidden">
            <div className="grid grid-cols-[30%_1fr_1fr_1fr] gap-4 p-4 bg-[#111933] font-medium text-white">
              <p className="flex justify-center">Question</p>
              <p className="flex justify-center border-x-[1px]">Student Answer</p>
              <p className="flex justify-center border-r-[1px]">Correct Answer</p>
              <p className="flex justify-center">Result</p>
            </div>
            {currentQuestions.map((question) => (
              <div
                key={question.id}
                className="grid grid-cols-[30%_1fr_1fr_1fr] gap-4 p-4 border-t hover:bg-gray-50"
              >
                <p className="flex justify-start">{question.question}</p>
                <p className={`flex justify-center ${question.isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {question.userAnswer || "Not Answered"}
                </p>
                <p className="text-green-600 flex justify-center">{question.correctAnswer}</p>
                <p className={`flex justify-center ${question.isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {question.isCorrect ? "Correct" : "Incorrect"}
                </p>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-4">
            <Pagination
              count={Math.ceil(filteredQuestions.length / itemsPerPage)}
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
                  color: '#fff',
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Download Certificate Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleDownloadCertificate}
          className="flex items-center bg-[#111933] text-white px-4 py-2 rounded hover:shadow-xl transition duration-300"


        >
          <FaDownload className="mr-2" />
          Download Certificate
        </button>
      </div>
    </div>
  );
};

export default StudentResult;
