import React, { useState } from 'react';
import LibraryModal from '../mcq/LibraryModal'; // Import the new component
import CreateManuallyIcon from "../../../assets/createmanually.svg";
import BulkUploadIcon from "../../../assets/bulkupload.svg";
import QuestionLibraryIcon from "../../../assets/qlibrary.svg";
import AIGeneratorIcon from "../../../assets/aigenerator.svg";
import TestLibraryIcon from "../../../assets/testlibrary(questiondashboard).svg"

const QuestionModal = ({ onClose, handleCreateManually, handleBulkUpload, handleMcqlibrary, handleAi, handleQuestionLibrary, handleTestLibrary }) => {
  const [showLibraryOptions, setShowLibraryOptions] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const handleLibraryClick = () => {
    setShowLibraryOptions(true);
  };

  const handleLibraryModalClose = () => {
    setShowLibraryModal(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-4  pb-7 max-w-4xl mx-auto bg-white rounded-xl  shadow-lg relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl text-[#111933] font-bold mb-1 ml-10 text-left">
            Add and manage your questions
          </h3>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
       
        <p className="text-sm mx-10 text-[#111933] mb-4 text-left">
          Choose how you'd like to add questions to your assessment. Select the method that works best for you to quickly build your test.
        </p>
        <hr className="mb-6 mx-10 border-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 mx-40 gap-6">
          {showLibraryOptions ? (
            <>
              <button
                onClick={handleQuestionLibrary}
                className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
              >
                <img src={QuestionLibraryIcon} alt="Question Library" className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold text-[#111933] mb-2">Question Library</h3>
                <p className="text-sm text-[#111933]">Pick from your saved questions library, organized by topic and ready to reuse.</p>
              </button>
              <button
                onClick={handleTestLibrary}
                className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
              >
                <img src={TestLibraryIcon} alt="Test Library" className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold text-[#111933] mb-2">Test Library</h3>
                <p className="text-sm text-[#111933]">Pick from your saved test library, organized by topic and ready to reuse.</p>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCreateManually}
                className="p-5  bg-white border border-[#111933] rounded-xl cursor-pointer flex flex-col items-center"
              >
                <img src={CreateManuallyIcon} alt="Create Manually" className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold text-[#111933] mb-2">Create Manually</h3>
                <p className="text-sm text-[#111933]">Enter each question and its options directly. Perfect for custom content!</p>
              </button>
              <button
                onClick={handleBulkUpload}
                className="p-5  bg-white border border-[#111933] rounded-xl cursor-pointer flex flex-col items-center"
              >
                <img src={BulkUploadIcon} alt="Bulk Upload" className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold text-[#111933] mb-2">Bulk Upload</h3>
                <p className="text-sm text-[#111933]">Upload a CSV or Excel file with your questions and options for bulk addition.</p>
              </button>
              <button
                onClick={handleLibraryClick}
                className="p-5 bg-white border border-[#111933] rounded-xl cursor-pointer flex flex-col items-center"
              >
                <img src={QuestionLibraryIcon} alt="Library" className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold text-[#111933] mb-2">Library</h3>
                <p className="text-sm text-[#111933]">Pick from your saved questions library, organized by topic and ready to reuse.</p>
              </button>
              <button
                onClick={handleAi}
                className="p-5 bg-white border border-[#111933] rounded-xl cursor-pointer flex flex-col items-center"
              >
                <img src={AIGeneratorIcon} alt="AI Generator" className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold text-[#111933] mb-2">AI Generator</h3>
                <p className="text-sm text-[#111933]">Automatically generate questions based on your selected topic.</p>
              </button>
            </>
          )}
        </div>
      </div>
      
      {showLibraryModal && <LibraryModal onClose={handleLibraryModalClose} />}
    </div>
  );
};

export default QuestionModal;
