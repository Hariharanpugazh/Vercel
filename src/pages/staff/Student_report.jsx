import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaList, FaThumbsUp, FaClipboardCheck, FaHourglassEnd, FaThumbsDown, FaStar, FaUser, FaFilter } from 'react-icons/fa';

const StudentReport = () => {
  const { contestId, regno } = useParams();
  const [testData, setTestData] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';
  const [filter, setFilter] = useState("all"); // State for filtering questions

  useEffect(() => {
    const fetchStudentReport = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL }/api/mcq/student-report/${contestId}/${regno}/`
        );
        console.log(response.data);  // Debugging
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!testData) return <div>No data available.</div>;

  const { attended_questions, grade, status, start_time, finish_time, red_flags, correct_answers, student } = testData;

  // Fetch pass percentage from session storage
  const passPercentage = sessionStorage.getItem('passPercentage');

  const score = (correct_answers / attended_questions.length) * 100;
  const isPassed = score >= passPercentage;

  // Calculate time taken to complete the test
  const start = new Date(start_time);
  const finish = new Date(finish_time);
  const timeTaken = (finish - start) / (1000 * 60); // Convert milliseconds to minutes

  // Calculate the number of questions not answered
  const notAnsweredQuestions = attended_questions.filter(q => q.userAnswer === null || q.userAnswer === '').length;
  const answeredQuestions = attended_questions.length - notAnsweredQuestions;

  // Filter questions based on the selected filter
  const filteredQuestions = attended_questions.filter(question => {
    if (filter === "all") return true;
    if (filter === "answered") return question.userAnswer !== null && question.userAnswer !== '';
    if (filter === "not_answered") return question.userAnswer === null || question.userAnswer === '';
    if (filter === "correct") return question.isCorrect;
    if (filter === "incorrect") return !question.isCorrect;
    return false;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Student Detail Card */}
      {student && (
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Student Name</p>
            <p className="text-2xl font-bold">{student.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Registration Number</p>
            <p className="text-2xl font-bold">{student.regno}</p>
          </div>
          <FaUser className="text-4xl text-blue-500" />
        </div>
      )}

      {/* Test Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Questions */}
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Total Questions</p>
            <p className="text-2xl font-bold">{attended_questions.length}</p>
          </div>
          <FaList className="text-4xl text-blue-400" />
        </div>

        {/* Correct Answers */}
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Correct Answers</p>
            <p className="text-2xl font-bold">{correct_answers}</p>
          </div>
          <FaThumbsUp className="text-4xl text-green-500" />
        </div>

        {/* Questions Answered */}
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Questions Answered</p>
            <p className="text-2xl font-bold">{answeredQuestions}</p>
          </div>
          <FaClipboardCheck className="text-4xl text-blue-700" />
        </div>

        {/* Time Taken */}
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Time Taken</p>
            <p className="text-2xl font-bold">{timeTaken.toFixed(2)} minutes</p>
          </div>
          <FaHourglassEnd className="text-4xl text-orange-400" />
        </div>

        {/* Wrong Answers */}
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Wrong Answers</p>
            <p className="text-2xl font-bold">{attended_questions.length - correct_answers - notAnsweredQuestions}</p>
          </div>
          <FaThumbsDown className="text-4xl text-red-500" />
        </div>

        {/* Total Marks */}
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Total Marks</p>
            <p className="text-2xl font-bold">{correct_answers}/{attended_questions.length}</p>
          </div>
          <FaStar className="text-4xl text-yellow-500" />
        </div>
      </div>

      {/* Red Flags Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <p className="text-xl font-medium">Fullscreen Policy Breach</p>
          <p className="text-2xl font-medium text-red-600">{red_flags}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <p className="text-xl font-medium">Face Recognition Anomaly</p>
          <p className="text-2xl font-medium text-red-600">{red_flags.face_detection}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
          <p className="text-xl font-medium">Audio Disturbance Detected</p>
          <p className="text-2xl font-medium text-red-600">{red_flags.noise_detection}</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Question Details</h2>
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

      {/* Question Details */}
      <div className="space-y-4 mt-4">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 font-medium">
            <p>Question</p>
            <p>Student Answer</p>
            <p>Correct Answer</p>
            <p>Result</p>
          </div>

          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className={`grid grid-cols-4 gap-4 p-4 border-t ${
                question.isCorrect ? "bg-green-50" : ""
              }`}
            >
              <p>{question.question}</p>
              <p
                className={`font-bold ${
                  question.userAnswer
                    ? question.isCorrect
                      ? "text-green-600"
                      : "text-red-600"
                    : "text-black"
                }`}
              >
                {question.userAnswer || "Not Answered"}
              </p>
              <p className="font-bold text-green-600">{question.correctAnswer}</p>
              <p
                className={`font-bold ${
                  question.isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {question.isCorrect ? "Correct" : "Incorrect"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentReport;
