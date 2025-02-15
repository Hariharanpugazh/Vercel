import React, { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import { withStyles } from '@mui/styles';

// Custom styling for the checkbox
const CustomCheckbox = withStyles({
  root: {
    color: '#fdc500', // Stroke color for the checkbox
    '&$checked': {
      color: '#fdc500', // Stroke color for the checked checkbox
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

const QuestionsList = ({ questions, loading, error, currentQuestions, setSelectedQuestion, currentPage, totalPages, setCurrentPage }) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setSelectedQuestions((prevSelected) => {
      if (prevSelected.includes(question)) {
        return prevSelected.filter((q) => q !== question);
      } else {
        return [...prevSelected, question];
      }
    });
  };

  return (
    <div className="bg-white p-4 shadow-sm border w-auto border-gray-200">
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
                className="flex items-center justify-between bg-white hover:bg-gray-50 transition-all duration-300 p-6 mb-4 rounded-md shadow-md"
              >
                <div className="text-left text-sm font-medium text-[#00296B] truncate w-7/12">
                  {question.question}
                </div>
                <div className="text-left text-sm text-[#00296B] w-3/12">
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
                      color: '#000975', // Text color for pagination items
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#FDC500', // Background color for selected item
                      color: '#fff', // Text color for the selected item
                    },
                    '& .MuiPaginationItem-root:hover': {
                      backgroundColor: 'rgba(0, 9, 117, 0.1)', // Hover effect
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