import React from 'react';

const ConfirmationModal = ({ showConfirm, setShowConfirm, handleDelete, selectedQuestion, setSelectedQuestion, navigate }) => {
  return (
    <div
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm " style={{zIndex: 5000}}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md" >
      <div className="text-red-600 mb-2">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold">Are you sure you want to delete this question?</p>
        <p className="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => {
              handleDelete(selectedQuestion.question_id);
              setShowConfirm(false);
              window.location.reload();
              setSelectedQuestion(null);
              setTimeout(() => {
                navigate("/library/mcq");
              }, 100);
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex-1"
          >
            Confirm
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
