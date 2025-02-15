import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AIGenerate = () => {
  const [formData, setFormData] = useState({
    topic: "",
    subtopic: "",
    selectedLevel: "",
    level: [],
    question_type: "Multiple Choice",
    num_questions: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://render-frontend-f05v.onrender.com";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "selectedLevel") {
      // Only add the level if it's not already in the list
      if (!formData.level.some((l) => l.value === value)) {
        setFormData((prevData) => ({
          ...prevData,
          selectedLevel: value,
          level: [...prevData.level, { value: value, percentage: "" }],
        }));
      }
    } else if (name === "num_questions") {
      setFormData((prevData) => ({
        ...prevData,
        num_questions: value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleLevelPercentageChange = (levelValue, percentage) => {
    setFormData((prevData) => {
      const updatedLevels = prevData.level.map((level) => {
        if (level.value === levelValue) {
          return { ...level, percentage: percentage };
        }
        return level;
      });
      return { ...prevData, level: updatedLevels };
    });
  };

  const removeLevel = (levelValue) => {
    setFormData((prevData) => ({
      ...prevData,
      level: prevData.level.filter((l) => l.value !== levelValue),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        setLoading(false);
        return;
      }

      if (!formData.num_questions) {
        alert("Please enter the number of questions.");
        setLoading(false);
        return;
      }

      const numQuestions = parseInt(formData.num_questions, 10);
      if (isNaN(numQuestions) || numQuestions <= 0) {
        alert("Number of questions must be a positive number.");
        setLoading(false);
        return;
      }

      const totalPercentage = formData.level.reduce((sum, level) => {
        const percentage = parseFloat(level.percentage);
        return sum + (isNaN(percentage) ? 0 : percentage);
      }, 0);

      if (totalPercentage !== 100) {
        alert("Total percentage of Bloom's levels must be equal to 100.");
        setLoading(false);
        return;
      }

      const requestData = {
        topic: formData.topic,
        subtopic: formData.subtopic,
        num_questions: numQuestions,
        question_type: "Multiple Choice",
        level_distribution: formData.level.map((level) => ({
          level: level.value,
          count: Math.round(
            (parseFloat(level.percentage) / 100) * numQuestions
          ),
        })),
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/api/generate-questions/`,
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

      const { questions } = response.data;
      navigate("/mcq/airesponse", { state: { questions } });
    } catch (error) {
      console.error("Error generating questions:", error);
      setErrorMessage(
        error.response.data.error ||
          "Failed to generate questions. Please try again later."
      );
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const bloomLevels = [
    { value: "Remembering", label: "Remembering - L1" },
    { value: "Understanding", label: "Understanding - L2" },
    { value: "Applying", label: "Applying - L3" },
    { value: "Analyzing", label: "Analyzing - L4" },
    { value: "Evaluating", label: "Evaluating - L5" },
    { value: "Creating", label: "Creating - L6" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6ff86] p-12">
      <div className="h-14 px-12 pb-10">
        <div className="flex items-center gap-2 text-[#111933]">
          <span className="opacity-60">Home</span>
          <span>{">"}</span>
          <span className="opacity-60">Assessment Overview</span>
          <span>{">"}</span>
          <span className="opacity-60">Test Configuration</span>
          <span>{">"}</span>
          <span
            onClick={() => window.history.back()}
            className="cursor-pointer opacity-60 hover:underline"
          >
            Add Questions
          </span>
          <span>{">"}</span>
          <span>AI Generator</span>
        </div>
      </div>
      <div className="max-w-5xl mx-auto bg-white p-10 shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold mb-3 text-[#111933]">Question Generator AI</h1>
        <p className="text-sm mb-8">
          Choose how you’d like to add questions to your assessment. Select the
          method that works best for you to quickly build your test.
        </p>
        <hr className="mb-12 mt-6 border-1 border-gray-500" />
        <form onSubmit={handleSubmit} className="space-y-8 md:mx-[20%] mb-12">
          {/* Topic */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="topic"
              className="block text-md font-semibold text-[#111933]"
            >
              Topic*
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              placeholder="Enter the topic"
              className="mt-1 block w-1/2 text-sm px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Subtopic */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="subtopic"
              className="block text-md font-semibold text-[#111933]"
            >
              Sub-Topic*
            </label>
            <input
              type="text"
              id="subtopic"
              name="subtopic"
              value={formData.subtopic}
              onChange={handleChange}
              required
              placeholder="Enter the sub-topic"
              className="mt-1 block w-1/2 text-sm px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Level Dropdown */}
          <div className="flex items-center justify-between">
            <label className="block text-md font-semibold text-[#111933]">
              Bloom's Taxonomy Levels*
            </label>
            <div className="w-1/2">
              <select
                name="selectedLevel"
                value={formData.selectedLevel}
                onChange={handleChange}
                className="w-full text-sm px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a level</option>
                {bloomLevels
                  .filter(
                    (level) =>
                      !formData.level.some((l) => l.value === level.value)
                  )
                  .map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
              </select>

              {/* Selected Levels */}
              <div className="mt-3 space-y-3">
                {formData.level.map((level) => (
                  <div
                    key={level.value}
                    className="flex items-center justify-between p-3 border border-gray-300 rounded-md"
                  >
                    <span className="text-sm">
                      {bloomLevels.find((l) => l.value === level.value)?.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="%"
                        min="0"
                        max="100"
                        value={level.percentage}
                        onChange={(e) =>
                          handleLevelPercentageChange(
                            level.value,
                            e.target.value
                          )
                        }
                        className="w-20 text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeLevel(level.value)}
                        className="text-red-500 hover:text-red-700 text-xl px-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Type */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="question_type"
              className="block text-md font-semibold text-[#111933]"
            >
              Type of Questions*
            </label>
            <select
              id="question_type"
              name="question_type"
              value={formData.question_type}
              onChange={handleChange}
              className="mt-1 block w-1/2 text-sm px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled
            >
              <option value="Multiple Choice">Multiple Choice</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="num_questions"
              className="block text-md font-semibold text-[#111933]"
            >
              Number of Questions*
            </label>
            <input
              type="number"
              id="num_questions"
              name="num_questions"
              value={formData.num_questions}
              onChange={handleChange}
              required
              placeholder="Enter the no. of questions"
              className="mt-1 block w-1/2 text-sm px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full border-2 border-[#111933] text-[#111933] py-3 px-6 rounded-lg hover:bg-[#111933] hover:text-white hover:border-[#111933] text-lg mt-8"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </form>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center mt-6">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Success/Error Messages */}
        {errorMessage && (
          <p className="mt-6 text-red-600 text-center">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="mt-6 text-green-600 text-center">{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default AIGenerate;
