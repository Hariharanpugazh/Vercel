import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import submiticon from '../../../assets/submit.svg';

const AIGenerateModal = ({ onClose, onQuestionsGenerated }) => {
  const [formData, setFormData] = useState({
    topic: "",
    subtopic: "",
    selectedLevel: "",
    level: [],
    question_type: "Multiple Choice",
    num_questions: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const bloomLevels = [
    { value: "Remembering", label: "Remembering - L1" },
    { value: "Understanding", label: "Understanding - L2" },
    { value: "Applying", label: "Applying - L3" },
    { value: "Analyzing", label: "Analyzing - L4" },
    { value: "Evaluating", label: "Evaluating - L5" },
    { value: "Creating", label: "Creating - L6" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "selectedLevel") {
      if (!formData.level.some((l) => l.value === value)) {
        setFormData((prevData) => ({
          ...prevData,
          selectedLevel: value,
          level: [...prevData.level, { value: value, percentage: "" }],
        }));
      }
    } else if (name === "num_questions") {
      const numValue = value.replace(/[^0-9]/g, '');
      setFormData((prevData) => ({
        ...prevData,
        [name]: numValue,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleLevelPercentageChange = (levelValue, percentage) => {
    const numericPercentage = percentage.replace(/[^0-9]/g, '');
    setFormData((prevData) => ({
      ...prevData,
      level: prevData.level.map((level) => 
        level.value === levelValue 
          ? { ...level, percentage: numericPercentage }
          : level
      ),
    }));
  };

  const removeLevel = (levelValue) => {
    setFormData((prevData) => ({
      ...prevData,
      level: prevData.level.filter((l) => l.value !== levelValue),
      selectedLevel: prevData.selectedLevel === levelValue ? "" : prevData.selectedLevel,
    }));
  };

  const validateForm = () => {
    if (!formData.topic.trim()) {
      toast.error("Please enter a topic");
      return false;
    }
    if (!formData.subtopic.trim()) {
      toast.error("Please enter a subtopic");
      return false;
    }
    if (!formData.num_questions || parseInt(formData.num_questions) <= 0) {
      toast.error("Please enter a valid number of questions");
      return false;
    }
    if (formData.level.length === 0) {
      toast.error("Please select at least one Bloom's Taxonomy level");
      return false;
    }

    const totalPercentage = formData.level.reduce((sum, level) => {
      const percentage = parseInt(level.percentage) || 0;
      return sum + percentage;
    }, 0);

    if (totalPercentage !== 100) {
      toast.error("Total percentage of Bloom's levels must equal 100");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        toast.error("Unauthorized access. Please log in again.");
        return;
      }

      const requestData = {
        topic: formData.topic,
        subtopic: formData.subtopic,
        num_questions: parseInt(formData.num_questions),
        question_type: "Multiple Choice",
        level_distribution: formData.level.map((level) => ({
          level: level.value,
          count: Math.round((parseInt(level.percentage) / 100) * parseInt(formData.num_questions)),
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

      if (response.data.questions) {
        setGeneratedQuestions(response.data.questions);
        setShowPreview(true);
        toast.success("Questions generated successfully!");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(
        error.response?.data?.error ||
        "Failed to generate questions. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (index) => {
    setSelectedQuestions(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === generatedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(generatedQuestions.map((_, index) => index));
    }
  };

  const handleAddSelectedQuestions = () => {
    if (selectedQuestions.length === 0) {
      toast.warning("Please select at least one question");
      return;
    }

    const questionsToAdd = selectedQuestions.map(index => generatedQuestions[index]);
    onQuestionsGenerated(questionsToAdd);
    toast.success("Questions added successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-500" />
        </button>

        {!showPreview ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#111933]">Generate Questions with AI</h2>
            <p className="text-sm text-gray-600">
              Fill in the details below to generate questions based on your requirements
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic*
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter topic"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Topic*
                  </label>
                  <input
                    type="text"
                    name="subtopic"
                    value={formData.subtopic}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter sub-topic"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bloom's Taxonomy Levels*
                </label>
                <select
                  name="selectedLevel"
                  value={formData.selectedLevel}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a level</option>
                  {bloomLevels
                    .filter((level) => !formData.level.some((l) => l.value === level.value))
                    .map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                </select>

                <div className="mt-4 space-y-3">
                  {formData.level.map((level) => (
                    <div
                      key={level.value}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <span className="text-sm font-medium">
                        {bloomLevels.find((l) => l.value === level.value)?.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          placeholder="%"
                          min="0"
                          max="100"
                          value={level.percentage}
                          onChange={(e) => handleLevelPercentageChange(level.value, e.target.value)}
                          className="w-20 p-2 border rounded-lg text-center"
                        />
                        <button
                          type="button"
                          onClick={() => removeLevel(level.value)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X size={20} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions*
                </label>
                <input
                  type="number"
                  name="num_questions"
                  value={formData.num_questions}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of questions"
                  min="1"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-[#111933] text-white rounded-lg hover:bg-[#2a3958] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Generate Questions</span>
                    <img src={submiticon} alt="submit" className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#111933]">Generated Questions Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to Generation
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {selectedQuestions.length === generatedQuestions.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <span className="text-sm text-gray-600">
                {selectedQuestions.length} of {generatedQuestions.length} questions selected
              </span>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {generatedQuestions.map((question, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedQuestions.includes(index)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(index)}
                      onChange={() => handleSelectQuestion(index)}
                      className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-3">
                        Q{index + 1}. {question.question}
                      </p>
                      <div className="pl-4 space-y-2">
                        {question.options.map((option, optIndex) => (
                          <p
                            key={optIndex}
                            className={`${
                              option === question.correctAnswer
                                ? "text-green-600 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelectedQuestions}
                disabled={selectedQuestions.length === 0}
                className="px-4 py-2 bg-[#111933] text-white rounded-md hover:bg-[#2a3958] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add Selected Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGenerateModal;