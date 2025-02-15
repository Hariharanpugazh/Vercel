import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import Pagination from '@mui/material/Pagination';

const QuestionsList = ({ questions, loading, error, currentQuestions, setSelectedQuestion, currentPage, totalPages, setCurrentPage }) => {
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="bg-white px-8 shadow-sm rounded-b-lg">
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4   text-red-700">
            <strong className="font-medium">Error: </strong>
            <span>{error}</span>
          </div>
        ) : (
          <>
            {currentQuestions.map((question, index) => (
              <div
                key={index}
                className="flex items-center bg-white hover:bg-gray-50 transition-all duration-300 cursor-pointer py-5 px-4 mb-2 rounded-xl border border-gray-400"
                onClick={() => setSelectedQuestion(question)}
              >
                <div className="text-center text-sm font-light text-[#111933] w-6 h-6 p-0.5 rounded-full mr-4 bg-[#FFCC00]">
                  <strong>{index + 1 + (currentPage - 1) * 10}</strong>
                </div>
                <div className="text-left text-sm font-medium text-[#111933] truncate w-7/12">
                  {question.question}
                </div>
                <div className="text-left text-sm ml-12 text-[#111933] w-3/12">
                  <strong>Answer:</strong> {question.correctAnswer}
                </div>
                <div className="text-right ml-16">
                  <ChevronRight className="w-5 h-5 text-[#111933]" />
                </div>
              </div>
            ))}
            {questions.length > 10 && (
              <div className="flex justify-center mt-6 py-2">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#111933', // Text color for pagination items
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#ffcc00', // Background color for selected item
                      
                    },
                    
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionsList;