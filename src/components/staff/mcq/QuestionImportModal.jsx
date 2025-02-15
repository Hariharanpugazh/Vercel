import React, { useState, useRef } from 'react';
import { X, FileUp } from 'lucide-react';

const QuestionImportModal = ({ isOpen, onClose, onUpload, uploadStatus }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  if (!isOpen) return null;

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Call the upload handler with the dropped file
      onUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  // Trigger file input when drag area is clicked
  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ color: '#000975' }} className="text-xl font-semibold">Import Question</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p style={{ color: '#000975' }} className="text-sm mb-4">
          Upload a CSV file containing multiple questions. Maximum file size: 5MB
        </p>
        
        {/* Drag and Drop Area */}
        <div 
          className={`
            w-full 
            border-2 
            border-dashed 
            rounded-lg 
            p-6 
            text-center 
            transition-colors 
            duration-300 
            ${dragActive 
              ? 'border-[#FDC500] bg-[#FDC500] bg-opacity-10' 
              : 'border-[#000975] border-opacity-20'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={onUpload}
            accept=".csv"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <FileUp className="w-10 h-10 text-[#000975] opacity-50" />
            <p style={{ color: '#000975' }} className="text-sm">
              Drag and drop CSV file here, or{' '}
              <span 
                onClick={onButtonClick} 
                className="text-[#FDC500] cursor-pointer hover:underline"
              >
                browse
              </span>
            </p>
            <p className="text-xs text-gray-500">CSV files only (max 5MB)</p>
          </div>
        </div>

        {uploadStatus && (
          <div
            className={`mt-4 p-3 rounded-md ${
              uploadStatus.startsWith("Success")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionImportModal;