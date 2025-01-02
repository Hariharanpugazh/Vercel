import React, { useState, useEffect } from "react";
import { PlusCircle, Upload, Loader2, Search, ChevronRight, Filter, X, CheckCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Utility functions remain the same
const getLevelBadgeColor = (level) => {
  const colors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hard: "bg-red-100 text-red-800 border-red-200"
  };
  return colors[level?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
};

const renderTags = (tags) => {
  if (!tags) return null;
  const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
  return (
    <div className="flex flex-wrap gap-2">
      {tagArray.map((tag, index) => (
        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
          {tag.trim()}
        </span>
      ))}
    </div>
  );
};

const Mcq = () => {
  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSingleQuestionModalOpen, setIsSingleQuestionModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ level: [], tags: [] });
  const [availableTags, setAvailableTags] = useState([]);
  const [singleQuestionData, setSingleQuestionData] = useState({
    question: "", option1: "", option2: "", option3: "", option4: "",
    answer: "", level: "easy", tags: ""
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
question: selectedQuestion?.question || '',
options: selectedQuestion?.options || ['', '', '', ''],
answer: selectedQuestion?.answer || '',
level: selectedQuestion?.level || 'general',
tags: selectedQuestion?.tags || [],
});





  const questionsPerPage = 10;
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  // Fetch questions and set available tags
  useEffect(() => {
    fetchQuestions();
  }, []);
  
  const handleDelete = async (question_id) => {
    try {
        const response = await fetch(`https://render-frontend-f05v.onrender.com/api/delete_question/${question_id}/`, {
            method: 'DELETE',
        });

        // Check if the response is JSON
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete question');
        }

        alert('Question deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        
    }
};


