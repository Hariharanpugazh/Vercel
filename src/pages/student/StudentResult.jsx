import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const StudentResult = ({  }) => {
  const { contestId, studentId } = useParams();
  const [testData, setTestData] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';
  const regno = studentId;
  useEffect(() => {
    const fetchStudentReport = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL }/api/mcq/student-report/${contestId}/${regno}/`
        );
        setTestData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch student report.");
        setLoading(false);
      }
    };

    fetchStudentReport();
  }, [contestId, regno]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!testData) return <div>No data available.</div>;

  const { attended_questions, grade, status, start_time, finish_time } = testData;
  const score = (attended_questions.filter((q) => q.isCorrect).length / attended_questions.length) * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Test Overview */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Test Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium">Score</p>
            <p className="text-2xl font-bold">{score.toFixed(1)}%</p>
            <div className="relative w-full bg-gray-200 rounded-full h-4 mt-2">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Grade</p>
            <p className="text-2xl font-bold">{grade}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-2xl font-bold">{status}</p>
          </div>
        </div>
      </div>

      {/* Question Details */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Question Details</h2>
        {attended_questions.map((question) => (
          <div
            key={question.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() =>
                setExpandedQuestion(
                  expandedQuestion === question.id ? null : question.id
                )
              }
            >
              <h3 className="text-lg font-medium">Question {question.id}</h3>
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  question.isCorrect
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {question.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            {expandedQuestion === question.id && (
              <div className="p-4 border-t">
                <p className="font-medium mb-2">{question.question}</p>
                <p className="text-sm mb-1">
                  Student answer:{" "}
                  <span
                    className={`font-bold ${
                      question.isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {question.userAnswer}
                  </span>
                </p>
                {!question.isCorrect && (
                  <p className="text-sm">
                    Correct answer:{" "}
                    <span className="font-bold text-green-600">
                      {question.correctAnswer}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentResult;
