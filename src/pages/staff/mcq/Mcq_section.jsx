import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Mcq_sectionDetails from "../../../components/staff/mcq/Mcq_sectionDetails";
import QuestionModal from "../../../components/staff/mcq/QuestionModal";

const Mcq_section = ({ formData, setFormData }) => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const location = useLocation();
  const requiredQuestions = location.state?.requiredQuestions || 0;
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSection = () => {
    const newSection = {
      id: sections.length + 1,
      sectionName: `Section ${sections.length + 1}`,
      numQuestions: 10,
      sectionDuration: 10,
    };
    setSections([...sections, newSection]);
  };

  const handleAddQuestion = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };




  const handleFinalSubmit = async () => {
    const token = localStorage.getItem("contestToken");
    if (!token) {
      alert("Unauthorized access. Please start the contest again.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/submit-sections",
        { sections },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Sections submitted successfully!");
    } catch (error) {
      console.error("Error submitting sections:", error);
      alert("Failed to submit sections. Please try again.");
    }
  };

  const updateSection = (id, updatedSection) => {
    const updatedSections = sections.map((section) =>
      section.id === id ? updatedSection : section
    );
    setSections(updatedSections);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="bg-gray-50 p-6 rounded-lg shadow-md w-full max-w-4xl">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Section Details
        </h3>
        <p className="text-lg text-gray-600 mb-8">
          Organize your test with sections or add questions directly for a
          tailored organization.
        </p>
        <div className="flex justify-between">
          <button
            className="w-48 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-300"
            onClick={handleAddSection}
          >
            Add Section
          </button>
          <button
            className="w-48 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-300"
            onClick={handleAddQuestion}
          >
            Add Question
          </button>
        </div>
      </div>

      {/* Render Sections */}
      <div className="w-full max-w-4xl mt-6">
        {sections.map((section) => (
          <Mcq_sectionDetails
            key={section.id}
            section={section}
            onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
          />
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleFinalSubmit}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700"
        >
          Submit
        </button>
      </div>

      {isModalOpen && (
  <QuestionModal 
    showModal={isModalOpen} 
    onClose={handleModalClose}
    handleCreateManually={() => navigate('/mcq/CreateQuestion')}
    handleBulkUpload={() => navigate('/mcq/bulkUpload')}
    handleMcqlibrary={() => navigate('/mcq/McqLibrary')}
    handleAi={() => navigate('/mcq/aigenerator')}
  />
)}

    </div>
  );
};

export default Mcq_section;
