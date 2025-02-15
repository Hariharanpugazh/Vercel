import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import { withStyles } from '@mui/styles';

// Custom styling for the checkbox
const CustomCheckbox = withStyles({
  root: {
    color: '#1119338f',
    '&$checked': {
      color: '#111933',
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

const QuestionsList = ({ 
  questions, 
  loading, 
  error, 
  currentQuestions, 
  setSelectedQuestion, 
  selectedQuestions, 
  currentPage, 
  totalPages, 
  setCurrentPage 
}) => {
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  return (
    <div className="bg-white p-4 shadow-sm border-gray-200" >
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <strong className="font-medium">Error: </strong>
            <span>{error}</span>
          </div>
        ) : (
          <>
            {currentQuestions.map((question, index) => (
              <div
                key={index}
                className="flex items-center py-2 justify-between bg-white hover:bg-gray-50 transition-all duration-300 px-2 rounded-xl border border-[#1119338f]"
              >
                <div className="flex items-center">
                  <CustomCheckbox
                    checked={selectedQuestions.includes(question)}
                    onChange={() => handleQuestionClick(question)}
                  />
                </div>
                <div className="text-left text-sm font-medium text-[#111933] truncate w-7/12">
                  {question.question}
                </div>
                <div className="text-left text-sm text-[#111933] w-3/12">
                  <strong>Answer:</strong> {question.correctAnswer}
                </div>
              </div>
            ))}
            {questions.length > 10 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#000975',
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#FDC500',
                      color: '#fff',
                    },
                    '& .MuiPaginationItem-root:hover': {
                      backgroundColor: 'rgba(0, 9, 117, 0.1)',
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