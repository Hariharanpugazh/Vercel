import React from 'react';
import { X, Download } from 'lucide-react';

const ImportModal = ({ isModalOpen, setIsModalOpen, handleBulkUpload, uploadStatus }) => {
  // Function to handle the download of the sample CSV file
  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample_document.csv'; // Update the path to reference the public folder
    link.download = 'sample_document.csv'; // Corrected the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10 transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#111933]">
            Import Question
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="absolute top-5 right-5 w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-[#111933] mb-4">
          Upload a CSV file containing multiple questions. Maximum file size: 5MB
        </p>
        <button
          onClick={handleDownloadSample}
          className="mb-4 w-full bg-[#E3E3E366] bg-opacity-70 text-[#111933] hover:bg-[#E3E3E3] hover:bg-opacity-100 py-2 px-4 rounded-md text-sm font-medium flex justify-between items-center"
        >
          <span>Sample file</span>
          <Download className="w-5 h-5 text-[#111933]" />
        </button>
        <input
          type="file"
          onChange={handleBulkUpload}
          accept=".csv"
          className="block w-full text-sm text-[#111933] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#111933] border-[#111933]  file:text-[#ffffff] hover:file:bg-[#111933] hover:file:bg-opacity-100"
        />

        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-md ${
            uploadStatus.startsWith("Success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}>
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;