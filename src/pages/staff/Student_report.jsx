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
} from "react-icons/fa";
import { CircularProgress, Pagination } from "@mui/material";
import UserImg from "../../assets/profile.svg";
import Loader from "../../layout/Loader";

const StudentReport = ({ contestId: propContestId, regno: propRegNo, hideDetails }) => {
  const { contestId: paramContestId, regno: paramRegNo } = useParams();
  const contestId = propContestId || paramContestId;
  const regno = propRegNo || paramRegNo;

  const [testData, setTestData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Number of items per page

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

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
  }, []);

  useEffect(() => {
    const fetchStudentReport = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/mcq/student-report/${contestId}/${regno}/`
        );
        setTestData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch student report:", err);
        setError("Failed to fetch student report.");
        setLoading(false);
      }
    };

    fetchStudentReport();
  }, [contestId, regno]);

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;
  if (!testData) return <div>No data available.</div>;

  const matchedStudent = testData?.student_id
    ? students.find((student) => student.studentId === testData.student_id)
    : null;

  const studentName = matchedStudent ? matchedStudent.name : "Unknown Student";

  function formatTimeDifference(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid date format. Please provide valid ISO date strings.");
    }

    const diffInMilliseconds = Math.max(0, end - start);
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffInMilliseconds % (1000 * 60)) / 1000);

    const timeParts = [];
    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);
    if (seconds > 0 || timeParts.length === 0) timeParts.push(`${seconds}s`);

    return timeParts.join(" ");
  }

  const {
    attended_questions,
    start_time,
    finish_time,
    fullscreen,
    tabswitchwarning,
    correct_answers,
  } = testData;

  const notAnsweredQuestions = attended_questions.filter(
    (q) => q.userAnswer === null || q.userAnswer === ""
  ).length;

  const filteredQuestions = attended_questions.filter((question) => {
    if (filter === "all") return true;
    if (filter === "answered") return question.userAnswer !== null && question.userAnswer !== "" && question.userAnswer !== 'notattended';
    if (filter === "not_answered") return question.userAnswer === null || question.userAnswer === "" || question.userAnswer === 'notattended';
    if (filter === "correct") return question.isCorrect;
    if (filter === "incorrect") return !question.isCorrect && question.userAnswer !== 'notattended' && question.userAnswer !== null && question.userAnswer !== "";
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
    <div id="report-preview" className="space-y-6 p-6 py-10 px-20 bg-[#f4f6ff86]">
      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 p-6 bg-[#f4f6ff86]">
        {/* Student Info Card */}
        <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md w-full max-w-lg flex-shrink-0">
          {/* Student Image */}
          <div className="flex-shrink-0 mr-6">
            <img
              src={UserImg}
              className="w-44 h-44 bg-[#ffcc00] rounded-full shadow-lg"
              alt="Student"
            />
          </div>

          {/* Student Details */}
          <div className="flex-1 bg-white p-4 rounded-2xl">
            {/* Student Name */}
            <div className="text-2xl font-semibold text-[#111933] mb-4 text-center uppercase">
              {matchedStudent?.name || "Student Name"}
            </div>
            <div className="text-start">
              <p className="text-lg font-semibold text-[#111933]">
                1st Year - {matchedStudent?.regno?.toUpperCase() || "N/A"}
              </p>
              <p className="text-sm text-[#111933] mt-2">
                {matchedStudent?.email || "N/A"}
              </p>
              <p className="text-sm font-semibold text-[#111933] mt-2">
                {matchedStudent?.dept?.toUpperCase() || "N/A"}
              </p>
              <p className="text-sm text-[#111933] mt-2">
                {matchedStudent?.collegename?.toUpperCase() || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Test Marks Summary Table */}
        <div className="w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-[#111933] text-white text-center py-3 font-semibold">
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
          <div className="bg-[#111933] text-white text-center py-3 font-semibold">
            Test Policy Breaches
          </div>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="bg-gray-50">
                <td className="py-4 px-6 border-b border-r border-gray-200 font-semibold">Time Taken</td>
                <td className="py-4 px-6 border-b border-gray-200 text-center">{formatTimeDifference(start_time, finish_time)}</td>
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
                value={(correct_answers / attended_questions.length) * 100}
                size={180}
                sx={{ color: "#ffcc00" }}
                thickness={8}
              />
            </div>
            <div className="rounded-full absolute top-0 h-full w-full flex items-center justify-center">
              {((correct_answers / attended_questions.length) * 100).toFixed(1)}%
            </div>
          </div>
          <p className="text-[#111933] mt-3 text-2xl font-bold">Total Marks</p>
        </div>
      </div>

      {/* Filter Section */}
      {!hideDetails && (
        <div className="bg-white p-4 m-5 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#111933] text-2xl font-semibold">Question Details</h2>
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
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[30%_1fr_1fr_1fr] gap-4 p-4 rounded-t-xl bg-[#111933] font-medium text-white">
                <p className="flex justify-center">Question</p>
                <p className="flex justify-center border-x-[1px]">Student Answer</p>
                <p className="flex justify-center border-r-[1px]">Correct Answer</p>
                <p className="flex justify-center">Result</p>
              </div>
              {currentQuestions.length == 0 &&
                <div className="p-4 text-center">
                  <p>No results found!!!</p>
                </div>}
              {currentQuestions.map((question) => (
                <div
                  key={question.id}
                  className="grid grid-cols-[30%_1fr_1fr_1fr] gap-4 p-4 border-t hover:bg-gray-50"
                >
                  <p className="flex justify-start">{question.question}</p>
                  <p className={`flex justify-center ${question.isCorrect ? "text-green-600" : "text-red-600"}`}>
                    {question.userAnswer === 'notattended' ? "Not Answered" : question.userAnswer || "Not Answered"}
                  </p>
                  <p className="text-green-600 flex justify-center">{question.correctAnswer}</p>
                  <p className={`flex justify-center ${question.isCorrect ? "text-green-600" : "text-red-600"}`}>
                    {question.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {currentQuestions.length > 0 &&
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
              </div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
