import React from "react";
import Legend from "./Legend";
import QuestionNumbers from "./QuestionNumbers";

export default function Sidebar({
  totalQuestions,
  currentIndex,
  selectedAnswers,
  reviewStatus,
  onQuestionClick,
}) {
  const length = totalQuestions || 0;
  const questionNumbers = Array.from({ length }, (_, i) => i + 1);

  const questionStatuses = questionNumbers.map((num) => {
    const index = num - 1;
    if (reviewStatus[index]) return "review";
    if (num - 1 === currentIndex) return "current";
    if (selectedAnswers[index]) return "answered";
    return "notAnswered";
  });

  return (
    <div className="w-[300px]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#000975] font-medium">Sections Name</h3>
        </div>
        <Legend />
        <QuestionNumbers
          questionNumbers={questionNumbers}
          questionStatuses={questionStatuses}
          onQuestionClick={onQuestionClick}
        />
      </div>
    </div>
  );
}
