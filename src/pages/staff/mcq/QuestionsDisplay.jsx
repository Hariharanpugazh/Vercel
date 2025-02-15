import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const QuestionsDisplay = () => {
  const { state } = useLocation();
  const { questions } = state || {};
  const navigate = useNavigate();

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [editedQuestions, setEditedQuestions] = useState(questions || []);
  const [isEditing, setIsEditing] = useState(null);
  const [levelReport, setLevelReport] = useState({}); // New state for the report
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  useEffect(() => {
    // Calculate the level report whenever the questions change
    if (editedQuestions && editedQuestions.length > 0) {
      calculateLevelReport();
    }
  }, [editedQuestions]);

  const calculateLevelReport = () => {
    const totalQuestions = editedQuestions.length;
    const levelCounts = {};

    editedQuestions.forEach(question => {
      const level = question.level;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    const report = {};
    for (const level in levelCounts) {
      const count = levelCounts[level];
      report[level] = ((count / totalQuestions) * 100).toFixed(2); // Percentage
    }

    setLevelReport(report);
  };

  const handleSelectQuestion = (index) => {
    setSelectedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === editedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(editedQuestions.map((_, index) => index));
    }
  };

  const handleEditQuestion = (index, field, value) => {
    const updatedQuestions = editedQuestions.map((question, i) =>
      i === index ? { ...question, [field]: value } : question
    );
    setEditedQuestions(updatedQuestions);
  };

  const handleSaveQuestions = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      const selected = selectedQuestions.map((index) => editedQuestions[index]);

      await axios.post(`${API_BASE_URL}/api/mcq/save-questions/`, {
        questions: selected,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert("Questions saved successfully!");
      navigate('/mcq/QuestionsDashboard');
    } catch (error) {
      console.error("Error saving questions:", error);
      alert("Failed to save questions.");
    }
  };

  if (!questions || questions.length === 0) {
    return <p>No questions to display.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-3xl p-8 w-[90%] max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Generated Questions</h1>

        <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedQuestions.length === editedQuestions.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-2">Question</th>
              <th className="px-4 py-2">Options</th>
              <th className="px-4 py-2">Correct Answer</th>
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {editedQuestions.map((question, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} text-gray-800`}
              >
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(index)}
                    onChange={() => handleSelectQuestion(index)}
                  />
                </td>
                <td className="px-4 py-2">
                  {isEditing === index ? (
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleEditQuestion(index, 'question', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    question.question
                  )}
                </td>
                <td className="px-4 py-2">
                  {isEditing === index ? (
                    question.options.map((option, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const updatedOptions = [...question.options];
                          updatedOptions[idx] = e.target.value;
                          handleEditQuestion(index, 'options', updatedOptions);
                        }}
                        className="w-full px-2 py-1 border rounded mb-1"
                      />
                    ))
                  ) : (
                    question.options.map((option, idx) => (
                      <div key={idx} className="text-gray-700 text-sm">
                        {option}
                      </div>
                    ))
                  )}
                </td>
                <td className="px-4 py-2">
                  {isEditing === index ? (
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(e) => handleEditQuestion(index, 'correctAnswer', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    question.correctAnswer
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {isEditing === index ? (
                    <input
                      type="text"
                      value={question.level}
                      onChange={(e) => handleEditQuestion(index, 'level', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    question.level  // Display the short form level (e.g., L1)
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {isEditing === index ? (
                    <input
                      type="text"
                      value={question.tags.join(", ")}
                      onChange={(e) => handleEditQuestion(index, 'tags', e.target.value.split(","))}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    question.tags.join(", ")
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {isEditing === index ? (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={() => setIsEditing(null)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => setIsEditing(index)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Level Report Section */}
        {/* <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Bloom's Taxonomy Level Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(levelReport).map(([level, percentage]) => (
              <div key={level} className="bg-gray-100 rounded-lg p-4 shadow-md">
                <p className="text-lg font-medium text-gray-700">
                  {level}: <span className="text-blue-600">{percentage}%</span>
                </p>
              </div>
            ))}
          </div>
        </div> */}

        <button
          className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={handleSaveQuestions}
        >
          Save Selected Questions
        </button>
      </div>
    </div>
  );
};

export default QuestionsDisplay;