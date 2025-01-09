import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Mcq_createQuestion = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [level, setLevel] = useState("easy");
  const [tags, setTags] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("contestToken");
        if (!token) {
          alert("Unauthorized access. Please log in again.");
          return;
        }

        const response = await axios.get(`${API_BASE_URL }/api/mcq/questions`, {
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
        alert("Failed to load questions. Please try again.");
      }
    };

    fetchQuestions();
  }, []);

  const handleFinish = () => {
    alert("Contest finished successfully!");
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

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleTagChange = (e) => {
    setTags(e.target.value.split(',').map(tag => tag.trim()));
  };

  const handleSaveQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    if (options.some(option => !option.trim())) {
      alert("Please fill in all options.");
      return;
    }

    if (!answer) {
      alert("Please select a correct answer.");
      return;
    }

    const newQuestion = {
      question,
      options,
      correctAnswer: answer,
      level,
      tags,
    };

    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        return;
      }

      if (isNewQuestion) {
        await axios.post(
          `${API_BASE_URL }/api/mcq/save-questions/`,
          { questions: [newQuestion] },
          {
            headers: { Authorization: `Bearer ${token} `},
          }
        );
        alert("New question saved successfully!");
      } else {
        await axios.put(
          `${API_BASE_URL }/api/mcq/questions/${questionList[currentQuestionIndex]._id}`,
          newQuestion,
          {
            headers: { Authorization: `Bearer ${token} `},
          }
        );
        alert("Question updated successfully!");
      }

      const response = await axios.get(`${API_BASE_URL }/api/mcq/questions`, {
        headers: { Authorization: `Bearer ${token} `},
      });

      const fetchedQuestions = response.data.questions || [];
      setQuestionList(fetchedQuestions);

      if (isNewQuestion) {
        resetFormForNewQuestion();
        setCurrentQuestionIndex(fetchedQuestions.length - 1);
      } else {
        loadQuestionIntoForm(newQuestion);
      }
    } catch (error) {
      console.error("Error saving question:", error.response?.data || error.message);
      alert("Failed to save the question. Please try again.");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      loadQuestionIntoForm(questionList[prevIndex]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionList.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      loadQuestionIntoForm(questionList[nextIndex]);
    } else {
      resetFormForNewQuestion();
      setCurrentQuestionIndex(questionList.length);
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-indigo-800 mb-2">
          Create Questions
        </h2>
      </header>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="col-span-1 bg-gray-50 p-6 rounded-lg shadow flex flex-col">
          <h3 className="font-semibold text-indigo-700 mb-4">Question List</h3>
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
                    {q.question?.slice(0, 20)}...
                  </span>
                  <span className="text-sm text-gray-600 italic">
                    Level: {q.level}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={handleFinish}
            className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 mt-auto"
          >
            Finish
          </button>
        </aside>

        {/* Main Form */}
        <main className="col-span-3 bg-gray-50 p-6 rounded-lg shadow">
          {/* Question Input */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2 flex justify-start">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border rounded-lg p-4 text-gray-700"
              placeholder="Enter your question here"
              rows={4}
            />
          </div>

          {/* Options Section */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2 flex justify-start">
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
            <label className="block text-lg font-medium text-gray-700 mb-2 flex justify-start">
              Correct Answer
            </label>
            <select
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full border rounded-lg p-2 text-gray-700"
            >
              <option value="">Select the correct option</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Level Selection */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2 flex justify-start">
              Difficulty Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border rounded-lg p-2 text-gray-700"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Tags Input */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2 flex justify-start">
              Tags
            </label>
            <input
              type="text"
              value={tags.join(', ')}
              onChange={handleTagChange}
              className="w-full border rounded-lg p-2 text-gray-700"
              placeholder="Enter tags separated by commas"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousQuestion}
              className={`bg-indigo-700 text-white py-2 px-4 rounded-lg transition-opacity ${
                currentQuestionIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-800'
              }`}
              disabled={currentQuestionIndex <= 0}
            >
              Previous
            </button>
            <button
              onClick={handleSaveQuestion}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleNextQuestion}
              className="bg-indigo-700 text-white py-2 px-4 rounded-lg hover:bg-indigo-800"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Mcq_createQuestion;