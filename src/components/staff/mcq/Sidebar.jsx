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
    if (num - 1 === currentIndex) return "current";
    if (reviewStatus[num - 1]) return "review";
    if (selectedAnswers[num - 1]) return "answered";
    return "notAnswered";
  });

  return (
    <div className="w-[300px]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#00296b] font-medium">Sections Name</h3>
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
