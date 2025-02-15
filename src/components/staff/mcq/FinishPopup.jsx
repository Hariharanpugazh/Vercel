import React from "react";

export default function FinishPopup({ onClose, onFinish, attempted, totalQuestions }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">
        {/* Header */}
        <h2 className="text-[#000975] text-xl font-bold text-center mb-6">MCQ Mock Test</h2>
        <div className="absolute top-4 right-4 cursor-pointer text-red-500 text-lg font-bold" onClick={onClose}>
          ✖
        </div>

        {/* Message */}
        <div className="bg-[#FFF6D9] border border-[#FDC500] p-4 rounded-lg text-center mb-6">
          <p className="text-[#4F4F4F] text-sm">
            <span className="font-semibold">You have gone through all the questions.</span>
            <br />
            Either browse through them once again or finish your assessment.
          </p>
        </div>

        {/* Question Status */}
        <div className="grid grid-cols-6 gap-2 justify-center mb-6">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              className={`w-10 h-10 flex items-center justify-center text-white font-bold rounded-lg ${
                idx + 1 <= attempted
                  ? "bg-green-500"
                  : idx + 1 === totalQuestions
                  ? "bg-blue-600"
                  : idx % 5 === 0
                  ? "bg-red-500"
                  : "bg-yellow-400"
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="text-center mb-6">
          <p className="text-[#000975] font-medium mb-2">Sections Name</p>
          <div className="flex justify-center items-center">
            <span className="text-[#FDC500] font-bold text-lg mr-2">←</span>
            <span className="text-[#FDC500] font-bold text-lg">→</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="relative w-24 h-24 mx-auto">
            <svg className="absolute inset-0 w-full h-full">
              <circle
                cx="50%"
                cy="50%"
                r="38"
                stroke="#E0E0E0"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="38"
                stroke="#000975"
                strokeWidth="8"
                fill="none"
                strokeDasharray="238"
                strokeDashoffset={`${238 - (attempted / totalQuestions) * 238}`}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[#000975]">
              <p className="text-lg font-bold">
                {attempted}/{totalQuestions}
              </p>
            </div>
          </div>
          <p className="text-[#4F4F4F] text-sm mt-2">Questions Attempted</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            className="border border-red-500 text-red-500 text-lg px-6 py-2 rounded-full"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-[#FDC500] text-[#000975] text-lg px-6 py-2 rounded-full"
            onClick={onFinish}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
