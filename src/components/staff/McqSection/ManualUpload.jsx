import React, { useState } from 'react';
import { X } from 'lucide-react';
import submiticon from '../../../assets/submit.svg';

const ManualUpload = ({ onClose, onQuestionAdded }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const handleAddQuestion = () => {
    const nonEmptyOptions = options.filter(option => option.trim() !== '');
  
    if (nonEmptyOptions.length < 2) {
      alert('At least two options are required.');
      return;
    }
  
    if (!correctAnswer) {
      alert('Please select a correct answer.');
      return;
    }
  
    const newQuestion = {
      question,
      options: nonEmptyOptions,
      correctAnswer,
    };
  
    onQuestionAdded(newQuestion);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-4/5 max-w px-16 py-8 overflow-hidden transform transition-all duration-300">
        <div className="flex mb-10">
          <div className='w-full'>
            <h2 className="text-lg font-semibold text-[#111933] pb-2">Add New Question</h2>
            <h2 className="text-sm font-light text-[#111933] pb-4">Choose how you’d like to add questions to your assessment. Select the method that works best for you to quickly build your test.</h2>
            <div className='border-b-2 border-[#111933]'></div>
          </div>
          <button
            onClick={onClose}
            className="text-[#111933] hover:text-[#fc2c2c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-[#111933] mb-1">
                Question<span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full h-[236px] p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300 resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here"
                required
              />

            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#111933] mb-1">
                Options <span className="text-red-500">*</span>
              </label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-5">
                  <input
                    type="text"
                    className="flex-1 p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                    }}
                    placeholder="Type your choice here"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 pr-20">
              <label className="block text-sm font-medium text-[#111933] mb-1">
                Select correct answer <span className="text-red-500">*</span>
              </label>
              <select
  className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
  value={correctAnswer}
  onChange={(e) => setCorrectAnswer(e.target.value)}
  required
>
  <option value="" disabled>Select Correct Answer</option>
  {options.map((option, index) =>
    option.trim() !== '' ? (
      <option key={index} value={option}>
        Option {index + 1}: {option}
      </option>
    ) : null
  )}
</select>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleAddQuestion}
              className="inline-flex items-center px-4 py-1 w-144px mt-2 font-medium bg-[#111933] text-[#ffffff] hover:bg-[#111933] focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-transform duration-300 hover:scale-102 cursor-pointer"
              style={{ borderRadius: '0.5rem' }}
            >
              Submit
              <img src={submiticon} alt="submit" className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualUpload;
