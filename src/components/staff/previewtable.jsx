import React from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Check } from 'lucide-react';

const PreviewTable = ({
  questions = [],
  selectedQuestions = [],
  currentPage,
  questionsPerPage = 5,
  onSelectQuestion,
  onSelectAll,
  onPageChange,
  onSubmit,
  indexOfFirstQuestion,
  totalPages
}) => {
  const maxPagesToShow = 3;
  const emptyRows = questionsPerPage - questions.length;
  
  const currentPageQuestions = questions.map((_, idx) => indexOfFirstQuestion + idx);
  const isAllSelected = currentPageQuestions.every(index => selectedQuestions.includes(index));

  const CustomCheckbox = ({ checked, onChange, isHeader = false }) => (
    <div 
      className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
        isHeader 
          ? 'border-white' 
          : checked 
            ? 'border-[#111933] border-opacity-30 bg-transparent' 
            : 'border-gray-300 bg-transparent'
      }`}
      onClick={onChange}
    >
      {checked && (
        <Check 
          size={16} 
          className={isHeader ? "text-white" : "text-[#111933]"} 
          strokeWidth={3} 
        />
      )}
    </div>
  );

  const handleSelectAll = () => {
    const indexes = questions.map((_, idx) => indexOfFirstQuestion + idx);
    onSelectAll(indexes, !isAllSelected);
  };

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="w-8 h-8 flex items-center justify-center">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            currentPage === i
              ? 'bg-amber-400 text-white font-medium'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="w-8 h-8 flex items-center justify-center">...</span>);
      }
      pages.push(
        <button
          key="last"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="w-full  mx-auto  p-6 font-urbanist">
      <div className="text-center mb-4">
        <h2 className="text-xl">Question Preview</h2>
        <p className="text-gray-500 text-sm">Preview and verify the extracted questions before proceeding</p>
      </div>

      <div className="rounded-lg overflow-hidden h-[450px]">
        <table className="w-full bg-white rounded-lg overflow-hidden border border-gray-200">
          <thead className="bg-[#111933] text-white">
            <tr>
              <th className="relative py-4 px-6 text-left w-28">
                <div className="flex items-center gap-3">
                  <CustomCheckbox
                    checked={questions.length > 0 && isAllSelected}
                    onChange={handleSelectAll}
                    isHeader={true}
                  />
                  <span className="text-sm font-semibold">Select</span>
                </div>
              </th>
              <th className="relative py-4 px-6 text-left">
                <span className="text-sm font-semibold">Question</span>
                <span
                  className="absolute top-1/2 -translate-y-1/2 left-0 h-3/4 w-[1px] bg-gray-200"
                  style={{ marginTop: "0.001rem", marginBottom: "2rem" }}
                ></span>
              </th>
              <th className="relative py-4 px-6 text-left">
                <span className="text-sm font-semibold">Correct Answer</span>
                <span
                  className="absolute top-1/2 -translate-y-1/2 left-0 h-3/4 w-[1px] bg-gray-200"
                  style={{ marginTop: "0.001rem", marginBottom: "2rem" }}
                ></span>
              </th>
            </tr>
          </thead>
          <tbody className="h-[350px] bg-gray-100">
            {questions.map((question, index) => {
              const actualIndex = indexOfFirstQuestion + index;
              return (
                <tr
                  key={actualIndex}
                  className={`h-20 ${
                    selectedQuestions.includes(actualIndex)
                      ? 'bg-gray-400'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <td className="py-4 px-6">
                    <CustomCheckbox
                      checked={selectedQuestions.includes(actualIndex)}
                      onChange={() => onSelectQuestion(actualIndex)}
                      isHeader={false}
                    />
                  </td>
                  <td className="py-4 px-6 break-words">{question.question}</td>
                  <td className="py-4 px-6">
                    <span className="font-medium">Answer: </span>
                    {question.correctAnswer}
                  </td>
                </tr>
              );
            })}
            {emptyRows > 0 && Array(emptyRows).fill(null).map((_, index) => (
              <tr key={`empty-${index}`} className="h-20 bg-gray-100">
                <td className="py-4 px-6"></td>
                <td className="py-4 px-6"></td>
                <td className="py-4 px-6"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex-1" />
        <div className="flex items-center gap-2 justify-center flex-1">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {renderPagination()}
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={onSubmit}
            className="bg-[#111933] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
          >
            Submit
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewTable;