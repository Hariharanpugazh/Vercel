import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const Questions = () => {
  const { contestId } = useParams(); // Extract contestId from the URL
  const navigate = useNavigate();
  const location = useLocation();
  const requiredQuestions = location.state?.requiredQuestions || 0;

  const handleNavigateToLibrary = () => {
    navigate(`/${contestId}/QuestionsLibrary`, { state: { requiredQuestions } });
  };

  return (
    <div className="questions-container max-w-10xl mx-auto p-10 bg-white shadow-md rounded-md">
      <div className="steps flex justify-between mb-6">
        <span className="text-gray-400">1. Create Contest</span>
        <span className="font-bold text-blue-600">2. Questions</span>
      </div>

      <h2 className="text-3xl font-semibold mb-6">Questions</h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div
          className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200 cursor-pointer"
          onClick={handleNavigateToLibrary}
        >
          <span className="text-4xl text-yellow-600 mb-4">&#128218;</span>
          <h3 className="text-lg font-semibold mb-2">Question Library</h3>
          <p className="text-gray-600 text-center">Browse and select questions from the library.</p>
        </div>

        <div
          className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200 cursor-pointer"
          onClick={() => alert("Feature coming soon!")}
        >
          <span className="text-4xl text-blue-600 mb-4">+</span>
          <h3 className="text-lg font-semibold mb-2">Add New Question</h3>
          <p className="text-gray-600 text-center">Create and add a new question manually.</p>
        </div>

        <div
            className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200 cursor-pointer"
            onClick={() => navigate('/BulkUpload')}
        >
            <span className="text-4xl text-green-600 mb-4">&uarr;</span>
            <h3 className="text-lg font-semibold mb-2">Bulk Upload</h3>
            <p className="text-gray-600 text-center">From here you can easily add multiple questions by uploading a CSV sheet!</p>
        </div>

        <div
            className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200 cursor-pointer"
            onClick={() => navigate('/AIQuestionGenerator')}
        >
            <span className="text-4xl text-purple-600 mb-4">&uarr;</span>
            <h3 className="text-lg font-semibold mb-2">AI Question Generator</h3>
            <p className="text-gray-600 text-center">From here you can easily add multiple questions by uploading a CSV sheet!</p>
        </div>
      </div>
    </div>
  );
};

export default Questions;
