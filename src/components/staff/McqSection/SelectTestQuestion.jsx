import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Filter, ChevronRight, Loader2 } from 'lucide-react';
import Pagination from '@mui/material/Pagination';
import { withStyles } from '@mui/styles';
import Checkbox from '@mui/material/Checkbox';

// Custom styling for the checkbox
const CustomCheckbox = withStyles({
  root: {
    color: '#fdc500',
    '&$checked': {
      color: '#fdc500',
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

const QuestionsList = ({ questions, loading, error, currentQuestions, setSelectedQuestion, currentPage, totalPages, setCurrentPage }) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setSelectedQuestions((prevSelected) => {
      if (prevSelected.includes(question)) {
        return prevSelected.filter((q) => q !== question);
      } else {
        return [...prevSelected, question];
      }
    });
  };

  return (
    <div className="bg-white p-4 shadow-sm border w-auto border-gray-200">
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <strong className="font-medium">Error: </strong>
            <span>{error}</span>
          </div>
        ) : (
          <>
            {currentQuestions.map((question, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white hover:bg-gray-50 transition-all duration-300 p-6 mb-4 rounded-md shadow-md"
              >
                <div className="text-left text-sm font-medium text-[#00296B] truncate w-7/12">
                  {question.question}
                </div>
                <div className="text-left text-sm text-[#00296B] w-3/12">
                  <strong>Answer:</strong> {question.correctAnswer}
                </div>
              </div>
            ))}
            {questions.length > 10 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#000975',
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#FDC500',
                      color: '#fff',
                    },
                    '& .MuiPaginationItem-root:hover': {
                      backgroundColor: 'rgba(0, 9, 117, 0.1)',
                    },
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SelectTestQuestion = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [questionCountFilter, setQuestionCountFilter] = useState('');
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = selectedTest 
    ? selectedTest.questions
        .filter(question => 
          question.question.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(indexOfFirstQuestion, indexOfLastQuestion)
    : [];
  const totalPages = selectedTest 
    ? Math.ceil(selectedTest.questions.filter(question => 
        question.question.toLowerCase().includes(searchQuery.toLowerCase())
      ).length / questionsPerPage)
    : 0;

  const filteredTests = questionCountFilter
    ? tests.filter(test => test.questions.length === parseInt(questionCountFilter))
    : tests;

  const handleSubmit = async () => {
    if (!selectedTest) {
      toast.error("Please select a test first");
      return;
    }

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4">
          <ChevronRight className="w-4 h-4" onClick={() => window.history.back()}/>
      </nav>

      <ToastContainer />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00296B]">Test Library</h1>
          <p className="text-gray-600 mt-2">Select a test to view and submit all questions</p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-[#00296B]">Test Name</h2>
                <div className="mt-4 flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#FDC500] focus:ring-[#FDC500]"
                    value={questionCountFilter}
                    onChange={(e) => setQuestionCountFilter(e.target.value)}
                  >
                    <option value="">All Questions</option>
                    {[...new Set(tests.map(test => test.questions.length))].map(count => (
                      <option key={count} value={count}>{count} Questions</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-2">
                {filteredTests.map((test) => (
                  <div
                    key={test.test_id}
                    onClick={() => setSelectedTest(test)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedTest?.test_id === test.test_id
                        ? 'bg-[#FDC500] bg-opacity-10 text-[#00296B]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-medium">{test.test_name}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Panel */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#FDC500] focus:ring-[#FDC500]"
                />
              </div>
            </div>
            <QuestionsList
              questions={selectedTest?.questions || []}
              loading={loading}
              error={error}
              currentQuestions={currentQuestions}
              setSelectedQuestion={setSelectedQuestion}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>

          {/* Right Panel */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="font-semibold text-[#00296B] mb-4">Selected Test</h2>
              {selectedTest ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">Test Name</p>
                    <p className="font-medium text-[#00296B]">{selectedTest.test_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Questions</p>
                    <p className="font-medium text-[#00296B]">{selectedTest.questions.length}</p>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full py-2 px-4 bg-[#FDC500] text-[#00296B] rounded-md hover:bg-[#e3b100] focus:outline-none focus:ring-2 focus:ring-[#FDC500] focus:ring-offset-2 transition-colors"
                  >
                    Save Selected Test
                  </button>
                </div>
              ) : (
                <p className="text-gray-600">No test selected</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTestQuestion;