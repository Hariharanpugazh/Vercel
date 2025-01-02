import React, { useState, useEffect } from "react";

export default function Question({
  question,
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  onFinish,
  onAnswerSelect, // Callback to update selected answers
  selectedAnswers, // Current selected answers
  onReviewMark, // Callback to mark a question for review
  reviewStatus, // Current review status
}) {
  const [selectedOption, setSelectedOption] = useState(
    selectedAnswers[currentIndex] || null
  );
  const [showPopup, setShowPopup] = useState(false); // State for showing the popup
  const isMarkedForReview = reviewStatus[currentIndex] || false;

  useEffect(() => {
    setSelectedOption(selectedAnswers[currentIndex] || null);
  }, [currentIndex, selectedAnswers]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onAnswerSelect(currentIndex, option); // Update selected answers in the parent component
  };

  const handleReviewMark = () => {
    const newStatus = !isMarkedForReview;
    onReviewMark(currentIndex);
  };

  const handleFinishClick = () => {
    setShowPopup(true); // Show the popup
  };

  const closePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const confirmFinish = () => {
    setShowPopup(false);
    onFinish(); // Call the parent onFinish function
  };

  return (
    <div className="flex-1 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#00296b] text-xl">
          Question {currentIndex + 1}/{totalQuestions}
        </h2>
        <button
          className={`text-sm border rounded-full px-4 py-1 ${
            isMarkedForReview ? "text-white bg-green-500" : "text-red-500 border-red-500"
          }`}
          onClick={handleReviewMark} // Call the review mark callback
        >
          {isMarkedForReview ? "Marked for Review" : "Mark for Review"}
        </button>
      </div>
      <div className="border border-black/15 rounded-xl p-8">
        <p className="text-lg">{question.text}</p>
        <div className="space-y-4 mb-8 mt-5">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              className={`w-full p-4 text-left border rounded-lg transition-colors ${
                selectedOption === option ? "border-[#00296b] bg-[#fdc500]" : ""
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-6 mb-20">
        <button
          className="bg-[#fdc500] text-[#00296b] px-8 py-2 rounded-full flex items-center gap-2"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        <button
          className="bg-[#fdc500] text-[#00296b] px-8 py-2 rounded-full"
          onClick={handleFinishClick}
        >
          Finish
        </button>
        <button
          className="bg-[#fdc500] text-[#00296b] px-8 py-2 rounded-full flex items-center gap-2"
          onClick={onNext}
          disabled={currentIndex === totalQuestions - 1}
        >
          Next →
        </button>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] p-6 rounded-xl shadow-lg">
            <h3 className="text-[#00296b] text-lg font-bold mb-4">
              MCT Mock Test
            </h3>
            <p className="text-center text-sm mb-4">
              You have gone through all the questions. <br />
              Either browse through them once again or finish your assessment.
            </p>
            <div className="grid grid-cols-6 gap-2 mb-6">
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center rounded-md text-white ${
                    idx === currentIndex
                      ? "bg-yellow-400"
                      : selectedAnswers[idx]
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center mb-4">
              <div className="relative w-24 h-24">
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
                    stroke="#00296B"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="238"
                    strokeDashoffset={`${
                      238 - (Object.keys(selectedAnswers).length / totalQuestions) * 238
                    }`}
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[#00296b] font-bold text-xl">
                    {Object.keys(selectedAnswers).length}/{totalQuestions}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                className="border border-red-500 text-red-500 px-6 py-2 rounded-full"
                onClick={closePopup}
              >
                Close
              </button>
              <button
                className="bg-[#fdc500] text-[#00296b] px-6 py-2 rounded-full"
                onClick={confirmFinish}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
