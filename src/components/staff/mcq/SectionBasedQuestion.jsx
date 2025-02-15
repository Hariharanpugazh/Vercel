import React, { useState, useEffect } from "react";

// Utility function to shuffle an array
const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export default function SectionBasedQuestion({
  sections,
  currentSectionIndex,
  currentQuestionIndex,
  onNext,
  onPrevious,
  onFinish,
  onAnswerSelect,
  selectedAnswers,
  onReviewMark,
  reviewStatus,
}) {
  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const totalQuestions = currentSection?.questions.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isLastSection = currentSectionIndex === sections.length - 1;

  const [selectedOption, setSelectedOption] = useState(
    selectedAnswers[currentSectionIndex]?.[currentQuestionIndex] || null
  );
  const [showPopup, setShowPopup] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const studentEmail = localStorage.getItem("studentEmail") || "SNSGROUPS.COM";

  // Shuffle options when the question changes
  useEffect(() => {
    if (currentQuestion) {
      setShuffledOptions(shuffleArray(currentQuestion.options));
    }
  }, [currentQuestion]);

  // Update selected option when selectedAnswers changes
  useEffect(() => {
    setSelectedOption(selectedAnswers[currentSectionIndex]?.[currentQuestionIndex] || null);
  }, [selectedAnswers, currentSectionIndex, currentQuestionIndex]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onAnswerSelect(currentSectionIndex, currentQuestionIndex, option); // Update selected answers in the parent component
  };

  const handleFinishClick = () => {
    setShowPopup(true); // Show the popup
  };

  const closePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const confirmFinish = () => {
    // Save all selected answers across all sections
    sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        sessionStorage.setItem(
          `section_${sectionIndex}_question_${questionIndex}`,
          JSON.stringify({
            question,
            selectedOption: selectedAnswers[sectionIndex]?.[questionIndex],
          })
        );
      });
    });
    setShowPopup(false);
    onFinish(); // Call the parent onFinish function
  };

  const handleSubmit = () => {
    // Save all selected answers in the current section
    currentSection.questions.forEach((question, questionIndex) => {
      sessionStorage.setItem(
        `section_${currentSectionIndex}_question_${questionIndex}`,
        JSON.stringify({
          question,
          selectedOption: selectedAnswers[currentSectionIndex]?.[questionIndex],
        })
      );
    });
    if (isLastSection) {
      confirmFinish();
    } else {
      onNext();
    }
  };

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <div className="flex-1 relative  ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#111933] text-2xl font-bold">
          Question {currentQuestionIndex + 1}/{totalQuestions}
        </h2>
        <button
          className={`text-sm border rounded-full  px-4 py-1 mr-7 ${
            reviewStatus[currentSectionIndex]?.[currentQuestionIndex] ? "text-[#111933] border-[#111933]" : "text-red-500 border-red-500"
          }`}
          onClick={() => onReviewMark(currentSectionIndex, currentQuestionIndex)} // Call the review mark callback
        >
          {reviewStatus[currentSectionIndex]?.[currentQuestionIndex] ? "Marked for Review" : "Mark for Review"}
        </button>
      </div>

      <p className="text-2xl text-[#111933] font-semibold mb-8">{currentQuestion.text}</p>

      <div className="space-y-4 text-[#111933] mb-12">
        {shuffledOptions.map((option, idx) => (
          <div
            key={idx}
            className="flex items-center cursor-pointer"
            onClick={() => handleOptionSelect(option)}
          >
            <button
              className={`w-8 h-8 flex items-center justify-center mr-4 border rounded-lg transition-colors text-1xl font-semibold ${
                selectedOption === option ? "border-[#111933] bg-[#fdc500]" : ""
              }`}
            >
              {String.fromCharCode(65 + idx)} {/* 65 is the ASCII code for 'A' */}
            </button>
            <span className={`flex-1 p-4 mr-6 border rounded-lg transition-colors text-1xl font-semibold ${
              selectedOption === option ? "border-[#111933] bg-[#fdc500]" : ""
            }`}>
              {option}
            </span>
          </div>
        ))}
      </div>
      {/* Ensure watermark does not interfere with options */}
      <div className="absolute inset-0 pointer-events-none z-[1] grid grid-cols-7 gap-2 p-1 opacity-[0.1]">
        {[...Array(21)].map((_, index) => (
          <div key={index} className="flex items-center justify-center">
            <div className="transform rotate-45 text-black text-[20px] font-semibold select-none">
              {studentEmail}
            </div>
          </div>
        ))}
      </div>

      {/* <div className="flex justify-between mt-8">
        <button
          className="bg-[#fdc500] text-[#111933] px-8 py-2 rounded-full flex items-center gap-2"
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </button>
        {isLastQuestion ? (
          isLastSection ? (
            <button
              className="bg-[#fdc500] text-[#111933] px-8 py-2 rounded-full"
              onClick={handleFinishClick}
            >
              Finish
            </button>
          ) : (
            <button
              className="bg-[#fdc500] text-[#111933] px-8 py-2 rounded-full"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )
        ) : (
          <button
            className="bg-[#fdc500] text-[#111933] px-8 py-2 rounded-full flex items-center gap-2"
            onClick={onNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
          >
            Next →
          </button>
        )}
      </div> */}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] p-6 rounded-xl shadow-lg">
            <h3 className="text-[#111933] text-lg font-bold mb-4">
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
                    idx === currentQuestionIndex
                      ? "bg-yellow-400"
                      : selectedAnswers[currentSectionIndex]?.[idx]
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
                    stroke="#111933"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="238"
                    strokeDashoffset={`${
                      238 - (Object.keys(selectedAnswers[currentSectionIndex] || {}).length / totalQuestions) * 238
                    }`}
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[#111933] font-bold text-xl">
                    {Object.keys(selectedAnswers[currentSectionIndex] || {}).length}/{totalQuestions}
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
                className="bg-[#fdc500] text-[#111933] px-6 py-2 rounded-full"
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