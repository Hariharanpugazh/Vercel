import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import TestQuestionDetails from './TestQuestionDetails';
import { FaSearch } from 'react-icons/fa';
import Pagination from '@mui/material/Pagination';
import filterIcon from "../../assets/filter.svg";
import sortIcon from "../../assets/sort.svg";
import TotalQuestions from './TotalQuestions';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const McqTestQuestionList = ({ testId, setSelectedQuestion, currentPage, totalPages, setCurrentPage, isEditMode, deleteSelectedQuestions, view, setView, selectedQuestion }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const fetchQuestions = useCallback(async () => {
    try {
      console.log("Fetching questions for test ID:", testId);
      if (!testId) {
        console.error("Test ID is undefined");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/fetch_questions_for_test/?test_id=${testId}`);
      console.log("API Response:", response.data);

      if (response.data.error) {
        setError(response.data.error);
        setQuestions([]);
        toast.error("Error fetching questions.");
      } else {
        setQuestions(response.data.questions);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to fetch questions. Please try again.");
      setLoading(false);
      toast.error("Failed to fetch questions. Please try again.");
    }
  }, [testId]);

  useEffect(() => {
    fetchQuestions();
  }, [testId, fetchQuestions]);

  useEffect(() => {
    let filteredQuestions = questions;

    if (searchQuery) {
      filteredQuestions = filteredQuestions.filter(question =>
        question.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterLevel) {
      filteredQuestions = filteredQuestions.filter(question =>
        question.level.toLowerCase() === filterLevel.toLowerCase()
      );
    }

    if (sortOrder) {
      if (sortOrder === 'name_asc') {
        filteredQuestions.sort((a, b) => a.question.localeCompare(b.question));
      } else if (sortOrder === 'name_desc') {
        filteredQuestions.sort((a, b) => b.question.localeCompare(a.question));
      } else if (sortOrder === 'level_asc') {
        filteredQuestions.sort((a, b) => a.level.localeCompare(b.level));
      } else if (sortOrder === 'level_desc') {
        filteredQuestions.sort((a, b) => b.level.localeCompare(a.level));
      }
    }

    setCurrentQuestions(filteredQuestions);
  }, [searchQuery, filterLevel, sortOrder, questions]);

  const debouncedSearch = useCallback(
    debounce((query) => setSearchQuery(query), 200), // Reduced debounce delay
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query); // Update state immediately
    debouncedSearch(query); // Debounce for filtering
  };

  const handleFilterLevelChange = (level) => {
    setFilterLevel(level);
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
  };

  const onDeleteQuestion = async (question_id) => {
    if (!testId) {
      console.error("Test ID is undefined");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/delete-question-from-test/${testId}/${question_id}/`);
      if (response.status === 200) {
        setQuestions(questions.filter(question => question.question_id !== question_id));
        toast.success("Question deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      setDeleteError("Failed to delete the question. Please try again.");
      toast.error("Failed to delete the question. Please try again.");
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const handleDeleteClick = (question_id) => {
    setQuestionToDelete(question_id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (questionToDelete) {
      onDeleteQuestion(questionToDelete);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setQuestionToDelete(null);
  };

  const getItemsPerPage = () => 10;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="flex space-y-4">
      <ToastContainer />
      <div className="flex flex-1 space-x-4">
        {/* Left Section */}
        <div className="w-1/5 bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className='relative flex-1 flex'>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search questions..."
                className="w-full appearance-none border rounded-full flex-1 text-lg p-2 px-12 text-[#111933] leading-tight focus:outline-none focus:shadow-outline"
              />
              <FaSearch className='text-xl absolute h-full self-center ml-4' />
            </div>
          </div>
          <div className='flex flex-col space-y-4'>
            <div className='relative items-stretch'>
              <div className="flex flex-col space-y-2">
                <button
                  className={`flex items-center text-left py-2 pl-8 pr-5 text-[#111933]`}
                >
                  <img src={filterIcon} alt="" className='w-4 mr-2 h-full' />
                  Filter by Level
                </button>
                <button
                  onClick={() => handleFilterLevelChange('easy')}
                  className={`text-left text-sm ml-5 text-gray-500 py-1 pl-8 pr-5 ${filterLevel === 'easy' ? 'bg-gray-200' : ''}`}
                >
                  Easy
                </button>
                <button
                  onClick={() => handleFilterLevelChange('medium')}
                  className={`text-left text-sm ml-5 text-gray-500 py-1 pl-8 pr-5 ${filterLevel === 'medium' ? 'bg-gray-200' : ''}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => handleFilterLevelChange('hard')}
                  className={`text-left text-sm ml-5 text-gray-500 py-1 pl-8 pr-5 ${filterLevel === 'hard' ? 'bg-gray-200' : ''}`}
                >
                  Hard
                </button>
              </div>
            </div>
            <div className='relative'>
              <select
                value={sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value)}
                className="test-filter outline-none p-2 px-7"
              >
                <option value="" className='text-[#111933]'>Sort by</option>
                <option value="name_asc" className='text-[#111933]'>Name (A-Z)</option>
                <option value="name_desc" className='text-[#111933]'>Name (Z-A)</option>
                <option value="level_asc" className='text-[#111933]'>Level (Asc)</option>
                <option value="level_desc" className='text-[#111933]'>Level (Desc)</option>
              </select>
              <img src={sortIcon} alt="" className='absolute z-10 w-3 h-full top-0 left-2' />
            </div>
            <TotalQuestions totalQuestions={questions.length} />
          </div>
        </div>

        {/* Right Section */}
        <div className="w-4/5 space-y-2 p-4 bg-white rounded-xl shadow-md">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              <strong className="font-medium">Error: </strong>
              <span>{error}</span>
            </div>
          ) : currentQuestions.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
              <strong className="font-medium">No Results: </strong>
              <span>No questions found matching your criteria.</span>
            </div>
          ) : (
            <>
              {currentQuestions.slice((currentPage - 1) * getItemsPerPage(), currentPage * getItemsPerPage()).map((question, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-[#111933] transition-all duration-300 hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedQuestion(question)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#FDC50061] text-[#111933] rounded-full font-semibold">
                        {index + 1 + (currentPage - 1) * getItemsPerPage()}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className=" font-medium text-[#111933]">{question.question}</p>
                          <div className='flex space-x-5 items-center'>
                            <p className='text-sm text-[#111933] font-semibold'> Ans: <span className='font-normal'> {question.correctAnswer} </span> </p>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(question.question_id); }}>
                              <Trash2 className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {currentQuestions.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    count={Math.ceil(currentQuestions.length / getItemsPerPage())}
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
          {deleting && (
            <div className="flex justify-center items-center mt-4">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}
          {deleteError && (
            <div className="text-red-500 text-center mt-4">
              {deleteError}
            </div>
          )}
          {view === 'details' && selectedQuestion && (
            <div className="absolute bg-black bg-opacity-50 flex items-center justify-center">
              <div className="z-[1000] bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <TestQuestionDetails
                  selectedQuestion={selectedQuestion}
                  setSelectedQuestion={setSelectedQuestion}
                />
              </div>
            </div>
          )}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 1000 }}>
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <p className="text-lg font-medium text-gray-900">Are you sure you want to delete this question?</p>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default McqTestQuestionList;
