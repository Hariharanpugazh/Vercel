import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LibraryModal from "../mcq/LibraryModal";
import CreateManuallyIcon from "../../../assets/createmanually.svg";
import BulkUploadIcon from "../../../assets/bulkupload.svg";
import QuestionLibraryIcon from "../../../assets/qlibrary.svg";
import AIGeneratorIcon from "../../../assets/aigenerator.svg";

const QuestionModal = ({
  onClose,
  handleCreateManually,
  handleBulkUpload,
  handleMcqlibrary,
  handleAi,
  handleQuestionLibrary,
  handleTestLibrary,
}) => {
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-8 pb-12 max-w-4x4 mx-auto bg-white rounded-xl  shadow-lg relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl text-[#111933] font-bold mb-1 text-left">
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
          <button
            onClick={() => navigate("/mcq/CreateQuestion")}
            className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
          >
            <img src={CreateManuallyIcon || "/placeholder.svg"} alt="" className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-[#111933] mb-2">Create Manually</h3>
            <p className="text-sm text-[#111933]">Enter each question and its options directly.</p>
          </button>

          <button
            onClick={() => navigate("/mcq/bulkUpload")}
            className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
          >
            <img src={BulkUploadIcon || "/placeholder.svg"} alt="" className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-[#111933] mb-2">Bulk Upload</h3>
            <p className="text-sm text-[#111933]">Upload questions via CSV or Excel file.</p>
          </button>

          <button
            onClick={() => setIsLibraryModalOpen(true)}
            className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
          >
            <img src={QuestionLibraryIcon || "/placeholder.svg"} alt="" className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-[#111933] mb-2">Question Library</h3>
            <p className="text-sm text-[#111933]">Choose from your saved question library.</p>
          </button>

          <button
            onClick={() => navigate("/mcq/aigenerator")}
            className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
          >
            <img src={AIGeneratorIcon || "/placeholder.svg"} alt="" className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-[#111933] mb-2">AI Generator</h3>
            <p className="text-sm text-[#111933]">Generate questions using AI.</p>
          </button>
        </div>
      </div>

      {isLibraryModalOpen && <LibraryModal onClose={() => setIsLibraryModalOpen(false)} />}
    </div>
  );
};

export default QuestionModal;
