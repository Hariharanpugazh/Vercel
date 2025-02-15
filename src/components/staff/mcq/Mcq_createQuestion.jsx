import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Mcq_createQuestion = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [level, setLevel] = useState("easy");
  const [tags, setTags] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [isNewQuestion, setIsNewQuestion] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
    setHasUnsavedChanges(true);
  };

  const handleTagChange = (e) => {
    setTags(e.target.value.split(',').map(tag => tag.trim()));
    setHasUnsavedChanges(true);
  };

  const handleNavigation = (navigateFunction) => {
    if (hasUnsavedChanges) {
      toast.info(
        <div className="flex flex-col items-center">
          <div className="text-blue-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-6">
            Are you sure you want to leave without saving?
          </p>
          <div className="flex justify-center gap-8">
            <button
              className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors  font-medium"
              onClick={() => {
                navigateFunction();
                toast.dismiss();
              }}
            >
              Yes
            </button>
            <button
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              onClick={() => toast.dismiss()}
            >
              No
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          className: "!fixed !top-1/2 !left-1/2 !transform !-translate-x-1/2 !-translate-y-1/2",
          style: {
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            width: 'auto',
            minWidth: '400px',
            margin: 0,
            zIndex: 9999
          }
        }
      );
    } else {
      navigateFunction();
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("contestToken");
        if (!token) {
          toast.error("Unauthorized access. Please log in again.");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/mcq/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedQuestions = response.data.questions || [];
        setQuestionList(fetchedQuestions);

        if (fetchedQuestions.length > 0) {
          setCurrentQuestionIndex(0);
          loadQuestionIntoForm(fetchedQuestions[0]);
        } else {
          resetFormForNewQuestion();
        }
      } catch (error) {
        console.error("Error fetching questions:", error.response?.data || error.message);
        toast.error("Failed to load questions. Please try again.");
      }
    };

    fetchQuestions();
    resetFormForNewQuestion(); // Reset the form whenever the component mounts
  }, []);

  const handleFinish = () => {
    toast.success("Contest finished successfully!");
    navigate("/mcq/QuestionsDashboard");
  };

  const loadQuestionIntoForm = (questionData) => {
    setIsNewQuestion(false);
    setQuestion(questionData.question || "");
    setOptions(questionData.options || ["", "", "", ""]);
    setAnswer(questionData.correctAnswer || "");
    setLevel(questionData.level || "easy");
    setTags(questionData.tags || []);
  };

  const resetFormForNewQuestion = () => {
    setIsNewQuestion(true);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setAnswer("");
    setLevel("easy");
    setTags([]);
  };

  const handleSaveClick = () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const filledOptions = options.filter(option => option.trim() !== "");
    if (filledOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    if (!answer) {
      toast.error("Please select the correct answer");
      return;
    }

    handleSaveQuestion();
  };

  const handleSaveQuestion = async () => {
    const newQuestion = {
      questions: [{
        question,
        options: options.filter(option => option.trim() !== ""),
        correctAnswer: answer,
        level,
        tags,
      }]
    };

    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        return;
      }

      let savedQuestion;
      if (isNewQuestion || currentQuestionIndex === questionList.length) {
        const response = await axios.post(
          `${API_BASE_URL}/api/mcq/save-questions/`,
          newQuestion,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );

        savedQuestion = response.data.added_questions?.[0];
        
        if (savedQuestion) {
          setQuestionList(prevList => [...prevList, savedQuestion]);
          setCurrentQuestionIndex(questionList.length);
        }
      } else {
        const questionId = questionList[currentQuestionIndex]?._id;
        if (!questionId) {
          return;
        }

        const response = await axios.put(
          `${API_BASE_URL}/api/mcq/questions/${questionId}/`,
          newQuestion.questions[0],
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        savedQuestion = response.data;
        
        const updatedQuestions = [...questionList];
        updatedQuestions[currentQuestionIndex] = savedQuestion;
        setQuestionList(updatedQuestions);
      }

      // Reset form after saving
      resetFormForNewQuestion();
      setCurrentQuestionIndex(-1);
      setIsNewQuestion(true);
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handlePreviousQuestion = () => {
    handleNavigation(() => {
      if (currentQuestionIndex > 0) {
        const prevIndex = currentQuestionIndex - 1;
        setCurrentQuestionIndex(prevIndex);
        loadQuestionIntoForm(questionList[prevIndex]);
      }
    });
  };

  const handleNextQuestion = () => {
    handleNavigation(() => {
      if (currentQuestionIndex < questionList.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = questionList[nextIndex];
        setQuestion(nextQuestion.question || "");
        setOptions(nextQuestion.options || ["", "", "", ""]);
        setAnswer(nextQuestion.correctAnswer || "");
        setLevel(nextQuestion.level || "easy");
        setTags(nextQuestion.tags || []);
        setIsNewQuestion(false);
      } else {
        setCurrentQuestionIndex(questionList.length);
        resetFormForNewQuestion();
        setIsNewQuestion(true);
      }
    });
  };

  const handleNewQuestion = () => {
    resetFormForNewQuestion();
    setCurrentQuestionIndex(-1);
    setIsNewQuestion(true);
  };

  const handleDeleteQuestion = (e, questionId, index) => {
    e.stopPropagation();
    // Implement the delete logic here
    console.log(`Deleting question with ID: ${questionId} at index: ${index}`);
  };

  return (
    <div className="bg-[#f4f6ff86] h-full py-8 px-24">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        style={{
          top: '20px',
          right: '20px',
          transform: 'none'
        }}
        toastStyle={{
          background: 'white',
          color: 'black',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      />
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
              Create Questions
            </span>

          </div>
        </div>
      <div className="max-w-[1500px] mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-[#111933] mb-2">
            Create Questions
          </h2>
          {!isNewQuestion && (
            <button
              onClick={handleNewQuestion}
              className="py-1 px-7 bg-white border-2 border-[#efeeee] shadow-md shadow-blue-100 font-semibold text-[#111933] rounded-xl hover:bg-white h-full flex items-center justify-center gap-2"
            >
              New Question +
            </button>
          )}
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-5 bg-gray-50 p-6 rounded-lg shadow flex flex-col">
            <h3 className="font-semibold text-[#111933] mb-4">Question List</h3>
            <ul className="space-y-4 flex-grow">
              {Array.isArray(questionList) && questionList.map((q, index) => (
                <li
                  key={index}
                  className="p-3 bg-indigo-100 rounded-lg shadow flex items-center justify-between cursor-pointer hover:bg-indigo-200"
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    loadQuestionIntoForm(q);
                  }}
                >
                  <div className="text-indigo-800">
                    <span className="block font-medium">
                      {q.question || "No question text"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteQuestion(e, q._id, index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </li>
              ))}
            </ul>

            {/* Previous and Next buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousQuestion}
                className="py-1 px-7 bg-white border-2 border-[#efeeee] shadow-md shadow-blue-100 font-semibold text-[#111933] rounded-md hover:bg-white flex items-center justify-center gap-2"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                className="bg-[#111933] text-white py-2 px-4 rounded-lg hover:bg-[#111933]"
              >
                Next
              </button>
            </div>
          </aside>

          {/* Main Form */}
          <main className="col-span-7 bg-gray-50 p-6 rounded-lg shadow">
            {/* Question Input */}
            <div className="mb-6">
              <label className="text-lg font-medium text-gray-700 mb-2 flex justify-start">
                Question
              </label>
              <textarea
                value={question}
                onChange={handleInputChange(setQuestion)}
                className="w-full border rounded-lg p-4 text-gray-700"
                placeholder="Enter your question here"
                rows={4}
              />
            </div>

            {/* Options Section */}
            <div className="mb-6">
              <label className="text-lg font-medium text-gray-700 mb-2 flex justify-start">
                Options
              </label>
              {options.map((option, index) => (
                <div className="flex items-center mb-2" key={index}>
                  <span className="mr-2 font-medium">{String.fromCharCode(65 + index)}.</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-grow border rounded-lg p-2 text-gray-700"
                  />
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <div className="mb-6">
              <label className="text-lg font-medium text-gray-700 mb-2 flex justify-start">
                Correct Answer
              </label>
              <select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border rounded-lg p-2 text-gray-700"
              >
                <option value="">Select the correct option</option>
                {options
                  .filter(option => option.trim() !== "")
                  .map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handleSaveClick}
                className="py-1 px-7 bg-white border-2 border-[#efeeee] shadow-md shadow-blue-100 font-semibold text-[#111933] rounded-md hover:bg-[#8b93ec9d] transition-colors duration-300 flex items-center justify-center gap-2"
              >
                Save
              </button>
              <button
                onClick={handleFinish}
                className="py-1 px-7 bg-white border-2 border-[#efeeee] shadow-md shadow-blue-100 font-semibold text-[#111933] rounded-md hover:bg-white flex items-center justify-center gap-2"
              >
                Finish
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Add the save confirmation popup with fixed positioning */}
      {showSavePopup && (
        <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 w-[400px] max-w-full rounded-xl shadow-lg text-center">
            <div className="text-blue-600 mb-4">
              <svg
                className="w-14 h-14 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700">
              Are you sure you want to leave without saving?
            </h2>
            <div className="flex justify-center mt-8 space-x-4">
              <button
                className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                onClick={() => {
                  handleSaveQuestion();
                  setShowSavePopup(false);
                }}
              >
                Yes
              </button>
              <button
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                onClick={() => setShowSavePopup(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mcq_createQuestion;