const handleUpdate = async (question_id) => {
  try {
    // Show loading state if needed
    setIsLoading(true);
    
    const response = await fetch(`https://render-frontend-f05v.onrender.com/api/update_question/${question_id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedQuestion),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update question');
    }

    // Reset states and show success
    setIsEditing(false);
    setSelectedQuestion(null);
    
    // Optional: Show success message
    setSuccessMessage('Question updated successfully');

    // Navigate after a short delay to ensure state updates are complete
    setTimeout(() => {
      navigate('/library/mcq');
    }, 100);

  } catch (error) {
    console.error('Error updating question:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    const tags = new Set();
    questions.forEach(question => {
      if (question.tags) {
        const questionTags = typeof question.tags === 'string' 
          ? question.tags.split(',').map(tag => tag.trim())
          : question.tags;
        questionTags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
  }, [questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/fetch-all-questions/');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
      setError(null);
    } catch (err) {
      setError('Failed to load questions. Please try again later.');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Form handling
  const handleSingleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setSingleQuestionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSingleQuestionSubmit = async (e) => {
    e.preventDefault();
    const { question, option1, option2, option3, option4, answer, level } = singleQuestionData;
    
    if (!question || !option1 || !option2 || !option3 || !option4 || !answer || !level) {
      setUploadStatus("Error: Please fill in all required fields");
      return;
    }

    const options = [option1, option2, option3, option4];
    if (!options.includes(answer)) {
      setUploadStatus("Error: Answer must be one of the options");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload-single-question/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleQuestionData)
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus(`Success: Question uploaded successfully! ID: ${data.question_id}`);
        setSingleQuestionData({
          question: "", option1: "", option2: "", option3: "", option4: "",
          answer: "", level: "easy", tags: ""
        });
        fetchQuestions();
        setTimeout(() => setIsSingleQuestionModalOpen(false), 1500);
      } else {
        const error = await response.json();
        setUploadStatus("Error: " + (error.error || "Unknown error."));
      }
    } catch (err) {
      console.error("Error uploading question:", err);
      setUploadStatus("Error: Unable to upload question.");
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadStatus("Error: Only CSV files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus("Error: File size exceeds 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/mcq-bulk-upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus("Success: " + data.message);
        fetchQuestions();
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        const error = await response.json();
        setUploadStatus("Error: " + (error.error || "Unknown error."));
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadStatus("Error: Unable to upload file.");
    }
  };

  // Filter and search logic
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.options.some(option => option.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = filters.level.length === 0 || filters.level.includes(question.level);
    
    const questionTags = typeof question.tags === 'string' 
      ? question.tags.split(',').map(tag => tag.trim())
      : question.tags || [];
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => questionTags.includes(tag));

    return matchesSearch && matchesLevel && matchesTags;
  });

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ level: [], tags: [] });
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                {(filters.level.length > 0 || filters.tags.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Difficulty Level Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Difficulty Level</h4>
                  <div className="space-y-2">
                    {['easy', 'medium', 'hard'].map(level => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.level.includes(level)}
                          onChange={() => toggleFilter('level', level)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={() => toggleFilter('tags', tag)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>



        {/* Main Content */}
        <div className="flex-1">
          {/* Header with Search and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import Question
              </button>
              <button
                onClick={() => setIsSingleQuestionModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Question
              </button>
            </div>
          </div>

{/* Questions List */}
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
<div className="space-y-4">
{currentQuestions.map((question, index) => (
  <div
    key={index}
    className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md cursor-pointer"
    onClick={() => setSelectedQuestion(question)} // Make container clickable
  >
    <div className="p-6">
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold">
          {indexOfFirstQuestion + index + 1}
        </span>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <p className="text-lg font-medium text-gray-900">{question.question}</p>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

    </div>
  </div>
))}




    {/* Pagination */}
    {filteredQuestions.length > questionsPerPage && (
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
        >
          Next
        </button>
      </div>
    )}
  </div>
)}
        </div>

        {selectedQuestion && (
<div className="fixed inset-0 z-50">
{/* Overlay background */}
<div
  className="fixed inset-0 bg-black/40 opacity-70 transition-opacity duration-300 ease-in-out"
  onClick={() => setSelectedQuestion(null)}
/>

{/* Sliding panel - reduced overall width */}
<div
  className={`fixed inset-y-0 right-0 w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] bg-white shadow-2xl rounded-l-3xl transform transition-all duration-500 ease-out ${selectedQuestion ? "translate-x-0 scale-100" : "translate-x-full scale-95"}`}
>
  <div className="h-full overflow-y-auto">
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
      {/* Close button */}
      <button
        onClick={() => setSelectedQuestion(null)}
        className="absolute top-5 right-5 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all shadow-md"
      >
        <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
      </button>

      {/* Question content - reduced max width */}
      <div className="mt-6 w-full max-w-2xl mx-auto">
        {isEditing ? (
          <>
            {/* Editable Question Text */}
            <textarea
              className="text-2xl font-bold text-gray-900 mb-6 w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={selectedQuestion.question}
              onChange={(e) =>
                setSelectedQuestion({
                  ...selectedQuestion,
                  question: e.target.value,
                })
              }
              placeholder="Type your question here..."
              rows={2}
            />

            {/* Editable Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="font-medium text-lg text-gray-700">Tags:</span>
              <input
                type="text"
                value={selectedQuestion.tags.join(", ")}
                onChange={(e) => {
                  const updatedTags = e.target.value.split(",").map((tag) => tag.trim());
                  setSelectedQuestion({
                    ...selectedQuestion,
                    tags: updatedTags,
                  });
                }}
                className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Add tags..."
              />
            </div>

            {/* Editable Level */}
            <div className="mb-6">
              <label htmlFor="level" className="block font-medium text-gray-700 mb-2">Level:</label>
              <select
                id="level"
                value={selectedQuestion.level}
                onChange={(e) =>
                  setSelectedQuestion({
                    ...selectedQuestion,
                    level: e.target.value,
                  })
                }
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedQuestion.question}</h2>

            {/* Tags and Level Display */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelBadgeColor(selectedQuestion.level)}`}
              >
                {selectedQuestion.level || "Not specified"}
              </span>
              {renderTags(selectedQuestion.tags)}
            </div>
          </>
        )}
      </div>

      {/* Options Section - reduced max width */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-2xl mx-auto">
        {selectedQuestion.options.map((option, optIndex) => (
          <div
            key={optIndex}
            className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-4 ${!isEditing && option === selectedQuestion.answer ? "bg-green-50 border-green-300 shadow-md" : "bg-gray-50 border-gray-200"}`}
          >
            {/* Option Label */}
            <span
              className={`font-medium text-lg ${!isEditing && option === selectedQuestion.answer ? "text-green-700" : "text-gray-600"}`}
            >
              {String.fromCharCode(65 + optIndex)}.
            </span>

            {/* Editable Options */}
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...selectedQuestion.options];
                    newOptions[optIndex] = e.target.value;
                    setSelectedQuestion({
                      ...selectedQuestion,
                      options: newOptions,
                    });
                  }}
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                />

                <input
                  type="radio"
                  name="correctAnswer"
                  checked={selectedQuestion.answer === option}
                  onChange={() =>
                    setSelectedQuestion({
                      ...selectedQuestion,
                      answer: option,
                    })
                  }
                  className="ml-4 w-5 h-5 accent-green-600 transition-transform"
                />
              </>
            ) : (
              <span className="flex-1">{option}</span>
            )}

            {/* Correct answer badge */}
            {!isEditing && option === selectedQuestion.answer && (
              <span className="ml-auto px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">
                Correct
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Correct Answer Section */}
      {!isEditing && (
        <div className="mt-6 p-4 rounded-lg bg-green-50 border-2 border-green-200 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
            <CheckCircleIcon className="w-6 h-6 mr-2" />
            Correct Answer
          </h3>
          <p className="text-gray-800 font-medium">{selectedQuestion.answer}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-start space-x-4 mt-6 max-w-2xl mx-auto">
        {isEditing ? (
          <>
            <button
              onClick={() => {
                handleUpdate(selectedQuestion.question_id);
                setSelectedQuestion(null);
                window.location.reload();
              }}
              disabled={isLoading}
              className="flex-1 text-blue-600 bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 text-gray-600 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 text-blue-600 bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-lg transition"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setShowConfirm(true); // Show the confirmation modal
              }}
              className="flex-1 text-red-600 bg-red-100 hover:bg-red-200 px-6 py-3 rounded-lg transition"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  </div>
</div>

{showConfirm && (
<div
role="dialog"
className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
>
<div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
  <p className="text-lg font-semibold">Are you sure you want to delete this question?</p>
  <p className="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
  <div className="flex justify-center gap-4 mt-6">
    <button
      onClick={() => {
        handleDelete(selectedQuestion.question_id); // Perform delete action
        setShowConfirm(false); // Close modal
        window.location.reload();
        setSelectedQuestion(null);
        setTimeout(() => {
          navigate("/library/mcq"); // Redirect to library page
        }, 100);
      }}
      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex-1"
    >
      Confirm
    </button>
    <button
      onClick={() => setShowConfirm(false)} // Close modal without deleting
      className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition flex-1"
    >
      Cancel
    </button>
  </div>
</div>
</div>
)}
</div>
)}


        </div>
      </div>

      {/* Modals */}
      {/* Import Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 opacity-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Import Question
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file containing multiple questions. Maximum file size: 5MB
            </p>
            <input
              type="file"
              onChange={handleBulkUpload}
              accept=".csv"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-md ${
                uploadStatus.startsWith("Success")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}>
                {uploadStatus}
              </div>
            )}
          </div>
        </div>
      )}

{isSingleQuestionModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Add New Question</h2>
        <button
          onClick={() => setIsSingleQuestionModalOpen(false)}
          className="text-gray-500 hover:text-black"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSingleQuestionSubmit} className="space-y-6">
        {/* Question Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            name="question"
            value={singleQuestionData.question}
            onChange={handleSingleQuestionInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
            rows={4}
            required
          />
        </div>

        {/* Options Input */}
        {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
          <div key={optionKey}>
            <label className="block text-sm font-medium text-black mb-2">
              Option {index + 1} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name={optionKey}
              value={singleQuestionData[optionKey]}
              onChange={handleSingleQuestionInputChange}
              className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
              required
            />
          </div>
        ))}

        {/* Correct Answer Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Correct Answer <span className="text-red-500">*</span>
          </label>
          <select
            name="answer"
            value={singleQuestionData.answer}
            onChange={handleSingleQuestionInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
            required
          >
            <option value="">Select Correct Answer</option>
            {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
              singleQuestionData[optionKey] && (
                <option key={optionKey} value={singleQuestionData[optionKey]}>
                  Option {index + 1}: {singleQuestionData[optionKey]}
                </option>
              )
            ))}
          </select>
        </div>

        {/* Difficulty Level Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Difficulty Level <span className="text-red-500">*</span>
          </label>
          <select
            name="level"
            value={singleQuestionData.level}
            onChange={handleSingleQuestionInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={singleQuestionData.tags}
            onChange={handleSingleQuestionInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
            placeholder="e.g., math, algebra, geometry"
          />
          <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Submit
          </button>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div
            className={`p-4 rounded-lg text-sm font-medium text-center shadow-sm ${
              uploadStatus.startsWith("Success")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </form>
    </div>
  </div>
)}

</div>
  );
};

export default Mcq;