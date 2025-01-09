// QuestionModal.js (New Component)
import React from 'react';

const QuestionModal = ({ onClose, handleCreateManually, handleBulkUpload, handleMcqlibrary, handleAi}) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg relative">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Add & Manage Your Questions</h2>
          <p className="text-lg text-gray-600 mb-8">
            Choose how you'd like to add questions to your assessment. Select the method that works best for you to quickly build your test.
          </p>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={handleCreateManually} className="p-6 bg-gray-50 rounded-lg text-center shadow-md transform transition-all hover:translate-y-2 hover:shadow-xl cursor-pointer">
              <div className="text-4xl text-blue-600 mb-4">+</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Create Manually</h3>
              <p className="text-sm text-gray-500">Enter each question and its options directly. Perfect for custom content!</p>
            </div>
  
            <div onClick={handleBulkUpload} className="p-6 bg-gray-50 rounded-lg text-center shadow-md transform transition-all hover:translate-y-2 hover:shadow-xl cursor-pointer">
              <div className="text-4xl text-blue-600 mb-4">📁</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Bulk Upload</h3>
              <p className="text-sm text-gray-500">Upload a CSV or Excel file with your questions and options for bulk addition.</p>
            </div>
  
            <div onClick={handleMcqlibrary} className="p-6 bg-gray-50 rounded-lg text-center shadow-md transform transition-all hover:translate-y-2 hover:shadow-xl cursor-pointer">
              <div className="text-4xl text-blue-600 mb-4">🔖</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Question Library</h3>
              <p className="text-sm text-gray-500">Pick from your saved questions library, organized by topic and ready to reuse.</p>
            </div>
            <div onClick={handleAi}className="p-6 bg-gray-50 rounded-lg text-center shadow-md transform transition-all hover:translate-y-2 hover:shadow-xl">
              <div className="text-4xl text-blue-600 mb-4">🤖</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">AI Generator</h3>
              <p className="text-sm text-gray-500">Automatically generate questions based on your selected topic.</p>
            </div>
          </div>
  
          <button
          onClick={onClose}  // Ensure the prop is correctly invoked here
          className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600"
        >
          Close
        </button>
        </div>
      </div>
    );
  };
  

export default QuestionModal;
