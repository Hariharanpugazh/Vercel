import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search as SearchIcon } from 'lucide-react';
import { Pagination } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const McqLibrary = ({ onClose, onQuestionsSelected }) => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [filters, setFilters] = useState({ level: [], tags: [], section: [] });
  const [availableTags, setAvailableTags] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(5);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('contestToken');
        if (!token) {
          console.error('Unauthorized access. Please log in again.');
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

        const tagsSet = new Set();
        const sectionsSet = new Set();
        sanitizedQuestions.forEach(question => {
          question.tags.forEach(tag => tagsSet.add(tag));
          if (question.section) sectionsSet.add(question.section);
        });
        setAvailableTags(Array.from(tagsSet));
        setAvailableSections(Array.from(sectionsSet));
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions;

    // Apply search filter
    if (filter) {
      filtered = filtered.filter((q) =>
        q.question.toLowerCase().includes(filter.toLowerCase()) ||
        q.options.some(option => option.toLowerCase().includes(filter.toLowerCase()))
      );
    }

    // Apply level filter
    if (filters.level.length > 0) {
      filtered = filtered.filter(q => filters.level.includes(q.level));
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(q =>
        q.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Apply section filter
    if (filters.section.length > 0) {
      filtered = filtered.filter(q => filters.section.includes(q.section));
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filter, filters, questions]);

  const toggleQuestionSelection = (index) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((id) => id !== index)
        : [...prevSelected, index]
    );
  };

  const FiltersSidebar = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Level</h4>
        {['easy', 'medium', 'hard'].map((level) => (
          <label key={level} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={filters.level.includes(level)}
              onChange={() => toggleFilter('level', level)}
              className="mr-2"
            />      
            {level}
          </label>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Tags</h4>
        <div className="max-h-40 overflow-y-auto">
          {availableTags.map((tag) => (
            <label key={tag} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.tags.includes(tag)}
                onChange={() => toggleFilter('tags', tag)}
                className="mr-2"
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Sections</h4>
        <div className="max-h-40 overflow-y-auto">
          {availableSections.map((section) => (
            <label key={section} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.section.includes(section)}
                onChange={() => toggleFilter('section', section)}
                className="mr-2"
              />
              {section}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => setFilters({ level: [], tags: [], section: [] })}
        className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
        Clear Filters
      </button>
    </div>
  );

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const handleSubmit = () => {
    const selected = selectedQuestions.map((index) => questions[index]);
    onQuestionsSelected(selected);
    onClose();
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      const allIndices = filteredQuestions.map((_, index) => indexOfFirstQuestion + index);
      setSelectedQuestions(allIndices);
    }
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#ECF2FE] w-screen h-screen z-50">
      <div className="w-full max-w-[90%] h-full max-h-[90%] bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="w-full h-full flex flex-col">
          <h3 className="font-semibold text-xl mb-2 text-[#111933] px-4 pt-4">Question Library</h3>
          <h4 className="font-light text-base mb-2 text-[#111933] px-4">
            Select and preview questions from your collection
          </h4>

          <div className="flex flex-grow">
            {/* Left Panel - Filters */}
            <div className="w-1/4 p-2">
              <FiltersSidebar />
            </div>

            {/* Middle Panel - Questions List */}
            <div className="w-2/4 p-2">
              <div className="flex items-center mb-4">
                <button
                  onClick={toggleSelectAll}
                  className="py-1 px-4 bg-white border-2 border-gray-300 shadow font-semibold text-[#111933] rounded-xl hover:bg-gray-100 text-sm"
                >
                  {selectedQuestions.length === filteredQuestions.length ? 'Deselect All' : 'Select All'}
                </button>
                <div className="flex items-center flex-grow ml-2">
                  <SearchIcon className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-grow px-2 py-1 border rounded-lg text-sm text-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {currentQuestions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedQuestions.includes(indexOfFirstQuestion + index)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => toggleQuestionSelection(indexOfFirstQuestion + index)}
                  >
                    <h3 className="font-medium text-sm text-black mb-2">{question.question}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded">Level: {question.level}</span>
                      {question.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-4">
                <Pagination
                  count={Math.ceil(filteredQuestions.length / questionsPerPage)}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color="primary"
                />
              </div>
            </div>

            {/* Right Panel - Selected Questions Preview */}
            <div className="w-1/4 p-2">
              <div className="bg-white rounded-lg shadow-lg p-4 h-full">
                <h4 className="font-semibold text-lg mb-4">Selected Questions</h4>

                <div className="mb-4 flex-grow overflow-y-auto max-h-[calc(100vh-300px)]">
                  {selectedQuestions.length === 0 ? (
                    <p className="text-sm text-gray-500">No questions selected</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedQuestions.map((index) => {
                        const question = questions[index];
                        return (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{question?.question}</p>
                            <div className="mt-1 text-xs text-gray-500">
                              Level: {question?.level}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-2 px-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 font-medium"
                    disabled={selectedQuestions.length === 0}
                  >
                    Save {selectedQuestions.length} Selected Questions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default McqLibrary;
