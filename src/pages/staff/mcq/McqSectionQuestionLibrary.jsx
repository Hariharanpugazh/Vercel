import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import FiltersSidebar from '../../../components/McqSectionLibrary/FiltersSidebar'; // Adjust the import path as needed

const McqSectionLibrary = ({ onQuestionsSelected, activeSectionIndex }) => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [filters, setFilters] = useState({ level: [], tags: [], section: [] });
  const [availableTags, setAvailableTags] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';
  const requiredQuestions = 5; // Define the requiredQuestions variable

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

        // Ensure tags are always arrays
        const sanitizedQuestions = response.data.questions.map(question => ({
          ...question,
          tags: Array.isArray(question.tags) ? question.tags : []
        }));

        setQuestions(sanitizedQuestions);
        setFilteredQuestions(sanitizedQuestions);
        setError(null);

        // Extract available tags and sections
        const tagsSet = new Set();
        const sectionsSet = new Set();
        sanitizedQuestions.forEach(question => {
          question.tags.forEach(tag => tagsSet.add(tag));
          if (question.section) {
            sectionsSet.add(question.section);
          }
        });
        setAvailableTags(Array.from(tagsSet));
        setAvailableSections(Array.from(sectionsSet));
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Filter and sort questions based on search input, selected tag, selected difficulty, and selected section
  useEffect(() => {
    let filtered = questions;

    if (filter) {
      filtered = filtered.filter((q) =>
        q.question.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((q) =>
        filters.tags.some(tag => q.tags.includes(tag))
      );
    }

    if (filters.level.length > 0) {
      filtered = filtered.filter((q) =>
        filters.level.some(diff => diff.toLowerCase() === q.level.toLowerCase())
      );
    }

    if (filters.section.length > 0) {
      filtered = filtered.filter((q) =>
        filters.section.includes(q.section)
      );
    }

    setFilteredQuestions(filtered);
  }, [filter, filters, questions]);

  // Toggle question selection
  const toggleQuestionSelection = (index) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((id) => id !== index)
        : [...prevSelected, index]
    );
  };

  // Toggle select all/deselect all questions
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map((_, index) => index));
    }
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
    setFilters({ level: [], tags: [], section: [] });
    setFilter('');
  };

  // Submit Selected Questions
  const handleSubmit = () => {
    if (selectedQuestions.length < requiredQuestions) {
      toast.warn(`Please select at least ${requiredQuestions} questions.`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const selectedQuestionsData = selectedQuestions.map((index) => questions[index]);

    onQuestionsSelected(selectedQuestionsData, activeSectionIndex);

    setQuestions([]);
    setSelectedQuestions([]);
    setFilter('');
    setFilters({ level: [], tags: [], section: [] });
    setSelectAll(false);
    toast.success("Questions added successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
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
          <h1 className="text-3xl font-bold text-slate-800">Question Library</h1>
          <p className="text-slate-600">Select and preview questions from your collection</p>
        </div>

        {loading && <p>Loading questions...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-4 gap-8">
          {/* Left Panel for Filters */}
          <FiltersSidebar
            filters={filters}
            toggleFilter={toggleFilter}
            clearFilters={clearFilters}
            availableTags={availableTags}
            availableSections={availableSections}
          />

          {/* Middle Panel for Questions List */}
          <div className="col-span-2 space-y-4">
            {/* Search Bar and Select/Deselect Button */}
            <div className="sticky top-4 bg-white p-4 shadow rounded-lg flex items-center justify-between">
              <button
                onClick={toggleSelectAll}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
              <div className="flex items-center flex-grow ml-4">
                <Search className="mr-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-grow px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Questions List */}
            {filteredQuestions.map((question, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedQuestions.includes(index) ? 'bg-blue-100 border-blue-500' : ''
                }`}
                onClick={() => toggleQuestionSelection(index)}
              >
                <h3 className="font-medium">{question.question}</h3>
                <p>
                  <strong>Level:</strong> {question.level} | <strong>Tags:</strong>{' '}
                  {Array.isArray(question.tags) ? question.tags.join(', ') : 'No tags'} | <strong>Section:</strong> {question.section || 'No section'}
                </p>
              </div>
            ))}
          </div>

          {/* Right Panel for Selected Questions */}
          <div className="col-span-1">
            <div className="bg-white shadow p-4 rounded-lg">
              <h2 className="text-lg font-bold mb-4">Selected Questions</h2>
              {selectedQuestions.length === 0 ? (
                <p className="text-slate-500">No questions selected</p>
              ) : (
                <ul>
                  {selectedQuestions.map((index) => {
                    const question = questions[index];
                    return (
                      <li key={index} className="border-b py-2">
                        {question?.question}
                      </li>
                    );
                  })}
                </ul>
              )}
              <button
                onClick={handleSubmit}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg"
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

export default McqSectionLibrary;
