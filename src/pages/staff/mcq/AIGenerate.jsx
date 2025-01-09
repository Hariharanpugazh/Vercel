import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AIGenerate = () => {
  const [formData, setFormData] = useState({
    topic: "",
    subtopic: "",
    level: "Beginner",
    question_type: "Fill Ups",
    num_questions: "",
  });
  const [loading, setLoading] = useState(false); // New loading state
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        setLoading(false);
        return;
      }
  
      const requestData = {
        ...formData,
        question_type: "Multiple Choice", // Force question type to Multiple Choice
      };
  
      const response = await axios.post(
        `${API_BASE_URL }/api/mcq/api/generate-questions/`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      setSuccessMessage("Questions generated successfully! Redirecting...");
      setErrorMessage(null);
  
      // Redirect to the questions display page with the generated data
      const { questions } = response.data;
      navigate("/mcq/airesponse", { state: { questions } });
    } catch (error) {
      console.error("Error generating questions:", error);
      setErrorMessage("Failed to generate questions. Please try again later.");
      setSuccessMessage(null);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Question Generator AI</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
              Topic
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Subtopic */}
          <div>
            <label htmlFor="subtopic" className="block text-sm font-medium text-gray-700">
              Subtopic
            </label>
            <input
              type="text"
              id="subtopic"
              name="subtopic"
              value={formData.subtopic}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">
              Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Question Type */}
<div>
  <label htmlFor="question_type" className="block text-sm font-medium text-gray-700">
    Type of Questions
  </label>
  <select
    id="question_type"
    name="question_type"
    value={formData.question_type}
    onChange={handleChange}
    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    disabled // Disable the dropdown to enforce "Multiple Choice" as the only option
  >
    <option value="Multiple Choice">Multiple Choice</option>
  </select>
</div>

          {/* Number of Questions */}
          <div>
            <label htmlFor="num_questions" className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              type="number"
              id="num_questions"
              name="num_questions"
              value={formData.num_questions}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            disabled={loading} // Disable button while loading
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </form>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Success/Error Messages */}
        {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
        {successMessage && <p className="mt-4 text-green-600">{successMessage}</p>}
      </div>
    </div>
  );
};

export default AIGenerate;