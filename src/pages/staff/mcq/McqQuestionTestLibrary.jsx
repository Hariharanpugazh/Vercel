import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from '@mui/material/Pagination';
import QuestionsList from '../../../components/McqLibrary/TestLibraryQuestionlist'; // Import QuestionsList component

const SelectTestQuestion = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('contestToken');
        if (!token) {
          alert('Unauthorized access. Please log in again.');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/fetch-all-tests/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure tags are always arrays
        const sanitizedTests = response.data.tests.map(test => ({
          ...test,
          questions: test.questions.map(question => ({
            ...question,
            tags: Array.isArray(question.tags) ? question.tags : []
          }))
        }));

        setTests(sanitizedTests);
        setError(null);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Pagination logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = selectedTest ? selectedTest.questions.slice(indexOfFirstQuestion, indexOfLastQuestion) : [];
  const totalPages = selectedTest ? Math.ceil(selectedTest.questions.length / questionsPerPage) : 0;

  // Submit Selected Test
  const handleSubmit = async () => {
    const token = localStorage.getItem("contestToken");

    try {
      await axios.post(
        `${API_BASE_URL}/api/mcq/save-questions/`,
        { questions: selectedTest.questions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Questions added successfully!");
      setTests([]);
      setSelectedTest(null);
      navigate('/mcq/QuestionsDashboard');
    } catch (error) {
      console.error("Error submitting questions:", error);
      toast.error("Failed to submit questions. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="h-14 px-14 pb-10">
          <div className="flex items-center gap-2 text-[#111933]">
            <span className="opacity-60">Home</span>
            <span>{">"}</span>
            <span className="opacity-60">Assessment Overview</span>
            <span>{">"}</span>
            <span className="opacity-60">Test Configuration</span>
            <span>{">"}</span>
            <span onClick={() => window.history.back()} className="cursor-pointer opacity-60 hover:underline">
              Add Questions
            </span>
            <span>{">"}</span>
            <span >
              Test Library
            </span>

          </div>
        </div>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111933]">Test Library</h1>
          <p className="text-[#00975]">Select a test to view and submit all questions</p>
        </div>

        {loading && <p className="text-sm text-[#00975]">Loading questions...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel for Test Names */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white shadow rounded-lg" style={{ borderRadius: '10px' }}>
              <div className='bg-[#111933] p-2 MB-1' style={{ borderRadius: '10px' }}>
                <p className="text-lg font-semibold pl-9 text-white">Test Name</p>
              </div>
              {tests.map((test, testIndex) => (
                <div
                  key={test.test_id}
                  className={`p-2 mt-2 pl-4 cursor-pointer ${
                    selectedTest?.test_id === test.test_id ? 'bg-[#fdc500] bg-opacity-40 border-[#fdc500]' : ''
                  }`}
                  onClick={() => setSelectedTest(test)}
                >
                  <h3 className="text-md font-medium">{test.test_name}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Panel for Questions List */}
          <div className="col-span-7 space-y-4">
            {selectedTest ? (
              <>
                {/* Questions List */}
                <QuestionsList
                  questions={selectedTest.questions}
                  loading={loading}
                  error={error}
                  currentQuestions={currentQuestions}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </>
            ) : (
              <div className="bg-white p-4 shadow rounded-lg">
                <p className="text-[#00975]">Please select a test to view questions.</p>
              </div>
            )}
          </div>

          {/* Right Panel for Selected Test */}
          <div className="col-span-3">
            <div className="bg-white shadow p-4 rounded-lg">
              <h2 className="text-sm font-bold mb-4 text-[#111933]">Selected Test</h2>
              {selectedTest ? (
                <>
                  <p className="text-sm text-[#111933]">{selectedTest.test_name}</p>
                  <p className="text-sm text-[#111933]">{selectedTest.questions.length} questions</p>
                  <button
                    onClick={handleSubmit}
                    className="mt-4 w-full py-2 px-4 rounded-lg text-sm bg-[#fdc500] text-[#111933] bg-opacity-40 border border-[#fdc500] text-[#00975] hover:bg-opacity-80"
                  >
                    Save Selected Test
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#111933]">No test selected</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTestQuestion;
