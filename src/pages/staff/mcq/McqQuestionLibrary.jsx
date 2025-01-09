import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';

const McqLibrary = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

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

        const response = await axios.get('https://render-frontend-f05v.onrender.com/api/fetch-all-questions/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuestions(response.data.questions || []);
        setFilteredQuestions(response.data.questions || []);
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

  // Filter questions based on search input
  useEffect(() => {
    if (filter) {
      setFilteredQuestions(
        questions.filter((q) =>
          q.question.toLowerCase().includes(filter.toLowerCase())
        )
      );
    } else {
      setFilteredQuestions(questions);
    }
  }, [filter, questions]);

  // Toggle question selection
  const toggleQuestionSelection = (index) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((id) => id !== index)
        : [...prevSelected, index]
    );
  };

  // Submit Selected Questions
  const handleSubmit = async () => {
    const token = localStorage.getItem("contestToken");
    const selected = selectedQuestions.map((index) => questions[index]);

    try {
      await axios.post(
        `${API_BASE_URL }/api/mcq/save-questions/`,
        { questions: selected },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      alert("Questions added successfully!");

      setQuestions([]);
      setSelectedQuestions([]);
      navigate('/mcq/QuestionsDashboard');
    } catch (error) {
      console.error("Error submitting questions:", error);
      alert("Failed to submit questions. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Question Library</h1>
          <p className="text-slate-600">Select and preview questions from your collection</p>
        </div>

        {loading && <p>Loading questions...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="sticky top-4 bg-white p-4 shadow rounded-lg">
              <div className="flex items-center">
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
                  {question.tags?.join(', ')}
                </p>
              </div>
            ))}
          </div>

          {/* Right Panel */}
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

export default McqLibrary;