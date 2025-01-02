import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import QuestionModal from "./QuestionModal";
// import '../style/home.css';

const Mcq_sectionDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sectionName: "",
    numQuestions: 10,
    sectionDuration: 10,
    markAllotment: 1,
    passPercentage: 50,
    timeRestriction: false,
  });

  const handleAddQuestion = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/section", formData);
      alert("Section created successfully: " + JSON.stringify(response.data));
    } catch (error) {
      console.error("Error creating section:", error);
      alert("Failed to create section. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg custom-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-500 p-2 rounded-full">
            <img src="/path-to-icon" alt="Icon" className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-medium">Section Name</h2>
        </div>
        <button className="bg-yellow-500 text-white p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Section Name, Number of Questions and Duration (Same line in flex row) */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Section Name *</label>
            <input
              type="text"
              name="sectionName"
              value={formData.sectionName}
              onChange={handleInputChange}
              placeholder="Section"
              className="w-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Number of Questions *</label>
            <input
              type="number"
              name="numQuestions"
              value={formData.numQuestions}
              onChange={handleInputChange}
              placeholder="10"
              className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Section Duration (Min)</label>
            <input
              type="number"
              name="sectionDuration"
              value={formData.sectionDuration}
              onChange={handleInputChange}
              placeholder="10"
              className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Mark Allotment and Pass Percentage */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Mark Allotment *</label>
            <div className="flex items-center">
              <input
                type="number"
                name="markAllotment"
                value={formData.markAllotment}
                onChange={handleInputChange}
                placeholder="01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
              <span className="ml-2">/ Question</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Pass Percentage</label>
            <div className="flex items-center">
              <input
                type="number"
                name="passPercentage"
                value={formData.passPercentage}
                onChange={handleInputChange}
                placeholder="50"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
              <span className="ml-2">%</span>
            </div>
          </div>
        </div>

        {/* Time Restriction Toggle */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Time Restriction *</label>
          <input
            type="checkbox"
            name="timeRestriction"
            checked={formData.timeRestriction}
            onChange={handleInputChange}
            className="w-6 h-6 text-yellow-500 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Add Questions Button */}
        <div>
          <button
            onClick={handleAddQuestion}
            className="bg-indigo-900 text-white w-full py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Add Questions
          </button>
        </div>
      </form>
      {isModalOpen && (
  <QuestionModal 
    showModal={isModalOpen} 
    onClose={handleModalClose}
    handleCreateManually={() => navigate('/mcq/CreateQuestion')}
    handleBulkUpload={() => navigate('/mcq/bulkUpload')}
    handleMcqlibrary={() => navigate('/mcq/McqLibrary')}
  />
)}
    </div>
  );
};

export default Mcq_sectionDetails;