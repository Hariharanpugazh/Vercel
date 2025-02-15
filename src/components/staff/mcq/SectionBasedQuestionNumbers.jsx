import React from "react";

export default function SectionBasedQuestionNumbers({ questionNumbers, questionStatuses, onQuestionClick }) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {questionNumbers.map((num, index) => (
        <button
          key={num}
          className={`p-2 border rounded-md text-center cursor-pointer ${
            questionStatuses[index] === "current"
              ? "bg-yellow-400 text-white"
              : questionStatuses[index] === "review"
              ? "bg-blue-500 text-white"
              : questionStatuses[index] === "answered"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => onQuestionClick(index)}
        >
          {num}
        </button>
      ))}
    </div>
  );
}
