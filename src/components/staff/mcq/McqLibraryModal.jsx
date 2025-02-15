import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLibraryIcon from "../../../assets/questionlibrary(questiondashboard).svg";
import TestLibraryIcon from "../../../assets/testlibrary(questiondashboard).svg";

const LibraryModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleQuestionLibrary = () => {
    navigate('/mcq/McqLibrary');
    onClose(); // Close the modal after navigation
  };

  const handleTestLibrary = () => {
    navigate('/mcq/TestLibrary');
    onClose(); // Close the modal after navigation
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-8 pb-12 max-w-4xl mx-auto bg-white rounded-lg shadow-lg relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose a Library</h2>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6 mb-3"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={handleQuestionLibrary}
            className="p-6 bg-gray-50 rounded-lg text-center  transform transition-all hover:translate-y-2 hover:shadow-xl cursor-pointer border border-[#111933]"
          >
            <img src={QuestionLibraryIcon} alt="Question Library" className="w-9 h-9 mx-auto mb-4 " />
            <h3 className="text-xl font-semibold text-[#111933]">Question Library</h3>
            <p className="text-sm text-gray-500">Access your saved questions library.</p>
          </div>
          <div
            onClick={handleTestLibrary}
            className="p-6 bg-gray-50 rounded-lg text-center border border-[#111933] transform transition-all hover:translate-y-2 hover:shadow-xl cursor-pointer"
          >
            <img src={TestLibraryIcon} alt="Test Library" className="w-9 h-9 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#111933] ">Test Library</h3>
            <p className="text-sm text-gray-500">Access your saved test library.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;
