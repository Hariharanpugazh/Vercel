import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from '@mui/material/Pagination';

import FiltersSidebar from '../../../components/McqLibrary/FiltersSidebar';
import QuestionsList from '../../../components/McqLibrary/TestQuestionList';

const McqLibrary = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [filters, setFilters] = useState({ level: [], tags: [] });
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [selectedQuestionsPerPage] = useState(5); // Number of selected questions per page
  const [selectedCurrentPage, setSelectedCurrentPage] = useState(1); // Current page for selected questions
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

        const response = await axios.get(`${API_BASE_URL}/api/fetch-all-questions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sanitizedQuestions = response.data.questions.map(question => ({
          ...question,
          tags: Array.isArray(question.tags) ? question.tags : []
        }));

        setQuestions(sanitizedQuestions);
        setFilteredQuestions(sanitizedQuestions);
        setError(null);

        const tagsSet = new Set();
        sanitizedQuestions.forEach(question => {
          question.tags.forEach(tag => tagsSet.add(tag));
        });
        setAvailableTags(Array.from(tagsSet));
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Filter and sort questions based on search input, selected tag, and selected difficulty
  useEffect(() => {
    let filtered = questions;

    if (filter) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(q =>
        filters.tags.some(tag => q.tags.includes(tag))
      );
    }

    if (filters.level.length > 0) {
      filtered = filtered.filter(q =>
        filters.level.some(diff => diff.toLowerCase() === q.level.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  }, [filter, filters, questions]);

  // Toggle question selection
  const toggleQuestionSelection = (question) => {
    setSelectedQuestions(prevSelected =>
      prevSelected.includes(question)
        ? prevSelected.filter(q => q !== question)
        : [...prevSelected, question]
    );
  };

  // Toggle select all/deselect all questions
  const toggleSelectAll = () => {
    setSelectedQuestions(selectAll ? [] : filteredQuestions);
    setSelectAll(!selectAll);
  };

  // Handle filter toggle
  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ level: [], tags: [] });
    setFilter('');
  };

  // Submit selected questions
  const handleSubmit = async () => {
    const token = localStorage.getItem("contestToken");

    try {
      await axios.post(
        `${API_BASE_URL}/api/mcq/save-questions/`,
        { questions: selectedQuestions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Questions added successfully!");
      setQuestions([]);
      setSelectedQuestions([]);
      navigate('/mcq/QuestionsDashboard');
    } catch (error) {
      console.error("Error submitting questions:", error);
      toast.error("Failed to submit questions. Please try again.");
    }
  };

  // Pagination logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  // Pagination logic for selected questions
  const selectedIndexOfLastQuestion = selectedCurrentPage * selectedQuestionsPerPage;
  const selectedIndexOfFirstQuestion = selectedIndexOfLastQuestion - selectedQuestionsPerPage;
  const selectedCurrentQuestions = selectedQuestions.slice(selectedIndexOfFirstQuestion, selectedIndexOfLastQuestion);
  const selectedTotalPages = Math.ceil(selectedQuestions.length / selectedQuestionsPerPage);

  // Handle page change for selected questions
  const handleSelectedPageChange = (event, value) => {
    setSelectedCurrentPage(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="h-14 px-14 pb-10 ml-7">
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
              Question Library
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
      <div className="max-w-[90%] mx-auto">
        {/* Header */}
        <div className="mb-4 border-b-2">
          <h1 className="text-3xl font-bold text-[#00975]">Question Library</h1>
          <p className="text-[#00975] mb-3">Select and preview questions from your collection</p>
        </div>

        {loading && <p className="text-sm text-[#00975]">Loading questions...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-4 gap-4">
          {/* Left Panel for Filters */}
          <div >
             {/* Add TotalQuestions component here */}
           
            <FiltersSidebar
              filters={filters}
              toggleFilter={toggleFilter}
              clearFilters={clearFilters}
              availableTags={availableTags}
            />
    
          </div>

          {/* Middle Panel for Questions List */}
          <div className="col-span-2 w-full">
            {/* Search Bar and Select/Deselect Button */}
            <div className="sticky top-4 bg-white p-2  rounded-lg flex  justify-between">
              <button
                onClick={toggleSelectAll}
                className="py-1 px-7 bg-[#111933] border-2 border-[#efeeee] shadow-blue-100 font-semibold text-[#ffffff] rounded-xl hover:bg-[#111933e3] h-full flex items-center justify-center gap-2"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
              <div className='py-1 px-6 ml-2 bg-white border-2 border-[#111933] shadow-blue-100 font-semibold text-[#111933] rounded-xl hover:bg-white h-full flex items-center justify-center gap-2'>
              Total Questions: {questions.length}
              </div>
              <div className="flex items-center flex-grow ml-4">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-grow px-3 py-2 border rounded-full text-sm text-[#00975]"
                />
              </div>
            </div>

            {/* Questions List */}
            <QuestionsList
              questions={filteredQuestions}
              loading={loading}
              error={error}
              currentQuestions={currentQuestions}
              setSelectedQuestion={toggleQuestionSelection}
              selectedQuestions={selectedQuestions}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>

          {/* Right Panel for Selected Questions */}
          <div className="col-span-1">
            <div className="bg-white shadow p-4 rounded-lg">
              <h2 className="text-sm font-bold mb-4 text-[#111933]">Selected Questions</h2>
              {selectedCurrentQuestions.length === 0 ? (
                <p className="text-sm text-[#111933]">No questions selected</p>
              ) : (
                <ul>
                  {selectedCurrentQuestions.map((question, index) => (
                    <li key={index} className="border-b py-2 text-sm flex justify-between items-center">
                      <span className="text-[#111933]">{index + 1}. {question.question}</span>
                    </li>
                  ))}
                </ul>
              )}
              {selectedQuestions.length > selectedQuestionsPerPage && (
                <Pagination
                  className="mt-4"
                  count={selectedTotalPages}
                  page={selectedCurrentPage}
                  onChange={handleSelectedPageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#000975', // Text color for pagination items
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#FDC500', // Background color for selected item
                      color: '#fff', // Text color for the selected item
                    },
                    '& .MuiPaginationItem-root:hover': {
                      backgroundColor: 'rgba(0, 9, 117, 0.1)', // Hover effect
                    },
                  }}
                />
              )}
              <button
                onClick={handleSubmit}
                className="mt-4 w-full py-2 px-4 rounded-lg text-sm bg-[#FFCC00] text-[#00296B]  border border-[#fdc500] text-[#00975] hover:bg-opacity-80"
              >
                Save Selected Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default McqLibrary;